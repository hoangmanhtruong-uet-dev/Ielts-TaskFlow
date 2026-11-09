"use client";

import { ArrowLeft, CircleStop, Lightbulb, Mic, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { SpeakingReviewData } from "@/features/speaking/server/content";

export function PronunciationPractice({ data }: { data: SpeakingReviewData }) {
  const word = getFocusWord(data);
  const [recording, setRecording] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    [localUrl],
  );

  function hearExample() {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech playback is not supported in this browser.");
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      if (!mimeType) {
        stream.getTracks().forEach((track) => track.stop());
        setMessage("No supported audio format was found.");
        return;
      }
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (localUrl) URL.revokeObjectURL(localUrl);
        setLocalUrl(
          URL.createObjectURL(new Blob(chunksRef.current, { type: mimeType })),
        );
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setMessage("Practice recording is kept only on this device.");
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start(200);
      setRecording(true);
      setMessage("Say the word clearly.");
    } catch {
      setMessage("Microphone access failed. Check your browser permission.");
    }
  }

  const originalRecording =
    data.responses.find((response) => response.signedUrl)?.signedUrl ?? null;
  const suggestion = Array.isArray(data.feedback?.suggestions)
    ? data.feedback.suggestions.find(
        (item): item is string => typeof item === "string",
      )
    : null;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl bg-[#fbf9ff] pb-24 text-[#211b2a] lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e5dfef]">
      <header className="flex min-h-14 items-center gap-3 border-b border-[#e9e4f0] bg-white px-4 lg:rounded-t-3xl">
        <Link
          href={`/practice/speaking/${data.set.slug}/attempt/${data.attempt.id}`}
          aria-label="Back to feedback"
          className="grid size-10 place-items-center rounded-full text-[#4d32d4]"
        >
          <ArrowLeft aria-hidden="true" size={18} />
        </Link>
        <h1 className="flex-1 text-center text-sm font-bold text-[#3823bd]">
          Feedback
        </h1>
        <span className="w-10" />
      </header>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 py-5 sm:px-6">
        <section className="rounded-2xl border border-[#e3ddec] bg-white p-6 text-center">
          <p className="text-2xl font-bold text-[#3823bd]">{word}</p>
          <p className="mt-2 text-xs text-[#736c7e]">
            Nghe mẫu và tự ghi âm đối chiếu trực tiếp trên thiết bị (chế độ tự
            luyện nghe-nhắc lại, không chấm điểm âm vị tự động)
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-[#e3ddec] bg-[#f4f1fa] p-4">
          <div className="flex items-center gap-2 text-[#08754d]">
            <Lightbulb aria-hidden="true" size={18} />
            <h2 className="font-bold">Teaching Tip</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#5f586a]">
            {suggestion ??
              `Say “${word}” slowly first, then repeat it at a natural pace.`}
          </p>
        </section>

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={hearExample}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd5e9] bg-white text-sm font-bold text-[#4d32d4]"
          >
            <Play aria-hidden="true" size={16} fill="currentColor" />
            Hear Example
          </button>
          {originalRecording ? (
            <audio
              controls
              preload="none"
              src={originalRecording}
              className="w-full"
            >
              Your browser does not support audio.
            </audio>
          ) : (
            <p className="rounded-xl bg-white p-3 text-center text-xs text-[#736c7e]">
              Your submitted recording is currently unavailable.
            </p>
          )}
        </div>

        {localUrl ? (
          <audio controls src={localUrl} className="mt-5 w-full">
            Your browser does not support audio.
          </audio>
        ) : null}
        <p
          aria-live="polite"
          className="mt-4 text-center text-xs text-[#736c7e]"
        >
          {message}
        </p>
        <button
          type="button"
          onClick={toggleRecording}
          className={`mt-auto flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white ${recording ? "bg-[#d94942]" : "bg-[#3d22c8]"}`}
        >
          {recording ? (
            <CircleStop aria-hidden="true" size={18} />
          ) : (
            <Mic aria-hidden="true" size={18} />
          )}
          {recording ? "Stop Recording" : "Practice Word"}
        </button>
      </div>
    </div>
  );
}

function getFocusWord(data: SpeakingReviewData) {
  const suggestions = Array.isArray(data.feedback?.suggestions)
    ? data.feedback.suggestions.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const quoted = suggestions
    .join(" ")
    .match(/[“\"']([A-Za-z][A-Za-z'-]{2,})[”\"']/)?.[1];
  if (quoted) return quoted;
  const transcript =
    data.responses.find((response) => response.transcript)?.transcript ?? "";
  return transcript.match(/\b[A-Za-z][A-Za-z'-]{4,}\b/)?.[0] ?? "Practice";
}
