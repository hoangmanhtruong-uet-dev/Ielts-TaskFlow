import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WritingHubClient } from "./client";

// Mock ThreeLexicalCore to avoid WebGL rendering in JSDOM
vi.mock("./components/ThreeLexicalCore", () => ({
  ThreeLexicalCore: () => <div aria-label="3D Lexical Crystal Visualizer" />,
}));

describe("WritingHubClient", () => {
  const dummyItems = [
    {
      slug: "plastic-pollution-oceans",
      title: "Mitigating Marine Plastic Debris",
      description:
        "Discuss whether individual bans or industrial regulations are more effective.",
      difficulty: "c1",
      testType: "academic",
      taskType: "task2",
      minimumWords: 250,
      timeLimitSeconds: 2400,
      activeDraftId: null,
      latestSubmissionId: null,
    },
  ];

  it("renders header, 4 criteria HUD, and 3D visualizer container", () => {
    render(<WritingHubClient items={dummyItems} />);

    expect(
      screen.getByText("Zen Focus Writing & Lexical Architecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("Task Resp")).toBeInTheDocument();
    expect(screen.getByText("Coherence")).toBeInTheDocument();
    expect(screen.getByText("Lexical")).toBeInTheDocument();
    expect(screen.getByText("Grammar")).toBeInTheDocument();
    expect(
      screen.getByLabelText("3D Lexical Crystal Visualizer"),
    ).toBeInTheDocument();
  });

  it("changes band dropdown and updates the stage descriptor", () => {
    render(<WritingHubClient items={dummyItems} />);

    const select = screen.getByLabelText("Chọn giai đoạn band điểm Writing");
    fireEvent.change(select, { target: { value: "8.0 - 9.0" } });

    expect(screen.getByText(/Master Stylist Focus:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Phản hồi toàn diện mọi khía cạnh/i),
    ).toBeInTheDocument();
  });

  it("renders Live Writing Lab and allows switching between tabs", () => {
    render(<WritingHubClient items={dummyItems} />);

    expect(
      screen.getByText("Academic Syntax & Cohesion Lab"),
    ).toBeInTheDocument();

    // Tab 1 (Paraphrase Forge) is active by default
    expect(screen.getByText(/Original Prompt Sentence/i)).toBeInTheDocument();
    expect(screen.getByText(/BAND 6.0 ATTEMPT/i)).toBeInTheDocument();
    expect(
      screen.getByText(/BAND 8.0\+ ACADEMIC PARAPHRASE/i),
    ).toBeInTheDocument();

    // Switch to Cohesion Matrix
    fireEvent.click(screen.getByText("Cohesion Matrix"));
    expect(screen.getByText("Contrast Linkers")).toBeInTheDocument();
    expect(
      screen.getAllByText(/BAND 8.0\+ COHESION/i).length,
    ).toBeGreaterThanOrEqual(1);

    // Switch to Lexicon Swap
    fireEvent.click(screen.getByText("Lexicon Swap"));
    expect(
      screen.getByText("advantageous / beneficial / commendable"),
    ).toBeInTheDocument();
  });

  it("renders 4 practice modes and opens Quick Writing Modal", () => {
    render(<WritingHubClient items={dummyItems} />);

    expect(screen.getByText("Visual Data Synthesis")).toBeInTheDocument();
    expect(screen.getByText("Argumentative Essay")).toBeInTheDocument();
    expect(
      screen.getByText("Paraphrase & Complex Sentences"),
    ).toBeInTheDocument();
    expect(screen.getByText("5-Minute Outline Sprint")).toBeInTheDocument();

    // Click "Vào Task 2"
    fireEvent.click(screen.getByText("Vào Task 2"));

    // Modal should be open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/IELTS TASK2 STUDIO/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Nhập bài luận của bạn tại đây/i),
    ).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByLabelText("Đóng cửa sổ làm bài"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("filters writing tasks by search input and task type chips", () => {
    render(<WritingHubClient items={dummyItems} />);

    const searchInput = screen.getByPlaceholderText(
      /Tìm kiếm chủ đề bài viết/i,
    );

    // Search for "renewable"
    fireEvent.change(searchInput, { target: { value: "renewable" } });
    expect(
      screen.getByText(
        "Government Expenditure on Renewable Energy vs Healthcare",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Carbon Emissions across European Transport Sectors (2000–2025)",
      ),
    ).not.toBeInTheDocument();

    // Reset search
    fireEvent.change(searchInput, { target: { value: "" } });

    // Filter Task 1 Report
    fireEvent.click(screen.getByRole("button", { name: "Task 1 Report" }));
    expect(
      screen.getByText(
        "Carbon Emissions across European Transport Sectors (2000–2025)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Government Expenditure on Renewable Energy vs Healthcare",
      ),
    ).not.toBeInTheDocument();
  });

  it("interacts with essay editor inside Quick Writing Modal and submits", () => {
    render(<WritingHubClient items={dummyItems} />);

    // Open Task 1
    fireEvent.click(screen.getByText("Vào Task 1"));

    const editor = screen.getByPlaceholderText(
      /Nhập bài luận của bạn tại đây/i,
    );
    fireEvent.change(editor, {
      target: {
        value:
          "The line graph illustrates carbon dioxide emissions across Western Europe. Overall, private cars showed a noticeable downward trajectory over the period.",
      },
    });

    // Verify word counter updated
    expect(screen.getByText("21")).toBeInTheDocument();

    // Save local draft essay
    const submitBtn = screen.getByRole("button", {
      name: "Lưu nháp & Kiểm tra tiêu chí IELTS",
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("Bài viết đã được lưu nháp thành công!"),
    ).toBeInTheDocument();
  });
});
