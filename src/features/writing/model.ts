import { z } from "@/lib/validation/zod";

const bandSchema = z
  .number()
  .min(0)
  .max(9)
  .refine((value) => Number.isInteger(value * 2));

const criterionSchema = z
  .object({
    band: bandSchema,
    comment: z.string().min(1).max(1_000),
    evidence: z.array(z.string().min(1).max(400)).min(1).max(3),
  })
  .strict();

export const writingFeedbackProviderSchema = z
  .object({
    overallBandEstimate: bandSchema,
    confidence: z.enum(["low", "medium", "high"]),
    summary: z.string().min(1).max(2_000),
    criteria: z
      .object({
        taskResponse: criterionSchema,
        coherenceCohesion: criterionSchema,
        lexicalResource: criterionSchema,
        grammaticalRangeAccuracy: criterionSchema,
      })
      .strict(),
    strengths: z.array(z.string().min(1).max(500)).min(1).max(5),
    priorityIssues: z
      .array(
        z
          .object({
            issue: z.string().min(1).max(500),
            evidence: z.string().min(1).max(400),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    revisionPlan: z.array(z.string().min(1).max(500)).min(3).max(5),
    correctedExamples: z
      .array(
        z
          .object({
            source: z.string().min(1).max(400),
            revision: z.string().min(1).max(800),
          })
          .strict(),
      )
      .max(5),
  })
  .strict();

export type WritingFeedbackProviderOutput = z.infer<
  typeof writingFeedbackProviderSchema
>;

export const writingFeedbackStartSchema = z.discriminatedUnion(
  "shouldCallProvider",
  [
    z.object({
      runId: z.uuid(),
      status: z.string(),
      shouldCallProvider: z.literal(false),
    }),
    z.object({
      runId: z.uuid(),
      status: z.literal("pending"),
      shouldCallProvider: z.literal(true),
      finalizeNonce: z.uuid(),
      taskType: z.literal("task_2"),
      taskTitle: z.string().min(1),
      taskPrompt: z.string().min(1),
      instructions: z.string().min(1),
      minimumWords: z.number().int().positive(),
      wordTarget: z.number().int().positive(),
      essay: z.string().min(1).max(20_000),
    }),
  ],
);

export const writingCriterionRecordSchema = z.object({
  taskResponse: criterionSchema,
  coherenceCohesion: criterionSchema,
  lexicalResource: criterionSchema,
  grammaticalRangeAccuracy: criterionSchema,
});

export const writingPriorityIssuesSchema = z.array(
  z.object({ issue: z.string(), evidence: z.string() }),
);
export const writingCorrectedExamplesSchema = z.array(
  z.object({
    source: z.string(),
    revision: z.string(),
    explanation: z.string().optional(),
  }),
);
export const writingStringListSchema = z.array(z.string());

export function formatWritingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safeSeconds / 60)}:${(safeSeconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
