import type { Metadata } from "next";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { getUnifiedDictationCatalog } from "@/features/dictation/server/content";
import { DictationCatalog } from "@/features/dictation/components/dictation-catalog";

export const metadata: Metadata = {
  title: "Dictation Practice - Luyện Nghe Chép Chính Tả",
};

export default async function DictationCatalogPage() {
  await requireCompletedOnboarding();
  const { items, averageAccuracy } = await getUnifiedDictationCatalog();

  return (
    <div className="mx-auto min-h-[100dvh] pb-32 font-sans">
      <DictationCatalog items={items} averageAccuracy={averageAccuracy} />
    </div>
  );
}
