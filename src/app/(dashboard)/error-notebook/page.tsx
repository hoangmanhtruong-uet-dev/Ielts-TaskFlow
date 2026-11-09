import type { Metadata } from "next";

import {
  ErrorNotebookScreen,
  getErrorNotebookAction,
} from "@/features/error-notebook";
import { requireCurrentAccount } from "@/features/auth/server/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sổ tay lỗi sai | Indigo Scholar",
  description:
    "Xem lại các câu trả lời chưa đúng từ những bài luyện tập thực tế của bạn.",
};

export default async function ErrorNotebookPage() {
  await requireCurrentAccount();
  const { data } = await getErrorNotebookAction();

  return <ErrorNotebookScreen initialEntries={data} />;
}
