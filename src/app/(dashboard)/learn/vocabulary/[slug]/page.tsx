import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { recordVocabularyReviewAction } from "@/features/learning/vocabulary-actions";
import {
  getVocabularyCatalog,
  getVocabularyEntry,
} from "@/features/learning/server/foundations";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getVocabularyEntry(slug);
  if (!entry) return {};

  return {
    title: `Học từ vựng: ${entry.term} | IELTS Self-Study`,
    description: `Nghĩa của từ ${entry.term}: ${entry.definitionVi}. Khám phá cách phát âm, ví dụ và các điểm ngữ pháp liên quan.`,
    openGraph: {
      title: `Từ vựng: ${entry.term} - IELTS Self-Study`,
      description: entry.definitionVi,
      type: "article",
    },
  };
}

export default async function VocabularyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entries = await getVocabularyCatalog();
  if (slug === "%5Bslug%5D" || slug === "[slug]") {
    if (entries[0]) {
      redirect(`/learn/vocabulary/${entries[0].slug}`);
    }
  }
  const index = entries.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const entry = entries[index];
  const next = entries[(index + 1) % entries.length];

  return (
    <article className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl flex-col overflow-hidden bg-[#fbf9ff] pb-24 lg:min-h-[45rem] lg:rounded-3xl lg:border lg:border-[#e4deef] lg:pb-0">
      <header className="flex h-14 items-center border-b border-[#e9e3f1] bg-white px-3">
        <Link
          href="/learn/vocabulary"
          aria-label="Back to vocabulary"
          className="grid size-11 place-items-center rounded-full text-[#3e2bc0]"
        >
          <ArrowLeft size={20} />
        </Link>
        <p className="flex-1 text-center text-sm font-bold">{entry.topic}</p>
        <span className="w-11" />
      </header>

      <div className="px-5 pt-5">
        <div className="flex justify-between text-xs font-semibold text-[#5f5870]">
          <span>PROGRESS</span>
          <span>
            {index + 1} of {entries.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8e2ef]">
          <div
            className="h-full rounded-full bg-[#805cf0]"
            style={{ width: `${((index + 1) / entries.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#eee7ff] px-3 py-1 text-[10px] font-bold text-[#6545df] uppercase">
            {entry.partOfSpeech}
          </span>
          <button
            type="button"
            aria-label={`Listen to ${entry.term}`}
            className="grid size-11 place-items-center rounded-full bg-[#eee8ff] text-[#4d31d4]"
          >
            <Volume2 size={19} />
          </button>
        </div>

        <div className="grid flex-1 place-items-center py-10 text-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#704fe5] uppercase sm:text-5xl">
              {entry.term}
            </h1>
            <p className="mt-2 inline-block rounded-md bg-[#f0ecf7] px-3 py-1 text-sm text-[#6b6476]">
              /{entry.term.toLowerCase()}/
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5deef] bg-white p-5 shadow-[0_8px_28px_rgba(61,37,162,.06)]">
          <p className="text-sm leading-6">
            <span className="font-bold">Meaning:</span> {entry.definitionVi}
          </p>
          <p className="mt-3 border-l-2 border-[#7452e6] pl-3 text-sm leading-6 text-[#655e70] italic">
            “{entry.exampleSentence}”
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[#e7e1ef] bg-white p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
        <ReviewForm
          entryId={entry.id}
          currentSlug={entry.slug}
          nextSlug={next.slug}
          familiarity="again"
          label="AGAIN"
          icon
        />
        <ReviewForm
          entryId={entry.id}
          currentSlug={entry.slug}
          nextSlug={next.slug}
          familiarity="learning"
          label="LEARNING"
        />
        <ReviewForm
          entryId={entry.id}
          currentSlug={entry.slug}
          nextSlug={next.slug}
          familiarity="mastered"
          label="KNOW IT"
          primary
        />
      </div>
    </article>
  );
}

function ReviewForm({
  entryId,
  currentSlug,
  nextSlug,
  familiarity,
  label,
  primary = false,
  icon = false,
}: {
  entryId: string;
  currentSlug: string;
  nextSlug: string;
  familiarity: "again" | "learning" | "mastered";
  label: string;
  primary?: boolean;
  icon?: boolean;
}) {
  return (
    <form action={recordVocabularyReviewAction}>
      <input type="hidden" name="vocabularyEntryId" value={entryId} />
      <input type="hidden" name="currentSlug" value={currentSlug} />
      <input type="hidden" name="nextSlug" value={nextSlug} />
      <input type="hidden" name="familiarity" value={familiarity} />
      <button
        type="submit"
        className={`flex min-h-12 w-full flex-col items-center justify-center rounded-xl text-[10px] font-bold ${primary ? "bg-[#4c31d4] text-white" : "border border-[#ded7e9] text-[#5e5769]"}`}
      >
        {icon ? <RotateCcw size={16} /> : null}
        {label}
      </button>
    </form>
  );
}
