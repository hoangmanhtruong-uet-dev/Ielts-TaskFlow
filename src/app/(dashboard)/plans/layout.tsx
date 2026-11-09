import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lộ trình khóa học chi tiết | Indigo Scholar",
  description:
    "Kế hoạch học được thiết kế khoa học từng ngày, từng tuần. Tự động cá nhân hóa theo trình độ khởi điểm, thời gian rảnh và mục tiêu band điểm của bạn.",
};

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#0C0E1D] text-[#EEF0FF]">{children}</div>
  );
}
