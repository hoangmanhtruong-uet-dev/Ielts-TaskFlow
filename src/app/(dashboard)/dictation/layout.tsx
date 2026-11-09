import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện nghe chép chính tả | Indigo Scholar",
  description:
    "Luyện kỹ năng nghe tiếng Anh qua bài tập chép chính tả. Nghe audio và gõ lại chính xác những gì bạn nghe được.",
};

export default function DictationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#0C0E1D] text-[#EEF0FF]">{children}</div>
  );
}
