import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { verifyMockRunnerContext } from "@/features/mock-tests/server/content";
import { ReadingRunner } from "@/features/reading/components/reading-runner";
import { ReadingStart } from "@/features/reading/components/reading-start";
import { getReadingPracticePage } from "@/features/reading/server/content";

export const metadata: Metadata = { title: "Luyện Reading" };

export default async function ReadingPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseSlug: string }>;
  searchParams: Promise<{
    error?: string;
    mockTestSlug?: string;
    mockSessionId?: string;
    mockSectionAttemptId?: string;
  }>;
}) {
  const [{ exerciseSlug }, query] = await Promise.all([params, searchParams]);
  const verifiedMock = await verifyMockRunnerContext(query, "reading");
  const data = await getReadingPracticePage(exerciseSlug, {
    mockAttemptId: verifiedMock?.learnerAttemptId ?? undefined,
  });
  if (!data) notFound();
  const mockContext =
    verifiedMock &&
    data.attempt &&
    data.attempt.id === verifiedMock.learnerAttemptId
      ? verifiedMock.context
      : undefined;
  return data.attempt ? (
    <ReadingRunner data={data} mockContext={mockContext} />
  ) : (
    <ReadingStart data={data} error={query.error} />
  );
}
