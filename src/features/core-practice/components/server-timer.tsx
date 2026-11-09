"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface ServerTimerProps {
  serverExpiresAt: string | null | undefined;
  serverNow?: string;
  onExpire: () => void;
  autoSubmitOnMountExpired?: boolean;
}

function computeInitialTimerState(
  serverExpiresAt: string | null | undefined,
  serverNow?: string,
) {
  if (!serverExpiresAt) {
    return {
      expiresTime: NaN,
      drift: 0,
      initialSeconds: null as number | null,
      mountedExpired: false,
    };
  }

  const expiresTime = new Date(serverExpiresAt).getTime();
  if (!Number.isFinite(expiresTime)) {
    return {
      expiresTime: NaN,
      drift: 0,
      initialSeconds: null as number | null,
      mountedExpired: false,
    };
  }

  const nowMs = Date.now();
  const serverTimeMs = serverNow ? new Date(serverNow).getTime() : nowMs;
  const drift = Number.isFinite(serverTimeMs) ? nowMs - serverTimeMs : 0;
  const initialDiff = Math.max(0, expiresTime - (nowMs - drift));

  return {
    expiresTime,
    drift,
    initialSeconds: Math.floor(initialDiff / 1000),
    mountedExpired: initialDiff <= 0,
  };
}

function ServerTimerInner({
  serverExpiresAt,
  serverNow,
  onExpire,
  autoSubmitOnMountExpired = false,
}: ServerTimerProps) {
  const [initialState] = useState(() =>
    computeInitialTimerState(serverExpiresAt, serverNow),
  );
  const [timeLeft, setTimeLeft] = useState<number | null>(
    () => initialState.initialSeconds,
  );
  const onExpireRef = useRef(onExpire);
  const expiredFiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const { expiresTime, drift, mountedExpired } = initialState;
    if (!Number.isFinite(expiresTime)) {
      return;
    }

    if (mountedExpired) {
      if (autoSubmitOnMountExpired && !expiredFiredRef.current) {
        expiredFiredRef.current = true;
        onExpireRef.current();
      }
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, expiresTime - (now - drift));
      setTimeLeft(Math.floor(diff / 1000));

      if (diff <= 0) {
        clearInterval(interval);
        if (!expiredFiredRef.current) {
          expiredFiredRef.current = true;
          onExpireRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [initialState, autoSubmitOnMountExpired]);

  if (timeLeft === null) {
    return (
      <div className="flex items-center text-sm text-zinc-500">
        <Clock className="mr-1.5 h-4 w-4" />
        Không giới hạn
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 60;

  return (
    <div
      className={`flex items-center gap-2 font-mono text-sm font-medium ${
        isWarning
          ? "animate-pulse text-red-500"
          : "text-zinc-700 dark:text-zinc-300"
      }`}
    >
      <span className="flex items-center">
        <Clock className="mr-1.5 h-4 w-4" />
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {initialState.mountedExpired && !autoSubmitOnMountExpired ? (
        <span className="rounded bg-amber-100 px-2 py-0.5 font-sans text-[11px] font-semibold text-amber-800">
          Đã hết giờ
        </span>
      ) : null}
    </div>
  );
}

export function ServerTimer(props: ServerTimerProps) {
  const timerKey = `${props.serverExpiresAt ?? ""}::${props.serverNow ?? ""}::${Boolean(props.autoSubmitOnMountExpired)}`;
  return <ServerTimerInner key={timerKey} {...props} />;
}
