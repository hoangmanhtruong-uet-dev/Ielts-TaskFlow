import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { getUnifiedDictationBySlug } from "@/features/dictation/server/content";
import { DictationResult } from "@/features/dictation/components/dictation-result";

export const metadata: Metadata = {
  title: "Kết quả Dictation",
};

export default async function DictationResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireCompletedOnboarding();
  const { slug } = await params;
  const exercise = await getUnifiedDictationBySlug(slug);
  if (!exercise) notFound();

  return <DictationResult exercise={exercise} />;
}
