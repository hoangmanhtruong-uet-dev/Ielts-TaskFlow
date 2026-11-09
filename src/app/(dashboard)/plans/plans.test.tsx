import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PlansClient } from "./client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("PlansClient component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  });

  it("renders hero section and real progress props without hardcoded 4/10 or fake student counts", () => {
    render(
      <PlansClient
        initialBand={2.0}
        initialEnrolledId={1}
        initialProg={{ 1: 25 }}
      />,
    );

    expect(screen.getByText("Lộ trình học tập chi tiết")).toBeInTheDocument();
    expect(screen.getByText("theo năng lực cá nhân")).toBeInTheDocument();

    const heroWidget = document.getElementById("cur");
    expect(heroWidget).toBeInTheDocument();
    if (heroWidget) {
      expect(
        within(heroWidget).getByText("Nền Tảng Ngữ Âm & Từ Vựng"),
      ).toBeInTheDocument();
      expect(within(heroWidget).getByText("Tiến độ 25%")).toBeInTheDocument();
      expect(within(heroWidget).getByText("2/8 tuần")).toBeInTheDocument();
    }

    expect(screen.queryByText(/12\.450 học viên/i)).not.toBeInTheDocument();

    const continueBtn = screen.getByRole("button", {
      name: "Học tiếp lộ trình đang đăng ký",
    });
    fireEvent.click(continueBtn);
    expect(mockPush).toHaveBeenCalledWith("/learn");
  });

  it("renders all 6 stage cards", () => {
    render(<PlansClient initialBand={2.0} initialEnrolledId={1} />);

    expect(
      screen.getByText("Chặng 1: Nền Tảng Ngữ Âm & Ngữ Pháp Sơ Cấp"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chặng 2: Mở Rộng Câu & Giao Tiếp Cơ Bản"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chặng 3: Định Hình Tư Duy IELTS Nền Tảng"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chặng 4: Chuẩn Hóa Kỹ Năng & Chiến Lược"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chặng 5: Nâng Cao Biện Luận & Thuần Thục"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chặng 6: Làm Chủ Bứt Phá & Tối Ưu Điểm"),
    ).toBeInTheDocument();
  });

  it("updates marker position when band slider changes", () => {
    render(<PlansClient initialBand={2.0} initialEnrolledId={1} />);

    expect(screen.getByText("Bạn ở đây · 2.0")).toBeInTheDocument();
    const slider = screen.getByRole("slider", {
      name: "Điều chỉnh band hiện tại",
    });
    fireEvent.change(slider, { target: { value: "5.0" } });

    expect(screen.getByText("Bạn ở đây · 5.0")).toBeInTheDocument();
  });

  it("filters cards when selecting tabs or typing in search box", () => {
    render(<PlansClient initialBand={2.0} initialEnrolledId={1} />);

    fireEvent.click(screen.getByRole("tab", { name: /Chặng 3/ }));
    expect(
      screen.getByText("Chặng 3: Định Hình Tư Duy IELTS Nền Tảng"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Chặng 1: Nền Tảng Ngữ Âm & Ngữ Pháp Sơ Cấp"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Tất cả lộ trình" }));
    const searchInput = screen.getByRole("searchbox", { name: "Tìm lộ trình" });
    fireEvent.change(searchInput, { target: { value: "Hedging" } });
    expect(
      screen.getByText("Chặng 6: Làm Chủ Bứt Phá & Tối Ưu Điểm"),
    ).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    expect(screen.getByText("Không tìm thấy lộ trình nào")).toBeInTheDocument();
  });

  it("opens modal on 'Xem chi tiết', navigates prev/next, and enrolls", () => {
    render(<PlansClient initialBand={2.0} initialEnrolledId={1} />);

    const viewDetailBtns = screen.getAllByText("Xem chi tiết");
    fireEvent.click(viewDetailBtns[1]);

    const modalDialog = screen.getByRole("dialog");
    expect(
      within(modalDialog).getByText("Chặng 2: Mở Rộng Câu & Giao Tiếp Cơ Bản"),
    ).toBeInTheDocument();

    const deepLink = within(modalDialog).getByText(
      /Xem giáo trình chi tiết từng ngày/,
    );
    expect(deepLink).toHaveAttribute("href", "/plans/stage-2-elementary");

    fireEvent.click(screen.getByRole("button", { name: "Chặng sau" }));
    expect(
      within(modalDialog).getByText("Chặng 3: Định Hình Tư Duy IELTS Nền Tảng"),
    ).toBeInTheDocument();

    vi.spyOn(window, "confirm").mockImplementation(() => true);
    fireEvent.click(
      screen.getByRole("button", { name: "Đăng ký lộ trình này" }),
    );
    expect(
      screen.getByRole("button", { name: "Đang học chặng này" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
