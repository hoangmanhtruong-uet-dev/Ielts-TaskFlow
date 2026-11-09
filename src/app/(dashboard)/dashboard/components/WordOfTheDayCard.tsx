"use client";

import React, { useState, useEffect } from "react";
import {
  saveVocabAction,
  checkWordInVaultAction,
} from "@/features/learning/vocabulary-actions";

interface WordOfTheDayCardProps {
  wordInfo?: {
    word: string;
    phonetics: string;
    type: string;
    level: string;
    definition: string;
    example?: string;
  };
}

const DEFAULT_WORD = {
  word: "Resilience",
  phonetics: "/rɪˈzɪl.jəns/",
  type: "noun",
  level: "C1",
  definition: "The capacity to recover quickly from difficulties; toughness.",
};

export function WordOfTheDayCard({ wordInfo }: WordOfTheDayCardProps) {
  const info = wordInfo ?? DEFAULT_WORD;
  const [inVault, setInVault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkSaved() {
      try {
        const res = await checkWordInVaultAction(info.word);
        if (res.success && res.inVault) {
          setInVault(true);
        }
      } catch {
        // Ignore check failure
      }
    }
    checkSaved();
  }, [info.word]);

  const handleSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(info.word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleVault = async () => {
    if (saving || inVault) return;
    setSaving(true);
    try {
      const res = await saveVocabAction({ term: info.word });
      if (res.success) {
        setInVault(true);
      }
    } catch (err) {
      console.error("Failed to add to vault:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="box wod">
      <div className="head" style={{ marginBottom: "10px" }}>
        <h2
          style={{
            fontSize: "16px",
            color: "var(--mute)",
            fontWeight: 600,
            fontFamily: "var(--body)",
            letterSpacing: 0,
          }}
        >
          Word of the day
        </h2>
        <span className="lv">{info.level}</span>
      </div>

      <h3>
        {info.word}{" "}
        <button
          type="button"
          className="spk"
          onClick={handleSpeak}
          aria-label={`Play pronunciation of ${info.word}`}
          title="Play pronunciation"
        >
          ♪
        </button>
      </h3>

      <div className="ph">
        {info.phonetics} &middot; {info.type}
      </div>

      <p>{info.definition}</p>

      <button
        type="button"
        className="add"
        aria-pressed={inVault}
        onClick={handleToggleVault}
        disabled={saving}
      >
        {inVault
          ? "✓ Added to your word list"
          : saving
            ? "Saving..."
            : "+ Add to my word list"}
      </button>
    </div>
  );
}
