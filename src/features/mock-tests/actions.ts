"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  startMockSectionSchema,
  startMockTestSchema,
  submitMockSectionSchema,
  submitMockTestSchema,
  type SubmitMockSectionInput,
} from "@/features/mock-tests/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { getMockSessionPage } from "@/features/mock-tests/server/content";

export async function startMockTestAction(formData: FormData) {
  const parsed = startMockTestSchema.safeParse({
    mockTestSlug: formData.get("mockTestSlug"),
  });
  if (!parsed.success) redirect("/mock-tests?error=invalid");
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("start_mock_test", {
    p_mock_test_slug: parsed.data.mockTestSlug,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error || !data)
    redirect(`/mock-tests/${parsed.data.mockTestSlug}?error=start`);
  revalidateMockPaths(parsed.data.mockTestSlug, data.id);
  redirect(`/mock-tests/${parsed.data.mockTestSlug}/session/${data.id}`);
}

export async function startMockSectionAction(formData: FormData) {
  const parsed = startMockSectionSchema.safeParse({
    mockTestSlug: formData.get("mockTestSlug"),
    sessionId: formData.get("sessionId"),
    sectionId: formData.get("sectionId"),
  });
  if (!parsed.success) redirect("/mock-tests?error=invalid");
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("start_mock_test_section", {
    p_session_id: parsed.data.sessionId,
    p_section_id: parsed.data.sectionId,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error || !data) {
    redirect(
      `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}?error=section-start`,
    );
  }
  const page = await getMockSessionPage(
    parsed.data.mockTestSlug,
    parsed.data.sessionId,
  );
  const section = page?.sections.find((item) => item.attempt?.id === data.id);
  if (!section?.practicePath) {
    redirect(
      `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}?error=section-route`,
    );
  }
  revalidateMockPaths(parsed.data.mockTestSlug, parsed.data.sessionId);
  redirect(section.practicePath);
}

export async function submitMockTestSectionAction(
  input: SubmitMockSectionInput,
) {
  const parsed = submitMockSectionSchema.safeParse(input);
  if (!parsed.success)
    return {
      status: "error" as const,
      message: "Dữ liệu nộp section không hợp lệ.",
    };
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("submit_mock_test_section", {
    p_section_attempt_id: parsed.data.sectionAttemptId,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error)
    return {
      status: "error" as const,
      message: "Chưa thể nộp section. Hãy kiểm tra dữ liệu bắt buộc.",
    };
  revalidateMockPaths(parsed.data.mockTestSlug, parsed.data.sessionId);
  redirect(
    `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}`,
  );
}

export async function submitMockTestAction(formData: FormData) {
  const parsed = submitMockTestSchema.safeParse({
    mockTestSlug: formData.get("mockTestSlug"),
    sessionId: formData.get("sessionId"),
  });
  if (!parsed.success) redirect("/mock-tests?error=invalid");
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { error: submitError } = await supabase.rpc("submit_mock_test", {
    p_session_id: parsed.data.sessionId,
    p_idempotency_key: crypto.randomUUID(),
  });
  if (submitError) {
    redirect(
      `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}?error=incomplete`,
    );
  }
  const { error: completeError } = await supabase.rpc("complete_mock_test", {
    p_session_id: parsed.data.sessionId,
  });
  if (completeError) {
    redirect(
      `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}?error=summary`,
    );
  }
  revalidateMockPaths(parsed.data.mockTestSlug, parsed.data.sessionId);
  redirect(
    `/mock-tests/${parsed.data.mockTestSlug}/session/${parsed.data.sessionId}/summary`,
  );
}

function revalidateMockPaths(slug: string, sessionId: string) {
  revalidatePath("/mock-tests");
  revalidatePath(`/mock-tests/${slug}`);
  revalidatePath(`/mock-tests/${slug}/session/${sessionId}`);
  revalidatePath("/progress");
  revalidatePath("/dashboard");
}
