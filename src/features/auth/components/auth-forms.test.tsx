import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { ProfileForm } from "@/features/profile/components/profile-form";

describe("authentication forms", () => {
  it("renders a labeled login form with correct autocomplete", () => {
    render(<LoginForm next="/profile" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });

  it("toggles password visibility accessibly", () => {
    render(<LoginForm />);
    const password = screen.getByLabelText("Mật khẩu");
    const toggle = screen.getByRole("button", { name: "Hiện mật khẩu" });

    expect(password).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ẩn mật khẩu" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders all required register fields", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("checkbox")).toBeRequired();

    expect(screen.getByLabelText("Họ và tên")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Mật khẩu")).toBeRequired();
    expect(screen.getByLabelText("Xác nhận mật khẩu")).toBeRequired();
    expect(screen.getByRole("button", { name: "Tạo tài khoản" })).toBeEnabled();
  });

  it("renders the persisted display name in the profile form", () => {
    render(<ProfileForm displayName="Nguyễn Minh Anh" />);

    expect(screen.getByLabelText("Họ và tên")).toHaveValue("Nguyễn Minh Anh");
    expect(screen.getByRole("button", { name: "Lưu hồ sơ" })).toBeEnabled();
  });
});
