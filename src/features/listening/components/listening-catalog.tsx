import {
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  MessagesSquare,
  BarChart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

import type { ListeningCatalogItem } from "@/features/listening/server/content";

export function ListeningCatalog({ items }: { items: ListeningCatalogItem[] }) {
  if (!items.length)
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
        <Headphones className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">
          No published lessons yet
        </h2>
        <p className="text-sm text-zinc-500">
          Check back later for new content.
        </p>
      </div>
    );

  const icons = [MessagesSquare, MapPin, Headphones];

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Today&apos;s Practice
          </h2>
          <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            View all <ChevronRight size={16} />
          </button>
        </div>

        <ol className="grid gap-4 md:grid-cols-2">
          {items.slice(0, 2).map((item, index) => (
            <li key={item.slug}>
              <Link
                href={`/practice/listening/${item.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 md:p-8"
              >
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                      New
                    </span>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-600">
                      🇬🇧 UK Accent
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                    {index ? (
                      <MessagesSquare size={20} />
                    ) : (
                      <Headphones size={20} />
                    )}
                  </div>
                </div>

                <div className="relative z-10 mb-6">
                  <h3 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-600">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={16} className="text-zinc-400" />
                      {Math.round(item.timeLimitSeconds / 60)}m 30s
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart size={16} className="text-zinc-400" />
                      {item.questionCount} Questions
                    </span>
                  </div>
                </div>

                {/* Simulated Waveform Preview on Hover */}
                <div className="absolute right-0 bottom-0 left-0 flex h-16 items-end gap-[2px] bg-gradient-to-t from-zinc-50 to-transparent px-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 origin-bottom rounded-t-sm bg-indigo-100"
                      style={{
                        height: `${Math.max(10, 20 + Math.random() * 80)}%`,
                        transition: "height 0.3s ease",
                        transitionDelay: `${i * 0.01}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-zinc-100 pt-4">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-zinc-900">
          Topics & Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {items.slice(0, 3).map((item, index) => {
            const Icon = icons[index] ?? Headphones;
            const category =
              index === 0
                ? "Daily Conversations"
                : index === 1
                  ? "Introductions"
                  : "Food & Drinks";

            const isMastered = index === 1;
            const progress = index === 1 ? "100%" : index === 0 ? "80%" : "20%";

            return (
              <Link
                key={`${item.slug}-${category}`}
                href={`/practice/listening/${item.slug}`}
                className="group block rounded-[1.5rem] border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-600 transition-colors duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  {isMastered ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 size={14} /> Mastered
                    </span>
                  ) : (
                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                      In Progress
                    </span>
                  )}
                </div>

                <h3 className="mb-1 text-lg font-semibold tracking-tight text-zinc-900">
                  {category}
                </h3>
                <p className="mb-6 text-sm font-medium text-zinc-500">
                  {item.questionCount} lessons available
                </p>

                <div className="flex items-center gap-4">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isMastered ? "bg-emerald-500" : "bg-zinc-900"}`}
                      style={{ width: progress }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 tabular-nums">
                    {progress}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
