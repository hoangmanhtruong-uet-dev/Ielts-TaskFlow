import { useEffect, useRef } from "react";
import { updateLessonProgressAction } from "../api/update-progress-action";

export function useVideoProgressSync({
  lessonId,
  interval = 10000,
}: {
  lessonId: string;
  interval?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSyncTimeRef = useRef<number>(0);

  useEffect(() => {
    // Restore last position from local storage
    const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, [lessonId]);

  useEffect(() => {
    const syncProgress = async (isFinal = false) => {
      const video = videoRef.current;
      if (!video) return;

      const currentTime = video.currentTime;
      const duration = video.duration || 1;

      // Update local storage
      localStorage.setItem(
        `lesson_progress_${lessonId}`,
        currentTime.toString(),
      );

      // Only sync to server if difference is > 5s or if it's the final sync (e.g. unload)
      if (isFinal || Math.abs(currentTime - lastSyncTimeRef.current) >= 5) {
        lastSyncTimeRef.current = currentTime;

        await updateLessonProgressAction({
          lessonId,
          lastPositionSeconds: Math.floor(currentTime),
          completionPercentage: Math.floor((currentTime / duration) * 100),
        });
      }
    };

    const intervalId = setInterval(() => syncProgress(false), interval);

    const handleBeforeUnload = () => {
      if (videoRef.current) {
        const formData = new FormData();
        formData.append("lessonId", lessonId);
        formData.append(
          "lastPositionSeconds",
          Math.floor(videoRef.current.currentTime).toString(),
        );
        formData.append(
          "completionPercentage",
          Math.floor(
            (videoRef.current.currentTime / (videoRef.current.duration || 1)) *
              100,
          ).toString(),
        );
        navigator.sendBeacon("/api/beacon/sync-video", formData);
      }
    };

    // Sync when video pauses
    const handlePause = () => syncProgress(false);

    const videoNode = videoRef.current;
    if (videoNode) {
      videoNode.addEventListener("pause", handlePause);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (videoNode) {
        videoNode.removeEventListener("pause", handlePause);
      }
    };
  }, [lessonId, interval]);

  return { videoRef };
}

// touched for audit
