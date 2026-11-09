import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { MarketingHeader } from "@/components/layout/marketing-header";
import {
  getAccountLabel,
  getCurrentAccount,
} from "@/features/auth/server/account";
import { PricingTable } from "@/features/billing/components/pricing-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảng giá & Các gói học tập - Indigo Scholar",
  description:
    "Tìm hiểu các gói học tập trên Indigo Scholar, trạng thái Public Beta miễn phí và chính sách hoàn tiền 14 ngày.",
};

export default async function PricingPage() {
  const [account, billingEnabled] = await Promise.all([
    getCurrentAccount().catch(() => null),
    Promise.resolve(process.env.BILLING_ENABLED === "true"),
  ]);

  if (account) {
    return (
      <AppShell
        account={{
          label: getAccountLabel(account),
          email: account.user.email,
        }}
      >
        <PricingTable billingEnabled={billingEnabled} />
      </AppShell>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <MarketingHeader />
      <main id="main-content">
        <PricingTable billingEnabled={billingEnabled} />
      </main>
    </div>
  );
}
