import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsentBanner } from "@/components/shared/cookie-consent-banner";
import { CrispProvider } from "@/components/shared/crisp-provider";
import { siteConfig } from "@/config/site";
import { OfflineFallbackRegistration } from "@/components/shared/offline-fallback-registration";

import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Học IELTS có lộ trình`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4638d2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isVercelDeployment = process.env.VERCEL === "1";

  return (
    <html
      lang="vi"
      className={`${GeistSans.variable} ${bricolage.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
        <OfflineFallbackRegistration />
        <CookieConsentBanner />
        <CrispProvider />
        {isVercelDeployment ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
