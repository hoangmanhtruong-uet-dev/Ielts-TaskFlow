"use client";

import React, { useState, useEffect } from "react";
import { Volume2, CheckCircle2, Play, Pause, RotateCcw } from "lucide-react";
import {
  IPA_PHONEME_PAIRS,
  FLUENCY_FILLER_FIXES,
  type IPAPhonemePair,
} from "./speaking-curated-data";

export function LiveSpeakingLab() {
  const [activeTab, setActiveTab] = useState<"phoneme" | "prep60" | "fillers">(
    "phoneme",
  );

  // Tab 1: Phoneme state
  const [selectedPair, setSelectedPair] = useState<IPAPhonemePair>(
    IPA_PHONEME_PAIRS[0],
  );
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Tab 2: Prep 60s Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [prepNotes, setPrepNotes] = useState("");
  const isCountingDown = timerRunning && timeLeft > 0;

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.9;
    setPlayingWord(text);
    utterance.onend = () => setPlayingWord(null);
    utterance.onerror = () => setPlayingWord(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(60);
  };

  return (
    <div className="rounded-2xl border border-[#242A4E] bg-[#12162B] p-5 shadow-xl backdrop-blur-md sm:p-6">
      {/* Header & Tabs */}
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[#242A4E] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-[#00F0FF]" />
            <h3 className="text-base font-extrabold tracking-tight text-[#EEF0FF] sm:text-lg">
              Acoustic Reflex & Pronunciation Lab
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            Micro-drills tập trung phản xạ phát âm chuẩn Cambridge, kiểm soát từ
            đệm và kỹ thuật nháp 60s Part 2.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex shrink-0 rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("phoneme")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "phoneme"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            IPA Gym
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prep60")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "prep60"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            60s Prep Coach
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fillers")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "fillers"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            Filler Trap
          </button>
        </div>
      </div>

      {/* Tab 1: IPA Phoneme Gym */}
      {activeTab === "phoneme" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {IPA_PHONEME_PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => setSelectedPair(pair)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedPair.id === pair.id
                    ? "border-[#5B5FEF] bg-[#1E2442] shadow-sm"
                    : "border-[#1E2442] bg-[#0C0E1D]/60 hover:border-[#2E3660]"
                }`}
              >
                <p className="text-xs font-bold text-[#EEF0FF]">{pair.title}</p>
                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-[#00F0FF]">
                  <span>{pair.soundA.symbol}</span>
                  <span className="text-[#94A3B8]">vs</span>
                  <span>{pair.soundB.symbol}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Sound A */}
              <div className="flex items-center justify-between rounded-xl border border-[#242A4E] bg-[#12162B] p-4">
                <div>
                  <span className="inline-block rounded border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-2 py-0.5 font-mono text-[11px] font-bold text-[#7A7DF5]">
                    {selectedPair.soundA.symbol}
                  </span>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {selectedPair.soundA.word}
                  </h4>
                  <p className="font-mono text-xs text-[#94A3B8]">
                    {selectedPair.soundA.ipa}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedPair.soundA.word)}
                  aria-label={`Nghe mẫu ${selectedPair.soundA.word}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-[#5B5FEF]/40 bg-[#5B5FEF]/20 text-[#7A7DF5] transition-all hover:bg-[#5B5FEF] hover:text-white"
                >
                  <Volume2
                    size={18}
                    className={
                      playingWord === selectedPair.soundA.word
                        ? "animate-bounce"
                        : ""
                    }
                  />
                </button>
              </div>

              {/* Sound B */}
              <div className="flex items-center justify-between rounded-xl border border-[#242A4E] bg-[#12162B] p-4">
                <div>
                  <span className="inline-block rounded border border-[#00F0FF]/30 bg-[#00F0FF]/20 px-2 py-0.5 font-mono text-[11px] font-bold text-[#00F0FF]">
                    {selectedPair.soundB.symbol}
                  </span>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {selectedPair.soundB.word}
                  </h4>
                  <p className="font-mono text-xs text-[#94A3B8]">
                    {selectedPair.soundB.ipa}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedPair.soundB.word)}
                  aria-label={`Nghe mẫu ${selectedPair.soundB.word}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-[#00F0FF]/40 bg-[#00F0FF]/20 font-bold text-[#00F0FF] transition-all hover:bg-[#00F0FF] hover:text-[#0C0E1D]"
                >
                  <Volume2
                    size={18}
                    className={
                      playingWord === selectedPair.soundB.word
                        ? "animate-bounce"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#1E2442] pt-3 text-xs text-[#94A3B8]">
              <p>
                <strong className="font-bold text-rose-400">
                  ⚠️ Bẫy trừ điểm:{" "}
                </strong>
                {selectedPair.trapExplanation}
              </p>
              <p>
                <strong className="font-bold text-emerald-400">
                  💡 Mẹo chuẩn bản xứ:{" "}
                </strong>
                {selectedPair.nativeTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 60s Prep Coach */}
      {activeTab === "prep60" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-4 sm:p-5">
            <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-14 items-center justify-center rounded-2xl border font-mono text-xl font-black ${
                    timeLeft <= 10
                      ? "animate-pulse border-rose-500/50 bg-rose-500/20 text-rose-400"
                      : "border-[#5B5FEF]/40 bg-[#5B5FEF]/20 text-[#00F0FF]"
                  }`}
                >
                  {timeLeft}s
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#EEF0FF]">
                    IELTS Part 2 1-Minute Prep Countdown
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    {isCountingDown
                      ? "Đồng hồ đang chạy — Ghi nhanh 4 từ khóa cốt lõi (Who / When / What / Feeling)!"
                      : "Nhấn Start để kích hoạt thử thách 60 giây lập dàn ý không nhìn tài liệu."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isCountingDown) {
                      setTimerRunning(false);
                      return;
                    }
                    if (timeLeft <= 0) setTimeLeft(60);
                    setTimerRunning(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isCountingDown
                      ? "bg-amber-500 font-black text-slate-900 hover:bg-amber-400"
                      : "bg-[#5B5FEF] text-white hover:bg-[#4D51DE]"
                  }`}
                >
                  {isCountingDown ? <Pause size={14} /> : <Play size={14} />}
                  {isCountingDown ? "Tạm dừng" : "Bắt đầu 60s"}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="rounded-xl bg-[#1E2442] p-2 text-[#94A3B8] transition-colors hover:text-white"
                  aria-label="Đặt lại thời gian"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Quick Keyword Scratchpad */}
            <div>
              <label
                htmlFor="prep-scratchpad"
                className="mb-1.5 block text-xs font-bold text-[#A5B4FC]"
              >
                Bảng nháp từ khóa tốc ký (Mindmap Keywords Scratchpad):
              </label>
              <textarea
                id="prep-scratchpad"
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                placeholder="Ví dụ: - Eco-habit: reusable cup&#10;- When: college sophomore year&#10;- Obstacle: forgetting at home&#10;- Impact: zero-waste lifestyle..."
                className="h-24 w-full resize-none rounded-xl border border-[#242A4E] bg-[#12162B] p-3 font-mono text-xs text-[#EEF0FF] placeholder:text-[#64748B] focus:border-[#5B5FEF] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Fluency & Filler Trap */}
      {activeTab === "fillers" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FLUENCY_FILLER_FIXES.map((fix) => (
              <div
                key={fix.id}
                className="flex flex-col justify-between rounded-xl border border-[#242A4E] bg-[#0C0E1D] p-4"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase">
                      {fix.category} Trap
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      BAND 7.5+ UPGRADE
                    </span>
                  </div>
                  <h4 className="mb-2 font-mono text-xs font-bold text-rose-400 line-through">
                    {fix.badFiller}
                  </h4>
                  <div className="space-y-1.5">
                    {fix.academicAlternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-[#EEF0FF]"
                      >
                        <CheckCircle2
                          size={13}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />
                        <span className="font-medium">{alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 border-t border-[#1E2442] pt-2 text-[11px] text-[#94A3B8]">
                  {fix.bandBoostTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
