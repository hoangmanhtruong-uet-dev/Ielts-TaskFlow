import Link from "next/link";

import { cn } from "@/lib/utils";

interface AppLogoProps {
  compact?: boolean;
  className?: string;
  inverse?: boolean;
}

export function AppLogo({
  compact = false,
  className,
  inverse = false,
}: AppLogoProps) {
  return (
    <Link
      href="/"
      prefetch={false}
      className={cn(
        "group inline-flex min-h-11 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        inverse
          ? "focus-visible:ring-white focus-visible:ring-offset-[var(--primary)]"
          : "focus-visible:ring-[var(--ring)]",
        className,
      )}
      aria-label="Indigo Scholar - Trang chủ"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 place-items-center rounded-xl text-sm font-extrabold tracking-tight shadow-[0_6px_0_rgb(var(--shadow-color)/0.18)] transition-transform duration-200 group-hover:scale-[1.04] group-hover:-rotate-3",
          inverse
            ? "bg-white text-[var(--primary)]"
            : "bg-[var(--primary)] text-[var(--primary-foreground)]",
        )}
      >
        IS
      </span>
      {!compact ? (
        <span
          className={cn(
            "text-lg font-extrabold tracking-[-0.03em]",
            inverse ? "text-white" : "text-[var(--foreground)]",
          )}
        >
          Indigo Scholar
        </span>
      ) : null}
    </Link>
  );
}
