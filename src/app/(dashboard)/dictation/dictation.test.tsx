import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { DictationClient } from "./client";

const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const k in storage) delete storage[k];
  }),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

class MockSpeechSynthesisUtterance {
  text = "";
  lang = "en-US";
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

Object.defineProperty(window, "SpeechSynthesisUtterance", {
  value: MockSpeechSynthesisUtterance,
  writable: true,
});

describe("DictationClient Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    // Mock speechSynthesis
    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      },
    });
  });

  it("renders dictation library with header, stats, and 7 default lessons", () => {
    render(<DictationClient />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Luyện nghe chép chính tả",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Câu đã luyện")).toBeInTheDocument();
    expect(screen.getByText("Độ chính xác trung bình")).toBeInTheDocument();
    expect(screen.getByText(/Bài đã hoàn thành/)).toBeInTheDocument();

    // Default lessons
    expect(
      screen.getByText("Daily Conversation: At the Coffee Shop"),
    ).toBeInTheDocument();
    expect(screen.getByText("Asking for Directions")).toBeInTheDocument();
    expect(screen.getByText("Everyday Life")).toBeInTheDocument();
    expect(screen.getByText("Office Meeting Talk")).toBeInTheDocument();
    expect(screen.getByText("City News Bulletin")).toBeInTheDocument();
    expect(screen.getByText("Job Interview")).toBeInTheDocument();
    expect(screen.getByText("Sleep and Memory Study")).toBeInTheDocument();
  });

  it("filters lessons by search keyword and category chips", () => {
    render(<DictationClient />);

    const searchInput = screen.getByLabelText("Tìm bài");
    fireEvent.change(searchInput, { target: { value: "Coffee" } });

    expect(
      screen.getByText("Daily Conversation: At the Coffee Shop"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sleep and Memory Study"),
    ).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });

    // Filter by Level
    const hardBtn = screen.getByRole("button", { name: "Nâng cao" });
    fireEvent.click(hardBtn);

    expect(screen.getByText("Job Interview")).toBeInTheDocument();
    expect(screen.getByText("Sleep and Memory Study")).toBeInTheDocument();
    expect(screen.queryByText("Asking for Directions")).not.toBeInTheDocument();
  });

  it("opens modal and creates a custom lesson from text", () => {
    render(<DictationClient />);

    const newBtn = screen.getByRole("button", {
      name: /\+ Tạo bài từ văn bản/i,
    });
    fireEvent.click(newBtn);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Tạo bài từ văn bản của bạn",
      }),
    ).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText("Tên bài (không bắt buộc)");
    const textArea = screen.getByPlaceholderText(
      "Dán đoạn văn tiếng Anh ở đây...",
    );

    fireEvent.change(titleInput, {
      target: { value: "My Custom IELTS Speech" },
    });
    fireEvent.change(textArea, {
      target: {
        value:
          "Learning English with dictation is remarkably effective. Regular practice ensures rapid vocabulary retention.",
      },
    });

    const createBtn = screen.getByRole("button", { name: "Tạo bài" });
    fireEvent.click(createBtn);

    // Modal closes and new lesson is visible under "Của tôi"
    expect(screen.getByText("My Custom IELTS Speech")).toBeInTheDocument();
  });

  it("opens and closes Sổ từ nghe sai modal", () => {
    render(<DictationClient />);

    const noteBtn = screen.getByRole("button", { name: /Sổ từ nghe sai/i });
    fireEvent.click(noteBtn);

    expect(
      screen.getByRole("heading", { level: 2, name: "Sổ từ nghe sai" }),
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Đóng" });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole("heading", { level: 2, name: "Sổ từ nghe sai" }),
    ).not.toBeInTheDocument();
  });

  it("starts a lesson, supports hint, checking answer, and advances", async () => {
    render(<DictationClient />);

    // Click on Coffee shop lesson
    const card = screen.getByText("Daily Conversation: At the Coffee Shop");
    fireEvent.click(card);

    // Now in Player view
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Daily Conversation: At the Coffee Shop",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Câu 1 \//)).toBeInTheDocument();

    // Toggle mode to Cloze and back
    const clozeBtn = screen.getByRole("button", { name: "Điền từ thiếu" });
    fireEvent.click(clozeBtn);
    expect(clozeBtn).toHaveAttribute("aria-pressed", "true");

    const fullBtn = screen.getByRole("button", { name: "Chép cả câu" });
    fireEvent.click(fullBtn);
    expect(fullBtn).toHaveAttribute("aria-pressed", "true");

    // Click Hint (Alt+H)
    const hintBtn = screen.getByRole("button", { name: /Gợi ý/i });
    fireEvent.click(hintBtn);
    expect(screen.getByText(/Hi/)).toBeInTheDocument();

    // Type full answer
    const input = screen.getByLabelText("Câu trả lời");
    fireEvent.change(input, {
      target: { value: "Hi can I get a medium latte please" },
    });

    // Click Check
    const checkBtn = screen.getByRole("button", { name: /Kiểm tra/i });
    fireEvent.click(checkBtn);

    // Results diff is shown
    expect(screen.getByText(/Chính xác|Gần đúng/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Câu tiếp/i }),
    ).toBeInTheDocument();

    // Advance to next sentence
    const nextBtn = screen.getByRole("button", { name: /Câu tiếp/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Câu 2 \//)).toBeInTheDocument();
  });

  it("completes all sentences and renders the Result summary view", () => {
    render(<DictationClient />);

    // Start Asking for Directions (4 sentences)
    const card = screen.getByText("Asking for Directions");
    fireEvent.click(card);

    // Quickly complete all 4 sentences by using Reveal
    for (let i = 0; i < 4; i++) {
      const revealBtn = screen.getByRole("button", { name: "Xem đáp án" });
      fireEvent.click(revealBtn);

      const nextBtn = screen.getByRole("button", {
        name: i === 3 ? /Xem kết quả/i : /Câu tiếp/i,
      });
      fireEvent.click(nextBtn);
    }

    // Now in Result view
    expect(screen.getByText("Từng câu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Làm lại bài" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Về thư viện" }),
    ).toBeInTheDocument();

    // Return to library
    const libBtn = screen.getByRole("button", { name: "Về thư viện" });
    fireEvent.click(libBtn);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Luyện nghe chép chính tả",
      }),
    ).toBeInTheDocument();
  });

  it("safely escapes XSS payloads in user dictation input without dangerouslySetInnerHTML or nested main", () => {
    const { container } = render(<DictationClient />);

    // No nested <main> landmarks inside DictationClient
    expect(container.querySelectorAll("main")).toHaveLength(0);

    fireEvent.click(screen.getByText("Daily Conversation: At the Coffee Shop"));
    const input = screen.getByLabelText("Câu trả lời");

    const xssPayload = `<img src=x onerror=alert(1)> <script>window.__dictationXss=true</script>`;
    fireEvent.change(input, { target: { value: xssPayload } });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));

    // Ensure no injected <img> or <script> DOM elements exist and payload renders as plain text
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(
      (window as unknown as { __dictationXss?: boolean }).__dictationXss,
    ).toBeUndefined();
    expect(screen.getByText("<img")).toBeInTheDocument();
    expect(screen.getByText("onerror=alert(1)>")).toBeInTheDocument();
  });
});
