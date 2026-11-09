"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic, Square, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

import { GenericPracticeEngine } from "@/features/core-practice";
import { submitMockTestSectionAction } from "@/features/mock-tests/actions";
import type { MockRunnerContext } from "@/features/mock-tests/model";
import { submitSpeakingAction } from "@/features/speaking/actions";
import {
  getR2UploadUrlAction,
  saveR2AudioAction,
  uploadR2AudioFallbackAction,
} from "@/features/speaking/r2-actions";
import type { SpeakingPracticeData } from "@/features/speaking/server/content";
import { cn } from "@/lib/utils";

type Recording = {
  blob: Blob;
  url: string;
  duration: number;
  mimeType: "audio/webm" | "audio/mp4" | "audio/mpeg";
};

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const EXTENSION_BY_MIME: Record<Recording["mimeType"], string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
};

export function SpeakingRunner({
  data,
  mockContext,
}: {
  data: SpeakingPracticeData;
  mockContext?: MockRunnerContext;
}) {
  const router = useRouter();
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Record<string, Recording>>({});
  const [uploadedPrompts, setUploadedPrompts] = useState<
    Record<string, boolean>
  >({});
  const [message, setMessage] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadingPromptId, setUploadingPromptId] = useState<string | null>(
    null,
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingsRef = useRef<Record<string, Recording>>({});
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const attempt = data.attempt;
  const attemptId = attempt?.id ?? "";

  useEffect(
    () => () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      Object.values(recordingsRef.current).forEach((recording) =>
        URL.revokeObjectURL(recording.url),
      );
    },
    [],
  );

  // Warn user if leaving with an active recording or un-uploaded local recordings
  useEffect(() => {
    const hasPendingAudio =
      activePrompt !== null ||
      Object.keys(recordings).length > 0 ||
      uploadingPromptId !== null;
    if (!hasPendingAudio) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activePrompt, recordings, uploadingPromptId]);

  const stopRecording = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const startRecording = async (promptId: string, maximumSeconds: number) => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMessage("Trình duyệt hiện tại không hỗ trợ ghi âm an toàn.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/mpeg",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      if (!preferred) {
        stream.getTracks().forEach((track) => track.stop());
        setMessage("Không tìm thấy định dạng âm thanh được hỗ trợ.");
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType: preferred });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstart = (event) => {
        startedAtRef.current = event.timeStamp;
      };
      recorder.onstop = (event) => {
        const mimeType = preferred.startsWith("audio/webm")
          ? "audio/webm"
          : (preferred as Recording["mimeType"]);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const duration = Math.min(
          maximumSeconds,
          Math.max(0, (event.timeStamp - startedAtRef.current) / 1000),
        );
        const url = URL.createObjectURL(blob);
        setRecordings((current) => {
          if (current[promptId]) URL.revokeObjectURL(current[promptId].url);
          const next = {
            ...current,
            [promptId]: { blob, url, duration, mimeType },
          };
          recordingsRef.current = next;
          return next;
        });
        stream.getTracks().forEach((track) => track.stop());
        setActivePrompt(null);
        setMessage(
          "Bản ghi âm đã lưu tạm trên thiết bị. Hãy tải lên để xác minh.",
        );
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start(250);
      setRecordingSeconds(0);
      elapsedTimerRef.current = setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1000,
      );
      setActivePrompt(promptId);
      setMessage("Đang ghi âm...");
      stopTimerRef.current = setTimeout(stopRecording, maximumSeconds * 1000);
    } catch {
      setMessage("Không thể truy cập micro. Hãy kiểm tra quyền trình duyệt.");
    }
  };

  const uploadRecordingToServer = useCallback(
    async (promptId: string, recording: Recording): Promise<boolean> => {
      if (recording.blob.size < 1 || recording.blob.size > MAX_AUDIO_BYTES) {
        setMessage("Dung lượng audio phải trong khoảng 1 byte đến 15MB.");
        return false;
      }
      if (recording.duration < 1 || recording.duration > 180) {
        setMessage("Thời lượng audio hợp lệ là từ 1 giây đến 3 phút.");
        return false;
      }

      setUploadingPromptId(promptId);
      setMessage("Đang tải audio lên hệ thống lưu trữ...");

      try {
        const result = await getR2UploadUrlAction(
          recording.mimeType,
          attemptId,
          promptId,
        );

        if (result.status !== "success") {
          setMessage(result.message);
          return false;
        }

        try {
          const uploadRes = await fetch(result.uploadUrl, {
            method: "PUT",
            body: recording.blob,
            headers: {
              "Content-Type": result.mimeType,
            },
          });

          if (!uploadRes.ok) {
            throw new Error(`HTTP error ${uploadRes.status}`);
          }

          const saveRes = await saveR2AudioAction(
            attemptId,
            promptId,
            result.fileKey,
            result.mimeType,
          );
          if (saveRes.status === "error") {
            setMessage(saveRes.message);
            return false;
          }
        } catch {
          setMessage("Đang thử tải lên qua máy chủ dự phòng...");
          const ext = EXTENSION_BY_MIME[recording.mimeType] || "webm";
          const formData = new FormData();
          formData.append("file", recording.blob, `audio.${ext}`);
          formData.append("attemptId", attemptId);
          formData.append("promptId", promptId);
          formData.append("mimeType", recording.mimeType);

          const fallbackRes = await uploadR2AudioFallbackAction(formData);
          if (fallbackRes.status !== "success") {
            setMessage(fallbackRes.message || "Lỗi kết nối khi tải audio lên.");
            return false;
          }
        }

        setUploadedPrompts((prev) => ({ ...prev, [promptId]: true }));
        setRecordings((current) => {
          if (current[promptId]) {
            URL.revokeObjectURL(current[promptId].url);
          }
          const next = { ...current };
          delete next[promptId];
          recordingsRef.current = next;
          return next;
        });
        setMessage("Audio đã được xác minh và lưu thành công!");
        router.refresh();
        return true;
      } catch {
        setMessage("Lỗi kết nối khi tải audio lên. Vui lòng thử lại.");
        return false;
      } finally {
        setUploadingPromptId(null);
      }
    },
    [attemptId, router],
  );

  const handleSubmit = useCallback(async () => {
    if (activePrompt !== null) {
      throw new Error("Vui lòng dừng ghi âm trước khi nộp bài.");
    }

    const pendingRecordings = Object.entries(recordingsRef.current);
    for (const [promptId, recording] of pendingRecordings) {
      const ok = await uploadRecordingToServer(promptId, recording);
      if (!ok) {
        throw new Error(
          "Không thể tải lên bản ghi âm đang chờ. Hãy kiểm tra và tải lại trước khi nộp.",
        );
      }
    }

    if (mockContext) {
      const res = await submitMockTestSectionAction({
        mockTestSlug: mockContext.mockTestSlug,
        sessionId: mockContext.sessionId,
        sectionAttemptId: mockContext.sectionAttemptId,
        idempotencyKey: crypto.randomUUID(),
      });
      if (res && "status" in res && res.status === "error") {
        throw new Error(res.message);
      }
      return;
    }

    const res = await submitSpeakingAction({
      attemptId,
      setSlug: data.set.slug,
      idempotencyKey: crypto.randomUUID(),
    });
    if (res && "status" in res && res.status === "error") {
      throw new Error(res.message);
    }
  }, [
    activePrompt,
    attemptId,
    data.set.slug,
    mockContext,
    uploadRecordingToServer,
  ]);

  const questions = data.prompts.map((p) => ({
    id: p.id,
    promptMarkdown: p.text,
  }));

  if (!attempt) return null;

  return (
    <GenericPracticeEngine
      attemptId={attempt.id}
      questions={questions}
      enableAutosave={false}
      title={data.set.title}
      domain="speaking"
      categoryLabel="Speaking Practice"
      isSubmitting={uploadingPromptId !== null}
      onSubmit={handleSubmit}
      renderSidePanel={() => (
        <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
          <h2 className="mb-4 text-2xl font-black text-slate-800">
            Speaking Instructions
          </h2>
          <p className="max-w-md leading-relaxed text-slate-600">
            Ghi âm câu trả lời cho từng câu hỏi và nhấn Tải lên để hệ thống xác
            minh audio trước khi nộp bài.
          </p>
        </div>
      )}
      renderQuestionArea={({ currentQuestion }) => {
        const prompt = data.prompts.find((p) => p.id === currentQuestion.id);
        if (!prompt) return null;
        const local = recordings[prompt.id];
        const isRecording = activePrompt === prompt.id;
        const isPromptUploaded =
          Boolean(prompt.verifiedAudio?.signedUrl) ||
          Boolean(uploadedPrompts[prompt.id]);
        const isBusy = uploadingPromptId !== null;

        return (
          <div className="mx-auto max-w-xl space-y-6 text-center">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-2 text-xs font-black tracking-wider text-slate-400 uppercase">
                {prompt.part.replace("_", " ")}
              </h2>
              <p className="mb-4 text-xl leading-relaxed font-black text-slate-800">
                {prompt.text}
              </p>
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                {prompt.instructions ||
                  `Speak for ${prompt.minimumAnswerSeconds}-${prompt.maximumAnswerSeconds} seconds.`}
              </p>
            </div>

            {message ? (
              <p
                aria-live="polite"
                className="text-xs font-bold text-indigo-600"
              >
                {message}
              </p>
            ) : null}

            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="relative mb-6">
                {isRecording ? (
                  <div className="absolute -inset-4 animate-ping rounded-full bg-rose-500/20" />
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    isRecording
                      ? stopRecording()
                      : startRecording(prompt.id, prompt.maximumAnswerSeconds)
                  }
                  disabled={isBusy || Boolean(activePrompt && !isRecording)}
                  className={cn(
                    "relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-300 disabled:opacity-50",
                    isRecording
                      ? "bg-slate-900 text-rose-500 hover:bg-slate-800"
                      : "bg-rose-500 text-white hover:bg-rose-600",
                  )}
                >
                  {isRecording ? <Square size={28} /> : <Mic size={36} />}
                </button>
              </div>

              <div className="font-mono text-lg font-bold text-slate-600">
                {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                {String(recordingSeconds % 60).padStart(2, "0")}{" "}
                <span className="text-slate-400">
                  / 00:{String(prompt.maximumAnswerSeconds).padStart(2, "0")}
                </span>
              </div>

              {local ? (
                <div className="mt-6 w-full">
                  <audio controls src={local.url} className="h-10 w-full" />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void uploadRecordingToServer(prompt.id, local)
                      }
                      disabled={isBusy || isRecording}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                    >
                      <UploadCloud size={16} />{" "}
                      {uploadingPromptId === prompt.id
                        ? "Đang tải lên..."
                        : "Nộp audio"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(local.url);
                        setRecordings((c) => {
                          const n = { ...c };
                          delete n[prompt.id];
                          recordingsRef.current = n;
                          return n;
                        });
                      }}
                      disabled={isBusy || isRecording}
                      className="rounded-xl bg-rose-50 px-4 py-2.5 font-bold text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : isPromptUploaded ? (
                <div className="mt-6 w-full space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} /> Audio đã được xác minh trên máy
                    chủ
                  </div>
                  {prompt.verifiedAudio?.signedUrl ? (
                    <audio
                      controls
                      preload="none"
                      src={prompt.verifiedAudio.signedUrl}
                      className="h-10 w-full"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      }}
    />
  );
}
