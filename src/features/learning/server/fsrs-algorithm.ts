import "server-only";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface SRSState {
  repetitions: number;
  intervalDays: number;
  easinessFactor: number;
  lastReviewedAt: string;
  dueAt: string;
}

const RATING_SCORES: Record<ReviewRating, number> = {
  again: 1,
  hard: 2,
  good: 4,
  easy: 5,
};

export function calculateNextSRSState(
  currentState: SRSState | null,
  rating: ReviewRating,
  now: Date = new Date(),
): SRSState {
  const currentRepetitions = currentState?.repetitions ?? 0;
  const currentInterval = currentState?.intervalDays ?? 0;
  const currentEasiness = currentState?.easinessFactor ?? 2.5;

  const score = RATING_SCORES[rating];

  let nextRepetitions = currentRepetitions;
  let nextInterval = currentInterval;
  let nextEasiness = currentEasiness;

  if (score < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    if (currentRepetitions === 0) {
      nextInterval = 1;
    } else if (currentRepetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(currentInterval * currentEasiness);
    }
    nextRepetitions = currentRepetitions + 1;
  }

  // Adjust easiness factor
  nextEasiness = Math.max(
    1.3,
    currentEasiness + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)),
  );
  nextEasiness = Math.round(nextEasiness * 100) / 100;

  // Bonus/penalty adjustments for ratings
  if (rating === "easy") {
    nextInterval = Math.round(nextInterval * 1.3);
  } else if (rating === "hard") {
    nextInterval = Math.max(1, Math.round(nextInterval * 0.8));
  }

  const dueAtDate = new Date(
    now.getTime() + nextInterval * 24 * 60 * 60 * 1000,
  );

  return {
    repetitions: nextRepetitions,
    intervalDays: nextInterval,
    easinessFactor: nextEasiness,
    lastReviewedAt: now.toISOString(),
    dueAt: dueAtDate.toISOString(),
  };
}
