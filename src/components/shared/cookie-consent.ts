"use client";

import { useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "indigoscholar_cookie_consent";
export const COOKIE_CONSENT_EVENT = "indigoscholar:cookie-consent";

export type CookieConsentState = "accepted" | "necessary" | "unset" | "server";

function subscribe(callback: () => void) {
  const onChange = () => callback();
  window.addEventListener("storage", onChange);
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  };
}

function getSnapshot(): CookieConsentState {
  try {
    const val = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (val === "accepted" || val === "necessary") return val;
    return "unset";
  } catch {
    return "unset";
  }
}

function getServerSnapshot(): CookieConsentState {
  return "server";
}

export function setCookieConsent(value: "accepted" | "necessary") {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Ignore storage quota or private mode restrictions
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }),
  );
}

export function useCookieConsent(): CookieConsentState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
