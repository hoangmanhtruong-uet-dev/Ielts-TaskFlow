import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { DashboardClient } from "./client";

vi.mock("@/features/learning/vocabulary-actions", () => ({
  saveVocabAction: vi.fn().mockResolvedValue({ success: true }),
  checkWordInVaultAction: vi
    .fn()
    .mockResolvedValue({ success: true, inVault: false }),
  getSavedVaultTermsAction: vi
    .fn()
    .mockResolvedValue({ success: true, terms: [] }),
}));

describe("DashboardClient component", () => {
  const defaultProps = {
    accountLabel: "Trường Hoàng",
    firstName: "Trường",
    level: { code: "A2", label: "Elementary", progress: 35 },
    dailyMinutes: 20,
    nextLesson: {
      skillTitle: "Grammar",
      title: "Grammar",
      summary: "Rules and structure drills.",
      description: "Rules and structure drills. 5 new lessons are waiting.",
      href: "/learn/grammar",
      slug: "grammar",
      progressPercent: 45,
    },
    progress: 45,
    overview: { completedLessons: 3 },
    streak: 4,
    xp: 240,
    dailyGoal: { current: 1, total: 4 },
    weekData: [15, 0, 20, 0, 0, 10, 0],
    planItems: [
      {
        id: "vocab",
        iconText: "Aa",
        colorClass: "c-v",
        title: "Vocabulary",
        subtitle: "Flashcards and spaced repetition",
        href: "/learn/vocabulary",
        completed: true,
        progressPercent: 100,
      },
      {
        id: "listening",
        iconText: "Li",
        colorClass: "c-l",
        title: "Listening",
        subtitle: "Audio comprehension",
        href: "/practice/listening",
        progressPercent: 25,
      },
      {
        id: "dictation",
        iconText: "Di",
        colorClass: "c-d",
        title: "Dictation",
        subtitle: "Listen and write",
        href: "/dictation",
        progressPercent: 0,
      },
      {
        id: "mistakes",
        iconText: "!",
        colorClass: "c-m",
        title: "Review mistakes",
        subtitle: "2 recorded errors waiting for review",
        href: "/error-notebook",
      },
    ],
    wordOfTheDay: {
      word: "Resilience",
      phonetics: "/rɪˈzɪl.jəns/",
      type: "noun",
      level: "C1",
      definition:
        "The capacity to recover quickly from difficulties; toughness.",
      example: "She showed resilience.",
    },
    heatData: Array(126).fill(0),
    activeDays: 5,
    totalTimeFormatted: "1h 15m",
    weeklyLeague: [],
    hasStreakFreeze: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero greeting with real user streak and XP", () => {
    render(<DashboardClient {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Trường/,
    );
    expect(screen.getByText(/4-day streak/i)).toBeInTheDocument();

    const heroSection = screen.getByLabelText(
      /welcome and statistics summary/i,
    );
    expect(within(heroSection).getByText(/240/)).toBeInTheDocument();
  });

  it("renders honest zero state with 0% progress and no fabricated leaderboard names", () => {
    render(
      <DashboardClient
        {...defaultProps}
        progress={0}
        streak={0}
        xp={0}
        weekData={[0, 0, 0, 0, 0, 0, 0]}
        activeDays={0}
        totalTimeFormatted="0h 0m"
        dailyGoal={{ current: 0, total: 4 }}
      />,
    );

    const progressBar = screen.getByRole("progressbar", {
      name: /Grammar lesson progress/i,
    });
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.queryByText("Nam Hoàng")).not.toBeInTheDocument();
    expect(screen.queryByText("Minh Thư")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Chưa có bảng xếp hạng tuần này/i),
    ).toBeInTheDocument();
  });

  it("renders Continue Hero Banner with title and CTA button", () => {
    render(<DashboardClient {...defaultProps} />);

    expect(screen.getByText("Pick up where you left off")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Grammar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue Grammar" }),
    ).toHaveAttribute("href", "/learn/grammar");
  });

  it("renders Stats Strip with CEFR ladder", () => {
    render(<DashboardClient {...defaultProps} />);

    expect(screen.getByText("Lessons done")).toBeInTheDocument();
    expect(screen.getByText("A2 Elementary")).toBeInTheDocument();
    expect(screen.getByText("35% to B1")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("C2")).toBeInTheDocument();
  });

  it("renders Today's Plan rows from props", () => {
    render(<DashboardClient {...defaultProps} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /today's plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Vocabulary")).toBeInTheDocument();
    expect(screen.getByText("Completed ✓")).toBeInTheDocument();
    expect(screen.getByText("Listening")).toBeInTheDocument();
    expect(screen.getByText("Dictation")).toBeInTheDocument();
    expect(screen.getByText("Review mistakes")).toBeInTheDocument();
  });

  it("renders Study Heatmap with passed active days and total time", () => {
    render(<DashboardClient {...defaultProps} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /study heatmap/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("active days")).toBeInTheDocument();
    expect(screen.getByText("1h 15m")).toBeInTheDocument();
  });

  it("supports interactive Quick Practice flip and advance", () => {
    render(<DashboardClient {...defaultProps} />);

    const flipButton = screen.getByRole("button", { name: /tap to flip/i });
    fireEvent.click(flipButton);
    expect(screen.getByText(/Answer/i)).toBeInTheDocument();

    const knewButton = screen.getByRole("button", { name: /I knew this/i });
    fireEvent.click(knewButton);
    expect(screen.getByText("Tap to flip")).toBeInTheDocument();
  });

  it("renders WeeklyLeagueCard entries when supplied", () => {
    render(
      <DashboardClient
        {...defaultProps}
        weeklyLeague={[
          {
            userId: "u1",
            rank: 1,
            initials: "#1",
            label: "Học viên #1",
            xp: 500,
            isCurrentUser: false,
          },
          {
            userId: "me",
            rank: 2,
            initials: "T",
            label: "Trường",
            xp: 240,
            isCurrentUser: true,
          },
        ]}
      />,
    );

    const sidebar = screen.getByLabelText(/goals and community/i);
    expect(within(sidebar).getByText("Học viên #1")).toBeInTheDocument();
    expect(within(sidebar).getByText("You")).toBeInTheDocument();
    expect(
      within(sidebar).getByText(/\+261 XP overtakes rank 1/),
    ).toBeInTheDocument();
  });

  it("renders Daily Goal and Word of the Day actions", async () => {
    const { saveVocabAction } =
      await import("@/features/learning/vocabulary-actions");

    render(<DashboardClient {...defaultProps} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /daily goal/i }),
    ).toBeInTheDocument();

    const sidebar = screen.getByLabelText(/goals and community/i);
    expect(within(sidebar).getByText("Resilience")).toBeInTheDocument();

    const addButton = within(sidebar).getByRole("button", {
      name: /\+ add to my word list/i,
    });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(saveVocabAction).toHaveBeenCalledWith({ term: "Resilience" });
      expect(
        within(sidebar).getByText("✓ Added to your word list"),
      ).toBeInTheDocument();
    });
  });
});
