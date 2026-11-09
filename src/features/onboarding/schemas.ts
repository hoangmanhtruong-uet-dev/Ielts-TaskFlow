import { z } from "@/lib/validation/zod";

import {
  DAILY_STUDY_MINUTES,
  PRIMARY_GOALS,
  PRIORITY_SKILLS,
  TEST_TYPES,
} from "@/features/onboarding/constants";

const halfBandSchema = z.coerce
  .number({ error: "Hãy chọn band điểm hợp lệ." })
  .min(0, "Band điểm phải từ 0 đến 9.")
  .max(9, "Band điểm phải từ 0 đến 9.")
  .refine((value) => Number.isInteger(value * 2), {
    message: "Band điểm phải theo bước 0.5.",
  });

export const testTypeStepSchema = z.object({
  testType: z.enum(TEST_TYPES, {
    error: "Hãy chọn loại bài thi IELTS.",
  }),
});

export const currentBandStepSchema = z.object({
  currentBand: z
    .union([z.literal("unknown"), halfBandSchema])
    .transform((value) => (value === "unknown" ? null : value)),
});

export const targetStepSchema = z.object({
  targetBand: halfBandSchema,
  primaryGoal: z
    .enum(PRIMARY_GOALS, {
      error: "Hãy chọn mục tiêu học IELTS.",
    })
    .optional(),
});

export function createExamDateStepSchema(today: string) {
  return z.object({
    targetExamDate: z
      .string()
      .transform((value) => (value.trim() === "" ? null : value))
      .refine(
        (value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
        "Ngày thi không hợp lệ.",
      )
      .refine(
        (value) => value === null || value >= today,
        "Ngày thi không được ở trong quá khứ.",
      ),
  });
}

export const availabilityStepSchema = z.object({
  dailyStudyMinutes: z.coerce
    .number({ error: "Hãy chọn thời lượng học mỗi ngày." })
    .refine(
      (value) => DAILY_STUDY_MINUTES.some((minutes) => minutes === value),
      "Thời lượng học không hợp lệ.",
    ),
  studyDaysPerWeek: z.coerce
    .number({ error: "Hãy chọn số ngày học mỗi tuần." })
    .int()
    .min(1, "Số ngày học phải từ 1 đến 7.")
    .max(7, "Số ngày học phải từ 1 đến 7."),
});

export const prioritySkillsStepSchema = z.object({
  prioritySkills: z
    .array(z.enum(PRIORITY_SKILLS))
    .min(1, "Hãy chọn ít nhất một kỹ năng ưu tiên.")
    .max(4)
    .refine((values) => new Set(values).size === values.length, {
      message: "Mỗi kỹ năng chỉ được chọn một lần.",
    }),
});

export function createLearnerPreferencesFormSchema(today: string) {
  return z.object({
    testType: testTypeStepSchema.shape.testType,
    currentBand: currentBandStepSchema.shape.currentBand,
    targetBand: targetStepSchema.shape.targetBand,
    primaryGoal: targetStepSchema.shape.primaryGoal,
    targetExamDate: createExamDateStepSchema(today).shape.targetExamDate,
    dailyStudyMinutes: availabilityStepSchema.shape.dailyStudyMinutes,
    studyDaysPerWeek: availabilityStepSchema.shape.studyDaysPerWeek,
    prioritySkills: prioritySkillsStepSchema.shape.prioritySkills,
  });
}

export const learnerPreferencesSchema = z.object({
  test_type: z.enum(TEST_TYPES),
  current_band: halfBandSchema.nullable(),
  target_band: halfBandSchema,
  target_exam_date: z.string().nullable(),
  daily_study_minutes: z
    .number()
    .refine((value) => DAILY_STUDY_MINUTES.some((item) => item === value)),
  study_days_per_week: z.number().int().min(1).max(7),
  priority_skills: z.array(z.enum(PRIORITY_SKILLS)).min(1).max(4),
  primary_goal: z.enum(PRIMARY_GOALS),
});
