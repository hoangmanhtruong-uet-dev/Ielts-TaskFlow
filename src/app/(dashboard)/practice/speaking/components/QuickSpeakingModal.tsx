"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  Square,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { SpeakingCueCard } from "./speaking-curated-data";

interface QuickSpeakingModalProps {
  card: SpeakingCueCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSpeakingModal({
  card,
  isOpen,
  onClose,
}: QuickSpeakingModalProps) {
  if (!isOpen || !card) return null;
  return <QuickSpeakingModalBody key={card.id} card={card} onClose={onClose} />;
}

function QuickSpeakingModalBody({
  card,
  onClose,
}: {
  card: SpeakingCueCard;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<
    "idle" | "prep" | "recording" | "completed"
  >("idle");
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [recordTime, setRecordTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Prep timer
  useEffect(() => {
    if (phase !== "prep") return;
    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase("recording");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Record timer
  useEffect(() => {
    if (phase !== "recording") return;
    const timer = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Canvas waveform animation during recording
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "recording") {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let step = 0;
    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      step += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#00F0FF";
      ctx.beginPath();

      for (let x = 0; x < width; x += 3) {
        const freq1 = Math.sin(x * 0.04 + step) * 16;
        const freq2 = Math.cos(x * 0.08 - step * 1.5) * 10;
        const y = mid + (freq1 + freq2) * Math.sin((x / width) * Math.PI);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic wave
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#5B5FEF";
      ctx.beginPath();
      for (let x = 0; x < width; x += 4) {
        const freq = Math.sin(x * 0.06 - step * 2) * 12;
        const y = mid + freq * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  const handleStartPrep = () => {
    setPhase("prep");
    setPrepTimeLeft(60);
  };

  const handleStartRecording = () => {
    setPhase("recording");
    setRecordTime(0);
  };

  const handleStopRecording = () => {
    setPhase("completed");
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaking-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md duration-300 sm:p-5"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#242A4E] bg-[#0C0E1D] shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#242A4E] bg-[#12162B] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-[#7A7DF5] uppercase">
              IELTS PART {card.part} STUDIO
            </span>
            <span className="text-xs font-semibold text-[#94A3B8]">
              Target Band {card.targetBand.toFixed(1)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="rounded-xl p-1.5 text-[#94A3B8] transition-colors hover:bg-[#1E2442] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Split-View */}
        <div className="grid flex-1 grid-cols-1 divide-y divide-[#242A4E] overflow-y-auto md:grid-cols-12 md:divide-x md:divide-y-0">
          {/* Left Column: Cue Card & Vocabulary */}
          <div className="space-y-6 p-6 md:col-span-6">
            <div>
              <span className="text-xs font-bold tracking-wide text-[#00F0FF] uppercase">
                Topic: {card.topic}
              </span>
              <h2
                id="speaking-modal-title"
                className="mt-1 text-xl leading-snug font-black text-white"
              >
                {card.title}
              </h2>
            </div>

            {/* Prompt Card */}
            <div className="rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
              <p className="mb-3 text-sm font-semibold text-[#EEF0FF]">
                {card.prompt}
              </p>
              {card.bulletPoints && (
                <div className="space-y-1.5 text-xs text-[#94A3B8]">
                  <p className="font-bold text-[#A5B4FC]">You should say:</p>
                  <ul className="list-inside list-disc space-y-1 pl-1">
                    {card.bulletPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* C1/C2 Academic Vocabulary Highlights */}
            <div>
              <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#A5B4FC] uppercase">
                <Sparkles size={14} className="text-[#00F0FF]" /> C1/C2 Lexical
                Recommendations:
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {card.vocabularyHighlights.map((vocab, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-xl border border-[#1E2442] bg-[#12162B] p-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {vocab.word}
                        </span>
                        <span className="py-0.2 rounded bg-[#5B5FEF]/30 px-1.5 font-mono text-[10px] text-[#7A7DF5]">
                          {vocab.band}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-[#00F0FF]">
                        {vocab.ipa}
                      </p>
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-[11px] text-[#94A3B8]">
                      {vocab.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recording Studio & Live Acoustic Meter */}
          <div className="flex flex-col justify-between space-y-6 bg-[#080A14] p-6 md:col-span-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2.5 rounded-full ${
                    phase === "recording"
                      ? "animate-ping bg-rose-500"
                      : phase === "prep"
                        ? "animate-pulse bg-amber-400"
                        : "bg-[#00F0FF]"
                  }`}
                />
                <span className="font-mono text-xs font-bold tracking-wider text-[#EEF0FF] uppercase">
                  {phase === "idle" && "Studio Standby"}
                  {phase === "prep" && "1-Minute Prep Phase"}
                  {phase === "recording" &&
                    `Live Recording (${formatSecs(recordTime)})`}
                  {phase === "completed" && "Evaluation Ready"}
                </span>
              </div>

              {phase === "recording" && (
                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-bold text-rose-400">
                  REC ●
                </span>
              )}
            </div>

            {/* Audio Waveform Canvas Box */}
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-[#242A4E] bg-[#12162B] p-5">
              {phase === "idle" && (
                <div className="space-y-2 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#5B5FEF]/20 text-[#7A7DF5]">
                    <Mic size={24} />
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Sẵn sàng ghi âm. Bạn có thể chọn chuẩn bị 60s hoặc bắt đầu
                    nói trực tiếp.
                  </p>
                </div>
              )}

              {phase === "prep" && (
                <div className="space-y-2 text-center">
                  <span className="animate-pulse font-mono text-5xl font-black text-amber-400">
                    {prepTimeLeft}s
                  </span>
                  <p className="text-xs text-[#94A3B8]">
                    Thời gian chuẩn bị 1 phút. Hãy hình dung cấu trúc 4 ý và từ
                    vựng then chốt.
                  </p>
                </div>
              )}

              {phase === "recording" && (
                <div className="w-full space-y-3">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={80}
                    className="h-[80px] w-full"
                  />
                  <p className="text-center font-mono text-xs text-[#00F0FF]">
                    Thu âm đang hoạt động: {formatSecs(recordTime)} / 02:00
                  </p>
                </div>
              )}

              {phase === "completed" && (
                <div className="w-full space-y-3 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Đã hoàn thành bài nói!
                    </h4>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      Thời lượng: {formatSecs(recordTime)}
                    </p>
                  </div>

                  {/* Honest Practice Summary (no fabricated IELTS scores for local drill) */}
                  <div className="grid grid-cols-3 gap-2 border-t border-[#1E2442] pt-2 text-center">
                    <div className="rounded-lg bg-[#0C0E1D] p-2">
                      <span className="block text-[10px] text-[#94A3B8]">
                        Chủ đề
                      </span>
                      <strong className="font-mono text-xs text-[#00F0FF]">
                        Part {card.part}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-[#0C0E1D] p-2">
                      <span className="block text-[10px] text-[#94A3B8]">
                        Thời lượng
                      </span>
                      <strong className="font-mono text-xs text-[#7A7DF5]">
                        {formatSecs(recordTime)}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-[#0C0E1D] p-2">
                      <span className="block text-[10px] text-[#94A3B8]">
                        Chấm AI
                      </span>
                      <strong className="font-mono text-xs text-amber-400">
                        Chế độ nháp
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Chế độ luyện nhanh giúp kiểm soát thời gian. Để lưu âm thanh
                    và nhận đánh giá 4 tiêu chí, hãy mở nhiệm vụ Speaking chính
                    thức.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {phase === "idle" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartPrep}
                    className="flex-1 rounded-xl border border-[#242A4E] bg-[#1E2442] py-3 text-xs font-bold text-[#EEF0FF] transition-all hover:bg-[#2A335E]"
                  >
                    Chuẩn bị 60s (Part 2)
                  </button>
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5B5FEF] py-3 text-xs font-bold text-white shadow-lg shadow-[#5B5FEF]/25 transition-all hover:bg-[#4D51DE]"
                  >
                    <Mic size={15} /> Bắt đầu nói ngay
                  </button>
                </div>
              )}

              {phase === "prep" && (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B5FEF] py-3 text-xs font-bold text-white transition-all hover:bg-[#4D51DE]"
                >
                  <Mic size={15} /> Bỏ qua chuẩn bị & Bắt đầu nói
                </button>
              )}

              {phase === "recording" && (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500"
                >
                  <Square size={15} /> Kết thúc bài nói
                </button>
              )}

              {phase === "completed" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPhase("idle")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E2442] py-2.5 text-xs font-bold text-[#94A3B8] transition-all hover:text-white"
                  >
                    <RotateCcw size={14} /> Nói lại
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-500"
                  >
                    <CheckCircle2 size={14} /> Hoàn tất & Lưu nháp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
