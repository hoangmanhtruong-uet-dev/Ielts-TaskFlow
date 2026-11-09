"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Bookmark, Check, Loader2, Sparkles, Volume2, X } from "lucide-react";

import { saveVocabAction } from "@/features/learning/vocabulary-actions";

interface WordData {
  word: string;
  phonetic?: string | null;
  audio?: string | null;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string | null;
      synonyms?: string[];
    }>;
  }>;
  collocations: string[];
  synonyms: string[];
}

const VALID_TERM_PATTERN =
  /^[a-zA-Z][a-zA-Z'-]{0,39}(?:\s+[a-zA-Z][a-zA-Z'-]{0,39})?$/;

export function VocabHighlightPopover({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const [selectedText, setSelectedText] = useState<string>("");
  const [coords, setCoords] = useState<{
    x: number;
    y: number;
    placeBelow: boolean;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const popoverRef = useRef<HTMLDivElement>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const fetchWordDetails = useCallback(async (term: string) => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    setWordData(null);

    try {
      const res = await fetch(
        `/api/dictionary/${encodeURIComponent(term.toLowerCase())}`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        setError("Không tìm thấy định nghĩa cho từ này.");
        return;
      }
      const data = await res.json();
      setWordData(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError("Không thể tải thông tin từ vựng lúc này.");
    } finally {
      if (fetchAbortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleMouseUp() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return;
      }

      if (
        popoverRef.current &&
        selection.anchorNode &&
        popoverRef.current.contains(selection.anchorNode)
      ) {
        return;
      }

      const anchorEl =
        selection.anchorNode instanceof Element
          ? selection.anchorNode
          : selection.anchorNode?.parentElement;
      if (
        anchorEl?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      const raw = selection.toString().trim();
      const clean = raw
        .replace(
          /^[.,/#!$%^&*;:{}=\-_`~()?"'“”—]+|[.,/#!$%^&*;:{}=\-_`~()?"'“”—]+$/g,
          "",
        )
        .replace(/\s+/g, " ")
        .trim();

      if (!clean || clean.length < 2 || !VALID_TERM_PATTERN.test(clean)) {
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const halfWidth = Math.min(160, Math.max(100, window.innerWidth * 0.42));
      const minX = halfWidth + 12;
      const maxX = Math.max(minX, window.innerWidth - halfWidth - 12);
      const centerX = rect.left + rect.width / 2;
      const x = Math.min(Math.max(minX, centerX), maxX);

      const placeBelow = rect.top < 260;
      const y = placeBelow
        ? rect.bottom + window.scrollY + 10
        : rect.top + window.scrollY - 10;

      setSelectedText(clean);
      setCoords({ x, y, placeBelow });
      setIsOpen(true);
      setSaved(false);
      setSaveError(null);
      void fetchWordDetails(clean);
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [enabled, fetchWordDetails]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (enabled && isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled, isOpen]);

  useEffect(() => {
    return () => {
      fetchAbortRef.current?.abort();
    };
  }, []);

  function handlePlayAudio() {
    if (wordData?.audio) {
      const audio = new Audio(wordData.audio);
      audio.play().catch(() => playSpeechFallback());
    } else {
      playSpeechFallback();
    }
  }

  function playSpeechFallback() {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleSaveWord() {
    if (!selectedText || saved) return;
    setSaveError(null);
    startSaving(async () => {
      try {
        const res = await saveVocabAction({ term: selectedText.toLowerCase() });
        if (!res.success) {
          setSaveError(res.error || "Không thể lưu từ vào sổ từ.");
          return;
        }
        setSaved(true);
      } catch {
        setSaveError("Không thể lưu từ vào sổ từ lúc này.");
      }
    });
  }

  if (!enabled || !isOpen || !coords) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        transform: coords.placeBelow
          ? "translate(-50%, 0)"
          : "translate(-50%, -100%)",
      }}
      className="animate-in fade-in zoom-in-95 z-50 w-80 max-w-[90vw] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl backdrop-blur-md transition-all duration-150"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-lg font-bold text-slate-900 capitalize">
              {wordData?.word || selectedText}
            </span>
            <button
              type="button"
              onClick={handlePlayAudio}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="Phát âm"
            >
              <Volume2 size={15} />
            </button>
          </div>
          {wordData?.phonetic ? (
            <p className="font-mono text-xs text-slate-500">
              {wordData.phonetic}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="my-3 max-h-56 space-y-2.5 overflow-y-auto pr-1 text-xs text-slate-600">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 className="animate-spin text-emerald-500" size={20} />
            <span>Đang tra cứu từ điển...</span>
          </div>
        ) : error ? (
          <p className="py-3 text-center text-slate-400">{error}</p>
        ) : wordData ? (
          <>
            {wordData.meanings.slice(0, 2).map((meaning, idx) => (
              <div key={idx} className="space-y-1">
                <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                  {meaning.partOfSpeech}
                </span>
                {meaning.definitions.slice(0, 2).map((def, dIdx) => (
                  <div
                    key={dIdx}
                    className="space-y-0.5 border-l-2 border-emerald-400/50 pl-1"
                  >
                    <p className="leading-relaxed font-medium text-slate-800">
                      {def.definition}
                    </p>
                    {def.example ? (
                      <p className="text-[11px] text-slate-500 italic">
                        &ldquo;{def.example}&rdquo;
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}

            {wordData.collocations && wordData.collocations.length > 0 ? (
              <div className="border-t border-slate-100 pt-2">
                <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <Sparkles size={12} className="text-emerald-500" />
                  <span>Cụm từ hay đi kèm (Collocations):</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {wordData.collocations.slice(0, 5).map((col, cIdx) => (
                    <span
                      key={cIdx}
                      className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                    >
                      {col} {wordData.word}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {saveError ? (
        <p role="alert" className="mb-2 text-[11px] font-medium text-rose-600">
          {saveError}
        </p>
      ) : null}

      {/* Footer Action */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[10px] text-slate-400">
          Từ điển Oxford / Datamuse
        </span>
        <button
          type="button"
          onClick={handleSaveWord}
          disabled={saved || isSaving}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
            saved
              ? "cursor-default bg-slate-100 text-slate-600"
              : "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95"
          }`}
        >
          {saved ? (
            <>
              <Check size={13} />
              <span>Đã lưu sổ từ</span>
            </>
          ) : (
            <>
              <Bookmark size={13} />
              <span>{isSaving ? "Đang lưu..." : "Lưu vào sổ từ"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
