import { z } from "zod";

export const SaveDraftSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(
    z.string(),
    z.union([
      z.string(),
      z.array(z.string()),
      z.record(z.string(), z.string()),
    ]),
  ),
});

export const SubmitExerciseSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(
    z.string(),
    z.union([
      z.string(),
      z.array(z.string()),
      z.record(z.string(), z.string()),
    ]),
  ),
});

export type SaveDraftInput = z.infer<typeof SaveDraftSchema>;
export type SubmitExerciseInput = z.infer<typeof SubmitExerciseSchema>;
