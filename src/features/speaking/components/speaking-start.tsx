import { Mic2, ShieldCheck } from "lucide-react";

import { startSpeakingAction } from "@/features/speaking/actions";
import type { SpeakingPracticeData } from "@/features/speaking/server/content";

export function SpeakingStart({
  data,
  error,
}: {
  data: SpeakingPracticeData;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-10 font-sans">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <div className="pointer-events-none absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform opacity-5">
          <Mic2 size={300} />
        </div>
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
            <Mic2 aria-hidden="true" size={32} />
          </div>
          <span className="mb-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            Practice Scenario
          </span>
          <h1 className="text-3xl font-black text-pretty text-slate-800 md:text-4xl">
            {data.set.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {data.set.description}
          </p>

          <div className="mt-8 w-full rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left text-sm leading-6">
            <h3 className="mb-2 font-bold text-slate-700">Instructions</h3>
            <p className="text-slate-600">{data.set.instructions}</p>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <li className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sky-700">
              {data.prompts.length} Prompts
            </li>
            <li className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sky-700">
              ~{data.set.estimatedMinutes} mins
            </li>
            <li className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sky-700">
              AI Evaluated
            </li>
          </ul>

          {error ? (
            <p
              role="alert"
              className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600"
            >
              Không thể bắt đầu bài. Hãy thử lại.
            </p>
          ) : null}

          <form action={startSpeakingAction} className="mt-8 w-full max-w-sm">
            <input type="hidden" name="setSlug" value={data.set.slug} />
            <button className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-lg font-black text-white shadow-md transition-all hover:scale-[1.02] hover:bg-sky-700">
              <Mic2 size={20} /> Enter Practice Room
            </button>
          </form>
        </div>
      </section>

      <aside className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-500 shadow-sm">
        <div className="shrink-0 rounded-full bg-emerald-100 p-2 text-emerald-600">
          <ShieldCheck aria-hidden="true" size={20} />
        </div>
        <p className="pt-1">
          <strong className="text-slate-700">Privacy First:</strong> Trình duyệt
          chỉ upload vào đường dẫn một lần do PostgreSQL cấp. Server xác minh
          file trước khi gắn vào attempt; transcript và AI feedback chỉ được tạo
          khi bạn đồng ý nộp bài.
        </p>
      </aside>
    </div>
  );
}
