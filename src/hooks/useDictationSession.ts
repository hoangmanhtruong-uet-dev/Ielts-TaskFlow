"use client";

import { useState, useCallback } from "react";
import type {
  DictationSentence,
  DictationSubmitResult,
} from "@/types/dictation";

interface UseDictationSessionProps {
  exerciseId: string;
  sentences: DictationSentence[];
}

export function useDictationSession({
  exerciseId,
  sentences,
}: UseDictationSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, DictationSubmitResult>>(
    new Map(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentenceStartTime, setSentenceStartTime] = useState<number>(Date.now);

  const currentSentence = sentences[currentIndex] ?? null;
  const isLastSentence = currentIndex === sentences.length - 1;
  const isSessionComplete = results.size === sentences.length;

  const completedCount = results.size;
  const totalCount = sentences.length;
  const overallAccuracy =
    results.size > 0
      ? Array.from(results.values()).reduce(
          (sum, r) => sum + r.accuracy_score,
          0,
        ) / results.size
      : 0;

  const submitAnswer = useCallback(
    async (userInput: string, replayCount: number) => {
      if (!currentSentence || isSubmitting) return null;

      setIsSubmitting(true);
      const timeSpent = Math.round((Date.now() - sentenceStartTime) / 1000);

      try {
        const response = await fetch("/api/dictation/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId,
            sentenceId: currentSentence.id,
            userInput,
            timeSpent,
            replayCount,
          }),
        });

        if (!response.ok) throw new Error("Submit failed");

        const result: DictationSubmitResult = await response.json();

        setResults((prev) => {
          const next = new Map(prev);
          next.set(currentSentence.id, result);
          return next;
        });

        return result;
      } catch (error) {
        console.error("Submit error:", error);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentSentence, exerciseId, isSubmitting, sentenceStartTime],
  );

  const goToNext = useCallback(() => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSentenceStartTime(Date.now());
    }
  }, [currentIndex, sentences.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSentenceStartTime(Date.now());
    }
  }, [currentIndex]);

  const goToSentence = useCallback(
    (index: number) => {
      if (index >= 0 && index < sentences.length) {
        setCurrentIndex(index);
        setSentenceStartTime(Date.now());
      }
    },
    [sentences.length],
  );

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setResults(new Map());
    setSentenceStartTime(Date.now());
  }, []);

  return {
    currentIndex,
    currentSentence,
    isLastSentence,
    isSessionComplete,
    isSubmitting,
    results,
    completedCount,
    totalCount,
    overallAccuracy,
    submitAnswer,
    goToNext,
    goToPrevious,
    goToSentence,
    resetSession,
  };
}
