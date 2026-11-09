import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { LearnClient } from "./client";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LearnClient Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header and continue hero banner", () => {
    render(
      <LearnClient
        continueLesson={{
          title: "Listening Section 2: Campus Accommodation",
          progressPercent: 60,
          href: "/practice/listening",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Thư viện học" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tiếp tục học")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Listening Section 2/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tiến độ 60%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Làm tiếp ngay" })).toHaveAttribute(
      "href",
      "/practice/listening",
    );
  });

  it("renders tabs with count badges and allows switching tabs", () => {
    render(<LearnClient />);

    const allTabs = screen.getAllByRole("tab");
    expect(allTabs.length).toBe(5);

    // Initial tab is "Tất cả"
    expect(screen.getByRole("tab", { name: /Tất cả/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // All 3 sections are visible initially
    expect(
      screen.getByRole("heading", { level: 2, name: "Bốn kỹ năng IELTS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Thi thử và ôn lỗi sai" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Nền tảng" }),
    ).toBeInTheDocument();

    // Switch to "4 Kỹ năng IELTS"
    fireEvent.click(screen.getByRole("tab", { name: /4 Kỹ năng IELTS/ }));

    expect(
      screen.getByRole("tab", { name: /4 Kỹ năng IELTS/ }),
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", { level: 2, name: "Bốn kỹ năng IELTS" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: "Thi thử và ôn lỗi sai",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Nền tảng" }),
    ).not.toBeInTheDocument();
  });

  it("filters items by keyword search", () => {
    render(<LearnClient />);

    const searchInput = screen.getByLabelText(
      /Tìm kiếm bài luyện hoặc kỹ năng/i,
    );
    expect(searchInput).toBeInTheDocument();

    // Type "Speaking"
    fireEvent.change(searchInput, { target: { value: "Speaking" } });

    expect(screen.getByText("Speaking AI Practice")).toBeInTheDocument();
    expect(screen.queryByText("Reading Practice")).not.toBeInTheDocument();
    expect(screen.queryByText("Grammar Intensive")).not.toBeInTheDocument();
  });

  it("filters items with the filter dropdown (e.g. Có AI chấm)", () => {
    render(<LearnClient />);

    const filterButton = screen.getByRole("button", { name: /Lọc kết quả/i });
    fireEvent.click(filterButton);

    const aiFilterOption = screen.getByRole("menuitemradio", {
      name: "Có AI chấm",
    });
    fireEvent.click(aiFilterOption);

    // Only Writing and Speaking have AI
    expect(screen.getByText("Writing Practice")).toBeInTheDocument();
    expect(screen.getByText("Speaking AI Practice")).toBeInTheDocument();
    expect(screen.queryByText("Listening Practice")).not.toBeInTheDocument();
    expect(screen.queryByText("Reading Practice")).not.toBeInTheDocument();
  });

  it("displays empty state when no cards match and resets on button click", () => {
    render(<LearnClient />);

    const searchInput = screen.getByLabelText(
      /Tìm kiếm bài luyện hoặc kỹ năng/i,
    );
    fireEvent.change(searchInput, { target: { value: "xyz_not_found_123" } });

    expect(
      screen.getByRole("heading", { level: 2, name: "Không tìm thấy bài nào" }),
    ).toBeInTheDocument();

    const resetButton = screen.getByRole("button", { name: "Xoá bộ lọc" });
    fireEvent.click(resetButton);

    // After reset, search input is empty and cards are restored
    expect(searchInput).toHaveValue("");
    expect(
      screen.getByRole("heading", { level: 2, name: "Bốn kỹ năng IELTS" }),
    ).toBeInTheDocument();
  });

  it("focuses search input when pressing '/' key", () => {
    render(<LearnClient />);

    const searchInput = screen.getByLabelText(
      /Tìm kiếm bài luyện hoặc kỹ năng/i,
    );
    expect(document.activeElement).not.toBe(searchInput);

    fireEvent.keyDown(document, { key: "/" });
    expect(document.activeElement).toBe(searchInput);
  });
});
