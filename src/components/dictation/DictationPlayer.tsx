"use client";

import React, { useCallback, useEffect, useRef } from "react";
import type { DictationExercise, DictationSentence } from "@/types/dictation";
import { useDictationAudio } from "@/hooks/useDictationAudio";
import { useDictationSession } from "@/hooks/useDictationSession";
import { DictationAudioControls } from "./DictationAudioControls";
import { DictationProgressBar } from "./DictationProgressBar";
import { DictationSentenceInput } from "./DictationSentenceInput";
import { DictationResultPanel } from "./DictationResultPanel";

interface Props {
  exercise: DictationExercise;
  sentences: DictationSentence[];
}

export function DictationPlayer({ exercise, sentences }: Props) {
  const audio = useDictationAudio({
    audioUrl: exercise.audio_url,
    audioUrlLow: exercise.audio_url_low,
  });

  const session = useDictationSession({
    exerciseId: exercise.id,
    sentences,
  });

  // Auto-play current sentence when navigating
  const handleReplaySentence = useCallback(() => {
    if (session.currentSentence) {
      audio.playSentence(
        session.currentSentence.start_time,
        session.currentSentence.end_time,
      );
    }
  }, [audio, session.currentSentence]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        handleReplaySentence();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleReplaySentence]);

  const { isLoading: isAudioLoading, playSentence: playAudioSentence } = audio;
  const hasAutoPlayedRef = useRef(false);

  // Auto-play first sentence on mount
  useEffect(() => {
    if (hasAutoPlayedRef.current || sentences.length === 0 || isAudioLoading) {
      return;
    }
    const timer = setTimeout(() => {
      hasAutoPlayedRef.current = true;
      playAudioSentence(sentences[0].start_time, sentences[0].end_time);
    }, 500);
    return () => clearTimeout(timer);
  }, [isAudioLoading, playAudioSentence, sentences]);

  const handleSubmit = useCallback(
    async (userInput: string) => {
      return session.submitAnswer(userInput, audio.replayCount);
    },
    [session, audio.replayCount],
  );

  const handleNext = useCallback(() => {
    if (session.isLastSentence) {
      // Session complete — show results
      return;
    }
    session.goToNext();
    // Auto-play next sentence
    const nextSentence = sentences[session.currentIndex + 1];
    if (nextSentence) {
      setTimeout(() => {
        audio.playSentence(nextSentence.start_time, nextSentence.end_time);
      }, 300);
    }
  }, [session, sentences, audio]);

  // Show result panel when session is complete
  if (session.isSessionComplete) {
    return (
      <DictationResultPanel
        exerciseId={exercise.id}
        exerciseTitle={exercise.title}
        sentences={sentences}
        results={session.results}
        onRestart={session.resetSession}
      />
    );
  }

  const completedIds = new Set(session.results.keys());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{exercise.title}</h1>
        {exercise.description && (
          <p className="mt-1 text-gray-500">{exercise.description}</p>
        )}
      </div>

      {/* Progress */}
      <DictationProgressBar
        current={session.currentIndex}
        total={session.totalCount}
        completedSentenceIds={completedIds}
        sentenceIds={sentences.map((s) => s.id)}
        onSentenceClick={(index) => {
          session.goToSentence(index);
          const s = sentences[index];
          if (s) {
            setTimeout(() => audio.playSentence(s.start_time, s.end_time), 200);
          }
        }}
      />

      {/* Audio Controls */}
      <DictationAudioControls
        isPlaying={audio.isPlaying}
        isLoading={audio.isLoading}
        playbackSpeed={audio.playbackSpeed}
        replayCount={audio.replayCount}
        onTogglePlay={audio.togglePlay}
        onReplaySentence={handleReplaySentence}
        onSpeedChange={audio.setPlaybackSpeed}
      />

      {/* Input */}
      {session.currentSentence && (
        <DictationSentenceInput
          key={session.currentSentence.id}
          sentenceId={session.currentSentence.id}
          hint={session.currentSentence.hint}
          isSubmitting={session.isSubmitting}
          existingResult={
            session.results.get(session.currentSentence.id) ?? null
          }
          onSubmit={handleSubmit}
          onNext={handleNext}
          isLast={session.isLastSentence}
        />
      )}

      {/* Keyboard shortcuts hint */}
      <div className="space-x-4 text-center text-xs text-gray-400">
        <span>Ctrl+Space: Nghe lại</span>
        <span>Enter: Kiểm tra / Câu tiếp</span>
      </div>
    </div>
  );
}
