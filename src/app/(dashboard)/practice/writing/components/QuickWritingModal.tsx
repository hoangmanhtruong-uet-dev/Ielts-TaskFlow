"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
} from "lucide-react";
import type { CuratedWritingTask } from "./writing-curated-data";

interface QuickWritingModalProps {
  task: CuratedWritingTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickWritingModal({
  task,
  isOpen,
  onClose,
}: QuickWritingModalProps) {
  if (!isOpen || !task) return null;
  return <QuickWritingModalBody key={task.id} task={task} onClose={onClose} />;
}

function QuickWritingModalBody({
  task,
  onClose,
}: {
  task: CuratedWritingTask;
  onClose: () => void;
}) {
  const [essayContent, setEssayContent] = useState("");
  const [timeLeftSecs, setTimeLeftSecs] = useState(task.timeLimitMinutes * 60);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted || timeLeftSecs <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSecs((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeftSecs]);

  // Real-time word count & lexical metrics
  const wordCount = useMemo(() => {
    const trimmed = essayContent.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [essayContent]);

  const lexicalDiversity = useMemo(() => {
    const trimmed = essayContent.trim();
    if (!trimmed) return 0;
    const words = trimmed.toLowerCase().split(/\s+/);
    const unique = new Set(words);
    return Math.round((unique.size / words.length) * 100);
  }, [essayContent]);

  const minWords = task.minWords;
  const isTargetReached = wordCount >= minWords;

  const handleSaveLocalDraft = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(`quick-writing:${task.id}`, essayContent);
      }
    } catch {
      // ignore private storage restrictions
    }
    setSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="writing-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md duration-300 sm:p-5"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#242A4E] bg-[#0C0E1D] shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#242A4E] bg-[#12162B] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-[#7A7DF5] uppercase">
              IELTS {task.taskType.toUpperCase()} STUDIO
            </span>
            <span className="text-xs font-semibold text-[#94A3B8]">
              Target Band {task.targetBand.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Timer */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#1E2442] bg-[#0C0E1D] px-3 py-1 font-mono text-xs font-bold text-[#00F0FF]">
              <Clock size={13} />
              <span>{formatTime(timeLeftSecs)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ làm bài"
              className="rounded-xl p-1.5 text-[#94A3B8] transition-colors hover:bg-[#1E2442] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split-View */}
        <div className="grid flex-1 grid-cols-1 divide-y divide-[#242A4E] overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left Column: Task Prompt, Outline & Recommended Lexicon */}
          <div className="space-y-6 overflow-y-auto p-6 lg:col-span-5">
            <div>
              <span className="text-[11px] font-bold tracking-wide text-[#A855F7] uppercase">
                {task.category} · {task.topic}
              </span>
              <h2
                id="writing-modal-title"
                className="mt-1 text-lg leading-snug font-black text-white"
              >
                {task.title}
              </h2>
            </div>

            {/* Prompt Box */}
            <div className="space-y-2 rounded-2xl border border-[#242A4E] bg-[#12162B] p-4 text-xs">
              <p className="leading-relaxed font-semibold text-[#EEF0FF]">
                {task.prompt}
              </p>
              {task.chartDescription && (
                <div className="rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-2.5 text-[#94A3B8]">
                  <strong className="mb-1 block text-[#00F0FF]">
                    Dữ liệu biểu đồ tóm tắt:
                  </strong>
                  {task.chartDescription}
                </div>
              )}
            </div>

            {/* Model Outline Guide */}
            <div>
              <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#A5B4FC] uppercase">
                <BookOpen size={13} className="text-[#5B5FEF]" /> Cấu Trúc Dàn Ý
                4 Đoạn Chuẩn:
              </h4>
              <div className="space-y-2">
                {task.modelOutline.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#1E2442] bg-[#12162B] p-3 text-xs"
                  >
                    <div className="mb-1 flex items-center justify-between font-bold text-white">
                      <span>{item.paragraph}</span>
                      <span className="font-mono text-[10px] text-[#7A7DF5]">
                        {item.focus}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#00F0FF]">
                      Gợi ý: &quot;{item.starterPhrase}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended C1/C2 Vocabulary */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#A5B4FC] uppercase">
                <Sparkles size={13} className="text-[#00F0FF]" /> C1/C2 Lexical
                Recommendations:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {task.recommendedVocabulary.map((vocab, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#1E2442] bg-[#12162B] p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{vocab.word}</strong>
                      <span className="rounded bg-[#5B5FEF]/30 px-1 font-mono text-[10px] text-[#7A7DF5]">
                        {vocab.band}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-[#94A3B8]">
                      {vocab.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Zen Focus Markdown Writing Area */}
          <div className="flex flex-col justify-between space-y-4 bg-[#080A14] p-6 lg:col-span-7">
            {/* Live Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#242A4E] bg-[#12162B] p-3">
              <div className="flex items-center gap-4">
                {/* Word Counter */}
                <div className="flex items-center gap-2">
                  <FileText
                    size={15}
                    className={
                      isTargetReached ? "text-emerald-400" : "text-amber-400"
                    }
                  />
                  <span className="text-xs font-bold text-[#EEF0FF]">
                    <strong
                      className={`font-mono text-sm ${isTargetReached ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {wordCount}
                    </strong>{" "}
                    / {minWords} từ
                  </span>
                </div>

                {/* Lexical Diversity */}
                <div className="text-xs text-[#94A3B8]">
                  Đa dạng từ vựng:{" "}
                  <strong className="font-mono text-[#00F0FF]">
                    {lexicalDiversity}%
                  </strong>
                </div>
              </div>

              {isTargetReached ? (
                <span className="flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 size={12} /> Đã đủ số từ tối thiểu
                </span>
              ) : (
                <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                  Cần thêm {Math.max(0, minWords - wordCount)} từ
                </span>
              )}
            </div>

            {/* Essay Textarea Editor */}
            <div className="flex min-h-[300px] flex-1 flex-col">
              <textarea
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="Nhập bài luận của bạn tại đây... Hãy bắt đầu với Introduction (Paraphrase + Thesis Statement)."
                className="w-full flex-1 resize-none rounded-2xl border border-[#242A4E] bg-[#0C0E1D] p-4 font-sans text-sm leading-relaxed text-[#EEF0FF] placeholder:text-[#64748B] focus:border-[#5B5FEF] focus:outline-none"
              />
            </div>

            {/* Submission Status or Action Buttons */}
            {submitted ? (
              <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={15} /> Bài viết đã được lưu nháp thành
                    công!
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8]">
                    {wordCount} words recorded
                  </span>
                </div>

                {/* Honest Local Draft Summary */}
                <div className="grid grid-cols-3 gap-2 border-t border-[#1E2442] pt-2 text-center">
                  <div className="rounded-lg bg-[#0C0E1D] p-2">
                    <span className="block text-[10px] text-[#94A3B8]">
                      Số từ đã viết
                    </span>
                    <strong className="font-mono text-xs text-[#00F0FF]">
                      {wordCount} từ
                    </strong>
                  </div>
                  <div className="rounded-lg bg-[#0C0E1D] p-2">
                    <span className="block text-[10px] text-[#94A3B8]">
                      Đa dạng từ vựng
                    </span>
                    <strong className="font-mono text-xs text-[#7A7DF5]">
                      {lexicalDiversity}%
                    </strong>
                  </div>
                  <div className="rounded-lg bg-[#0C0E1D] p-2">
                    <span className="block text-[10px] text-[#94A3B8]">
                      Độ dài mục tiêu
                    </span>
                    <strong className="font-mono text-xs text-emerald-400">
                      {isTargetReached ? "Đạt" : `${wordCount}/${minWords}`}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Bản nháp được lưu trong phiên trình duyệt này. Để lưu vĩnh
                  viễn và chấm 4 tiêu chí IELTS bằng AI, hãy mở một nhiệm vụ ở
                  mục &quot;Nhiệm Vụ Writing Từ Hệ Thống Đã Lưu&quot;.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
                >
                  Đóng studio & Quay lại thư viện
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEssayContent("")}
                  className="rounded-xl bg-[#1E2442] px-4 py-3 text-xs font-bold text-[#94A3B8] transition-colors hover:bg-[#2A335E] hover:text-white"
                >
                  Xóa bài
                </button>
                <button
                  type="button"
                  onClick={handleSaveLocalDraft}
                  disabled={wordCount === 0}
                  className="flex-1 rounded-xl bg-[#5B5FEF] py-3 text-xs font-bold text-white shadow-lg shadow-[#5B5FEF]/25 transition-all hover:bg-[#4D51DE] disabled:pointer-events-none disabled:opacity-40"
                >
                  Lưu nháp & Kiểm tra tiêu chí IELTS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
