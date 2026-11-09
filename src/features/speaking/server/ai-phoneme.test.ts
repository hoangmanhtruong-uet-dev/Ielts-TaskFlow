import { describe, expect, it } from "vitest";

import { evaluatePronunciationTranscript } from "./ai-phoneme";

describe("evaluatePronunciationTranscript", () => {
  it("calculates honest WPM fluency without fabricating phoneme scores", () => {
    const transcript = "The quick brown fox jumps over the lazy dog";
    const durationSeconds = 5;

    const result = evaluatePronunciationTranscript(transcript, durationSeconds);

    expect(result.words).toHaveLength(9);
    expect(result.phonemeScoringAvailable).toBe(false);
    expect(result.pronunciationBand).toBeNull();
    expect(result.wpm).toBe(108);
    expect(result.fluencyScore).toBeGreaterThan(0);
    expect(result.fluencyScore).toBeLessThanOrEqual(100);
    expect(result.completenessScore).toBeNull();
    expect(result.words.every((w) => w.phonemeScoreAvailable === false)).toBe(
      true,
    );
  });

  it("computes word coverage against a target prompt when provided", () => {
    const result = evaluatePronunciationTranscript(
      "Urban gardens improve local resilience",
      4,
      "Urban green spaces improve resilience",
    );

    expect(result.completenessScore).toBe(60);
    expect(result.words[0]).toEqual({
      word: "urban",
      matchedTarget: true,
      phonemeScoreAvailable: false,
    });
    expect(result.words[1]).toEqual({
      word: "gardens",
      matchedTarget: false,
      phonemeScoreAvailable: false,
    });
  });

  it("handles empty transcript gracefully", () => {
    const result = evaluatePronunciationTranscript("", 10);
    expect(result.fluencyScore).toBe(0);
    expect(result.wpm).toBe(0);
    expect(result.pronunciationBand).toBeNull();
    expect(result.phonemeScoringAvailable).toBe(false);
    expect(result.words).toHaveLength(0);
  });
});
