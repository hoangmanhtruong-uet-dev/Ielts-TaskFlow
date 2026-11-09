import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { verifyMockRunnerContext } from "@/features/mock-tests/server/content";
import { SpeakingRunner } from "@/features/speaking/components/speaking-runner";
import { SpeakingStart } from "@/features/speaking/components/speaking-start";
import { getSpeakingPracticePage } from "@/features/speaking/server/content";

export const metadata: Metadata = { title: "Luyện Speaking" };

export default async function SpeakingPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ setSlug: string }>;
  searchParams: Promise<{
    error?: string;
    mockTestSlug?: string;
    mockSessionId?: string;
    mockSectionAttemptId?: string;
  }>;
}) {
  const [{ setSlug }, query] = await Promise.all([params, searchParams]);
  const verifiedMock = await verifyMockRunnerContext(query, "speaking");
  const data = await getSpeakingPracticePage(setSlug, {
    mockAttemptId: verifiedMock?.speakingAttemptId ?? undefined,
  });
  if (!data) notFound();
  const mockContext =
    verifiedMock &&
    data.attempt &&
    data.attempt.id === verifiedMock.speakingAttemptId
      ? verifiedMock.context
      : undefined;
  return data.attempt ? (
    <SpeakingRunner data={data} mockContext={mockContext} />
  ) : (
    <SpeakingStart data={data} error={query.error} />
  );
}
