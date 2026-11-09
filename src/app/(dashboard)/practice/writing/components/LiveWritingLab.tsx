"use client";

import React, { useState } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";
import {
  PARAPHRASE_DRILLS,
  COHESIVE_DEVICES_MATRIX,
  type ParaphraseDrill,
} from "./writing-curated-data";

export function LiveWritingLab() {
  const [activeTab, setActiveTab] = useState<
    "paraphrase" | "cohesion" | "lexicon"
  >("paraphrase");
  const [selectedDrill, setSelectedDrill] = useState<ParaphraseDrill>(
    PARAPHRASE_DRILLS[0],
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const academicSwaps = [
    {
      weak: "good",
      academic: "advantageous / beneficial / commendable",
      note: "Tránh dùng 'good' chung chung trong luận điểm Task 2",
    },
    {
      weak: "bad",
      academic: "detrimental / adverse / deleterious",
      note: "Tạo sắc thái học thuật khi nói về tác hại môi trường/sức khỏe",
    },
    {
      weak: "a lot of",
      academic: "a substantial proportion of / an array of",
      note: "Dùng để diễn đạt số lượng lớn trong Task 1 và Task 2",
    },
    {
      weak: "show",
      academic: "illustrate / delineate / elucidate",
      note: "Bắt buộc đổi từ cho câu mở đầu Task 1 Report",
    },
    {
      weak: "big problem",
      academic: "pressing conundrum / acute challenge",
      note: "Nâng band phần nêu thực trạng xã hội",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#242A4E] bg-[#12162B] p-5 shadow-xl backdrop-blur-md sm:p-6">
      {/* Header & Tabs */}
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-[#242A4E] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 animate-pulse rounded-full bg-[#A855F7]" />
            <h3 className="text-base font-extrabold tracking-tight text-[#EEF0FF] sm:text-lg">
              Academic Syntax & Cohesion Lab
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            Trạm rèn kỹ thuật Paraphrase câu phức, ma trận liên từ học thuật và
            thay thế từ vựng Band 8.0+.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex shrink-0 rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("paraphrase")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "paraphrase"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            Paraphrase Forge
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cohesion")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "cohesion"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            Cohesion Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lexicon")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "lexicon"
                ? "bg-[#5B5FEF] text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#EEF0FF]"
            }`}
          >
            Lexicon Swap
          </button>
        </div>
      </div>

      {/* Tab 1: Paraphrase Forge */}
      {activeTab === "paraphrase" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PARAPHRASE_DRILLS.map((drill) => (
              <button
                key={drill.id}
                type="button"
                onClick={() => setSelectedDrill(drill)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedDrill.id === drill.id
                    ? "border-[#5B5FEF] bg-[#1E2442] shadow-sm"
                    : "border-[#1E2442] bg-[#0C0E1D]/60 hover:border-[#2E3660]"
                }`}
              >
                <span className="font-mono text-[10px] font-bold text-[#A855F7] uppercase">
                  MẪU CÂU {drill.id.toUpperCase()}
                </span>
                <p className="mt-0.5 line-clamp-1 text-xs font-bold text-[#EEF0FF]">
                  {drill.originalSentence}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-4 rounded-xl border border-[#1E2442] bg-[#0C0E1D] p-4 sm:p-5">
            <div>
              <span className="mb-1 block font-mono text-[11px] text-[#94A3B8] uppercase">
                Original Prompt Sentence (Câu gốc trong đề bài):
              </span>
              <p className="rounded-xl border border-[#242A4E] bg-[#12162B] p-3 text-sm font-semibold text-white">
                &quot;{selectedDrill.originalSentence}&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Band 6 Attempt */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                    BAND 6.0 ATTEMPT
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    Dịch thô theo từng từ
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#EEF0FF]">
                  &quot;{selectedDrill.band6Attempt}&quot;
                </p>
              </div>

              {/* Band 8 Paraphrase */}
              <div className="group relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                    BAND 8.0+ ACADEMIC PARAPHRASE
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        selectedDrill.band8Paraphrase,
                        selectedDrill.id,
                      )
                    }
                    className="rounded p-1 text-[#94A3B8] hover:text-white"
                    aria-label="Sao chép câu Band 8"
                  >
                    {copiedId === selectedDrill.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-xs leading-relaxed font-medium text-white">
                  &quot;{selectedDrill.band8Paraphrase}&quot;
                </p>
              </div>
            </div>

            <div className="border-t border-[#1E2442] pt-3 text-xs text-[#94A3B8]">
              <strong className="text-[#00F0FF]">Kỹ thuật chuyển đổi: </strong>
              <span>{selectedDrill.technique}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cohesion Matrix */}
      {activeTab === "cohesion" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {COHESIVE_DEVICES_MATRIX.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-[#242A4E] bg-[#0C0E1D] p-4"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded border border-[#5B5FEF]/30 bg-[#5B5FEF]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#7A7DF5] uppercase">
                    {item.category} Linkers
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    BAND 8.0+ COHESION
                  </span>
                </div>

                <div className="mb-2 space-y-1">
                  <span className="text-[11px] text-[#64748B]">
                    Từ nối phổ thông:
                  </span>
                  <p className="text-xs text-[#94A3B8] line-through">
                    {item.commonLinkers.join(" · ")}
                  </p>
                </div>

                <div className="mb-3 space-y-1">
                  <span className="text-[11px] font-bold text-[#00F0FF]">
                    Nâng cấp học thuật:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.advancedBand8Linkers.map((linker, i) => (
                      <span
                        key={i}
                        className="rounded border border-[#2E3660] bg-[#1E2442] px-2 py-0.5 font-mono text-xs font-bold text-white"
                      >
                        {linker}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1E2442] pt-2 text-[11px] text-[#94A3B8]">
                <span className="font-semibold text-[#A5B4FC]">Ví dụ: </span>
                <span>&quot;{item.exampleSentence}&quot;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Lexicon Swap */}
      {activeTab === "lexicon" && (
        <div className="space-y-2">
          {academicSwaps.map((swap, i) => (
            <div
              key={i}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[#242A4E] bg-[#0C0E1D] p-3 sm:flex-row sm:items-center sm:p-4"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-400 line-through">
                  {swap.weak}
                </span>
                <ArrowRight size={14} className="shrink-0 text-[#64748B]" />
                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                  {swap.academic}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] sm:max-w-md">{swap.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
