import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReadingRunner } from "@/features/reading/components/reading-runner";
import { saveReadingAnswerAction } from "@/features/reading/actions";
import type { ReadingPracticePageData } from "@/features/reading/server/content";

vi.mock("@/features/reading/actions", () => ({
  saveReadingAnswerAction: vi.fn().mockResolvedValue({
    status: "saved",
    clientRevision: 1,
    savedAt: "2026-07-16T00:00:01Z",
  }),
  submitReadingPracticeAction: vi.fn(),
}));

const fixture: ReadingPracticePageData = {
  exercise: {
    slug: "academic-reading-cool-roofs",
    versionId: "11111111-1111-4111-8111-111111111111",
    title: "Cool roofs in a neighbourhood pilot",
    summary: "Original Reading practice.",
    instructionsMarkdown: "Read and answer.",
    difficulty: "intermediate",
    timeLimitSeconds: 1200,
  },
  passage: {
    title: "Cool roofs in a neighbourhood pilot",
    summary: "Original passage.",
    testType: "academic",
    sourceName: "Project-authored content",
    licence: "Original project content",
    sections: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        position: 1,
        heading: "The pilot",
        bodyMarkdown: "A neighbourhood tested reflective roofs.",
      },
    ],
  },
  groups: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      position: 1,
      type: "true_false_not_given",
      title: "Questions 1–2",
      instructionsMarkdown: "Choose one answer.",
      maxAnswerWords: null,
    },
  ],
  questions: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      groupId: "33333333-3333-4333-8333-333333333333",
      position: 1,
      type: "true_false_not_given",
      promptMarkdown: "Every roof was painted blue.",
      points: 1,
      options: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          label: "True",
          position: 1,
        },
        {
          id: "66666666-6666-4666-8666-666666666666",
          label: "False",
          position: 2,
        },
        {
          id: "77777777-7777-4777-8777-777777777777",
          label: "Not Given",
          position: 3,
        },
      ],
      answer: null,
    },
  ],
  attempt: {
    id: "88888888-8888-4888-8888-888888888888",
    startedAt: "2026-07-16T00:00:00Z",
    expiresAt: "2026-07-16T00:20:00Z",
    serverNow: "2026-07-16T00:01:00Z",
    lastSavedAt: "2026-07-16T00:00:00Z",
  },
  latestResultId: null,
};

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("ReadingRunner", () => {
  it("renders passage and question landmarks without exposing an answer key", () => {
    render(<ReadingRunner data={fixture} />);
    expect(screen.getByRole("article")).toHaveTextContent("reflective roofs");
    expect(screen.getByRole("radio", { name: "False" })).not.toBeChecked();
    expect(screen.queryByText(/đáp án đúng/i)).not.toBeInTheDocument();
  });

  it("autosaves a changed answer with the next client revision", async () => {
    vi.useFakeTimers();
    render(<ReadingRunner data={fixture} />);
    fireEvent.click(screen.getByRole("radio", { name: "False" }));
    await act(async () => vi.advanceTimersByTimeAsync(2001));
    expect(saveReadingAnswerAction).toHaveBeenCalledWith(
      expect.objectContaining({
        clientRevision: 1,
        selectedOptionIds: ["66666666-6666-4666-8666-666666666666"],
      }),
    );
    expect(screen.getByText("saved")).toBeInTheDocument();
  });
});
