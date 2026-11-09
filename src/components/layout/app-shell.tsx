"use client";

import {
  BookOpenText,
  ChartNoAxesCombined,
  GraduationCap,
  Headphones,
  House,
  Map,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/learn", label: "Learn", icon: BookOpenText },
  { href: "/dictation", label: "Dictation", icon: Headphones },
  { href: "/plans", label: "Plans", icon: GraduationCap },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/pricing", label: "Pricing", icon: Sparkles },
  { href: "/profile", label: "Profile & Settings", icon: UserRound },
] as const;

const mobileNavigation = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/roadmap", label: "Roadmap", icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  account,
}: {
  children: React.ReactNode;
  account: { label: string; email: string };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const initial = (account.label.trim().charAt(0) || "U").toUpperCase();

  useEffect(() => {
    if (!mobileOpen) return;
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    const trigger = menuButtonRef.current;
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#0C0E1D] text-[#EEF0FF] selection:bg-[#5B5FEF] selection:text-white">
      <a
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[#5B5FEF] focus:px-3 focus:py-2 focus:text-white"
        href="#main-content"
      >
        Skip navigation
      </a>

      {/* Top sticky navigation */}
      <header className="sticky top-0 z-40 border-b border-[#2B3060] bg-[#0C0E1D]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center gap-3 px-4 sm:gap-7 sm:px-6 lg:px-12">
          {/* Brand */}
          <Link
            href="/dashboard"
            prefetch={false}
            className="flex items-center gap-3 rounded-lg text-[19px] font-extrabold tracking-[-0.02em] whitespace-nowrap text-[#EEF0FF] focus-visible:ring-2 focus-visible:ring-[#F6E85C] focus-visible:outline-none"
            aria-label="Indigo Scholar"
          >
            <span className="grid size-[34px] place-items-center rounded-[10px] bg-[#5B5FEF] text-[13px] font-extrabold text-white shadow-sm">
              IS
            </span>
            <span className="font-display hidden sm:inline">
              Indigo Scholar
            </span>
          </Link>

          {/* Horizontal scrollable links */}
          <nav
            aria-label="Main navigation"
            className="flex flex-1 [scrollbar-width:none] items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          >
            {navigation.map((item) => {
              const active = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-[10px] px-3.5 py-2 text-[14.5px] font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#F6E85C] focus-visible:outline-none",
                    active
                      ? "font-semibold text-[#EEF0FF]"
                      : "text-[#98A0CF] hover:text-[#EEF0FF]",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span
                      className="absolute inset-x-3.5 -bottom-[13px] h-[3px] rounded-full bg-[#F6E85C]"
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* User Avatar (.me button) */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={`User account: ${account.label}`}
            aria-expanded={mobileOpen}
            aria-controls="account-drawer"
            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#1B1F40] bg-[#5B5FEF] text-sm font-bold text-white transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#F6E85C] focus-visible:outline-none"
          >
            {initial}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="w-full flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile / Account Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-[#0C0E1D]/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            ref={drawerRef}
            id="account-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Account"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col border-l border-[#2B3060] bg-[#141731] p-5 text-[#EEF0FF] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[#5B5FEF] text-xs font-extrabold text-white">
                  IS
                </span>
                <span className="font-display text-lg font-bold">
                  Indigo Scholar
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                className="text-[#98A0CF] hover:bg-[#1B1F40] hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X aria-hidden="true" size={20} />
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#2B3060] bg-[#1B1F40] p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-full bg-[#5B5FEF] text-base font-bold text-white">
                  {initial}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-bold text-[#EEF0FF]">
                    {account.label}
                  </p>
                  <p className="truncate text-xs text-[#98A0CF]">
                    {account.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <Link
                href="/pricing"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold text-[#F6E85C] transition-colors hover:bg-[#1B1F40]"
              >
                <Sparkles aria-hidden="true" size={18} />
                Upgrade to Pro
              </Link>
              <Link
                href="/profile"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold text-[#EEF0FF] transition-colors hover:bg-[#1B1F40]"
              >
                <UserRound aria-hidden="true" size={18} />
                Profile
              </Link>
              <Link
                href="/settings"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold text-[#EEF0FF] transition-colors hover:bg-[#1B1F40]"
              >
                <Settings aria-hidden="true" size={18} />
                Settings
              </Link>
            </div>

            <div className="mt-auto border-t border-[#2B3060] pt-4">
              <LogoutButton className="w-full text-left" />
            </div>
          </aside>
        </div>
      ) : null}

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav
        aria-label="Quick navigation"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#2B3060] bg-[#0C0E1D]/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {mobileNavigation.map((item) => {
            const learningRoute =
              pathname.startsWith("/learn/") ||
              pathname.startsWith("/practice/");
            const active = learningRoute
              ? item.href === "/roadmap"
              : isCurrentRoute(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#F6E85C] focus-visible:outline-none",
                  active ? "text-[#F6E85C]" : "text-[#98A0CF]",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    active ? "bg-[#5B5FEF] text-white" : "text-[#98A0CF]",
                  )}
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
