"use client";

import React, { useState, useEffect } from "react";
import { getSavedVaultTermsAction } from "@/features/learning/vocabulary-actions";

interface Flashcard {
  question: string;
  answer: string;
  hint?: string;
}

const DEFAULT_CARDS: Flashcard[] = [
  { question: "To be accustomed ___", answer: "to", hint: "Preposition" },
  { question: "She is good ___ maths", answer: "at", hint: "Preposition" },
  {
    question: "Look ___ the word in a dictionary",
    answer: "up",
    hint: "Phrasal verb",
  },
  {
    question: "He apologised ___ being late",
    answer: "for",
    hint: "Preposition",
  },
  {
    question: "She is capable ___ handling it",
    answer: "of",
    hint: "Preposition",
  },
  {
    question: "Pay attention ___ the instructions",
    answer: "to",
    hint: "Collocation",
  },
];

export function QuickPracticeCard() {
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_CARDS);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    async function loadVaultWords() {
      try {
        const res = await getSavedVaultTermsAction();
        if (res.success && res.terms && res.terms.length > 0) {
          const vaultCards: Flashcard[] = res.terms.map((term) => ({
            question: `What does "${term}" mean?`,
            answer: term,
            hint: "Saved Vocabulary",
          }));
          setCards([...DEFAULT_CARDS, ...vaultCards]);
        }
      } catch {
        // Fallback to default cards
      }
    }
    loadVaultWords();
  }, []);

  const current = cards[index] ?? DEFAULT_CARDS[0];

  const handleNext = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const renderQuestion = () => {
    if (current.question.includes("___")) {
      const parts = current.question.split("___");
      return (
        <>
          {parts[0]}
          <em>&nbsp;&nbsp;&nbsp;&nbsp;</em>
          {parts[1]}
        </>
      );
    }
    return current.question;
  };

  return (
    <div className="box">
      <button
        type="button"
        className="flip"
        onClick={() => setFlipped(!flipped)}
        aria-live="polite"
        aria-label={
          flipped
            ? `Answer: ${current.answer}`
            : `Question: ${current.question}. Tap to flip`
        }
      >
        {flipped ? (
          <div>
            <small>
              {current.hint ? `Answer (${current.hint})` : "Answer"}
            </small>
            <b>
              <em>{current.answer}</em>
            </b>
          </div>
        ) : (
          <div>
            <small>Tap to flip</small>
            <b>{renderQuestion()}</b>
          </div>
        )}
      </button>

      <div className="fb">
        <button
          type="button"
          className="yes"
          onClick={handleNext}
          aria-label="I knew this card"
        >
          I knew this
        </button>
        <button type="button" onClick={handleNext} aria-label="Needs review">
          Needs review
        </button>
      </div>
    </div>
  );
}
