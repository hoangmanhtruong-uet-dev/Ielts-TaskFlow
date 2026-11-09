import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServerTimer } from "./server-timer";
import React from "react";

describe("ServerTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates initial remaining time and compensates for drift", () => {
    // Client is at 10:00:00
    // Server says now is 10:00:10 (server is 10s ahead)
    // Server says expire at 10:00:20 (10 seconds from server's 'now')
    const serverNow = "2026-10-09T10:00:10.000Z";
    const serverExpiresAt = "2026-10-09T10:00:20.000Z";
    const onExpire = vi.fn();

    render(
      <ServerTimer
        serverExpiresAt={serverExpiresAt}
        serverNow={serverNow}
        onExpire={onExpire}
      />,
    );

    // Initial time should be 10 seconds (00:10)
    expect(screen.getByText("00:10")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText("00:05")).toBeInTheDocument();
  });

  it("triggers onExpire callback when time runs out", () => {
    const serverNow = "2026-10-09T10:00:00.000Z";
    const serverExpiresAt = "2026-10-09T10:00:02.000Z"; // 2 seconds
    const onExpire = vi.fn();

    render(
      <ServerTimer
        serverExpiresAt={serverExpiresAt}
        serverNow={serverNow}
        onExpire={onExpire}
      />,
    );

    expect(screen.getByText("00:02")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
