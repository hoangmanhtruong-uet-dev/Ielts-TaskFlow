import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo & Tiến độ học tập 3D | Indigo Scholar",
  description:
    "Phân tích chuyên sâu hiệu suất học tập, xu hướng điểm số 3D, cân bằng 6 kỹ năng IELTS và bản đồ hoạt động 365 ngày.",
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#0d0e15] text-[#f3f4f6]">{children}</div>
  );
}
