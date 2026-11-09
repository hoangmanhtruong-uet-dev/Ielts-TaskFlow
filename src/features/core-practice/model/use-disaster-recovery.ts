"use client";

import { useEffect, useCallback } from "react";
import localforage from "localforage";
import type { AnswerValue } from "../components/generic-practice-engine";

const DRAFT_QUEUE_KEY = "practice_draft_queue";

interface QueuedDraft {
  attemptId: string;
  answers: Record<string, AnswerValue>;
  timestamp: number;
}

export function useDisasterRecovery(
  onFlushQueue: (
    attemptId: string,
    answers: Record<string, AnswerValue>,
  ) => Promise<boolean>,
) {
  // Save a draft to local indexedDB queue when offline
  const queueDraftOffline = useCallback(
    async (attemptId: string, answers: Record<string, AnswerValue>) => {
      try {
        const queue: QueuedDraft[] =
          (await localforage.getItem(DRAFT_QUEUE_KEY)) || [];

        // Remove older drafts for the same attempt
        const filteredQueue = queue.filter((q) => q.attemptId !== attemptId);

        filteredQueue.push({
          attemptId,
          answers,
          timestamp: Date.now(),
        });

        await localforage.setItem(DRAFT_QUEUE_KEY, filteredQueue);
      } catch (error) {
        console.error("Failed to queue draft offline", error);
      }
    },
    [],
  );

  // Flush the queue when online
  const flushQueue = useCallback(async () => {
    try {
      const queue: QueuedDraft[] =
        (await localforage.getItem(DRAFT_QUEUE_KEY)) || [];
      if (queue.length === 0) return;

      const remainingQueue: QueuedDraft[] = [];

      for (const draft of queue) {
        const success = await onFlushQueue(draft.attemptId, draft.answers);
        if (!success) {
          remainingQueue.push(draft);
        }
      }

      await localforage.setItem(DRAFT_QUEUE_KEY, remainingQueue);
    } catch (error) {
      console.error("Failed to flush draft queue", error);
    }
  }, [onFlushQueue]);

  useEffect(() => {
    const handleOnline = () => {
      flushQueue();
    };

    window.addEventListener("online", handleOnline);

    // Initial flush in case we start online with queued items
    if (navigator.onLine) {
      flushQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [flushQueue]);

  return { queueDraftOffline };
}
