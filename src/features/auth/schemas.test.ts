import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schemas";

describe("authentication schemas", () => {
  it("normalizes email and keeps password whitespace unchanged", () => {
    const result = registerSchema.parse({
      displayName: "  Nguyễn Minh Anh  ",
      email: "  USER@EXAMPLE.COM  ",
      password: " password1",
      confirmPassword: " password1",
      acceptPolicies: "on",
    });

    expect(result.displayName).toBe("Nguyễn Minh Anh");
    expect(result.email).toBe("user@example.com");
    expect(result.password).toBe(" password1");
  });

  it("rejects a mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      displayName: "Nguyễn Minh Anh",
      email: "user@example.com",
      password: "password1",
      confirmPassword: "password2",
      acceptPolicies: "on",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        "Mật khẩu xác nhận chưa khớp.",
      );
    }
  });

  it("requires explicit acceptance of the current policies", () => {
    const result = registerSchema.safeParse({
      displayName: "Nguyễn Minh Anh",
      email: "user@example.com",
      password: "password1",
      confirmPassword: "password1",
      acceptPolicies: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.acceptPolicies).toBeDefined();
    }
  });

  it("validates login and profile inputs", () => {
    expect(
      loginSchema.parse({
        email: " LEARNER@EXAMPLE.COM ",
        password: "password1",
      }).email,
    ).toBe("learner@example.com");

    expect(profileUpdateSchema.parse({ displayName: "  Minh  " })).toEqual({
      displayName: "Minh",
    });
    expect(
      profileUpdateSchema.safeParse({ displayName: " ".repeat(101) }).success,
    ).toBe(false);
  });

  it("validates password recovery inputs", () => {
    expect(
      forgotPasswordSchema.parse({
        identifier: " USER@EXAMPLE.COM ",
        channel: "email",
      }).identifier,
    ).toBe("USER@EXAMPLE.COM");
    expect(
      resetPasswordSchema.safeParse({
        password: "new-password",
        confirmPassword: "different-password",
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        password: "new-password",
        confirmPassword: "new-password",
      }).success,
    ).toBe(true);
  });
});
