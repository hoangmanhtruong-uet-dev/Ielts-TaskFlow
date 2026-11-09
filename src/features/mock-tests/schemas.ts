import { z } from "@/lib/validation/zod";

const uuid = z.string().uuid();
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120);

export const startMockTestSchema = z.object({ mockTestSlug: slug });
export const startMockSectionSchema = z.object({
  mockTestSlug: slug,
  sessionId: uuid,
  sectionId: uuid,
});
export const submitMockSectionSchema = z.object({
  mockTestSlug: slug,
  sessionId: uuid,
  sectionAttemptId: uuid,
  idempotencyKey: z.string().min(1).max(200),
});
export const submitMockTestSchema = z.object({
  mockTestSlug: slug,
  sessionId: uuid,
});
export const mockRunnerContextSchema = z.object({
  mockTestSlug: slug,
  mockSessionId: uuid,
  mockSectionAttemptId: uuid,
});

export type SubmitMockSectionInput = z.infer<typeof submitMockSectionSchema>;

export function parseMockRunnerContext(input: unknown) {
  const parsed = mockRunnerContextSchema.safeParse(input);
  if (!parsed.success) return undefined;
  return {
    mockTestSlug: parsed.data.mockTestSlug,
    sessionId: parsed.data.mockSessionId,
    sectionAttemptId: parsed.data.mockSectionAttemptId,
  };
}
