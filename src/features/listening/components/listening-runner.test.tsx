import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ListeningRunner } from "@/features/listening/components/listening-runner";
import { saveListeningAnswerAction } from "@/features/listening/actions";
import type { ListeningPracticePageData } from "@/features/listening/server/content";

vi.mock("@/features/listening/actions", () => ({
  saveListeningAnswerAction: vi.fn().mockResolvedValue({
    status: "saved",
    clientRevision: 1,
    savedAt: "2026-07-16T00:00:01Z",
  }),
  submitListeningPracticeAction: vi.fn(),
}));

const fixture: ListeningPracticePageData = {
  exercise: {
    slug: "academic-listening-community-library",
    versionId: "11111111-1111-4111-8111-111111111111",
    title: "Community library visit",
    summary: "Original Listening practice.",
    instructionsMarkdown: "Listen and answer.",
    difficulty: "beginner",
    timeLimitSeconds: 600,
  },
  audio: {
    path: "/audio/listening/community-library-visit.wav",
    mimeType: "audio/wav",
    durationSeconds: 108,
    sourceName: "Project editorial team",
    licence: "Original project content",
  },
  parts: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      position: 1,
      title: "Part 1",
      instructionsMarkdown: "Choose one answer.",
      audioStartSeconds: 0,
      audioEndSeconds: 64,
    },
  ],
  questions: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      partId: "22222222-2222-4222-8222-222222222222",
      position: 1,
      type: "single_choice",
      promptMarkdown: "When does the library open?",
      points: 1,
      options: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          label: "9:00",
          position: 1,
        },
        {
          id: "55555555-5555-4555-8555-555555555555",
          label: "9:30",
          position: 2,
        },
      ],
      answer: null,
    },
  ],
  attempt: {
    id: "66666666-6666-4666-8666-666666666666",
    startedAt: "2026-07-16T00:00:00Z",
    expiresAt: "2026-07-16T00:10:00Z",
    serverNow: "2026-07-16T00:01:00Z",
    lastSavedAt: "2026-07-16T00:00:00Z",
  },
  latestResultId: null,
};

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("ListeningRunner", () => {
  it("renders controlled audio and questions without answer keys or transcript", () => {
    const { container } = render(<ListeningRunner data={fixture} />);
    expect(container.querySelector("audio source")).toHaveAttribute(
      "src",
      fixture.audio.path,
    );
    expect(screen.queryByText("Transcript")).not.toBeInTheDocument();
    expect(screen.queryByText(/đáp án đúng/i)).not.toBeInTheDocument();
  });
  it("autosaves with the next revision", async () => {
    vi.useFakeTimers();
    render(<ListeningRunner data={fixture} />);
    fireEvent.click(screen.getByRole("radio", { name: "9:30" }));
    await act(async () => vi.advanceTimersByTimeAsync(2001));
    expect(saveListeningAnswerAction).toHaveBeenCalledWith(
      expect.objectContaining({
        clientRevision: 1,
        selectedOptionIds: ["55555555-5555-4555-8555-555555555555"],
      }),
    );
    expect(screen.getByText("saved")).toBeInTheDocument();
  });
});
