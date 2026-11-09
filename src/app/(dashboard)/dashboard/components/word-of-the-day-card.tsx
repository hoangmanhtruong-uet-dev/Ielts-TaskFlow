"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordOfTheDayProps {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
}

export function WordOfTheDayCard({
  word,
  phonetic,
  type,
  meaning,
  example,
}: WordOfTheDayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError(true);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    // Attempt to find a high quality English voice (Google or Apple)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Siri")),
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setError(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#4338CA] to-[#312e81] p-5 text-white shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-black">{word}</h3>
          <p className="mt-1 text-sm font-medium text-white/80">
            {phonetic} • {type}
          </p>
        </div>
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          aria-label="Play audio"
          className={cn(
            "grid size-9 place-items-center rounded-full transition-colors",
            isPlaying
              ? "animate-pulse bg-white/40"
              : "bg-white/20 hover:bg-white/30",
          )}
        >
          {error ? (
            <VolumeX size={18} className="text-red-300" />
          ) : (
            <Volume2 size={18} />
          )}
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/95">{meaning}</p>
      <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-white/90 italic">
        "{example}"
      </div>
    </article>
  );
}
