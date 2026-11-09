"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseDictationAudioProps {
  audioUrl: string;
  audioUrlLow?: string | null;
}

interface UseDictationAudioReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isLoading: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  playSentence: (startTime: number, endTime: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  replayCount: number;
}

export function useDictationAudio({
  audioUrl,
  audioUrlLow,
}: UseDictationAudioProps): UseDictationAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentenceEndRef = useRef<number | null>(null);
  const playbackSpeedRef = useRef(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [replayCount, setReplayCount] = useState(0);

  // Initialize and cleanly dispose audio element on URL change / unmount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.playbackRate = playbackSpeedRef.current;
    audio.src = audioUrl;
    audioRef.current = audio;
    sentenceEndRef.current = null;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (
        sentenceEndRef.current !== null &&
        audio.currentTime >= sentenceEndRef.current
      ) {
        audio.pause();
        setIsPlaying(false);
        sentenceEndRef.current = null;
      }
    };

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    const handleError = () => {
      if (audioUrlLow && audio.src !== audioUrlLow) {
        audio.src = audioUrlLow;
      } else {
        setIsLoading(false);
        setIsPlaying(false);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.removeAttribute("src");
      try {
        audio.load();
      } catch {
        // Ignore jsdom or browser load reset issues during unmount
      }
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      sentenceEndRef.current = null;
      setIsPlaying(false);
    };
  }, [audioUrl, audioUrlLow]);

  const safePlay = useCallback((audio: HTMLAudioElement) => {
    const maybePromise = audio.play();
    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(true);
    safePlay(audio);
  }, [safePlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const playSentence = useCallback(
    (startTime: number, endTime: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      sentenceEndRef.current = endTime;
      audio.currentTime = startTime;
      setIsPlaying(true);
      setReplayCount((prev) => prev + 1);
      safePlay(audio);
    },
    [safePlay],
  );

  const setPlaybackSpeed = useCallback((speed: number) => {
    playbackSpeedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setPlaybackSpeedState(speed);
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isLoading,
    play,
    pause,
    togglePlay,
    seekTo,
    playSentence,
    setPlaybackSpeed,
    replayCount,
  };
}
