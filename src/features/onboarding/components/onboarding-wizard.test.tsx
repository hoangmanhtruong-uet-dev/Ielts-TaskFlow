import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OnboardingActionState } from "@/features/onboarding/actions";
import type { LearnerProfile } from "@/features/onboarding/server/learner-profile";

const saveStep = vi.fn(
  async (...args: unknown[]): Promise<OnboardingActionState> => {
    const formData = args.find(
      (value): value is FormData => value instanceof FormData,
    );
    if (!formData) return { status: "idle" as const };
    const step = Number(formData.get("step"));
    if (step === 2 && !formData.get("testType")) {
      return {
        status: "error" as const,
        message: "Hãy kiểm tra lại thông tin ở bước này.",
        fieldErrors: { testType: ["Hãy chọn loại bài thi IELTS."] },
        requestId: "request-error",
      };
    }
    return {
      status: "success" as const,
      message: "Đã lưu tiến độ.",
      requestId: `request-${step}`,
      nextStep: formData.get("returnToReview") === "true" ? 8 : step + 1,
    };
  },
);

vi.mock("@/features/onboarding/actions", () => ({
  saveOnboardingStepAction: (...args: unknown[]) => saveStep(...args),
  completeOnboardingAction: vi.fn(),
}));

import { OnboardingWizard } from "./onboarding-wizard";

const completedProfile: LearnerProfile = {
  user_id: "41111111-1111-4111-8111-111111111111",
  test_type: "academic",
  current_band: 5.5,
  target_band: 7,
  target_exam_date: null,
  daily_study_minutes: 45,
  study_days_per_week: 5,
  priority_skills: ["writing", "speaking"],
  primary_goal: "study_abroad",
  onboarding_step: 8,
  onboarding_completed_at: null,
  created_at: "2026-07-16T00:00:00.000Z",
  updated_at: "2026-07-16T00:00:00.000Z",
};

describe("OnboardingWizard", () => {
  beforeEach(() => saveStep.mockClear());

  it("provides a real URL for starting setup before hydration", () => {
    render(<OnboardingWizard learnerProfile={null} displayName="Minh" />);

    expect(
      screen.getByRole("link", { name: "Bắt đầu thiết lập" }),
    ).toHaveAttribute("href", "/onboarding?step=2");
  });

  it("can render the first form directly from a server requested step", () => {
    render(
      <OnboardingWizard
        learnerProfile={null}
        displayName="Minh"
        initialStep={2}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Bạn đang chuẩn bị cho loại bài thi nào?",
      }),
    ).toBeVisible();
  });

  it("supports welcome, validation error focus, and back navigation", async () => {
    render(<OnboardingWizard learnerProfile={null} displayName="Minh" />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    fireEvent.click(screen.getByRole("link", { name: "Bắt đầu thiết lập" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    expect(
      screen.getByRole("heading", {
        name: "Bạn đang chuẩn bị cho loại bài thi nào?",
      }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));
    await expect(
      screen.findByText("Hãy chọn loại bài thi IELTS."),
    ).resolves.toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /IELTS Academic/ }),
      ).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.getByRole("heading", { name: /Chào Minh/ })).toBeVisible();
  });

  it("saves a step and advances to the next semantic form", async () => {
    render(<OnboardingWizard learnerProfile={null} displayName="Minh" />);
    fireEvent.click(screen.getByRole("link", { name: "Bắt đầu thiết lập" }));
    fireEvent.click(screen.getByRole("radio", { name: /IELTS Academic/ }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));

    await expect(
      screen.findByRole("heading", {
        name: "Band hiện tại của bạn là bao nhiêu?",
      }),
    ).resolves.toBeVisible();
    expect(saveStep).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Band hiện tại")).toHaveValue("unknown");
  });

  it("resumes at review and renders persisted values", () => {
    render(
      <OnboardingWizard learnerProfile={completedProfile} displayName="Minh" />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Kiểm tra lại thiết lập của bạn",
      }),
    ).toBeVisible();
    expect(screen.getByText("IELTS Academic")).toBeVisible();
    expect(screen.getByText("Du học")).toBeVisible();
    expect(screen.getByText("Writing, Speaking")).toBeVisible();
    expect(screen.getByText("3 giờ 45 phút mỗi tuần")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Hoàn tất thiết lập" }),
    ).toBeEnabled();
  });

  it("selects a balanced four-skill focus in one action", () => {
    render(
      <OnboardingWizard
        learnerProfile={{
          ...completedProfile,
          onboarding_step: 7,
          priority_skills: [],
        }}
        displayName="Minh"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Học cân bằng 4 kỹ năng" }),
    );
    for (const skill of ["Listening", "Reading", "Writing", "Speaking"]) {
      expect(screen.getByRole("checkbox", { name: skill })).toBeChecked();
    }
  });

  it("returns to review after editing a saved value", async () => {
    render(
      <OnboardingWizard learnerProfile={completedProfile} displayName="Minh" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sửa band mục tiêu" }));
    fireEvent.change(screen.getByLabelText("Band mục tiêu"), {
      target: { value: "7.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));

    await expect(
      screen.findByRole("heading", { name: "Kiểm tra lại thiết lập của bạn" }),
    ).resolves.toBeVisible();
    expect(screen.getByText("7.5")).toBeVisible();
  });

  it("supports selecting all 7 study days per week", async () => {
    render(
      <OnboardingWizard
        learnerProfile={null}
        displayName="Minh"
        initialStep={6}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "T7" }));
    fireEvent.click(screen.getByRole("button", { name: "CN" }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));

    await expect(
      screen.findByRole("heading", { name: "Kỹ năng nào cần ưu tiên?" }),
    ).resolves.toBeVisible();

    const submittedFormData = saveStep.mock.calls.at(-1)?.[1] as FormData;
    expect(submittedFormData.get("studyDaysPerWeek")).toBe("7");
  });

  it("clears saveError and fieldErrors when changing inputs or navigating back", async () => {
    render(
      <OnboardingWizard
        learnerProfile={null}
        displayName="Minh"
        initialStep={2}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));
    await expect(
      screen.findByText("Hãy chọn loại bài thi IELTS."),
    ).resolves.toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Hãy kiểm tra lại thông tin ở bước này.",
    );

    fireEvent.click(screen.getByRole("radio", { name: /IELTS Academic/ }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Hãy chọn loại bài thi IELTS."),
    ).not.toBeInTheDocument();

    saveStep.mockResolvedValueOnce({
      status: "error",
      message: "Lỗi tạm thời khi lưu.",
      requestId: "req-err-back",
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu và tiếp tục" }));
    await expect(screen.findByRole("alert")).resolves.toHaveTextContent(
      "Lỗi tạm thời khi lưu.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
