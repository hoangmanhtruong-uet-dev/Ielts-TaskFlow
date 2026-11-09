import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoadmapClient } from "./client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/features/roadmap/actions", () => ({
  updateDailyStudyMinutesAction: vi
    .fn()
    .mockResolvedValue({ success: true, dailyStudyMinutes: 60 }),
}));

describe("RoadmapClient component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, view switcher, and target exam info without fabricated IDP Vietnam copy", () => {
    render(
      <RoadmapClient
        targetBand="6.5"
        currentBand="4.5"
        targetExamDate="2027-06-15"
        initialDailyMinutes={35}
        skillReadiness={{
          listening: 70,
          reading: 82,
          writing: null,
          speaking: null,
        }}
      />,
    );

    expect(screen.getByText(/MỤC TIÊU IELTS 6.5/)).toBeInTheDocument();
    expect(screen.getByText("BẢN ĐỒ LỘ TRÌNH CÁ NHÂN HÓA")).toBeInTheDocument();
    expect(screen.queryByText(/IDP Vietnam/i)).not.toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getAllByText("Chưa có dữ liệu").length).toBe(2);
  });

  it("switches between 3D, List, and Calendar views dynamically from passed nodes", () => {
    const customNodes = [
      {
        id: "m1",
        phase: 1,
        phaseTitle: "Phase 1: Foundations",
        title: "Core Grammar Essentials",
        subtitle: "2/4 bài đã hoàn thành",
        score: "Đang học (50%)",
        progressPercent: 50,
        status: "active" as const,
        pos: [-6, 1, 0] as [number, number, number],
        color: 0x6366f1,
        targetHref: "/learn/core-grammar",
      },
      {
        id: "m2",
        phase: 2,
        phaseTitle: "Phase 2: IELTS Practice",
        title: "Academic Reading Drills",
        subtitle: "0/3 bài đã hoàn thành",
        score: "Chưa bắt đầu",
        progressPercent: 0,
        status: "upcoming" as const,
        pos: [6, 2, 0] as [number, number, number],
        color: 0x38bdf8,
        targetHref: "/practice/reading",
      },
    ];

    render(<RoadmapClient nodes={customNodes} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển chế độ Danh sách" }),
    );
    expect(screen.getByText("Phase 1: Foundations")).toBeInTheDocument();
    expect(screen.getByText("Core Grammar Essentials")).toBeInTheDocument();
    expect(screen.getByText("Phase 2: IELTS Practice")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển chế độ Lịch học" }),
    );
    expect(screen.getByText(/Kế hoạch học tập theo chặng/)).toBeInTheDocument();
  });

  it("updates daily minutes state on slider change", () => {
    render(<RoadmapClient initialDailyMinutes={35} />);

    expect(screen.getByText("35 phút/ngày")).toBeInTheDocument();
    const slider = screen.getByRole("slider", {
      name: "Điều chỉnh thời gian học mỗi ngày",
    });
    fireEvent.change(slider, { target: { value: "60" } });

    expect(screen.getByText("60 phút/ngày")).toBeInTheDocument();
  });

  it("navigates to node module route from List view", () => {
    render(<RoadmapClient />);

    fireEvent.click(
      screen.getByRole("button", { name: "Chuyển chế độ Danh sách" }),
    );
    const openBtns = screen.getAllByRole("button", { name: /Học ngay/ });
    fireEvent.click(openBtns[0]);
    expect(mockPush).toHaveBeenCalledWith("/learn/vocabulary");
  });
});
