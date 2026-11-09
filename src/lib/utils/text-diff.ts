import { WordDiff } from "@/types/dictation";
import { splitWords } from "./normalize-text";

/**
 * So sánh user input vs correct text, trả về mảng WordDiff
 * Sử dụng thuật toán LCS (Longest Common Subsequence) để diff chính xác
 */
export function computeWordDiff(
  correctText: string,
  userInput: string,
): WordDiff[] {
  const correctWords = splitWords(correctText);
  const userWords = splitWords(userInput);

  // Build LCS table
  const m = correctWords.length;
  const n = userWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (correctWords[i - 1] === userWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  let i = m;
  let j = n;
  const result: WordDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && correctWords[i - 1] === userWords[j - 1]) {
      result.unshift({ word: correctWords[i - 1], type: "correct" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ word: userWords[j - 1], type: "extra" });
      j--;
    } else {
      result.unshift({
        word: correctWords[i - 1],
        type: "missing",
      });
      i--;
    }
  }

  return result;
}

/**
 * Tính accuracy từ diff result
 */
export function calculateAccuracyFromDiff(diffs: WordDiff[]): number {
  const totalExpected = diffs.filter(
    (d) => d.type === "correct" || d.type === "missing",
  ).length;
  const correct = diffs.filter((d) => d.type === "correct").length;
  if (totalExpected === 0) return 0;
  return Math.round((correct / totalExpected) * 100 * 100) / 100;
}
