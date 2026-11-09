import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bản đồ lộ trình cá nhân hóa | Indigo Scholar",
  description:
    "Theo dõi tiến độ học tập 4 kỹ năng IELTS, lộ trình cây 3D trực quan, lịch phân bổ theo tuần và AI Pacing Assistant.",
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#0b0d14] text-[#f1f5f9]">{children}</div>
  );
}
