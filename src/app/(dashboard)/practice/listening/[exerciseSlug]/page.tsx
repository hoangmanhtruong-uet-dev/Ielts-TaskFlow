import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListeningRunner } from "@/features/listening/components/listening-runner";
import { ListeningStart } from "@/features/listening/components/listening-start";
import { getListeningPracticePage } from "@/features/listening/server/content";
import { verifyMockRunnerContext } from "@/features/mock-tests/server/content";

export const metadata: Metadata = { title: "Listening practice" };

export default async function ListeningPracticePage({
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
  const verifiedMock = await verifyMockRunnerContext(query, "listening");
  const data = await getListeningPracticePage(exerciseSlug, {
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
    <ListeningRunner data={data} mockContext={mockContext} />
  ) : (
    <ListeningStart data={data} error={query.error} />
  );
}
