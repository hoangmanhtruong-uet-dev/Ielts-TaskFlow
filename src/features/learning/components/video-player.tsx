"use client";
import React from "react";

export function VideoPlayer({
  lessonId,
  videoUrl,
}: {
  lessonId: string;
  videoUrl: string;
}) {
  return (
    <div className="video-player">
      Video {lessonId} ({videoUrl})
    </div>
  );
}
