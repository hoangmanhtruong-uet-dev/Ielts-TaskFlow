import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function calculateTimeLeft(
  serverExpiresAt: string,
  serverNow: string,
  clientNow: number,
): number {
  const expiresTime = new Date(serverExpiresAt).getTime();
  const serverTimeMs = new Date(serverNow).getTime();
  const drift = clientNow - serverTimeMs;

  const diff = Math.max(0, expiresTime - (clientNow - drift));
  return Math.floor(diff / 1000);
}

describe("Practice Timer Logic (Drift Correction)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates time left correctly with zero drift", () => {
    const serverExpiresAt = new Date(1000000 + 60000).toISOString(); // 60s from now
    const serverNow = new Date(1000000).toISOString();
    const clientNow = 1000000;

    const timeLeft = calculateTimeLeft(serverExpiresAt, serverNow, clientNow);
    expect(timeLeft).toBe(60);
  });

  it("calculates time left correctly with positive drift (client ahead of server)", () => {
    const serverExpiresAt = new Date(1000000 + 60000).toISOString(); // 60s from now
    const serverNow = new Date(1000000).toISOString();
    const clientNow = 1000000 + 5000; // Client is 5 seconds ahead of server

    const timeLeft = calculateTimeLeft(serverExpiresAt, serverNow, clientNow);
    expect(timeLeft).toBe(60); // Still 60 seconds because of drift correction
  });

  it("calculates time left correctly with negative drift (client behind server)", () => {
    const serverExpiresAt = new Date(1000000 + 60000).toISOString(); // 60s from now
    const serverNow = new Date(1000000).toISOString();
    const clientNow = 1000000 - 5000; // Client is 5 seconds behind server

    const timeLeft = calculateTimeLeft(serverExpiresAt, serverNow, clientNow);
    expect(timeLeft).toBe(60);
  });

  it("returns 0 if expired", () => {
    const serverExpiresAt = new Date(1000000 - 60000).toISOString(); // Expired 60s ago
    const serverNow = new Date(1000000).toISOString();
    const clientNow = 1000000;

    const timeLeft = calculateTimeLeft(serverExpiresAt, serverNow, clientNow);
    expect(timeLeft).toBe(0);
  });
});
