import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { verifyMockRunnerContext } from "@/features/mock-tests/server/content";
import { WritingRunner } from "@/features/writing/components/writing-runner";
import { WritingStart } from "@/features/writing/components/writing-start";
import { getWritingPracticePage } from "@/features/writing/server/content";

export const metadata: Metadata = { title: "Luyện Writing" };

export default async function WritingPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ taskSlug: string }>;
  searchParams: Promise<{
    error?: string;
    mockTestSlug?: string;
    mockSessionId?: string;
    mockSectionAttemptId?: string;
  }>;
}) {
  const [{ taskSlug }, query] = await Promise.all([params, searchParams]);
  const verifiedMock = await verifyMockRunnerContext(query, "writing");
  const data = await getWritingPracticePage(taskSlug, {
    mockSubmissionId: verifiedMock?.writingSubmissionId ?? undefined,
  });
  if (!data) notFound();
  const mockContext =
    verifiedMock &&
    data.submission &&
    data.submission.id === verifiedMock.writingSubmissionId
      ? verifiedMock.context
      : undefined;
  return data.submission ? (
    <WritingRunner data={data} mockContext={mockContext} />
  ) : (
    <WritingStart data={data} error={query.error} />
  );
}
