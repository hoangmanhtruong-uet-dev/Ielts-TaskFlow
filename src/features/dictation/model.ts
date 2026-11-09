export type DictationDifficulty = "beginner" | "intermediate" | "advanced";

export type DictationSentence = {
  id: string;
  position: number;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  translation?: string;
  hint?: string;
};

export type DictationExercise = {
  dbExerciseId?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: DictationDifficulty;
  audioUrl: string;
  durationSeconds: number;
  sentences: DictationSentence[];
};

export type WordDiffStatus = "correct" | "missing" | "extra" | "typo";

export type WordDiffItem = {
  word: string;
  status: WordDiffStatus;
  userWord?: string;
};

export type SentenceDiffResult = {
  sentenceId: string;
  targetText: string;
  userText: string;
  accuracyPercent: number;
  wordCount: number;
  correctCount: number;
  diffItems: WordDiffItem[];
};

/**
 * Normalizes text for comparison: lowercases, removes punctuation, trims extra spaces.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenizes text into word tokens preserving basic contractions (e.g. don't).
 */
export function tokenizeWords(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(" ");
}

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1,
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Computes a detailed word-level diff between target text and user text.
 */
export function diffSentenceText(
  targetText: string,
  userText: string,
): SentenceDiffResult {
  const targetWords = tokenizeWords(targetText);
  const userWords = tokenizeWords(userText);

  // Use Dynamic Programming (LCS / alignment) to align target and user words
  const n = targetWords.length;
  const m = userWords.length;

  if (n === 0) {
    return {
      sentenceId: "",
      targetText,
      userText,
      accuracyPercent: 100,
      wordCount: 0,
      correctCount: 0,
      diffItems: [],
    };
  }

  // Cost matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0),
  );
  for (let i = 0; i <= n; i++) dp[i][0] = i * 10;
  for (let j = 0; j <= m; j++) dp[0][j] = j * 10;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const t = targetWords[i - 1];
      const u = userWords[j - 1];

      if (t === u) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const dist = levenshteinDistance(t, u);
        const subCost =
          dist <= 2 && Math.min(t.length, u.length) > 2 ? 4 + dist : 10;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 10, // missing target word
          dp[i][j - 1] + 10, // extra user word
          dp[i - 1][j - 1] + subCost, // substitution / typo
        );
      }
    }
  }

  // Backtrack to construct diff items
  let i = n;
  let j = m;
  const diffItems: WordDiffItem[] = [];
  let correctCount = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const t = targetWords[i - 1];
      const u = userWords[j - 1];
      if (t === u) {
        diffItems.unshift({ word: t, status: "correct" });
        correctCount++;
        i--;
        j--;
        continue;
      }
      const dist = levenshteinDistance(t, u);
      const subCost =
        dist <= 2 && Math.min(t.length, u.length) > 2 ? 4 + dist : 10;
      if (dp[i][j] === dp[i - 1][j - 1] + subCost) {
        diffItems.unshift({ word: t, status: "typo", userWord: u });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 10) {
      diffItems.unshift({ word: targetWords[i - 1], status: "missing" });
      i--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 10) {
      diffItems.unshift({
        word: userWords[j - 1],
        status: "extra",
        userWord: userWords[j - 1],
      });
      j--;
    } else if (i > 0 && j > 0) {
      diffItems.unshift({
        word: targetWords[i - 1],
        status: "typo",
        userWord: userWords[j - 1],
      });
      i--;
      j--;
    } else if (i > 0) {
      diffItems.unshift({ word: targetWords[i - 1], status: "missing" });
      i--;
    } else {
      diffItems.unshift({
        word: userWords[j - 1],
        status: "extra",
        userWord: userWords[j - 1],
      });
      j--;
    }
  }

  const accuracyPercent = Math.round((correctCount / n) * 100);

  return {
    sentenceId: "",
    targetText,
    userText,
    accuracyPercent,
    wordCount: n,
    correctCount,
    diffItems,
  };
}

/**
 * Returns a hint string given the target text and what the user has currently typed.
 * E.g. reveals the next word or letter.
 */
export function getNextWordHint(targetText: string, userText: string): string {
  const targetWords = tokenizeWords(targetText);
  const userWords = tokenizeWords(userText);

  let matchIndex = 0;
  while (
    matchIndex < targetWords.length &&
    matchIndex < userWords.length &&
    targetWords[matchIndex] === userWords[matchIndex]
  ) {
    matchIndex++;
  }

  if (matchIndex < targetWords.length) {
    const wordToReveal = targetWords[matchIndex];
    return `Từ tiếp theo là: "${wordToReveal}" (bắt đầu bằng '${wordToReveal[0].toUpperCase()}')`;
  }

  return "Bạn đã nhập đủ các từ!";
}

export function formatSecondsToMMSS(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
