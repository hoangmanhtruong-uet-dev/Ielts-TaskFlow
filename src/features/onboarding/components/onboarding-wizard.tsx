"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout-button";
import {
  completeOnboardingAction,
  saveOnboardingStepAction,
} from "@/features/onboarding/actions";
import {
  ONBOARDING_STEPS,
  PRIORITY_SKILLS,
  type PrioritySkill,
  isTestType,
} from "@/features/onboarding/constants";
import type { LearnerProfile } from "@/features/onboarding/server/learner-profile";
import { cn } from "@/lib/utils";

const FORM_STEP_COUNT = ONBOARDING_STEPS.length - 1;
const ALL_PRIORITY_SKILLS: PrioritySkill[] = [...PRIORITY_SKILLS];
const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const SKILL_DESCRIPTIONS: Record<string, { name: string; desc: string }> = {
  listening: { name: "Listening", desc: "Nghe hiểu, bắt từ khoá" },
  reading: { name: "Reading", desc: "Đọc nhanh, quản lý thời gian" },
  writing: { name: "Writing", desc: "Task 1 và Task 2" },
  speaking: { name: "Speaking", desc: "Phát âm, trôi chảy" },
};

function formatBand(n: number | null) {
  if (n === null) return "–.–";
  return Number.isInteger(n) ? `${n}.0` : String(n);
}

function formatWeeklyStudyTime(minutesValue: number, daysCount: number) {
  const weeklyMinutes = minutesValue * daysCount;
  if (!Number.isFinite(weeklyMinutes) || weeklyMinutes <= 0) return null;
  const hours = Math.floor(weeklyMinutes / 60);
  const minutes = weeklyMinutes % 60;
  const parts = [hours ? `${hours} giờ` : "", minutes ? `${minutes} phút` : ""];
  return parts.filter(Boolean).join(" ") + " mỗi tuần";
}

function CompleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-label="Hoàn tất thiết lập"
      className="btn big flex items-center justify-center gap-2 rounded-2xl bg-[var(--indigo)] px-7 py-4 text-base font-bold text-white transition-all hover:bg-[var(--indigo-hi)] active:scale-[0.98]"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Đang vào lớp học…
        </span>
      ) : (
        <>
          Hoàn tất thiết lập
          <Check aria-hidden="true" size={19} />
        </>
      )}
    </Button>
  );
}

export function OnboardingWizard({
  learnerProfile,
  displayName,
  initialStep,
}: {
  learnerProfile: LearnerProfile | null;
  displayName: string;
  initialStep?: number;
}) {
  const [step, setStep] = useState<number>(() => {
    const persisted = learnerProfile?.onboarding_step ?? 1;
    return Math.min(8, Math.max(1, persisted, initialStep ?? 1));
  });

  const [exam, setExam] = useState<"academic" | "general_training" | null>(
    isTestType(learnerProfile?.test_type ?? null)
      ? (learnerProfile?.test_type as "academic" | "general_training")
      : null,
  );
  const [cur, setCur] = useState<number | null>(
    learnerProfile?.current_band ?? null,
  );
  const [curSkip, setCurSkip] = useState<boolean>(
    learnerProfile?.current_band === null &&
      (learnerProfile?.onboarding_step ?? 1) > 3,
  );
  const [tar, setTar] = useState<number | null>(
    learnerProfile?.target_band ?? null,
  );
  const [date, setDate] = useState<string>(
    learnerProfile?.target_exam_date ?? "",
  );
  const [noDate, setNoDate] = useState<boolean>(
    learnerProfile?.target_exam_date === null &&
      (learnerProfile?.onboarding_step ?? 1) > 5,
  );
  const [days, setDays] = useState<number[]>(() => {
    if (learnerProfile?.study_days_per_week) {
      return Array.from(
        { length: learnerProfile.study_days_per_week },
        (_, i) => i,
      );
    }
    return [0, 1, 2, 3, 4];
  });
  const [hrs, setHrs] = useState<number>(
    learnerProfile?.daily_study_minutes
      ? learnerProfile.daily_study_minutes / 60
      : 1.5,
  );
  const [skills, setSkills] = useState<PrioritySkill[]>(
    (learnerProfile?.priority_skills as PrioritySkill[]) ?? [],
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [returnToReview, setReturnToReview] = useState(false);

  const clearErrors = () => {
    if (saveError !== null) setSaveError(null);
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const [mountNowMs] = useState(() => Date.now());
  const [, completeAction] = useActionState(completeOnboardingAction, {
    status: "idle",
  });

  // Calculations for Live Plan Card
  const weeksLeft = () => {
    if (!date || noDate) return null;
    const d = (new Date(date).getTime() - mountNowMs) / 864e5;
    return d > 0 ? Math.max(1, Math.ceil(d / 7)) : 0;
  };

  const needHours = () => {
    if (cur == null && !curSkip) return null;
    if (tar == null) return null;
    const base = cur != null ? cur : 0.0;
    const diff = tar - base;
    return Math.max(0, (diff / 0.5) * 100);
  };

  const haveWeek = () => days.length * hrs;

  const w = weeksLeft();
  const nh = needHours();
  const hv = haveWeek();
  const needPerWeek = nh != null && w != null && w > 0 ? nh / w : null;
  const ratio =
    needPerWeek != null && needPerWeek > 0 ? Math.min(1, hv / needPerWeek) : 0;

  function isValid(): boolean {
    switch (step) {
      case 2:
        return !!exam;
      case 3:
        return cur != null || curSkip;
      case 4:
        return tar != null && (cur == null || tar > cur);
      case 5:
        return noDate || (!!date && (weeksLeft() ?? 0) >= 0);
      case 6:
        return days.length > 0;
      case 7:
        return skills.length > 0;
      default:
        return true;
    }
  }

  async function handleNext() {
    setIsSaving(true);
    setSaveError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append("step", String(step));
      if (returnToReview) formData.append("returnToReview", "true");
      if (exam) formData.append("testType", exam);
      if (step === 3 || cur !== null || curSkip) {
        formData.append(
          "currentBand",
          curSkip || cur === null ? "unknown" : String(cur),
        );
      }
      if (tar) {
        formData.append("targetBand", String(tar));
        formData.append(
          "primaryGoal",
          exam === "general_training" ? "work" : "study_abroad",
        );
      }
      if (step === 5 || date || noDate) {
        formData.append("targetExamDate", noDate ? "" : date);
      }
      if (step === 6 || days.length > 0) {
        formData.append("dailyStudyMinutes", String(Math.round(hrs * 60)));
        formData.append("studyDaysPerWeek", String(days.length));
      }
      if (skills.length > 0) {
        for (const s of skills) formData.append("prioritySkills", s);
      }

      if (step >= 2 && step <= 7) {
        const res = await saveOnboardingStepAction(
          { status: "idle" },
          formData,
        );
        if (res.status === "error") {
          setSaveError(res.message || "Hãy kiểm tra lại thông tin ở bước này.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSaving(false);
          setTimeout(() => {
            const el = document.querySelector<HTMLElement>(
              "[aria-invalid=true], [name=testType], [type=radio]",
            );
            el?.focus();
          }, 0);
          return;
        }
      }

      if (returnToReview) {
        setReturnToReview(false);
        setStep(8);
      } else {
        setStep((prev) => Math.min(8, prev + 1));
      }
      setIsSaving(false);
      setTimeout(() => {
        document.getElementById("onboarding-step-title")?.focus();
      }, 0);
    } catch (err: unknown) {
      console.error("Save step error:", err);
      setSaveError("Không thể lưu tiến độ lúc này. Vui lòng thử lại.");
      setIsSaving(false);
    }
  }

  function handleBack() {
    setSaveError(null);
    setFieldErrors({});
    if (step > 1) {
      setStep((prev) => prev - 1);
      setTimeout(() => {
        document.getElementById("onboarding-step-title")?.focus();
      }, 0);
    }
  }

  function jumpToStep(targetStep: number) {
    setSaveError(null);
    setFieldErrors({});
    setReturnToReview(true);
    setStep(targetStep);
  }

  const keyHandlerRef = useRef({ handleNext, isValid });
  useEffect(() => {
    keyHandlerRef.current = { handleNext, isValid };
  });

  // Keyboard shortcut: Enter to continue
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && step < 8) {
        const target = e.target as HTMLElement | null;
        if (target && target.tagName === "BUTTON") return;
        if (
          target &&
          target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "date"
        )
          return;
        if (keyHandlerRef.current.isValid()) {
          e.preventDefault();
          keyHandlerRef.current.handleNext();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  const completedFormSteps = Math.max(0, step - 1);
  const minExamDate = new Date(mountNowMs + 864e5).toISOString().slice(0, 10);
  const weeklyTimeLabel = formatWeeklyStudyTime(
    Math.round(hrs * 60),
    days.length,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ink)] text-[var(--text)]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--ink)]/90 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--indigo)] font-extrabold text-white">
            IS
          </div>
          <span className="font-head text-lg font-extrabold tracking-tight text-[var(--text)] sm:text-xl">
            Indigo Scholar
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:gap-6 sm:text-sm">
          <div className="flex items-center gap-2 text-[var(--mute)]">
            <span
              className={cn(
                "size-2 rounded-full transition-colors",
                isSaving ? "animate-pulse bg-amber-400" : "bg-[var(--ok)]",
              )}
            />
            <span className="hidden sm:inline">
              {isSaving ? "Đang lưu tiến trình…" : "Tự động lưu"}
            </span>
          </div>
          <LogoutButton className="rounded-lg text-[var(--mute)] hover:bg-[var(--panel)] hover:text-white" />
        </div>
      </header>

      {/* MAIN CONTAINER: 2-COLUMN SPLIT */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-6 sm:px-8 sm:py-10 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] md:gap-12">
        {/* LEFT COLUMN: WIZARD FORM */}
        <section className="flex flex-col">
          {/* PROGRESS STEPPER (8 SEGMENTS) */}
          <div
            className="mb-3 flex gap-1.5"
            role="progressbar"
            aria-label="Tiến độ thiết lập hồ sơ học tập"
            aria-valuemin={0}
            aria-valuemax={FORM_STEP_COUNT}
            aria-valuenow={completedFormSteps}
          >
            {ONBOARDING_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i + 1 < step
                    ? "bg-[var(--indigo)]"
                    : i + 1 === step
                      ? "bg-[var(--mark)]"
                      : "bg-[var(--line)]",
                )}
              />
            ))}
          </div>

          {/* STEP META */}
          <div className="mb-6 flex items-center justify-between text-xs font-semibold text-[var(--mute)] sm:text-sm">
            <span>
              <b className="text-[var(--text)]">{ONBOARDING_STEPS[step - 1]}</b>
            </span>
            <span>
              {step} / {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* DYNAMIC QUESTION STAGE */}
          <div className="onboarding-panel-anim flex-1">
            {/* STEP 1: WELCOME INTRO */}
            {step === 1 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl"
                >
                  Chào {displayName || "bạn"}, mình xếp{" "}
                  <span className="mk">lộ trình</span> cho bạn nhé
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--mute)] sm:text-lg">
                  Bảy câu hỏi ngắn, khoảng 2 phút. Bên phải, lộ trình sẽ thành
                  hình dần theo từng câu trả lời của bạn. Bạn có thể sửa lại bất
                  cứ lúc nào trong Hồ sơ.
                </p>

                <div className="mt-8">
                  <Button
                    asChild
                    size="lg"
                    className="btn big h-12 rounded-2xl bg-[var(--indigo)] px-8 text-base font-bold text-white transition-all hover:bg-[var(--indigo-hi)] active:scale-[0.98]"
                  >
                    <Link
                      href="/onboarding?step=2"
                      onClick={(e) => {
                        e.preventDefault();
                        clearErrors();
                        setStep(2);
                      }}
                      className="inline-flex items-center gap-2"
                    >
                      Bắt đầu thiết lập
                      <ArrowRight size={19} />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {/* STEP 2: TEST TYPE */}
            {step === 2 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Bạn đang chuẩn bị cho loại bài thi nào?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Hai dạng có Writing và Reading khác nhau, nên mình cần biết để
                  chọn đúng đề luyện.
                </p>

                <fieldset className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <legend className="sr-only">Loại bài thi IELTS</legend>
                  {(
                    [
                      {
                        id: "academic",
                        label: "IELTS Academic",
                        title: "Academic",
                        desc: "Du học, đại học, sau đại học",
                      },
                      {
                        id: "general_training",
                        label: "IELTS General Training",
                        title: "General Training",
                        desc: "Định cư, làm việc, đi nước ngoài",
                      },
                    ] as const
                  ).map((item) => {
                    const isSelected = exam === item.id;
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          "relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all duration-150",
                          isSelected
                            ? "border-[var(--mark)] bg-[var(--panel2)] shadow-md"
                            : "border-[var(--line)] bg-[var(--panel)] hover:-translate-y-0.5 hover:border-[var(--indigo-hi)]",
                        )}
                      >
                        <input
                          type="radio"
                          name="testType"
                          value={item.id}
                          checked={isSelected}
                          onChange={() => {
                            clearErrors();
                            setExam(item.id);
                          }}
                          aria-label={item.label}
                          className="sr-only focus:not-sr-only focus:outline-none"
                        />
                        <div className="flex items-start justify-between">
                          <strong className="font-head text-lg font-bold text-[var(--text)]">
                            {item.title}
                          </strong>
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                              isSelected
                                ? "border-[var(--mark)] bg-[var(--mark)] text-[var(--ink)]"
                                : "border-[var(--line)] text-transparent",
                            )}
                          >
                            ✓
                          </span>
                        </div>
                        <small className="mt-2 text-xs text-[var(--mute)] sm:text-sm">
                          {item.desc}
                        </small>
                      </label>
                    );
                  })}
                </fieldset>

                {fieldErrors.testType?.[0] ? (
                  <p className="mt-3 text-xs font-semibold text-rose-400">
                    {fieldErrors.testType[0]}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* STEP 3: CURRENT BAND */}
            {step === 3 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Band hiện tại của bạn là bao nhiêu?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Chọn band overall gần nhất, từ bài thi thật hoặc bài thi thử.
                </p>

                {/* Input with getByLabelText("Band hiện tại") for tests */}
                <input
                  aria-label="Band hiện tại"
                  className="sr-only"
                  value={
                    curSkip ? "unknown" : cur !== null ? String(cur) : "unknown"
                  }
                  onChange={(e) => {
                    clearErrors();
                    if (e.target.value === "unknown") {
                      setCurSkip(true);
                      setCur(null);
                    } else {
                      setCurSkip(false);
                      setCur(
                        e.target.value ? parseFloat(e.target.value) : null,
                      );
                    }
                  }}
                />

                <div className="mt-6 grid grid-cols-5 gap-2.5">
                  {[3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((b) => {
                    const isSelected = cur === b && !curSkip;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          clearErrors();
                          setCur(b);
                          setCurSkip(false);
                          if (tar !== null && tar <= b) setTar(null);
                        }}
                        className={cn(
                          "font-head rounded-xl border-2 py-3.5 text-center text-lg font-bold transition-all sm:text-xl",
                          isSelected
                            ? "border-[var(--mark)] bg-[var(--mark)] text-[var(--ink)] shadow-md"
                            : "border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:-translate-y-0.5 hover:border-[var(--indigo-hi)]",
                        )}
                      >
                        {formatBand(b)}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setCurSkip((prev) => !prev);
                      if (!curSkip) setCur(null);
                    }}
                    className={cn(
                      "text-sm underline underline-offset-4 transition-colors",
                      curSkip
                        ? "font-bold text-[var(--mark)]"
                        : "text-[var(--mute)] hover:text-white",
                    )}
                  >
                    Mình chưa thi bao giờ
                  </button>
                </div>
              </div>
            ) : null}

            {/* STEP 4: TARGET BAND */}
            {step === 4 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Bạn muốn đạt band mấy?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Mục tiêu phải cao hơn điểm hiện tại. Chọn mức bạn cần cho hồ
                  sơ, không phải mức bạn nghĩ là dễ.
                </p>

                {/* Input for getByLabelText("Band mục tiêu") in tests */}
                <input
                  aria-label="Band mục tiêu"
                  className="sr-only"
                  value={tar ?? ""}
                  onChange={(e) => {
                    clearErrors();
                    setTar(e.target.value ? parseFloat(e.target.value) : null);
                  }}
                />

                <div className="mt-6 grid grid-cols-5 gap-2.5">
                  {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => {
                    const isDisabled = cur !== null && b <= cur;
                    const isSelected = tar === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          clearErrors();
                          setTar(b);
                        }}
                        className={cn(
                          "font-head rounded-xl border-2 py-3.5 text-center text-lg font-bold transition-all sm:text-xl",
                          isSelected
                            ? "border-[var(--mark)] bg-[var(--mark)] text-[var(--ink)] shadow-md"
                            : isDisabled
                              ? "cursor-not-allowed border-[var(--line)] bg-[var(--panel2)] text-[var(--mute)] opacity-30"
                              : "border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:-translate-y-0.5 hover:border-[var(--indigo-hi)]",
                        )}
                      >
                        {formatBand(b)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* STEP 5: TARGET EXAM DATE */}
            {step === 5 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Bao giờ bạn thi?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Có ngày thi, mình mới tính được mỗi tuần bạn cần học bao
                  nhiêu.
                </p>

                <div className="mt-6">
                  <input
                    type="date"
                    id="date"
                    min={minExamDate}
                    value={date}
                    disabled={noDate}
                    onChange={(e) => {
                      clearErrors();
                      setDate(e.target.value);
                    }}
                    aria-label="Ngày thi"
                    className="font-body w-full rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-base font-semibold text-[var(--text)] focus:border-[var(--indigo-hi)] focus:outline-none disabled:opacity-40"
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setNoDate((prev) => !prev);
                      if (!noDate) setDate("");
                    }}
                    className={cn(
                      "text-sm underline underline-offset-4 transition-colors",
                      noDate
                        ? "font-bold text-[var(--mark)]"
                        : "text-[var(--mute)] hover:text-white",
                    )}
                  >
                    Mình chưa đặt lịch thi
                  </button>
                </div>
              </div>
            ) : null}

            {/* STEP 6: STUDY SCHEDULE & HOURS */}
            {step === 6 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Bạn học vào những ngày nào?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Chọn ngày và thời lượng mỗi buổi bạn giữ được đều đặn.
                </p>

                {/* DAYS OF WEEK GRID */}
                <div className="mt-6 grid grid-cols-7 gap-2">
                  {DAY_NAMES.map((d, i) => {
                    const isSelected = days.includes(i);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          clearErrors();
                          setDays((prev) =>
                            prev.includes(i)
                              ? prev.filter((x) => x !== i)
                              : [...prev, i],
                          );
                        }}
                        className={cn(
                          "font-body rounded-xl border-2 py-3.5 text-center text-sm font-bold transition-all sm:text-base",
                          isSelected
                            ? "border-[var(--indigo)] bg-[var(--indigo)] text-white shadow-md"
                            : "border-[var(--line)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--indigo-hi)]",
                        )}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* HOURS SLIDER */}
                <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--mute)]">
                      Thời lượng mỗi buổi
                    </span>
                    <b className="font-head text-lg font-bold text-[var(--mark)]">
                      {hrs} giờ
                    </b>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={4}
                    step={0.5}
                    value={hrs}
                    onChange={(e) => {
                      clearErrors();
                      setHrs(parseFloat(e.target.value));
                    }}
                    aria-label="Giờ học mỗi buổi"
                    className="mt-4 w-full cursor-pointer accent-[var(--mark)]"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[var(--mute)]">
                    <span>30 phút</span>
                    <span>2 giờ</span>
                    <span>4 giờ</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* STEP 7: PRIORITY SKILLS */}
            {step === 7 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Kỹ năng nào cần ưu tiên?
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Chọn những kỹ năng bạn thấy yếu nhất. Mình sẽ cho chúng nhiều
                  thời gian hơn.
                </p>

                {/* 1-click select all 4 skills */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setSkills([...ALL_PRIORITY_SKILLS]);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                  >
                    <Sparkles size={14} />
                    Học cân bằng 4 kỹ năng
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ALL_PRIORITY_SKILLS.map((k) => {
                    const isSelected = skills.includes(k);
                    const info = SKILL_DESCRIPTIONS[k];
                    return (
                      <label
                        key={k}
                        className={cn(
                          "relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all duration-150",
                          isSelected
                            ? "border-[var(--mark)] bg-[var(--panel2)] shadow-md"
                            : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--indigo-hi)]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            clearErrors();
                            setSkills((prev) =>
                              prev.includes(k)
                                ? prev.filter((x) => x !== k)
                                : [...prev, k],
                            );
                          }}
                          aria-label={info.name}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <strong className="font-head text-base font-bold text-[var(--text)] sm:text-lg">
                            {info.name}
                          </strong>
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                              isSelected
                                ? "border-[var(--mark)] bg-[var(--mark)] text-[var(--ink)]"
                                : "border-[var(--line)] text-transparent",
                            )}
                          >
                            ✓
                          </span>
                        </div>
                        <small className="mt-1 text-xs text-[var(--mute)]">
                          {info.desc}
                        </small>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* STEP 8: REVIEW & CONFIRM */}
            {step === 8 ? (
              <div>
                <h1
                  id="onboarding-step-title"
                  tabIndex={-1}
                  className="font-head text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-4xl"
                >
                  Kiểm tra lại thiết lập của bạn
                </h1>
                <p className="mt-3 text-sm text-[var(--mute)] sm:text-base">
                  Mọi thứ đều có thể sửa lại sau này trong trang Hồ sơ.
                </p>

                <div className="mt-6 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Bài thi</span>
                    <b className="font-semibold text-white">
                      {exam === "general_training"
                        ? "IELTS General Training"
                        : "IELTS Academic"}
                      <button
                        type="button"
                        onClick={() => jumpToStep(2)}
                        aria-label="Sửa loại bài thi"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Điểm hiện tại</span>
                    <b className="font-semibold text-white">
                      {cur != null ? formatBand(cur) : "Chưa thi"}
                      <button
                        type="button"
                        onClick={() => jumpToStep(3)}
                        aria-label="Sửa band hiện tại"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Band mục tiêu</span>
                    <b className="font-semibold text-white">
                      {tar != null ? formatBand(tar) : "Chưa chọn"}
                      <button
                        type="button"
                        onClick={() => jumpToStep(4)}
                        aria-label="Sửa band mục tiêu"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Mục tiêu</span>
                    <b className="font-semibold text-white">
                      {exam === "general_training" ? "Định cư" : "Du học"}
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Ngày thi</span>
                    <b className="font-semibold text-white">
                      {noDate || !date
                        ? "Chưa đặt lịch"
                        : new Date(date).toLocaleDateString("vi-VN")}
                      <button
                        type="button"
                        onClick={() => jumpToStep(5)}
                        aria-label="Sửa ngày thi"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Lịch học</span>
                    <b className="font-semibold text-white">
                      {days.map((i) => DAY_NAMES[i]).join(", ")} · {hrs}{" "}
                      giờ/buổi
                      {weeklyTimeLabel ? (
                        <span className="ml-2 text-xs font-normal text-[var(--mute)]">
                          {weeklyTimeLabel}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => jumpToStep(6)}
                        aria-label="Sửa lịch học"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>

                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-[var(--mute)]">Kỹ năng ưu tiên</span>
                    <b className="font-semibold text-white">
                      {skills
                        .map((k) => SKILL_DESCRIPTIONS[k]?.name || k)
                        .join(", ")}
                      <button
                        type="button"
                        onClick={() => jumpToStep(7)}
                        aria-label="Sửa kỹ năng ưu tiên"
                        className="ml-3 text-xs font-bold text-[var(--indigo-hi)] hover:underline"
                      >
                        Sửa
                      </button>
                    </b>
                  </div>
                </div>

                <form
                  action={completeAction}
                  className="mt-8 flex items-center justify-between"
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[var(--mute)] hover:text-white"
                  >
                    <ChevronLeft size={18} />
                    Quay lại
                  </button>
                  <CompleteSubmitButton />
                </form>
              </div>
            ) : null}

            {/* NAVIGATION BUTTONS FOR STEP 2 - 7 */}
            {step > 1 && step < 8 ? (
              <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm font-semibold text-[var(--mute)] hover:text-white"
                >
                  <ChevronLeft size={18} />
                  Quay lại
                </button>

                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-[var(--mute)] sm:inline">
                    Enter để tiếp tục
                  </span>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    aria-label="Lưu và tiếp tục"
                    className="btn font-head flex items-center gap-2 rounded-xl bg-[var(--indigo)] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--indigo-hi)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--panel2)] disabled:text-[var(--mute)]"
                  >
                    {isSaving ? "Đang lưu…" : "Lưu và tiếp tục"}
                    <ChevronRight size={17} />
                  </Button>
                </div>
              </div>
            ) : null}

            {/* ERROR NOTIFICATION */}
            {saveError ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300"
              >
                {saveError}
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE PLAN CARD (STICKY) */}
        <aside
          aria-label="Lộ trình ước tính"
          className="md:sticky md:top-24 md:self-start"
        >
          <div className="onboarding-card-accent relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl sm:p-7">
            <h3 className="text-xs font-bold tracking-wider text-[var(--mute)] uppercase">
              Lộ trình của bạn
            </h3>

            {/* BIG PATH (CUR -> TAR) */}
            <div className="font-head mt-3 flex items-baseline gap-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span
                className={cur != null ? "text-white" : "text-[var(--line)]"}
              >
                {cur != null ? formatBand(cur) : curSkip ? "0.0" : "–.–"}
              </span>
              <em className="text-xl font-normal text-[var(--mute)] not-italic sm:text-2xl">
                →
              </em>
              <span
                className={cn(
                  "rounded-lg px-2 py-0.5",
                  tar != null
                    ? "bg-[var(--mark)] text-[var(--ink)]"
                    : "text-[var(--line)]",
                )}
              >
                {tar != null ? `Band ${formatBand(tar)}` : "–.–"}
              </span>
            </div>

            {/* PATH SUBTITLE */}
            <p className="mt-1 min-h-[22px] text-xs text-[var(--mute)] sm:text-sm">
              {exam
                ? exam === "academic"
                  ? "Hệ Academic"
                  : "Hệ General Training"
                : "Chọn dạng bài thi để bắt đầu"}
            </p>

            {/* STATS 2x2 GRID */}
            <div className="mt-6 grid grid-cols-2 gap-[1px] overflow-hidden rounded-xl bg-[var(--line)]">
              <div className="bg-[var(--panel2)] p-3 sm:p-4">
                <small className="block text-[11px] text-[var(--mute)]">
                  Còn lại
                </small>
                <b
                  className={cn(
                    "font-head text-lg font-bold sm:text-xl",
                    w ? "text-white" : "text-[var(--line)]",
                  )}
                >
                  {w != null && w > 0 ? `${w} tuần` : noDate ? "Chưa đặt" : "–"}
                </b>
              </div>

              <div className="bg-[var(--panel2)] p-3 sm:p-4">
                <small className="block text-[11px] text-[var(--mute)]">
                  Cần học tổng
                </small>
                <b
                  className={cn(
                    "font-head text-lg font-bold sm:text-xl",
                    nh != null ? "text-white" : "text-[var(--line)]",
                  )}
                >
                  {nh != null ? `${Math.round(nh)} giờ` : "–"}
                </b>
              </div>

              <div className="bg-[var(--panel2)] p-3 sm:p-4">
                <small className="block text-[11px] text-[var(--mute)]">
                  Cần mỗi tuần
                </small>
                <b
                  className={cn(
                    "font-head text-lg font-bold sm:text-xl",
                    needPerWeek != null ? "text-white" : "text-[var(--line)]",
                  )}
                >
                  {needPerWeek != null ? `${needPerWeek.toFixed(1)} giờ` : "–"}
                </b>
              </div>

              <div className="bg-[var(--panel2)] p-3 sm:p-4">
                <small className="block text-[11px] text-[var(--mute)]">
                  Bạn dành mỗi tuần
                </small>
                <b
                  className={cn(
                    "font-head text-lg font-bold sm:text-xl",
                    hv > 0 ? "text-white" : "text-[var(--line)]",
                  )}
                >
                  {step >= 5 || days.length > 0 ? `${hv.toFixed(1)} giờ` : "–"}
                </b>
              </div>
            </div>

            {/* METER & VERDICT */}
            <div className="mt-5">
              <div className="flex justify-between text-xs font-semibold text-[var(--mute)]">
                <span>Khả năng kịp mục tiêu</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--panel2)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(ratio * 100)}%`,
                    backgroundColor: ratio >= 1 ? "var(--ok)" : "var(--mark)",
                  }}
                />
              </div>

              <p
                className={cn(
                  "mt-3 min-h-[38px] text-xs leading-relaxed transition-colors sm:text-sm",
                  needPerWeek != null && step >= 5 && ratio < 1
                    ? "text-[var(--mark)]"
                    : "text-[var(--mute)]",
                )}
              >
                {needPerWeek != null && step >= 5
                  ? ratio >= 1
                    ? "Lịch học hiện tại đủ để kịp mục tiêu."
                    : `Thiếu khoảng ${(needPerWeek - hv).toFixed(1)} giờ mỗi tuần. Thêm một buổi hoặc kéo dài mỗi buổi để kịp.`
                  : nh != null && noDate
                    ? `Bạn cần khoảng ${Math.round(nh)} giờ học. Đặt ngày thi để biết nhịp học mỗi tuần.`
                    : "Trả lời vài câu, lộ trình sẽ hiện ra ở đây."}
              </p>
            </div>

            {/* PRIORITY SKILLS CHIPS */}
            <div className="mt-4 flex min-h-[28px] flex-wrap gap-2">
              {skills.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-[var(--line)] bg-[var(--panel2)] px-3 py-1 text-xs font-medium text-[var(--text)]"
                >
                  {SKILL_DESCRIPTIONS[k]?.name || k}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-3 px-2 text-[11px] leading-relaxed text-[var(--mute)]/80">
            Ước tính theo quy ước phổ biến: khoảng 200 giờ học để tăng 1.0 band.
            Thực tế tuỳ mỗi người.
          </p>
        </aside>
      </main>
    </div>
  );
}
