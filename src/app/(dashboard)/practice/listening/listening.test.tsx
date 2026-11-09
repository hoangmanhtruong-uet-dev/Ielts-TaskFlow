import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ListeningHubClient } from "./client";
import type { ListeningCatalogItem } from "@/features/listening/server/content";

const mockItems: ListeningCatalogItem[] = [
  {
    slug: "community-library-visit",
    title: "Community Library Visit & Membership",
    summary: "Đăng ký thẻ thư viện và hỏi giờ mở cửa, quy định mượn sách.",
    difficulty: "Foundation",
    testType: "practice",
    questionCount: 10,
    timeLimitSeconds: 600,
    durationSeconds: 185,
  },
];

const mockProfile = {
  current_band: 5.5,
  target_band: 6.5,
  daily_study_minutes: 25,
  target_exam_date: "2026-12-31",
};

describe("ListeningHubClient", () => {
  it("renders hero section with band selector, accuracy, and daily goal", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={82}
        attemptsCount={12}
        profile={mockProfile}
      />,
    );

    expect(screen.getByText("LISTENING TRAINING CENTER")).toBeInTheDocument();
    expect(
      screen.getByText(/Luyện Nghe IELTS Thực Chiến/i),
    ).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("25m")).toBeInTheDocument();
  });

  it("opens the band dropdown and allows selecting an IELTS band stage", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Initial band stage button
    const bandTrigger = screen.getByRole("button", {
      name: /Upper-Intermediate/i,
    });
    expect(bandTrigger).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(bandTrigger);

    // Verify stages are visible
    expect(screen.getByText(/Starter \(0.0 - 2.5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Expert \(8.5 - 9.0\)/i)).toBeInTheDocument();

    // Click "Starter"
    const starterButton = screen.getByRole("button", {
      name: /Starter \(0.0 - 2.5\)/i,
    });
    fireEvent.click(starterButton);

    // Verify active selection updated
    expect(
      screen.getByRole("button", { name: /Starter \(Band 0.0 - 2.5\)/i }),
    ).toBeInTheDocument();
  }, 15000);

  it("renders the 4 listening modes bento grid with working navigation and interactions", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Mode 1: Dictation link
    const dictationLink = screen.getByRole("link", {
      name: /Deep Dictation/i,
    });
    expect(dictationLink).toHaveAttribute("href", "/dictation");

    // Mode 2: Speed run
    expect(screen.getByText(/Speed Run \(1.25x - 1.5x\)/i)).toBeInTheDocument();

    // Mode 3: Accents
    expect(screen.getByText(/Luyện Giọng \(Accents\)/i)).toBeInTheDocument();

    // Mode 4: Full Test CTA button
    const fullTestBtn = screen.getByRole("button", {
      name: /Vào thi thử Full Test/i,
    });
    expect(fullTestBtn).toBeInTheDocument();
  });

  it("renders Live Mini-Lab and allows switching tabs", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Live Mini-Lab header
    expect(
      screen.getByText(/Trạm Phản Xạ Âm Thanh Tức Thì/i),
    ).toBeInTheDocument();

    // Tab 1: Dictation input
    expect(
      screen.getByPlaceholderText(/Bấm 'Nghe câu mẫu' rồi gõ lại/i),
    ).toBeInTheDocument();

    // Tab 2: Switch to Paraphrase
    const paraphraseTabBtn = screen.getByRole("button", {
      name: /Bẫy Paraphrase/i,
    });
    fireEvent.click(paraphraseTabBtn);
    expect(
      screen.getByText(/GIẢI MÃ BẪY PARAPHRASE CAMBRIDGE/i),
    ).toBeInTheDocument();

    // Tab 3: Switch to Diagnostic Radar
    const diagnosticTabBtn = screen.getByRole("button", {
      name: /Radar Kỹ Năng/i,
    });
    fireEvent.click(diagnosticTabBtn);
    expect(screen.getByText("Form & Note Completion")).toBeInTheDocument();
  });

  it("filters exercise cards by search query", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Tìm bài nghe, chủ đề, Section...",
    );
    fireEvent.change(searchInput, { target: { value: "Library" } });

    expect(
      screen.getAllByText("Community Library Visit").length,
    ).toBeGreaterThanOrEqual(1);

    // Search nonexistent query
    fireEvent.change(searchInput, { target: { value: "xyznonexistentquery" } });
    expect(
      screen.getByText("Không tìm thấy bài luyện nghe phù hợp"),
    ).toBeInTheDocument();

    // Reset filter
    const resetBtn = screen.getByRole("button", { name: "Đặt lại bộ lọc" });
    fireEvent.click(resetBtn);
    expect(
      screen.getAllByText("Community Library Visit").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("opens Quick Practice Modal when clicking Làm bài", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Click "Làm bài" on the first card
    const lamBaiButtons = screen.getAllByRole("button", { name: /Làm bài/i });
    expect(lamBaiButtons.length).toBeGreaterThan(0);
    fireEvent.click(lamBaiButtons[0]);

    // Modal opens
    expect(screen.getByText(/Phiếu Trả Lời Câu Hỏi/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Chấm điểm & Giải thích/i }),
    ).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /Đóng bài tập/i });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/Phiếu Trả Lời Câu Hỏi/i),
    ).not.toBeInTheDocument();
  });

  it("controls the floating audio player dock (play, pause, speed, seek)", () => {
    render(
      <ListeningHubClient
        items={mockItems}
        accuracy={80}
        attemptsCount={5}
        profile={mockProfile}
      />,
    );

    // Play/Pause button
    const playBtn = screen.getByRole("button", { name: "Phát âm thanh" });
    fireEvent.click(playBtn);

    // Speed toggle
    const speedBtn = screen.getByTitle("Tốc độ nghe");
    fireEvent.click(speedBtn);

    // Rewind 5s
    const rewindBtn = screen.getByLabelText("Tua lùi 5 giây");
    fireEvent.click(rewindBtn);

    // Forward 5s
    const forwardBtn = screen.getByLabelText("Tua tới 5 giây");
    fireEvent.click(forwardBtn);

    // AB Loop
    const abLoopBtn = screen.getByTitle("Lặp lại câu (Loop)");
    fireEvent.click(abLoopBtn);
  });
});
