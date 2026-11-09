import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProgressClient } from "./client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ProgressClient component", () => {
  const sampleProps = {
    ranges: {
      "7d": {
        hours: "4h 30m",
        hoursSub: "Thời gian làm bài 7 ngày qua",
        lessons: 6,
        lessonTotal: 20,
        lessonsPct: 30,
        band: "6.5",
        bandBadge: "4 bài chấm điểm",
        confidence: "Sơ bộ",
        streak: "5 Ngày",
        weeks: [
          {
            id: 0,
            label: "Mock #1",
            band: 6.0,
            hours: "01/11/2026",
            note: "Mock Test 1",
          },
          {
            id: 1,
            label: "Mock #2",
            band: 6.5,
            hours: "08/11/2026",
            note: "Mock Test 2",
          },
        ],
      },
      "30d": {
        hours: "12h 10m",
        hoursSub: "Thời gian làm bài 30 ngày qua",
        lessons: 6,
        lessonTotal: 20,
        lessonsPct: 30,
        band: "6.5",
        bandBadge: "4 bài chấm điểm",
        confidence: "Sơ bộ",
        streak: "5 Ngày",
        weeks: [
          {
            id: 0,
            label: "Mock #1",
            band: 6.0,
            hours: "01/11/2026",
            note: "Mock Test 1",
          },
          {
            id: 1,
            label: "Mock #2",
            band: 6.5,
            hours: "08/11/2026",
            note: "Mock Test 2",
          },
        ],
      },
      all: {
        hours: "18h 0m",
        hoursSub: "Tổng thời gian ghi nhận",
        lessons: 6,
        lessonTotal: 20,
        lessonsPct: 30,
        band: "6.5",
        bandBadge: "4 bài chấm điểm",
        confidence: "Sơ bộ",
        streak: "5 Ngày",
        weeks: [
          {
            id: 0,
            label: "Mock #1",
            band: 6.0,
            hours: "01/11/2026",
            note: "Mock Test 1",
          },
          {
            id: 1,
            label: "Mock #2",
            band: 6.5,
            hours: "08/11/2026",
            note: "Mock Test 2",
          },
        ],
      },
    },
    skills: [
      {
        id: "reading",
        name: "Reading",
        band: 7.0,
        progress: 75,
        status: "Điểm mạnh",
        barColor: "bg-emerald-500",
        badgeClass: "bg-emerald-950/90 text-emerald-400 border-emerald-500/30",
        statusClass: "text-emerald-400",
      },
      {
        id: "writing",
        name: "Writing",
        band: 5.5,
        progress: 50,
        status: "Cần chú ý",
        barColor: "bg-amber-500",
        badgeClass: "bg-amber-950/90 text-amber-400 border-amber-500/30",
        statusClass: "text-amber-500",
      },
    ],
    vocabSummary: { savedTerms: 18, dueReview: 4, mastered: 12 },
    weakArea: { skill: "writing", label: "Writing", accuracyPercent: 50 },
    targetBand: 7.5,
    lastUpdatedLabel: "09/11/2026",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  it("renders header, 4 KPI cards, and default empty/zero telemetry honestly", () => {
    render(<ProgressClient />);

    expect(screen.getByText("ANALYTICS HUB")).toBeInTheDocument();
    expect(screen.getByText("Báo cáo & Tiến độ học tập")).toBeInTheDocument();
    expect(screen.getByText("0h 0m")).toBeInTheDocument();
    expect(screen.getByText("/ 0 bài")).toBeInTheDocument();
    expect(screen.getByText("0 Ngày")).toBeInTheDocument();
    expect(screen.queryByText("92h 15m")).not.toBeInTheDocument();
    expect(screen.queryByText("1,240")).not.toBeInTheDocument();
  });

  it("switches time ranges dynamically and reflects passed DB telemetry", () => {
    render(<ProgressClient {...sampleProps} />);

    expect(screen.getByText("4h 30m")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tháng này" }));
    expect(screen.getByText("12h 10m")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toàn thời gian" }));
    expect(screen.getByText("18h 0m")).toBeInTheDocument();
  });

  it("links weak area CTA to real practice route instead of fake +0.2 drill", () => {
    render(<ProgressClient {...sampleProps} />);

    const cta = screen.getByRole("button", { name: /Luyện ngay: Writing/ });
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/practice/writing");
  });

  it("toggles 3D heatmap isometric elevation mode", () => {
    render(<ProgressClient {...sampleProps} />);

    const toggleBtn = screen.getByRole("button", {
      name: "Bật tắt khối nổi 3D Heatmap",
    });
    expect(toggleBtn).toHaveTextContent("Khối nổi 3D: Tắt");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent("Khối nổi 3D: Bật");
  });

  it("navigates to vocabulary vault on 'Ôn tập' click", () => {
    render(<ProgressClient {...sampleProps} />);

    const reviewBtn = screen.getByRole("button", { name: "Ôn tập từ vựng" });
    fireEvent.click(reviewBtn);

    expect(mockPush).toHaveBeenCalledWith("/learn/vocabulary");
  });

  it("opens PDF export modal and calls window.print on confirmation", () => {
    render(<ProgressClient {...sampleProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Xuất báo cáo PDF" }));
    const modal = screen.getByRole("dialog");
    expect(
      within(modal).getByText("Xuất báo cáo tiến độ học tập"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "In / Lưu file PDF" }));
    expect(window.print).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
