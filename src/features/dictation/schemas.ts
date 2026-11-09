import { z } from "@/lib/validation/zod";
import { learningSlugSchema } from "@/features/learning/schemas";

export const startDictationSchema = z.object({
  exerciseSlug: learningSlugSchema,
});

export const saveDictationSentenceSchema = z.object({
  exerciseSlug: learningSlugSchema,
  sentenceId: z.string().min(1),
  userText: z.string().max(2000),
});

export const submitDictationSchema = z.object({
  exerciseSlug: learningSlugSchema,
  answers: z.record(z.string(), z.string()),
});

export type StartDictationInput = z.infer<typeof startDictationSchema>;
export type SaveDictationSentenceInput = z.infer<
  typeof saveDictationSentenceSchema
>;
export type SubmitDictationInput = z.infer<typeof submitDictationSchema>;
