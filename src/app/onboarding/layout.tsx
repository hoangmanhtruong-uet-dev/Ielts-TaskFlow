import "./onboarding.css";
import { requireCurrentAccount } from "@/features/auth/server/account";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCurrentAccount();

  return (
    <div className="onboarding-scope relative flex min-h-screen flex-col selection:bg-[var(--indigo)] selection:text-white">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(91,95,239,0.12)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 -left-32 size-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,128,255,0.08)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute -right-32 bottom-10 size-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(94,224,160,0.06)_0%,transparent_70%)] blur-3xl" />
      </div>

      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--panel2)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--text)] focus:outline-none"
        href="#main-content"
      >
        Bỏ qua điều hướng
      </a>

      {children}
    </div>
  );
}
