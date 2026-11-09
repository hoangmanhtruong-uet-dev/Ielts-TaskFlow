import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LessonReader } from "@/features/learning/components/lesson-reader";
import type { LessonReaderData } from "@/features/learning/server/content";

const actionMocks = vi.hoisted(() => ({
  openSection: vi.fn(),
  completeSection: vi.fn(),
}));

vi.mock("@/features/learning/actions", () => ({
  initialLearningProgressActionState: { status: "idle" },
  openLessonSectionAction: (...args: unknown[]) =>
    actionMocks.openSection(...args),
  completeLessonSectionAction: (...args: unknown[]) =>
    actionMocks.completeSection(...args),
}));

const readerFixture: LessonReaderData = {
  module: {
    id: "module-1",
    slug: "ielts-foundations",
    title: "Nền tảng IELTS",
    description: "Nội dung nền tảng",
    skill: "foundations",
    testType: "both",
  },
  lesson: {
    id: "11111111-1111-4111-8111-111111111111",
    moduleId: "module-1",
    moduleSlug: "ielts-foundations",
    moduleTitle: "Nền tảng IELTS",
    moduleOrder: 1,
    slug: "hieu-ielts",
    lessonOrder: 1,
    versionId: "version-1",
    title: "Hiểu IELTS",
    summary: "Tóm tắt",
    difficulty: "beginner",
    estimatedMinutes: 15,
    status: "in_progress",
    progressPercent: 50,
    currentSectionId: "22222222-2222-4222-8222-222222222222",
    lastAccessedAt: "2026-07-16T10:00:00Z",
    completedAt: null,
    href: "/learn/ielts-foundations/hieu-ielts",
    versionStatus: "published",
  },
  sections: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      type: "text",
      title: "Phần đầu",
      bodyMarkdown: "Nội dung đầu.",
      displayOrder: 1,
      isRequired: true,
      completed: true,
      completedAt: "2026-07-16T10:00:00Z",
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      type: "summary",
      title: "Tóm tắt",
      bodyMarkdown: "Nội dung tóm tắt.",
      displayOrder: 2,
      isRequired: true,
      completed: false,
      completedAt: null,
    },
  ],
  activeSection: {
    id: "33333333-3333-4333-8333-333333333333",
    type: "summary",
    title: "Tóm tắt",
    bodyMarkdown: "Nội dung tóm tắt.",
    displayOrder: 2,
    isRequired: true,
    completed: false,
    completedAt: null,
  },
  nextLesson: null,
};

describe("LessonReader", () => {
  beforeEach(() => {
    actionMocks.openSection.mockReset();
    actionMocks.openSection.mockResolvedValue({ status: "success" });
    actionMocks.completeSection.mockReset();
    actionMocks.completeSection.mockResolvedValue({
      status: "success",
      message: "Đã lưu",
    });
  });

  it("renders navigation, progress and the active section", async () => {
    render(<LessonReader data={readerFixture} />);

    expect(
      screen.getByRole("progressbar", {
        name: "Tiến độ bài học: Hiểu IELTS",
      }),
    ).toHaveAttribute("aria-valuenow", "50");
    expect(
      screen.getByRole("navigation", { name: "Các phần trong bài học" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tóm tắt" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đánh dấu đã hoàn thành" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Phần trước" })).toHaveAttribute(
      "href",
      "?section=1",
    );

    await waitFor(() => expect(actionMocks.openSection).toHaveBeenCalledOnce());
  });

  it("does not save again when current section is already persisted", async () => {
    render(
      <LessonReader
        data={{
          ...readerFixture,
          lesson: {
            ...readerFixture.lesson,
            currentSectionId: readerFixture.activeSection.id,
          },
        }}
      />,
    );

    await waitFor(() => expect(actionMocks.openSection).not.toHaveBeenCalled());
  });

  it("shows a safe save error", async () => {
    actionMocks.openSection.mockResolvedValue({
      status: "error",
      message: "Không thể lưu vị trí đang học.",
    });
    render(<LessonReader data={readerFixture} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Không thể lưu vị trí đang học.",
    );
  });

  it("exposes a pending state while completion is saving", async () => {
    let resolveAction!: (value: { status: "success"; message: string }) => void;
    actionMocks.completeSection.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    render(<LessonReader data={readerFixture} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Đánh dấu đã hoàn thành" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Đang lưu…" })).toBeDisabled(),
    );

    await act(async () => {
      resolveAction({ status: "success", message: "Đã lưu" });
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu");
  });

  it("renders the completed state and next lesson link", () => {
    render(
      <LessonReader
        data={{
          ...readerFixture,
          lesson: {
            ...readerFixture.lesson,
            status: "completed",
            progressPercent: 100,
          },
          activeSection: {
            ...readerFixture.activeSection,
            completed: true,
            completedAt: "2026-07-16T10:00:00Z",
          },
          nextLesson: {
            ...readerFixture.lesson,
            id: "44444444-4444-4444-8444-444444444444",
            slug: "bai-tiep-theo",
            title: "Bài tiếp theo",
            status: "not_started",
            progressPercent: 0,
            href: "/learn/ielts-foundations/bai-tiep-theo",
          },
        }}
      />,
    );

    expect(screen.getByText("Phần này đã hoàn thành")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Bạn đã hoàn thành tất cả phần bắt buộc.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bài tiếp theo: Bài tiếp theo/ }),
    ).toHaveAttribute("href", "/learn/ielts-foundations/bai-tiep-theo");
  });
});
