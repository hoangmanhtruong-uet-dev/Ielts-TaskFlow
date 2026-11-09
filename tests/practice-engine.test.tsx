import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GenericPracticeEngine } from "../src/features/core-practice/components/generic-practice-engine";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock actions
vi.mock("../src/features/core-practice/api/save-draft-action", () => ({
  saveExerciseDraftAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../src/features/core-practice/api/submit-attempt-action", () => ({
  submitExerciseAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("GenericPracticeEngine", () => {
  const mockQuestions = [
    { id: "q1", order_index: 0, question_type: "multiple_choice" },
    { id: "q2", order_index: 1, question_type: "fill_in_blanks" },
  ];

  it("renders questions and navigation correctly", () => {
    render(
      <GenericPracticeEngine
        attemptId="test-123"
        serverExpiresAt={null}
        questions={mockQuestions}
      >
        {({ currentQuestion }) => (
          <div data-testid="question-display">
            Rendering {currentQuestion.id}
          </div>
        )}
      </GenericPracticeEngine>,
    );

    // Initial render should show first question
    expect(screen.getByTestId("question-display").textContent).toBe(
      "Rendering q1",
    );

    // Check navigation buttons exist
    const nextBtn = screen.getByText("Câu tiếp");
    expect(nextBtn).toBeDefined();

    // Go to next question
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("question-display").textContent).toBe(
      "Rendering q2",
    );
  });
});
