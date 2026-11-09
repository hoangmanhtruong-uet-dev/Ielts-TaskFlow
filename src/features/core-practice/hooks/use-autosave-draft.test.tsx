import { act, renderHook } from "@testing-library/react";
import localforage from "localforage";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutosaveDraft } from "@/features/core-practice/hooks/use-autosave-draft";

describe("useAutosaveDraft", () => {
  let onlineFlag = true;

  beforeEach(() => {
    vi.useFakeTimers();
    onlineFlag = true;
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => onlineFlag,
    });
    vi.mocked(localforage.setItem).mockResolvedValue(null);
    vi.mocked(localforage.removeItem).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("debounces dirty changes to server and clears local draft after saving", async () => {
    const onServerSync = vi.fn().mockResolvedValue(true);

    const { result, rerender } = renderHook(
      ({ answers }) =>
        useAutosaveDraft({
          attemptId: "att-1",
          storageKey: "draft_att-1",
          answers,
          onServerSync,
          debounceMs: 1000,
          intervalMs: 0,
        }),
      {
        initialProps: { answers: { q1: "initial" } as Record<string, string> },
      },
    );

    rerender({ answers: { q1: "updated" } });
    expect(onServerSync).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1001);
    });

    expect(onServerSync).toHaveBeenCalledTimes(1);
    expect(onServerSync).toHaveBeenCalledWith({ q1: "updated" });
    expect(result.current.status).toBe("saved");
    expect(localforage.removeItem).toHaveBeenCalledWith("draft_att-1");
  });

  it("saves to localforage when offline and auto-syncs when returning online", async () => {
    const onServerSync = vi.fn().mockResolvedValue(true);
    onlineFlag = false;

    const { result, rerender } = renderHook(
      ({ answers }) =>
        useAutosaveDraft({
          attemptId: "att-2",
          storageKey: "draft_att-2",
          answers,
          onServerSync,
          debounceMs: 500,
          intervalMs: 0,
        }),
      { initialProps: { answers: { q1: "" } as Record<string, string> } },
    );

    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    rerender({ answers: { q1: "offline edit" } });
    await act(async () => {
      const flushed = await result.current.flushNow();
      expect(flushed).toBe(false);
    });

    expect(onServerSync).not.toHaveBeenCalled();
    expect(result.current.status).toBe("offline_saved");
    expect(localforage.setItem).toHaveBeenCalledWith("draft_att-2", {
      q1: "offline edit",
    });

    onlineFlag = true;
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await Promise.resolve();
    });

    expect(onServerSync).toHaveBeenCalledWith({ q1: "offline edit" });
    expect(result.current.status).toBe("saved");
    expect(localforage.removeItem).toHaveBeenCalledWith("draft_att-2");
  });

  it("flushNow awaits an in-flight request and resyncs newer mutations", async () => {
    let resolveFirst!: (ok: boolean) => void;
    const onServerSync = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(true);

    const { result, rerender } = renderHook(
      ({ answers }) =>
        useAutosaveDraft({
          attemptId: "att-3",
          answers,
          onServerSync,
          debounceMs: 5000,
          intervalMs: 0,
        }),
      { initialProps: { answers: { q1: "v1" } as Record<string, string> } },
    );

    rerender({ answers: { q1: "v2" } });

    let flushPromise!: Promise<boolean>;
    act(() => {
      flushPromise = result.current.flushNow();
    });
    expect(onServerSync).toHaveBeenCalledTimes(1);
    expect(onServerSync).toHaveBeenNthCalledWith(1, { q1: "v2" });

    // Edit while first request is still running
    rerender({ answers: { q1: "v3" } });

    await act(async () => {
      resolveFirst(true);
      const ok = await flushPromise;
      expect(ok).toBe(true);
    });

    expect(onServerSync).toHaveBeenCalledTimes(2);
    expect(onServerSync).toHaveBeenNthCalledWith(2, { q1: "v3" });
    expect(result.current.status).toBe("saved");
  });

  it("warns on beforeunload only when dirty and supports clearLocalDraft", async () => {
    const onServerSync = vi.fn().mockResolvedValue(true);

    const { result, rerender } = renderHook(
      ({ answers }) =>
        useAutosaveDraft({
          attemptId: "att-4",
          storageKey: "draft_att-4",
          answers,
          onServerSync,
          debounceMs: 5000,
          intervalMs: 0,
        }),
      { initialProps: { answers: { q1: "clean" } as Record<string, string> } },
    );

    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    rerender({ answers: { q1: "dirty" } });
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    await act(async () => {
      await result.current.clearLocalDraft();
    });
    expect(localforage.removeItem).toHaveBeenCalledWith("draft_att-4");

    const clearedEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clearedEvent);
    expect(clearedEvent.defaultPrevented).toBe(false);
  });
});
