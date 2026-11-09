"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TipItem {
  title: string;
  category: string;
  text: string;
  actionLabel: string;
  href: string;
}

const TIPS: TipItem[] = [
  {
    title: "Context over isolated lists",
    category: "Vocabulary",
    text: 'Learning "ephemeral" in a sentence ("The beauty of a sunset is ephemeral") triggers 3× better recall than learning the word alone. Always read the example.',
    actionLabel: "Merriam-Webster",
    href: "https://www.merriam-webster.com",
  },
  {
    title: "Write what you hear",
    category: "Dictation",
    text: "Dictation trains spelling, listening and punctuation at once. Replay short chunks instead of the whole clip.",
    actionLabel: "Start dictation",
    href: "/dictation",
  },
  {
    title: "Review errors within a day",
    category: "Grammar",
    text: "Mistakes you revisit the same day stick far better than ones left for the weekend.",
    actionLabel: "Review mistakes",
    href: "/error-notebook",
  },
  {
    title: "Short sessions beat long ones",
    category: "Habit",
    text: "Twenty focused minutes every day builds more than one three-hour session on Sunday.",
    actionLabel: "See study plans",
    href: "/plans",
  },
  {
    title: "Shadow native speakers",
    category: "Speaking",
    text: "Repeat a sentence right after you hear it, copying rhythm and stress, not just the words.",
    actionLabel: "Practice listening",
    href: "/practice/listening",
  },
];

export function TipsCarousel() {
  const [activeIdx, setActiveIdx] = useState(2); // default index 2 as in prototype

  const current = TIPS[activeIdx];

  return (
    <section>
      <div className="head">
        <h2>English theory and tips</h2>
      </div>

      <div className="box tip">
        <div className="meta">
          <h3>{current.title}</h3>
          <span className="k">{current.category}</span>
        </div>
        <p>{current.text}</p>
        <Link
          href={current.href}
          prefetch={false}
          className="mt-3 inline-block font-medium transition-colors hover:text-[#EEF0FF]"
        >
          {current.actionLabel} &rarr;
        </Link>
      </div>

      <div className="dots" role="tablist" aria-label="Tips navigation">
        {TIPS.map((tip, i) => (
          <button
            key={i}
            type="button"
            className={i === activeIdx ? "on" : ""}
            onClick={() => setActiveIdx(i)}
            aria-label={`View tip ${i + 1}: ${tip.title}`}
            aria-current={i === activeIdx ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
