export interface DictationExercise {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: number; // 1-5
  audio_url: string;
  audio_url_low: string | null;
  thumbnail_url: string | null;
  total_sentences: number;
  duration_seconds: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DictationSentence {
  id: string;
  exercise_id: string;
  order_index: number;
  text: string;
  start_time: number;
  end_time: number;
  hint: string | null;
}

export interface DictationAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  sentence_id: string;
  user_input: string;
  accuracy_score: number;
  correct_words: number;
  total_words: number;
  time_spent_seconds: number;
  replay_count: number;
  created_at: string;
}

export interface DictationProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  best_score: number;
  latest_score: number;
  attempts_count: number;
  completed_sentences: number;
  total_sentences: number;
  completed: boolean;
  last_attempted_at: string;
  created_at: string;
}

export interface DictationSubmitResult {
  attempt_id: string;
  accuracy_score: number;
  correct_words: number;
  total_words: number;
  correct_text: string;
  user_input_normalized: string;
}

export interface DictationUserStats {
  total_exercises_attempted: number;
  total_exercises_completed: number;
  average_best_score: number;
  total_attempts: number;
  last_practiced: string | null;
}

export interface DictationSessionState {
  exerciseId: string;
  currentSentenceIndex: number;
  sentences: DictationSentence[];
  results: Map<string, DictationSubmitResult>;
  isPlaying: boolean;
  playbackSpeed: number;
  replayCount: number;
}

export type DictationDifficulty = 1 | 2 | 3 | 4 | 5;
export type DictationCategory =
  "general" | "business" | "academic" | "daily" | "news";

export interface WordDiff {
  word: string;
  type: "correct" | "incorrect" | "missing" | "extra";
  expected?: string;
}
