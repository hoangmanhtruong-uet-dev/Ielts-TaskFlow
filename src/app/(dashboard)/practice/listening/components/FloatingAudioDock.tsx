"use client";

import { useEffect, useRef } from "react";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Repeat,
} from "lucide-react";

import type { AmbientNoise } from "./ThreeSonicVisualizer";

export interface FloatingAudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  accent: string;
  bandRange: string;
  durationSec: number;
  audioUrl?: string;
}

export interface FloatingAudioDockProps {
  currentTrack: FloatingAudioTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  ambientNoise: AmbientNoise;
  isDockMinimized: boolean;
  isMuted: boolean;
  abLoop: boolean;
  currentTranscriptLine: string;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSeekTo: (newTime: number) => void;
  onChangeSpeed: () => void;
  onToggleMute: () => void;
  onToggleAbLoop: () => void;
  onSetAmbientNoise: (noise: AmbientNoise) => void;
  onSetDockMinimized: (minimized: boolean) => void;
}

export function FloatingAudioDock({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  ambientNoise,
  isDockMinimized,
  isMuted,
  abLoop,
  currentTranscriptLine,
  onTogglePlay,
  onSeek,
  onSeekTo,
  onChangeSpeed,
  onToggleMute,
  onToggleAbLoop,
  onSetAmbientNoise,
  onSetDockMinimized,
}: FloatingAudioDockProps) {
  // Web Audio API Ambient Noise Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (ambientNoise === "off") {
      if (noiseGainRef.current) {
        noiseGainRef.current.gain.setTargetAtTime(
          0,
          audioCtxRef.current?.currentTime ?? 0,
          0.2,
        );
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Stop previous
      if (noiseSourceRef.current) {
        try {
          (noiseSourceRef.current as AudioBufferSourceNode).stop();
        } catch {}
      }

      // Generate 2 seconds of pink/brownian noise loop
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise integration
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain compensation
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (ambientNoise === "exam") {
        filter.type = "lowpass";
        filter.frequency.value = 350; // Low frequency quiet room hum
      } else {
        filter.type = "bandpass";
        filter.frequency.value = 800; // Cafe mid-frequency chatter
      }

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start();

      noiseSourceRef.current = whiteNoise;
      noiseGainRef.current = gainNode;
    } catch {
      // AudioContext not allowed or not supported in environment
    }

    return () => {
      if (noiseGainRef.current && audioCtxRef.current) {
        try {
          noiseGainRef.current.gain.setValueAtTime(
            0,
            audioCtxRef.current.currentTime,
          );
        } catch {}
      }
    };
  }, [ambientNoise]);

  const formatTime = (sec: number) => {
    const safeSec = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(safeSec / 60);
    const s = safeSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      {isDockMinimized ? (
        /* Compact Pill Button */
        <button
          onClick={() => onSetDockMinimized(false)}
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-indigo-400/40 bg-[#101436]/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl shadow-indigo-950 backdrop-blur-2xl transition-all duration-300 hover:scale-105"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isPlaying ? "animate-ping bg-emerald-400" : "bg-indigo-400"
            }`}
          />
          <span className="max-w-[180px] truncate">{currentTrack.title}</span>
          <span className="font-mono text-indigo-300 tabular-nums">
            {formatTime(currentTime)}
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      ) : (
        /* Full Cyber Audio Dock */
        <div className="pointer-events-auto w-full max-w-4xl rounded-3xl border border-[#2B3060] bg-[#101436]/95 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all sm:px-5 sm:py-3.5">
          {/* Subtitle Script Ticker & Ambient Simulator */}
          <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[#2B3060]/60 pb-2 text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span className="shrink-0 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
                LIVE SCRIPT
              </span>
              <span className="max-w-[280px] truncate text-zinc-300 italic sm:max-w-md">
                "{currentTranscriptLine || "Sẵn sàng nghe bài tập..."}"
              </span>
            </div>

            {/* Ambient Noise Selector */}
            <div className="hidden shrink-0 items-center gap-1.5 text-xs sm:flex">
              <span className="text-[11px] text-zinc-400">Môi trường:</span>
              {[
                { id: "off" as const, label: "Phòng thu (Chuẩn)" },
                { id: "exam" as const, label: "Phòng thi" },
                { id: "cafe" as const, label: "Quán Cafe" },
              ].map((env) => (
                <button
                  key={env.id}
                  onClick={() => onSetAmbientNoise(env.id)}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    ambientNoise === env.id
                      ? "border border-cyan-500/40 bg-cyan-500/25 text-cyan-300"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {env.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Track Info */}
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
              >
                <Headphones className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                      isPlaying ? "animate-ping" : ""
                    }`}
                  />
                  <span>{isPlaying ? "ĐANG PHÁT" : "SẴN SÀNG"}</span>
                  <span className="text-zinc-400">• {currentTrack.accent}</span>
                </div>
                <div className="max-w-[200px] truncate text-xs font-bold text-white sm:max-w-[220px] sm:text-sm">
                  {currentTrack.title}
                </div>
              </div>

              {/* Mobile Minimize */}
              <button
                onClick={() => onSetDockMinimized(true)}
                className="rounded-xl bg-white/5 p-2 text-zinc-400 hover:text-white sm:hidden"
                title="Thu gọn"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Scrub Timeline */}
            <div className="flex w-full max-w-md items-center gap-3 sm:flex-1">
              <span className="w-9 text-right font-mono text-[11px] text-zinc-400 tabular-nums">
                {formatTime(currentTime)}
              </span>

              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickRatio = Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width),
                  );
                  onSeekTo(Math.floor(clickRatio * duration));
                }}
                className="group relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full border border-[#2B3060]/50 bg-[#0C0E1D]"
                title="Click để tua"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-400 to-[#F6E85C] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <span className="w-9 font-mono text-[11px] text-zinc-400 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Button Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSeek(-5)}
                title="Tua lùi 5 giây"
                aria-label="Tua lùi 5 giây"
                className="rounded-xl p-2 text-zinc-300 transition-colors hover:bg-white/[0.08]"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-[#0C0E1D] shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>

              <button
                onClick={() => onSeek(5)}
                title="Tua tới 5 giây"
                aria-label="Tua tới 5 giây"
                className="rounded-xl p-2 text-zinc-300 transition-colors hover:bg-white/[0.08]"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <div className="mx-1 h-5 w-px bg-[#2B3060]" />

              {/* Speed Multiplier */}
              <button
                onClick={onChangeSpeed}
                title="Tốc độ nghe"
                className="rounded-xl border border-[#2B3060] bg-[#1B1F40] px-2.5 py-1.5 font-mono text-xs font-bold text-indigo-300 tabular-nums transition-colors hover:bg-[#252A56]"
              >
                {playbackSpeed}x
              </button>

              {/* A-B Loop */}
              <button
                onClick={onToggleAbLoop}
                title="Lặp lại câu (Loop)"
                className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-colors ${
                  abLoop
                    ? "border-amber-400 bg-amber-500/20 text-amber-300"
                    : "border-[#2B3060] bg-[#1B1F40] text-zinc-400 hover:text-white"
                }`}
              >
                <Repeat size={12} />
                <span>A-B</span>
              </button>

              {/* Mute */}
              <button
                onClick={onToggleMute}
                title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                className="rounded-xl p-2 text-zinc-300 transition-colors hover:bg-white/[0.08]"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              {/* Desktop Minimize */}
              <button
                onClick={() => onSetDockMinimized(true)}
                title="Thu gọn thanh phát"
                className="hidden rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white sm:flex"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
