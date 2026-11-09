"use client";

import React, { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

/**
 * Theory tips sourced from:
 * - Cambridge English: https://www.cambridgeenglish.org/learning-english/
 * - British Council: https://learnenglish.britishcouncil.org/
 * - Merriam-Webster: https://www.merriam-webster.com/words-at-play
 * - Vocabulary.com: https://www.vocabulary.com/articles/
 */
const TIPS = [
  {
    title: "The Shadowing Technique",
    body: "Listen to a native speaker and repeat simultaneously — matching rhythm, stress, and intonation. Used by language schools worldwide to accelerate speaking fluency.",
    source: "Cambridge English",
    href: "https://www.cambridgeenglish.org",
    tag: "Speaking",
    tagColor: "bg-sky-50 text-sky-700",
  },
  {
    title: "Spaced Repetition = 95% Retention",
    body: "Review a word after 1 day → 3 days → 7 days → 14 days. Studies show 95% retention vs. 40% for massed practice. Your flashcard sessions are built on this science.",
    source: "British Council",
    href: "https://learnenglish.britishcouncil.org",
    tag: "Vocabulary",
    tagColor: "bg-violet-50 text-violet-700",
  },
  {
    title: "Context Over Isolated Lists",
    body: 'Learning "ephemeral" in a sentence ("The beauty of a sunset is ephemeral") triggers 3× better recall than learning the word alone. Always read the example.',
    source: "Merriam-Webster",
    href: "https://www.merriam-webster.com",
    tag: "Vocabulary",
    tagColor: "bg-violet-50 text-violet-700",
  },
  {
    title: "IELTS Academic Wordlist: 570 words",
    body: "The Academic Word List (AWL) covers 10% of all words in academic texts. Mastering these 570 words gives a huge score boost in IELTS Reading & Writing.",
    source: "Vocabulary.com",
    href: "https://www.vocabulary.com",
    tag: "IELTS",
    tagColor: "bg-amber-50 text-amber-700",
  },
  {
    title: "Dictation Trains Multiple Skills",
    body: "Writing down what you hear forces your brain to process phonemes, vocabulary, and grammar simultaneously — more effective than passive listening alone.",
    source: "Cambridge English",
    href: "https://www.cambridgeenglish.org",
    tag: "Listening",
    tagColor: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "The Grammar Accuracy Loop",
    body: "Notice → Understand the rule → Practise in drills → Use in free writing. Skipping any step creates fragile grammar that breaks under pressure (exams, speaking).",
    source: "British Council",
    href: "https://learnenglish.britishcouncil.org",
    tag: "Grammar",
    tagColor: "bg-rose-50 text-rose-700",
  },
];

export const TheoryTipCard = memo(function TheoryTipCard() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TIPS.length);
        setAnimating(false);
      }, 200);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const tip = TIPS[idx];

  return (
    <div>
      {/* Card */}
      <div
        className={cn(
          "app-panel border-l-2 border-l-[var(--primary)] p-4 transition-opacity duration-200",
          animating ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm leading-snug font-bold text-[var(--foreground)]">
            {tip.title}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
              tip.tagColor,
            )}
          >
            {tip.tag}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          {tip.body}
        </p>
        <a
          href={tip.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[11px] font-semibold text-[var(--primary)] hover:underline"
        >
          {tip.source} →
        </a>
      </div>

      {/* Dot nav */}
      <div className="mt-2 flex justify-center gap-1">
        {TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Tip ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === idx
                ? "w-5 bg-[var(--primary)]"
                : "w-1.5 bg-[var(--muted)] hover:bg-[var(--border-strong)]",
            )}
          />
        ))}
      </div>
    </div>
  );
});
