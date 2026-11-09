"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { submitDictationAction } from "../actions";
import {
  diffSentenceText,
  formatSecondsToMMSS,
  getNextWordHint,
  type DictationExercise,
  type DictationSentence,
  type SentenceDiffResult,
} from "../model";

export function DictationRunner({ exercise }: { exercise: DictationExercise }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoPause] = useState(true);

  // User input per sentence
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Saved sentence diff results after clicking "Check"
  const [diffResults, setDiffResults] = useState<
    Record<string, SentenceDiffResult>
  >({});
  // Active sentence hint message
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const currentSentence: DictationSentence = exercise.sentences[currentIndex];
  const userText = answers[currentSentence.id] || "";
  const currentDiff = diffResults[currentSentence.id];

  // Play audio segment for active sentence
  const playSentenceAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentSentence.startTime;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback to Web Speech API synthesis if audio file playback fails
          speakWebSpeech(currentSentence.text, playbackSpeed);
        });
    } else {
      speakWebSpeech(currentSentence.text, playbackSpeed);
    }
  };

  const speakWebSpeech = (text: string, rate: number) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      playSentenceAudio();
    }
  };

  // Monitor audio time update for auto pause at end of sentence segment
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (autoPause && audio.currentTime >= currentSentence.endTime) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentIndex, currentSentence.endTime, autoPause]);

  // Dispose audio and Web Speech on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        try {
          audio.load();
        } catch {
          // Ignore reset issues
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update playback speed when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleInputChange = (text: string) => {
    setAnswers((prev) => ({ ...prev, [currentSentence.id]: text }));
    // Clear hint when typing
    setActiveHint(null);
  };

  const checkCurrentSentence = () => {
    const result = diffSentenceText(currentSentence.text, userText);
    setDiffResults((prev) => ({ ...prev, [currentSentence.id]: result }));
  };

  const showHint = () => {
    const hint = getNextWordHint(currentSentence.text, userText);
    setActiveHint(hint);
  };

  const handleNext = () => {
    if (currentIndex < exercise.sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setActiveHint(null);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActiveHint(null);
      setIsPlaying(false);
    }
  };

  const submitDictation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const allDiffs: Record<string, SentenceDiffResult> = {};
      exercise.sentences.forEach((sent) => {
        const text = answers[sent.id] || "";
        allDiffs[sent.id] = diffSentenceText(sent.text, text);
      });

      await submitDictationAction({
        exerciseSlug: exercise.slug,
        answers,
      }).catch(() => null);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `dictation_result_${exercise.slug}`,
          JSON.stringify({
            exercise,
            answers,
            diffs: allDiffs,
            completedAt: new Date().toISOString(),
          }),
        );
      }

      router.push(`/practice/listening/dictation/${exercise.slug}/result`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24 font-sans">
      {/* Hidden Audio element */}
      <audio ref={audioRef} src={exercise.audioUrl} preload="metadata" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/practice/listening/dictation")}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100"
            title="Trở về danh sách Dictation"
          >
            <X size={20} />
          </button>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider text-amber-600 uppercase">
              {exercise.category} · Dictation
            </span>
            <h1 className="max-w-xs truncate text-sm font-bold text-slate-800 sm:max-w-md sm:text-base">
              {exercise.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Tiến độ câu
            </p>
            <p className="text-xs font-bold text-amber-600">
              {currentIndex + 1} / {exercise.sentences.length} câu
            </p>
          </div>
          <button
            onClick={() => void submitDictation()}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-600 disabled:opacity-60"
          >
            <Check size={16} /> {isSubmitting ? "Đang lưu..." : "Nộp bài"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {exercise.sentences.map((sent, index) => {
            const isDone = Boolean(diffResults[sent.id]);
            const isCurrent = index === currentIndex;
            return (
              <button
                key={sent.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setActiveHint(null);
                }}
                className={`flex h-10 min-w-10 flex-1 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "scale-105 bg-amber-500 text-white shadow-md ring-4 ring-amber-100"
                    : isDone
                      ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {isDone ? <Check size={16} /> : index + 1}
              </button>
            );
          })}
        </div>

        {/* Sentence Audio Control Box */}
        <div className="space-y-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <Sparkles size={16} /> Câu {currentSentence.position} /{" "}
              {exercise.sentences.length}
            </div>
            <span className="font-mono text-xs text-slate-400">
              {formatSecondsToMMSS(currentSentence.startTime)} -{" "}
              {formatSecondsToMMSS(currentSentence.endTime)}
            </span>
          </div>

          {/* Main Playback Bar */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:bg-amber-400"
              >
                {isPlaying ? (
                  <Pause size={26} />
                ) : (
                  <Play size={26} className="ml-1" />
                )}
              </button>
              <div>
                <p className="text-sm font-bold text-white">
                  Phát âm thanh câu {currentIndex + 1}
                </p>
                <p className="text-xs text-slate-400">
                  Ấn phím Space để Phát / Tạm dừng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={playSentenceAudio}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/20"
                title="Nghe lại từ đầu câu"
              >
                <RotateCcw size={14} /> Replay câu
              </button>

              {/* Speed toggle */}
              <div className="flex rounded-xl border border-white/10 bg-white/10 p-1">
                {[0.75, 1.0, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      playbackSpeed === speed
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dictation Typing Workspace */}
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <label
              htmlFor="dictation-input"
              className="flex items-center gap-2 text-sm font-bold text-slate-800"
            >
              <span>Gõ lại những gì bạn nghe được:</span>
            </label>
            <span className="text-xs font-medium text-slate-400">
              {userText.trim().split(/\s+/).filter(Boolean).length} từ
            </span>
          </div>

          <textarea
            id="dictation-input"
            rows={3}
            value={userText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Gõ chính xác tiếng Anh nghe được tại đây..."
            className="w-full resize-none rounded-2xl border border-slate-300 p-4 text-base font-medium text-slate-800 transition-all outline-none placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-amber-500"
          />

          {/* Hint alert */}
          {activeHint && (
            <div className="animate-in fade-in flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
              <Lightbulb size={18} className="shrink-0 text-amber-600" />
              <span>{activeHint}</span>
            </div>
          )}

          {/* Diff Result Feedback Card */}
          {currentDiff && (
            <div className="animate-in fade-in space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Kết quả kiểm tra câu {currentIndex + 1}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    currentDiff.accuracyPercent >= 90
                      ? "bg-emerald-100 text-emerald-700"
                      : currentDiff.accuracyPercent >= 60
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {currentDiff.accuracyPercent}% Chính xác
                </span>
              </div>

              {/* Word-by-word diff display */}
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed">
                {currentDiff.diffItems.map((item, i) => {
                  if (item.status === "correct") {
                    return (
                      <span
                        key={i}
                        className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800"
                      >
                        {item.word}
                      </span>
                    );
                  }
                  if (item.status === "missing") {
                    return (
                      <span
                        key={i}
                        className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-900 line-through"
                      >
                        {item.word}
                      </span>
                    );
                  }
                  if (item.status === "typo" || item.status === "extra") {
                    return (
                      <span
                        key={i}
                        className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-800"
                      >
                        {item.userWord
                          ? `${item.userWord} → (${item.word})`
                          : item.word}
                      </span>
                    );
                  }
                  return <span key={i}>{item.word}</span>;
                })}
              </div>

              {/* Sentence Translation & Notes */}
              {currentSentence.translation && (
                <p className="text-xs font-medium text-slate-500 italic">
                  Dịch nghĩa: &quot;{currentSentence.translation}&quot;
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={showHint}
                className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
              >
                <Lightbulb size={15} /> Gợi ý từ tiếp theo
              </button>
              <button
                onClick={checkCurrentSentence}
                disabled={!userText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> Kiểm tra câu này
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Câu trước
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === exercise.sentences.length - 1}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-40"
              >
                Câu sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
