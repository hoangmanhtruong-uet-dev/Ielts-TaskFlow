import { expect, test, type Page, type TestInfo } from "@playwright/test";

const publicRoutes = [
  ["/", "Học đúng bài, tiến bộ rõ mỗi ngày"],
  ["/login", "Đăng nhập"],
  ["/register", "Tạo tài khoản"],
  ["/forgot-password", "Khôi phục mật khẩu"],
  ["/privacy", "Chính sách quyền riêng tư"],
  ["/terms", "Điều khoản sử dụng"],
] as const;

const protectedRoutes = [
  "/onboarding",
  "/dashboard",
  "/learn",
  "/learn/ielts-foundations",
  "/learn/ielts-foundations/hieu-cau-truc-bai-thi",
  "/roadmap",
  "/progress",
  "/profile",
  "/settings",
  "/mock-tests",
] as const;

const requiredViewports = [
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
] as const;

const authEmail = process.env.E2E_AUTH_EMAIL;
const authPassword = process.env.E2E_AUTH_PASSWORD;
const hasAuthAccount = Boolean(authEmail && authPassword);
const onboardingEmail = process.env.E2E_ONBOARDING_EMAIL;
const onboardingPassword = process.env.E2E_ONBOARDING_PASSWORD;
const hasOnboardingAccount = Boolean(onboardingEmail && onboardingPassword);
const expectedProjectRef = process.env.E2E_EXPECTED_SUPABASE_PROJECT_REF;
const activeProjectRef = process.env.E2E_ACTIVE_SUPABASE_PROJECT_REF;
const hasVerifiedE2EEnvironment = Boolean(
  expectedProjectRef &&
  activeProjectRef &&
  expectedProjectRef === activeProjectRef,
);

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasOverflow).toBe(false);
}

async function loginWithTestAccount(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(authEmail!);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(authPassword!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/(dashboard|onboarding)$/);
}

function skipWithoutDesktopTestAccount(testInfo: TestInfo) {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "INTENTIONAL: authenticated E2E runs once in the desktop project.",
  );
  test.skip(
    !hasAuthAccount,
    "AUTH_ENV: E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD were not provided.",
  );
  test.skip(
    !hasVerifiedE2EEnvironment,
    "AUTH_ENV: authenticated E2E requires an expected Supabase project ref matching the active environment.",
  );
}

for (const [route, heading] of publicRoutes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }).first(),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
  });
}

for (const route of protectedRoutes) {
  test(`${route} redirects an anonymous visitor to login`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login\?/);
    const currentUrl = new URL(page.url());
    expect(currentUrl.searchParams.get("next")).toBe(route);
    await expect(
      page.getByRole("heading", { name: "Đăng nhập", exact: true }),
    ).toBeVisible();
  });
}

test("register returns field-level validation errors", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill("email-khong-hop-le");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("12345678");
  await page.getByLabel("Xác nhận mật khẩu").fill("khong-trung-khop");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();

  await expect(page.getByText("Hãy nhập họ và tên.")).toBeVisible();
  await expect(
    page.getByText("Hãy nhập một địa chỉ email hợp lệ."),
  ).toBeVisible();
  await expect(page.getByText("Mật khẩu xác nhận chưa khớp.")).toBeVisible();
  await expect(
    page.getByText(/Bạn cần đồng ý Điều khoản sử dụng/),
  ).toBeVisible();
  await expect(page.getByLabel("Họ và tên")).toBeFocused();
});

test("password recovery validates email without exposing account state", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Nhận mã OTP" }).click();
  await expect(
    page.getByText("Hãy nhập một địa chỉ email hợp lệ."),
  ).toBeVisible();
});

test("canonical skill aliases redirect into protected practice routes", async ({
  page,
}) => {
  for (const skill of ["reading", "listening", "writing", "speaking"]) {
    await page.goto(`/${skill}`);
    await expect(page).toHaveURL(
      new RegExp(`/login\\?next=%2Fpractice%2F${skill}`),
    );
  }
});

test("internal cleanup is undiscoverable without its server secret", async ({
  request,
}) => {
  const response = await request.post("/api/internal/storage-cleanup");
  expect(response.status()).toBe(404);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("security headers are present on public HTML", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
});

test("login returns field-level validation errors", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("khong-phai-email");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(
    page.getByText("Hãy nhập một địa chỉ email hợp lệ."),
  ).toBeVisible();
  await expect(page.getByText("Hãy nhập mật khẩu.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();
});

test("password visibility and keyboard navigation work", async ({ page }) => {
  await page.goto("/login");
  const email = page.getByLabel("Email");
  const password = page.getByLabel("Mật khẩu", { exact: true });
  const visibility = page.getByRole("button", { name: "Hiện mật khẩu" });

  await email.focus();
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await password.fill("mat-khau-thu-nghiem");
  await visibility.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(
    page.getByRole("button", { name: "Ẩn mật khẩu" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("confirmation route returns a safe generic error", async ({ page }) => {
  await page.goto("/auth/confirm");
  await expect(page).toHaveURL(/\/login\?authError=confirmation_invalid$/);
  await expect(page.getByText(/liên kết xác minh không hợp lệ/i)).toBeVisible();
});

for (const viewport of requiredViewports) {
  test(`auth UI is responsive at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Tạo tài khoản", exact: true }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `test-results/auth-${viewport.name}.png`,
      fullPage: true,
    });
  });
}

test("provider returns safe invalid-login feedback", async ({
  page,
}, testInfo) => {
  skipWithoutDesktopTestAccount(testInfo);
  await page.goto("/login");
  await page.getByLabel("Email").fill(authEmail!);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(`${authPassword!}-invalid`);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByText("Email hoặc mật khẩu chưa đúng.")).toBeVisible();
});

test("real login, profile update, logout, and route guard", async ({
  page,
}, testInfo) => {
  skipWithoutDesktopTestAccount(testInfo);
  await loginWithTestAccount(page);

  await page.goto("/profile");
  const displayName = page.getByLabel("Họ và tên");
  const originalName = await displayName.inputValue();
  const temporaryName = `${originalName || "Người học"} E2E`;
  const saveButton = displayName
    .locator("xpath=ancestor::form")
    .locator('button[type="submit"]');
  const saveName = async (name: string) => {
    await displayName.fill(name);
    await saveButton.click();
    await expect(saveButton).toHaveText("Đang lưu…");
    await expect(saveButton).toBeEnabled({ timeout: 20_000 });
    await expect(page.getByRole("status")).toContainText(
      "Hồ sơ đã được cập nhật.",
    );
  };

  try {
    await saveName(temporaryName);
  } finally {
    await expect(saveButton).toBeEnabled({ timeout: 20_000 });
    await saveName(originalName || "Người học");
  }

  await page.getByRole("button", { name: "Đăng xuất" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?/);
});

test("real onboarding saves every step and unlocks dashboard", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-desktop",
    "INTENTIONAL: authenticated onboarding E2E runs once in the desktop project.",
  );
  test.skip(
    !hasOnboardingAccount,
    "AUTH_ENV: E2E_ONBOARDING_EMAIL and E2E_ONBOARDING_PASSWORD were not provided.",
  );
  test.skip(
    !hasVerifiedE2EEnvironment,
    "AUTH_ENV: authenticated E2E requires an expected Supabase project ref matching the active environment.",
  );

  await page.goto("/login");
  await page.getByLabel("Email").fill(onboardingEmail!);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(onboardingPassword!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/(dashboard|onboarding)$/);

  // Login first targets /dashboard. Revisit it so the server-side onboarding
  // guard settles before asserting the dedicated account is still incomplete.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/onboarding$/);

  const startOnboarding = page.getByRole("link", {
    name: "Bắt đầu thiết lập",
  });
  await expect(startOnboarding).toBeVisible();
  await startOnboarding.click();

  await page.getByLabel("IELTS Academic").check();
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await expect(
    page.getByRole("heading", { name: "Band hiện tại của bạn là bao nhiêu?" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Band hiện tại của bạn là bao nhiêu?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.getByLabel("IELTS Academic")).toBeChecked();
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page
    .getByLabel("Band hiện tại", { exact: true })
    .selectOption("unknown");
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page.getByLabel("Band mục tiêu", { exact: true }).selectOption("7");
  await page
    .getByLabel("Mục tiêu chính", { exact: true })
    .selectOption("study_abroad");
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page.getByLabel("Chưa xác định ngày thi").check();
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page.getByLabel("Thời lượng mỗi ngày").selectOption("45");
  await page.getByLabel("Số ngày mỗi tuần").selectOption("5");
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page.getByLabel("Writing").check();
  await page.getByLabel("Speaking").check();
  await page.getByRole("button", { name: "Lưu và tiếp tục" }).click();
  await page.getByRole("button", { name: "Hoàn tất thiết lập" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/profile");
  await expect(page.getByLabel("Band mục tiêu", { exact: true })).toHaveValue(
    "7",
  );
  await page.getByLabel("Mục tiêu chính", { exact: true }).selectOption("work");
  await page.getByRole("button", { name: "Lưu mục tiêu học" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Mục tiêu học đã được cập nhật.",
    { timeout: 15_000 },
  );
  await page.reload();
  await expect(page.getByLabel("Mục tiêu chính", { exact: true })).toHaveValue(
    "work",
  );
});

test("not-found state gives a safe path home", async ({ page }) => {
  await page.goto("/route-khong-ton-tai");
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy trang" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Về trang chủ" }),
  ).toHaveAttribute("href", "/");
});

test("health endpoints return normalized envelopes", async ({ request }) => {
  const live = await request.get("/api/health/live");
  await expect(live).toBeOK();
  expect(live.headers()["cache-control"]).toContain("no-store");
  await expect(await live.json()).toMatchObject({
    data: { status: "ok" },
  });

  const ready = await request.get("/api/health/ready");
  expect(ready.headers()["cache-control"]).toContain("no-store");
  const body = await ready.json();

  if (ready.status() === 200) {
    expect(body).toMatchObject({ data: { status: "ready" } });
  } else {
    expect(ready.status()).toBe(503);
    expect(["CONFIGURATION_ERROR", "DEPENDENCY_UNAVAILABLE"]).toContain(
      body.error.code,
    );
  }
});
