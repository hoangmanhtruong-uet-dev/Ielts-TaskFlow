import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SpeakingHubClient } from "./client";

// Mock ThreeVocalVisualizer to avoid WebGL rendering in JSDOM
vi.mock("./components/ThreeVocalVisualizer", () => ({
  ThreeVocalVisualizer: () => <div aria-label="3D Vocal Acoustic Visualizer" />,
}));

describe("SpeakingHubClient", () => {
  const dummyItems = [
    {
      slug: "tech-future-society",
      title: "Technology and Social Connections",
      description:
        "Discuss how modern messaging apps affect real-world relationships.",
      difficulty: "c1",
      testType: "academic",
      estimatedMinutes: 5,
      promptCount: 3,
      activeAttemptId: null,
      latestAttemptId: null,
    },
  ];

  it("renders header, 4 criteria HUD, and 3D visualizer container", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    expect(
      screen.getByText("AI Speaking Studio & Acoustic Resonance"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fluency")).toBeInTheDocument();
    expect(screen.getByText("Lexical")).toBeInTheDocument();
    expect(screen.getByText("Grammar")).toBeInTheDocument();
    expect(screen.getByText("Pronun")).toBeInTheDocument();
    expect(
      screen.getByLabelText("3D Vocal Acoustic Visualizer"),
    ).toBeInTheDocument();
  });

  it("changes band dropdown and updates the stage descriptor", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    const select = screen.getByLabelText("Chọn giai đoạn band điểm Speaking");
    fireEvent.change(select, { target: { value: "8.0 - 9.0" } });

    expect(screen.getByText(/Master Orator Focus:/i)).toBeInTheDocument();
    expect(screen.getByText(/Độ trôi chảy tuyệt đối/i)).toBeInTheDocument();
  });

  it("renders Live Speaking Lab and allows switching between tabs", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    expect(
      screen.getByText("Acoustic Reflex & Pronunciation Lab"),
    ).toBeInTheDocument();

    // Tab 1 (IPA Gym) is active by default
    expect(screen.getByText("Âm ma sát răng: /θ/ vs /s/")).toBeInTheDocument();

    // Switch to 60s Prep Coach
    fireEvent.click(screen.getByText("60s Prep Coach"));
    expect(
      screen.getByText("IELTS Part 2 1-Minute Prep Countdown"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bắt đầu 60s")).toBeInTheDocument();

    // Switch to Filler Trap
    fireEvent.click(screen.getByText("Filler Trap"));
    expect(screen.getByText(/Hesitation Trap/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/BAND 7.5\+ UPGRADE/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders 4 practice modes and opens Quick Speaking Modal", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    expect(screen.getByText("Part 1 Rapid Fire")).toBeInTheDocument();
    expect(screen.getByText("Part 2 Cue Card Master")).toBeInTheDocument();
    expect(screen.getByText("Part 3 Abstract Discussion")).toBeInTheDocument();
    expect(screen.getByText("Shadowing & Rhythm")).toBeInTheDocument();

    // Click "Vào Cue Card"
    fireEvent.click(screen.getByText("Vào Cue Card"));

    // Modal should be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/IELTS PART 2 STUDIO/i)).toBeInTheDocument();
    expect(screen.getByText("Bắt đầu nói ngay")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByLabelText("Đóng cửa sổ"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters cue cards by search input and part chips", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    const searchInput = screen.getByPlaceholderText(
      /Tìm kiếm chủ đề speaking/i,
    );

    // Search for "eco-friendly"
    fireEvent.change(searchInput, { target: { value: "eco-friendly" } });
    expect(
      screen.getByText("Describe an eco-friendly habit you adopted"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("The Role of Artificial Intelligence in Education"),
    ).not.toBeInTheDocument();

    // Reset search
    fireEvent.change(searchInput, { target: { value: "" } });

    // Filter Part 1
    fireEvent.click(screen.getByRole("button", { name: "Part 1" }));
    expect(
      screen.getByText("Daily Routine & Work-Life Equilibrium"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Describe an eco-friendly habit you adopted"),
    ).not.toBeInTheDocument();
  });

  it("tests microphone toggle interaction", () => {
    render(<SpeakingHubClient items={dummyItems} />);

    const testMicBtn = screen.getByRole("button", { name: "Test mic" });
    fireEvent.click(testMicBtn);

    expect(screen.getByText("Live Audio Testing...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dừng test" }),
    ).toBeInTheDocument();
  });
});
