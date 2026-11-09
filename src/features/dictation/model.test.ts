import { describe, expect, it } from "vitest";
import {
  diffSentenceText,
  formatSecondsToMMSS,
  getNextWordHint,
  normalizeText,
} from "./model";

describe("dictation model", () => {
  it("normalizes text properly", () => {
    expect(normalizeText("Hello, World!  How are you?")).toBe(
      "hello world how are you",
    );
    expect(normalizeText("I'm fine, thank you.")).toBe("i'm fine thank you");
  });

  it("calculates 100% accuracy for exact match", () => {
    const target = "Good morning, welcome to the library.";
    const user = "Good morning welcome to the library";
    const res = diffSentenceText(target, user);
    expect(res.accuracyPercent).toBe(100);
    expect(res.correctCount).toBe(6);
    expect(res.diffItems.every((item) => item.status === "correct")).toBe(true);
  });

  it("identifies missing words correctly", () => {
    const target = "Please sign your name on the form.";
    const user = "Please sign name form";
    const res = diffSentenceText(target, user);
    expect(res.correctCount).toBe(4);
    expect(res.accuracyPercent).toBe(57); // 4 / 7 = 57%
    const missing = res.diffItems.filter((i) => i.status === "missing");
    expect(missing.map((m) => m.word)).toEqual(["your", "on", "the"]);
  });

  it("provides helpful next word hints", () => {
    const target = "Today we will discuss international economy";
    const user = "Today we";
    const hint = getNextWordHint(target, user);
    expect(hint).toContain('Từ tiếp theo là: "will"');
  });

  it("formats seconds to MM:SS correctly", () => {
    expect(formatSecondsToMMSS(65)).toBe("1:05");
    expect(formatSecondsToMMSS(0)).toBe("0:00");
    expect(formatSecondsToMMSS(3599)).toBe("59:59");
  });
});
