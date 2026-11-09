import { requireAdminAccount } from "@/lib/auth/admin";
import { sanitizeExternalHttpUrl } from "@/lib/security/ssrf-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

import { approveContent, rejectContent } from "./actions";

function extractStructuredSummary(data: Json): {
  title?: string;
  passage?: string;
} | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  return {
    title: typeof data.title === "string" ? data.title : undefined,
    passage: typeof data.passage === "string" ? data.passage : undefined,
  };
}

export default async function AdminContentPage() {
  await requireAdminAccount({ onUnauthorized: "redirect" });
  const supabase = await createSupabaseServerClient();

  const { data: contents, error } = await supabase
    .from("ai_generated_contents")
    .select(
      "id, content_type, source_url, raw_content, structured_data, created_at",
    )
    .eq("status", "PENDING_REVIEW")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contents", error);
  }

  const items = Array.isArray(contents) ? contents : [];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-gray-900">
        AI Content Review
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Không có bài viết nào
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Tất cả bài viết do AI tạo ra đã được duyệt.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => {
            const safeSourceUrl = sanitizeExternalHttpUrl(item.source_url);
            const summary = extractStructuredSummary(item.structured_data);
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium tracking-wide text-blue-700 uppercase ring-1 ring-blue-700/10 ring-inset">
                      {item.content_type}
                    </span>
                    {safeSourceUrl ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Source:{" "}
                        <a
                          href={safeSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {safeSourceUrl}
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {summary?.title || "Untitled"}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                    {summary?.passage || item.raw_content}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <form action={approveContent}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        Duyệt (Approve)
                      </button>
                    </form>
                    <form action={rejectContent}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                      >
                        Từ chối (Reject)
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
