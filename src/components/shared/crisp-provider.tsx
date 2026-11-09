"use client";

import { useEffect } from "react";

import { useCookieConsent } from "@/components/shared/cookie-consent";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

export function CrispProvider() {
  const consent = useCookieConsent();

  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim();
    if (!websiteId || websiteId === "dummy-crisp-website-id") {
      return;
    }

    if (consent !== "accepted") {
      return;
    }

    if (window.$crisp) {
      return;
    }

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);
  }, [consent]);

  return null;
}
