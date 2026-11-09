import {
  ArrowRight,
  Clock3,
  ImageIcon,
  ListChecks,
  PenLine,
  Type,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import type { WritingCatalogItem } from "@/features/writing/server/content";

const categoryIcons = [Type, UserRound, ListChecks, ImageIcon];

export function WritingCatalog({ items }: { items: WritingCatalogItem[] }) {
  if (!items.length) {
    return (
      <section className="rounded-2xl border border-dashed border-[#d9d1e6] bg-white p-6 text-center">
        <PenLine aria-hidden="true" className="mx-auto text-[#4d32d4]" />
        <h2 className="mt-3 font-bold">No published Writing tasks yet</h2>
        <p className="mt-1 text-sm text-[#736c7e]">
          New practice tasks will appear here when they are ready.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-base font-bold">Practice Categories</h2>
      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = categoryIcons[index % categoryIcons.length];
          return (
            <article
              key={item.slug}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon aria-hidden="true" size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 transition-colors group-hover:text-indigo-600">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 uppercase">
                        {item.difficulty}
                      </span>
                      {item.latestSubmissionId ? (
                        <span className="flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600 uppercase">
                          ✨ Feedback Ready
                        </span>
                      ) : item.activeDraftId ? (
                        <span className="flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600 uppercase">
                          💾 Draft Saved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400 uppercase">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta Tags */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <Clock3 size={14} className="text-indigo-500" />
                      {Math.round(item.timeLimitSeconds / 60)} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                      <PenLine size={14} className="text-indigo-500" />
                      {item.minimumWords} words min
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      <ListChecks size={14} />
                      {item.taskType === "task_2" ? "Essay" : "Report"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5">
                <Link
                  href={`/practice/writing/${item.slug}`}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  {item.activeDraftId ? "Continue Draft" : "Start Task"}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
                {item.latestSubmissionId ? (
                  <Link
                    href={`/practice/writing/${item.slug}/submission/${item.latestSubmissionId}`}
                    className="flex min-h-12 items-center justify-center rounded-xl border-2 border-indigo-100 bg-indigo-50 px-6 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    View Feedback
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
