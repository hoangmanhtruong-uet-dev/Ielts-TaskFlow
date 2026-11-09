import { useCallback, useEffect, useRef, useState } from "react";
import localforage from "localforage";

import { saveExerciseDraftAction } from "../api/save-draft-action";

export type AutosaveStatus =
  "idle" | "saving" | "saved" | "error" | "offline_saved";

export function useAutosaveDraft({
  attemptId,
  storageKey,
  answers,
  onServerSync,
  debounceMs = 2000,
  intervalMs = 15000,
  enabled = true,
}: {
  attemptId: string;
  storageKey?: string;
  answers: Record<string, string | string[] | Record<string, unknown>>;
  onServerSync?: (
    answers: Record<string, string | string[] | Record<string, unknown>>,
  ) => Promise<boolean>;
  debounceMs?: number;
  intervalMs?: number;
  enabled?: boolean;
}) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const resolvedStorageKey =
    storageKey || (attemptId ? `draft_${attemptId}` : "");

  const answersRef = useRef(answers);
  const lastSyncedSnapshotRef = useRef(JSON.stringify(answers));
  const isDirtyRef = useRef(false);
  const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);
  const pendingResyncRef = useRef(false);
  const onServerSyncRef = useRef(onServerSync);
  const executeSaveRef = useRef<(force?: boolean) => Promise<boolean>>(
    async () => true,
  );

  useEffect(() => {
    onServerSyncRef.current = onServerSync;
  }, [onServerSync]);

  useEffect(() => {
    answersRef.current = answers;
    const serialized = JSON.stringify(answers);
    isDirtyRef.current = serialized !== lastSyncedSnapshotRef.current;
  }, [answers]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const executeSave = useCallback(
    async (force = false): Promise<boolean> => {
      if (!enabled) return true;
      if (!attemptId && !onServerSyncRef.current) return true;

      const snapshotToSave = JSON.stringify(answersRef.current);
      const needsSync =
        snapshotToSave !== lastSyncedSnapshotRef.current || isDirtyRef.current;

      if (!needsSync && !force) {
        return true;
      }

      if (inFlightPromiseRef.current) {
        pendingResyncRef.current = true;
        return inFlightPromiseRef.current;
      }

      const run = async (): Promise<boolean> => {
        const currentOnline =
          typeof navigator !== "undefined"
            ? navigator.onLine && isOnline
            : isOnline;

        setStatus("saving");

        const currentAnswers = answersRef.current;
        const currentSnapshot = JSON.stringify(currentAnswers);

        if (!currentOnline) {
          if (resolvedStorageKey) {
            await localforage
              .setItem(resolvedStorageKey, currentAnswers)
              .catch(() => {});
          }
          setStatus("offline_saved");
          return false;
        }

        try {
          let synced = false;
          if (onServerSyncRef.current) {
            synced = await onServerSyncRef.current(currentAnswers);
          } else if (attemptId) {
            const res = await saveExerciseDraftAction({
              attemptId,
              answers: currentAnswers as Record<
                string,
                string | string[] | Record<string, string>
              >,
            });
            synced = res.success;
          }

          if (synced) {
            lastSyncedSnapshotRef.current = currentSnapshot;
            isDirtyRef.current =
              JSON.stringify(answersRef.current) !== currentSnapshot;
            setStatus("saved");
            if (resolvedStorageKey) {
              await localforage.removeItem(resolvedStorageKey).catch(() => {});
            }
            return true;
          }

          if (resolvedStorageKey) {
            await localforage
              .setItem(resolvedStorageKey, currentAnswers)
              .catch(() => {});
          }
          setStatus("error");
          return false;
        } catch {
          if (resolvedStorageKey) {
            await localforage
              .setItem(resolvedStorageKey, currentAnswers)
              .catch(() => {});
          }
          setStatus(currentOnline ? "error" : "offline_saved");
          return false;
        }
      };

      const promise = run().finally(() => {
        inFlightPromiseRef.current = null;
      });
      inFlightPromiseRef.current = promise;

      const firstOk = await promise;

      if (
        pendingResyncRef.current ||
        JSON.stringify(answersRef.current) !== snapshotToSave
      ) {
        pendingResyncRef.current = false;
        return await executeSaveRef.current(false);
      }

      return firstOk;
    },
    [attemptId, enabled, isOnline, resolvedStorageKey],
  );

  useEffect(() => {
    executeSaveRef.current = executeSave;
  }, [executeSave]);

  // Debounced autosave whenever answers diverge from last server-synced snapshot
  useEffect(() => {
    if (!enabled) return;
    if (JSON.stringify(answers) === lastSyncedSnapshotRef.current) return;

    const timer = setTimeout(() => {
      void executeSave(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [answers, debounceMs, enabled, executeSave]);

  // Sync any unsaved/offline drafts automatically when transitioning back online
  const wasOfflineRef = useRef(!isOnline);
  useEffect(() => {
    const transitionedOnline = wasOfflineRef.current && isOnline;
    wasOfflineRef.current = !isOnline;
    if (!transitionedOnline || !enabled) return;
    void executeSave(true);
  }, [isOnline, enabled, executeSave]);

  // Periodic fallback interval
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const interval = setInterval(() => {
      if (
        isDirtyRef.current ||
        status === "offline_saved" ||
        status === "error"
      ) {
        void executeSave(false);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [executeSave, intervalMs, enabled, status]);

  // Flush on page hide and warn user if unsaved changes exist before unload
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isDirtyRef.current) {
        void executeSave(false);
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        isDirtyRef.current ||
        Boolean(inFlightPromiseRef.current) ||
        status === "offline_saved" ||
        status === "error"
      ) {
        void executeSave(false);
        event.preventDefault();
        event.returnValue = "";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [executeSave, enabled, status]);

  const flushNow = useCallback(async (): Promise<boolean> => {
    if (!enabled) return true;
    if (inFlightPromiseRef.current) {
      pendingResyncRef.current = true;
      await inFlightPromiseRef.current;
    }
    if (
      isDirtyRef.current ||
      JSON.stringify(answersRef.current) !== lastSyncedSnapshotRef.current
    ) {
      return await executeSave(true);
    }
    return true;
  }, [enabled, executeSave]);

  const clearLocalDraft = useCallback(async () => {
    isDirtyRef.current = false;
    lastSyncedSnapshotRef.current = JSON.stringify(answersRef.current);
    if (resolvedStorageKey) {
      await localforage.removeItem(resolvedStorageKey).catch(() => {});
    }
  }, [resolvedStorageKey]);

  return {
    status,
    isOnline,
    forceSave: flushNow,
    flushNow,
    clearLocalDraft,
  };
}
