import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdminAccount } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminAccount({ onUnauthorized: "redirect" });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white shadow-xl">
        <div className="flex h-16 items-center border-b border-gray-800 px-6 text-xl font-bold">
          Indigo Scholar Admin
        </div>
        <div className="px-4 py-6">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/admin/content"
                className="flex items-center rounded-lg bg-indigo-600 px-4 py-3 text-white shadow transition-all hover:bg-indigo-700"
              >
                <svg
                  className="mr-3 h-5 w-5 text-indigo-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                AI Content Review
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
