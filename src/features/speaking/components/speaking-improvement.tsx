import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import type { SpeakingImprovementReviewData } from "@/features/speaking/server/content";

const metrics = [
  ["Pronunciation", "estimatedPronunciationBand"],
  ["Fluency", "estimatedFluencyBand"],
] as const;

export function SpeakingImprovement({
  data,
}: {
  data: SpeakingImprovementReviewData;
}) {
  const feedback = data.current.feedback;
  if (!feedback)
    return (
      <EmptyComparison
        href={`/practice/speaking/${data.current.set.slug}/attempt/${data.current.attempt.id}`}
      />
    );
  const previous = data.previous?.feedback ?? null;
  const improvements = previous
    ? metrics.flatMap(([label, key]) => {
        const before = previous[key];
        const after = feedback[key];
        if (before === null || after === null || after <= before) return [];
        return [
          `${label} improved by ${Math.round(((after - before) / 9) * 100)} points.`,
        ];
      })
    : Array.isArray(feedback.strengths)
      ? feedback.strengths.filter(
          (item): item is string => typeof item === "string",
        )
      : [];
  const suggestions = Array.isArray(feedback.suggestions)
    ? feedback.suggestions.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl bg-[#fbf9ff] pb-24 text-[#211b2a] lg:min-h-0 lg:rounded-3xl lg:border lg:border-[#e5dfef]">
      <header className="flex min-h-14 items-center gap-3 border-b border-[#e9e4f0] bg-white px-4 lg:rounded-t-3xl">
        <Link
          href={`/practice/speaking/${data.current.set.slug}/attempt/${data.current.attempt.id}`}
          aria-label="Back to feedback"
          className="grid size-10 place-items-center rounded-full text-[#4d32d4]"
        >
          <ArrowLeft aria-hidden="true" size={18} />
        </Link>
        <h1 className="flex-1 text-sm font-bold text-[#3823bd]">
          You Improved
        </h1>
      </header>

      <div className="space-y-5 px-4 py-5 sm:px-6">
        <Attempt label="Attempt 1" feedback={previous} />
        <Attempt label="Latest attempt" feedback={feedback} current />

        <section className="rounded-2xl border border-[#cfeadc] bg-[#f3fff9] p-4">
          <div className="flex items-center gap-2 text-[#08754d]">
            <Sparkles aria-hidden="true" size={17} />
            <h2 className="font-bold">What Improved</h2>
          </div>
          <ul className="mt-3 divide-y divide-[#dcefe5]">
            {(improvements.length
              ? improvements
              : ["Your latest speaking attempt is ready for review."]
            )
              .slice(0, 4)
              .map((item) => (
                <li
                  key={item}
                  className="flex gap-2 py-3 text-sm leading-6 text-[#365d4e]"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    size={15}
                    className="mt-1 shrink-0"
                  />
                  {item}
                </li>
              ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e3ddec] bg-[#f2eff8] p-4">
          <div className="flex items-center gap-2 text-[#4d32d4]">
            <TrendingUp aria-hidden="true" size={17} />
            <h2 className="font-bold">Still Practicing</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#5f586a]">
            {suggestions.at(0) ??
              "Keep a natural pace and pronounce each key word clearly."}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/practice/speaking/${data.current.set.slug}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d0e5] bg-white px-3 text-sm font-bold text-[#4d32d4]"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Try again
          </Link>
          <Link
            href={`/practice/speaking/${data.current.set.slug}/attempt/${data.current.attempt.id}/pronunciation`}
            className="flex min-h-11 items-center justify-center rounded-xl bg-[#3d22c8] px-3 text-center text-sm font-bold text-white"
          >
            Practice pronunciation
          </Link>
        </div>
      </div>
    </div>
  );
}

function Attempt({
  label,
  feedback,
  current = false,
}: {
  label: string;
  feedback: {
    estimatedPronunciationBand: number | null;
    estimatedFluencyBand: number | null;
    suggestions?: unknown;
  } | null;
  current?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${current ? "border-[#7652e8] bg-white" : "border-[#e3ddec] bg-white"}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">{label}</h2>
        {current ? (
          <span className="rounded-full bg-[#4d32d4] px-2 py-1 text-[9px] font-bold text-white">
            Current
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map(([metric, key]) => {
          const value = feedback?.[key] ?? null;
          const score = value === null ? null : Math.round((value / 9) * 100);
          return (
            <div key={metric}>
              <p className="text-[10px] text-[#736c7e]">{metric}</p>
              <strong className="mt-1 block text-xl text-[#4d32d4]">
                {score ?? "—"}
              </strong>
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#e9e4f0]">
                <span
                  className={`block h-full rounded-full ${current ? "bg-[#08754d]" : "bg-[#7652e8]"}`}
                  style={{ width: `${score ?? 0}%` }}
                />
              </span>
            </div>
          );
        })}
      </div>
      {!feedback ? (
        <p className="mt-3 text-xs text-[#736c7e]">
          No earlier scored attempt.
        </p>
      ) : null}
    </article>
  );
}

function EmptyComparison({ href }: { href: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#e3ddec] bg-white p-8 text-center">
      <h1 className="text-xl font-bold">Feedback is not ready yet</h1>
      <p className="mt-2 text-sm text-[#736c7e]">
        Create feedback before comparing speaking attempts.
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#3d22c8] px-5 text-sm font-bold text-white"
      >
        Open feedback
      </Link>
    </div>
  );
}
