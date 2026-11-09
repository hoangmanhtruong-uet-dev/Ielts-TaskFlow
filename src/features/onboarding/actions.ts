"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionStatus } from "@/features/auth/action-state";
import {
  availabilityStepSchema,
  createExamDateStepSchema,
  createLearnerPreferencesFormSchema,
  currentBandStepSchema,
  learnerPreferencesSchema,
  prioritySkillsStepSchema,
  targetStepSchema,
  testTypeStepSchema,
} from "@/features/onboarding/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/features/auth/policies";
import { requireCurrentAccount } from "@/features/auth/server/account";
import { logServerEvent } from "@/server/observability/logger";
import { getServerRequestId } from "@/server/observability/request-context";
import type { Database } from "@/types/database";

type LearnerProfileUpdate =
  Database["public"]["Tables"]["learner_profiles"]["Update"];

export type OnboardingActionState = {
  status: ActionStatus;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  requestId?: string;
  nextStep?: number;
};

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function dateInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function validationError(
  requestId: string,
  fieldErrors: Record<string, string[] | undefined>,
): OnboardingActionState {
  return {
    status: "error",
    message: "Hãy kiểm tra lại thông tin ở bước này.",
    fieldErrors,
    requestId,
  };
}

export async function saveOnboardingStepAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const requestId = await getServerRequestId();
  const step = Number(stringValue(formData, "step"));
  const returnToReview = stringValue(formData, "returnToReview") === "true";
  const account = await requireCurrentAccount();

  if (!account.profile) {
    return {
      status: "error",
      message: "Chưa tìm thấy hồ sơ tài khoản để lưu thiết lập.",
      requestId,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed_at, onboarding_step, test_type")
    .eq("user_id", account.user.id)
    .maybeSingle();

  if (readError) {
    logServerEvent("warn", {
      event: "onboarding.read.rejected",
      requestId,
      route: "saveOnboardingStepAction",
      stage: "read learner profile",
      errorCode: readError.code ?? "ONBOARDING_READ_REJECTED",
    });
    return {
      status: "error",
      message: "Không thể kiểm tra tiến độ thiết lập lúc này.",
      requestId,
    };
  }

  if (existing?.onboarding_completed_at) redirect("/dashboard");

  let update: LearnerProfileUpdate;
  let nextStep: number;

  if (step === 2) {
    const result = testTypeStepSchema.safeParse({
      testType: stringValue(formData, "testType"),
    });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = { test_type: result.data.testType };
    nextStep = 3;
  } else if (step === 3) {
    const result = currentBandStepSchema.safeParse({
      currentBand: stringValue(formData, "currentBand"),
    });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = { current_band: result.data.currentBand };
    nextStep = 4;
  } else if (step === 4) {
    const rawGoal = stringValue(formData, "primaryGoal");
    const inferredGoal =
      rawGoal ||
      (existing?.test_type === "general_training" ? "work" : "study_abroad");
    const result = targetStepSchema.safeParse({
      targetBand: stringValue(formData, "targetBand"),
      primaryGoal: inferredGoal,
    });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = {
      target_band: result.data.targetBand,
      primary_goal: result.data.primaryGoal ?? inferredGoal,
    };
    nextStep = 5;
  } else if (step === 5) {
    const result = createExamDateStepSchema(
      dateInTimeZone(account.profile.timezone),
    ).safeParse({ targetExamDate: stringValue(formData, "targetExamDate") });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = { target_exam_date: result.data.targetExamDate };
    nextStep = 6;
  } else if (step === 6) {
    const result = availabilityStepSchema.safeParse({
      dailyStudyMinutes: stringValue(formData, "dailyStudyMinutes"),
      studyDaysPerWeek: stringValue(formData, "studyDaysPerWeek"),
    });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = {
      daily_study_minutes: result.data.dailyStudyMinutes,
      study_days_per_week: result.data.studyDaysPerWeek,
    };
    nextStep = 7;
  } else if (step === 7) {
    const result = prioritySkillsStepSchema.safeParse({
      prioritySkills: formData
        .getAll("prioritySkills")
        .filter((value): value is string => typeof value === "string"),
    });
    if (!result.success)
      return validationError(requestId, result.error.flatten().fieldErrors);
    update = { priority_skills: result.data.prioritySkills };
    nextStep = 8;
  } else {
    return {
      status: "error",
      message: "Bước thiết lập không hợp lệ.",
      requestId,
    };
  }

  const destinationStep =
    returnToReview && existing?.onboarding_step === 8 ? 8 : nextStep;
  const { error } = await supabase.from("learner_profiles").upsert(
    {
      user_id: account.user.id,
      ...update,
      onboarding_step: destinationStep,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    logServerEvent("warn", {
      event: "onboarding.save.rejected",
      requestId,
      route: "saveOnboardingStepAction",
      stage: "save learner profile",
      errorCode: error.code ?? "ONBOARDING_SAVE_REJECTED",
    });
    return {
      status: "error",
      message: "Không thể lưu bước này. Hãy thử lại sau.",
      requestId,
    };
  }

  revalidatePath("/onboarding");
  return {
    status: "success",
    message: "Đã lưu tiến độ.",
    requestId,
    nextStep: destinationStep,
  };
}

export async function completeOnboardingAction(
  _previousState: OnboardingActionState,
  _formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  void _formData;
  const requestId = await getServerRequestId();
  const account = await requireCurrentAccount();
  const supabase = await createSupabaseServerClient();
  const { data: learnerProfile, error: readError } = await supabase
    .from("learner_profiles")
    .select(
      "test_type, current_band, target_band, target_exam_date, daily_study_minutes, study_days_per_week, priority_skills, primary_goal",
    )
    .eq("user_id", account.user.id)
    .maybeSingle();

  if (readError || !learnerProfile) {
    if (readError) {
      logServerEvent("warn", {
        event: "onboarding.complete_read.rejected",
        requestId,
        route: "completeOnboardingAction",
        stage: "read learner profile",
        errorCode: readError.code ?? "ONBOARDING_READ_REJECTED",
      });
    }
    return {
      status: "error",
      message: "Không tìm thấy hồ sơ học tập để hoàn tất.",
      requestId,
    };
  }

  const validation = learnerPreferencesSchema.safeParse(learnerProfile);
  if (!validation.success) {
    return {
      status: "error",
      message: "Thiết lập chưa đủ thông tin. Hãy quay lại kiểm tra các bước.",
      requestId,
    };
  }

  const { error } = await supabase.rpc("complete_learner_onboarding");
  if (error) {
    logServerEvent("warn", {
      event: "onboarding.complete.rejected",
      requestId,
      route: "completeOnboardingAction",
      stage: "complete onboarding",
      errorCode: error.code ?? "ONBOARDING_COMPLETE_REJECTED",
    });
    return {
      status: "error",
      message: "Không thể hoàn tất thiết lập lúc này. Hãy thử lại sau.",
      requestId,
    };
  }

  try {
    await supabase.rpc("accept_current_policies", {
      p_terms_version: TERMS_VERSION,
      p_privacy_version: PRIVACY_VERSION,
      p_channel: "onboarding_banner",
    });
  } catch {
    // Non-fatal if already accepted on signup or OAuth.
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateLearnerPreferencesAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const requestId = await getServerRequestId();
  const account = await requireCurrentAccount();

  if (!account.profile) {
    return {
      status: "error",
      message: "Chưa tìm thấy hồ sơ tài khoản.",
      requestId,
    };
  }

  const result = createLearnerPreferencesFormSchema(
    dateInTimeZone(account.profile.timezone),
  ).safeParse({
    testType: stringValue(formData, "testType"),
    currentBand: stringValue(formData, "currentBand"),
    targetBand: stringValue(formData, "targetBand"),
    primaryGoal: stringValue(formData, "primaryGoal"),
    targetExamDate: stringValue(formData, "targetExamDate"),
    dailyStudyMinutes: stringValue(formData, "dailyStudyMinutes"),
    studyDaysPerWeek: stringValue(formData, "studyDaysPerWeek"),
    prioritySkills: formData
      .getAll("prioritySkills")
      .filter((value): value is string => typeof value === "string"),
  });

  if (!result.success) {
    return validationError(requestId, result.error.flatten().fieldErrors);
  }

  const supabase = await createSupabaseServerClient();
  const { data: learnerProfile, error: readError } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed_at")
    .eq("user_id", account.user.id)
    .maybeSingle();

  if (readError || !learnerProfile?.onboarding_completed_at) {
    if (readError) {
      logServerEvent("warn", {
        event: "preferences.read.rejected",
        requestId,
        route: "updateLearnerPreferencesAction",
        stage: "read learner profile",
        errorCode: readError.code ?? "PREFERENCES_READ_REJECTED",
      });
    }
    return {
      status: "error",
      message: "Hãy hoàn tất thiết lập ban đầu trước khi cập nhật mục tiêu.",
      requestId,
    };
  }

  const { error } = await supabase
    .from("learner_profiles")
    .update({
      test_type: result.data.testType,
      current_band: result.data.currentBand,
      target_band: result.data.targetBand,
      primary_goal: result.data.primaryGoal,
      target_exam_date: result.data.targetExamDate,
      daily_study_minutes: result.data.dailyStudyMinutes,
      study_days_per_week: result.data.studyDaysPerWeek,
      priority_skills: result.data.prioritySkills,
    })
    .eq("user_id", account.user.id);

  if (error) {
    logServerEvent("warn", {
      event: "preferences.update.rejected",
      requestId,
      route: "updateLearnerPreferencesAction",
      stage: "update learner preferences",
      errorCode: error.code ?? "PREFERENCES_UPDATE_REJECTED",
    });
    return {
      status: "error",
      message: "Không thể cập nhật mục tiêu học lúc này. Hãy thử lại sau.",
      requestId,
    };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: "Mục tiêu học đã được cập nhật.",
    requestId,
  };
}
