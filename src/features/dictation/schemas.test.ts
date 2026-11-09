import { describe, expect, it } from "vitest";
import {
  saveDictationSentenceSchema,
  startDictationSchema,
  submitDictationSchema,
} from "./schemas";

describe("dictation schemas", () => {
  it("validates startDictationSchema with valid slug", () => {
    const res = startDictationSchema.safeParse({
      exerciseSlug: "daily-routine-1",
    });
    expect(res.success).toBe(true);
  });

  it("rejects invalid slugs in startDictationSchema", () => {
    const res = startDictationSchema.safeParse({
      exerciseSlug: "Invalid Slug!",
    });
    expect(res.success).toBe(false);
  });

  it("validates sentence save schema", () => {
    const res = saveDictationSentenceSchema.safeParse({
      exerciseSlug: "campus-conversation",
      sentenceId: "sent-1",
      userText: "Hello there",
    });
    expect(res.success).toBe(true);
  });

  it("validates dictation submission schema", () => {
    const res = submitDictationSchema.safeParse({
      exerciseSlug: "campus-conversation",
      answers: { "sent-1": "Hello there", "sent-2": "How are you" },
    });
    expect(res.success).toBe(true);
  });
});
