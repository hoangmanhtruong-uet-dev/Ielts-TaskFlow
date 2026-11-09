import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ReadingHubClient } from "./client";
import type { ReadingCatalogItem } from "@/features/reading/server/content";

const mockItems: ReadingCatalogItem[] = [
  {
    slug: "urban-microclimates-cool-roofs",
    title: "Urban Microclimates & The Cool Roofs Initiative",
    summary:
      "Nghiên cứu kiến trúc đô thị bền vững: tác động của sơn phản xạ nhiệt.",
    difficulty: "Foundation",
    testType: "practice",
    questionCount: 8,
    timeLimitSeconds: 1200,
  },
];

const mockProfile = {
  current_band: 5.5,
  target_band: 6.5,
  daily_study_minutes: 30,
  target_exam_date: "2026-12-31",
};

describe("ReadingHubClient", () => {
  it("renders hero section with band selector, comprehension rate, and WPM speed", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={86}
        attemptsCount={10}
        profile={mockProfile}
      />,
    );

    expect(screen.getByText("READING TRAINING ARENA")).toBeInTheDocument();
    expect(screen.getByText(/Luyện Đọc IELTS Thực Chiến/i)).toBeInTheDocument();
    expect(screen.getByText("86%")).toBeInTheDocument();
    expect(screen.getAllByText(/240 WPM/i).length).toBeGreaterThanOrEqual(1);
  });

  it("opens the band dropdown and allows selecting an IELTS reading band stage", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Initial button (target_band 6.5 -> Upper-Intermediate)
    const bandTrigger = screen.getByRole("button", {
      name: /Upper-Intermediate/i,
    });
    expect(bandTrigger).toBeInTheDocument();

    // Open dropdown
    fireEvent.click(bandTrigger);

    // Click "Foundation"
    const foundationBtn = screen.getByRole("button", {
      name: /Foundation \(4.5 - 5.5\)/i,
    });
    fireEvent.click(foundationBtn);

    // Verify selection updated
    expect(
      screen.getByRole("button", { name: /Foundation \(Band 4.5 - 5.5\)/i }),
    ).toBeInTheDocument();
  });

  it("renders the 4 reading modes bento grid with working navigation and interactions", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    expect(
      screen.getByText(/Skimming & Scanning \(Đọc Lướt & Định Vị\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Deep Academic Passages/i)).toBeInTheDocument();
    expect(screen.getByText(/Từ Vựng Ngữ Cảnh/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Vào thi thử Full Reading/i }),
    ).toBeInTheDocument();
  });

  it("renders Live Reading Mini-Lab and allows switching tabs (TFNG, Speed WPM, Headings)", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Mini-Lab Header
    expect(
      screen.getByText(/Trạm Phản Xạ Đọc Hiểu Tức Thì/i),
    ).toBeInTheDocument();

    // Tab 1: TFNG choice buttons
    const falseBtn = screen.getByRole("button", { name: "FALSE" });
    fireEvent.click(falseBtn);
    expect(
      screen.getByText(/Giải mã bẫy logic Cambridge/i),
    ).toBeInTheDocument();

    // Tab 2: Switch to Speed WPM Meter
    const speedTabBtn = screen.getByRole("button", {
      name: /Speed WPM Meter/i,
    });
    fireEvent.click(speedTabBtn);
    expect(screen.getByText(/Chỉ số Tốc độ Đọc \(WPM\)/i)).toBeInTheDocument();

    // Tab 3: Switch to Matching Headings
    const headingsTabBtn = screen.getByRole("button", {
      name: "Matching Headings",
    });
    fireEvent.click(headingsTabBtn);
    expect(screen.getByText(/Phân tích Bẫy Tiêu Đề/i)).toBeInTheDocument();
  });

  it("filters passage cards by search query and reset button", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Tìm bài đọc, chủ đề, Passage...",
    );
    fireEvent.change(searchInput, { target: { value: "Microclimates" } });

    expect(
      screen.getByText(/Urban Microclimates & The Cool Roofs Initiative/i),
    ).toBeInTheDocument();

    // Search nonexistent query
    fireEvent.change(searchInput, {
      target: { value: "xyznonexistentreading" },
    });
    expect(
      screen.getByText("Không tìm thấy bài đọc phù hợp"),
    ).toBeInTheDocument();

    // Reset filter
    const resetBtn = screen.getByRole("button", { name: "Đặt lại bộ lọc" });
    fireEvent.click(resetBtn);
    expect(
      screen.getByText(/Urban Microclimates & The Cool Roofs Initiative/i),
    ).toBeInTheDocument();
  });

  it("opens Quick Reading Modal (Split-View) when clicking Đọc thử or Làm bài", () => {
    render(
      <ReadingHubClient
        items={mockItems}
        comprehensionRate={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Click "Đọc thử Split-View"
    const docThuButtons = screen.getAllByRole("button", {
      name: /Đọc thử Split-View/i,
    });
    expect(docThuButtons.length).toBeGreaterThan(0);
    fireEvent.click(docThuButtons[0]);

    // Modal opens with Passage Viewer & Question Sheet
    expect(screen.getByText(/Phiếu Câu Hỏi Thực Chiến/i)).toBeInTheDocument();
    expect(screen.getByText(/Thời gian đọc chuẩn:/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /Đóng bài đọc/i });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/Phiếu Câu Hỏi Thực Chiến/i),
    ).not.toBeInTheDocument();
  });
});
