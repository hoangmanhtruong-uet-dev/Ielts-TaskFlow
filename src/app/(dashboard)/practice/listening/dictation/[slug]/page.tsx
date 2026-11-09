import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { getUnifiedDictationBySlug } from "@/features/dictation/server/content";
import { DictationRunner } from "@/features/dictation/components/dictation-runner";

export const metadata: Metadata = {
  title: "Luyện Chép Chính Tả - Dictation",
};

export default async function DictationExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireCompletedOnboarding();
  const { slug } = await params;
  const exercise = await getUnifiedDictationBySlug(slug);
  if (!exercise) notFound();

  return <DictationRunner exercise={exercise} />;
}
