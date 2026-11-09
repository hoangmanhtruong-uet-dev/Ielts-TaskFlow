import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WritingRunner } from "@/features/writing/components/writing-runner";
import {
  saveWritingDraftAction,
  submitWritingAction,
} from "@/features/writing/actions";
import type { WritingPracticePageData } from "@/features/writing/server/content";

vi.mock("@/features/writing/actions", () => ({
  saveWritingDraftAction: vi.fn(),
  submitWritingAction: vi.fn(),
}));

const fixture: WritingPracticePageData = {
  task: {
    id: "81000000-0000-4000-8000-000000000001",
    slug: "community-green-spaces",
    versionId: "82000000-0000-4000-8000-000000000001",
    title: "Community green spaces",
    description: "Original Writing practice.",
    promptText: "Should unused land become a green space?",
    instructions: "Write a clear position.",
    difficulty: "intermediate",
    testType: "academic",
    taskType: "task_2",
    wordTarget: 250,
    minimumWords: 250,
    maximumWords: 1000,
    timeLimitSeconds: 2400,
    sourceName: "Indigo Scholar original content",
    licence: "Original educational content",
  },
  submission: {
    id: "83000000-0000-4000-8000-000000000001",
    draftText: "A saved introduction.",
    serverRevision: 0,
    wordCount: 3,
    minimumWordsMet: false,
    startedAt: "2026-07-16T00:00:00Z",
    expiresAt: "2026-07-16T00:40:00Z",
    serverNow: "2026-07-16T00:01:00Z",
    lastSavedAt: "2026-07-16T00:00:00Z",
  },
  latestSubmissionId: null,
};

beforeEach(() => {
  vi.mocked(saveWritingDraftAction).mockResolvedValue({
    status: "saved",
    serverRevision: 1,
    wordCount: 8,
    minimumWordsMet: false,
    savedAt: "2026-07-16T00:01:01Z",
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("WritingRunner", () => {
  it("renders the pinned task, editor and timer", () => {
    render(<WritingRunner data={fixture} />);
    expect(screen.getByText(fixture.task.promptText)).toBeVisible();
    expect(screen.getByLabelText("Your writing")).toHaveValue(
      "A saved introduction.",
    );
    expect(screen.getByText("39:00")).toBeVisible();
    expect(screen.queryByText(/official IELTS score/i)).not.toBeInTheDocument();
  });

  it("autosaves the full draft with the expected server revision", async () => {
    vi.useFakeTimers();
    render(<WritingRunner data={fixture} />);
    fireEvent.change(screen.getByLabelText("Your writing"), {
      target: { value: "A changed introduction with more useful detail." },
    });
    await act(async () => vi.advanceTimersByTimeAsync(2001));
    expect(saveWritingDraftAction).toHaveBeenCalledWith({
      submissionId: fixture.submission!.id,
      taskSlug: fixture.task.slug,
      draftText: "A changed introduction with more useful detail.",
      expectedRevision: 0,
    });
    expect(screen.getByText("saved")).toBeInTheDocument();
  });

  it("surfaces a conflict without replacing the learner's local text", async () => {
    vi.useFakeTimers();
    vi.mocked(saveWritingDraftAction).mockResolvedValueOnce({
      status: "conflict",
      serverRevision: 2,
      message: "PostgreSQL has a newer draft.",
    });
    render(<WritingRunner data={fixture} />);
    const editor = screen.getByLabelText("Your writing");
    fireEvent.change(editor, { target: { value: "Unsaved local version." } });
    await act(async () => vi.advanceTimersByTimeAsync(2001));
    expect(editor).toHaveValue("Unsaved local version.");
    expect(saveWritingDraftAction).toHaveBeenCalledTimes(1);
  });

  it("keeps local text after a network failure", async () => {
    vi.useFakeTimers();
    vi.mocked(saveWritingDraftAction).mockRejectedValueOnce(
      new TypeError("network unavailable"),
    );
    render(<WritingRunner data={fixture} />);
    const editor = screen.getByLabelText("Your writing");
    fireEvent.change(editor, { target: { value: "Unsaved network draft." } });
    await act(async () => vi.advanceTimersByTimeAsync(2001));

    expect(editor).toHaveValue("Unsaved network draft.");
    expect(saveWritingDraftAction).toHaveBeenCalledTimes(1);
  });

  it("flushes dirty local text and awaits save completion before submitting", async () => {
    let resolveSave!: (
      value: Awaited<ReturnType<typeof saveWritingDraftAction>>,
    ) => void;
    vi.mocked(saveWritingDraftAction).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );
    vi.mocked(submitWritingAction).mockResolvedValueOnce(undefined as never);

    render(<WritingRunner data={fixture} />);
    fireEvent.change(screen.getByLabelText("Your writing"), {
      target: { value: "Final paragraph added right before clicking submit." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    fireEvent.click(screen.getByRole("button", { name: "Nộp bài ngay" }));

    await waitFor(() =>
      expect(saveWritingDraftAction).toHaveBeenCalledWith({
        submissionId: fixture.submission!.id,
        taskSlug: fixture.task.slug,
        draftText: "Final paragraph added right before clicking submit.",
        expectedRevision: 0,
      }),
    );
    expect(submitWritingAction).not.toHaveBeenCalled();

    await act(async () => {
      resolveSave({
        status: "saved",
        serverRevision: 1,
        wordCount: 8,
        minimumWordsMet: false,
        savedAt: "2026-07-16T00:01:02Z",
      });
    });

    await waitFor(() =>
      expect(submitWritingAction).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: fixture.submission!.id,
          taskSlug: fixture.task.slug,
        }),
      ),
    );
  });

  it("blocks submission and keeps local text when pre-submit flush detects conflict", async () => {
    vi.mocked(saveWritingDraftAction).mockResolvedValueOnce({
      status: "conflict",
      serverRevision: 3,
      message: "PostgreSQL có bản nháp mới hơn.",
    });

    render(<WritingRunner data={fixture} />);
    const editor = screen.getByLabelText("Your writing");
    fireEvent.change(editor, {
      target: { value: "Unsaved conflicting edit at final second." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
    fireEvent.click(screen.getByRole("button", { name: "Nộp bài ngay" }));

    await waitFor(() =>
      expect(saveWritingDraftAction).toHaveBeenCalledTimes(1),
    );

    const alerts = await screen.findAllByRole("alert");
    expect(
      alerts.some((el) =>
        el.textContent?.includes("Không thể đồng bộ bản nháp lên máy chủ"),
      ),
    ).toBe(true);
    expect(submitWritingAction).not.toHaveBeenCalled();
    expect(editor).toHaveValue("Unsaved conflicting edit at final second.");
  });
});
