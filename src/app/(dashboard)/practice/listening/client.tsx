"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Headphones,
  Mic,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Clock,
  BookOpen,
  Sliders,
  ChevronDown,
  Layers,
  Activity,
  Target,
  ShieldAlert,
  Search,
  X,
  Compass,
  Bookmark,
  Award,
  Check,
  Radio,
} from "lucide-react";

import type { ListeningCatalogItem } from "@/features/listening/server/content";
import {
  CURATED_EXERCISES,
  BAND_STAGES,
  TOPIC_TRACKS,
  type CuratedExercise,
  type BandStage,
} from "./components/listening-curated-data";

export { BAND_STAGES };
import { LiveMiniLab } from "./components/LiveMiniLab";
import {
  FloatingAudioDock,
  type FloatingAudioTrack,
} from "./components/FloatingAudioDock";
import { QuickPracticeModal } from "./components/QuickPracticeModal";
import type {
  VisualMode,
  AmbientNoise,
} from "./components/ThreeSonicVisualizer";
import "./listening.css";

// Dynamic import for Three.js 3D canvas (prevents SSR hydration error)
const ThreeSonicVisualizer = dynamic(
  () =>
    import("./components/ThreeSonicVisualizer").then(
      (mod) => mod.ThreeSonicVisualizer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center font-mono text-xs text-indigo-300">
        <Activity className="mr-2 h-5 w-5 animate-spin" />
        Đang nạp 3D Sonic Engine...
      </div>
    ),
  },
);

export interface ListeningHubProps {
  items: ListeningCatalogItem[];
  accuracy: number | null;
  attemptsCount: number;
  profile: {
    current_band: number | null;
    target_band: number | null;
    daily_study_minutes: number | null;
    target_exam_date: string | null;
  } | null;
}

export function ListeningHubClient({
  items,
  accuracy,
  attemptsCount,
  profile,
}: ListeningHubProps) {
  // 1. Initial Band Stage
  const userTargetBand = profile?.target_band ?? 6.5;
  const initialStage = useMemo(() => {
    return (
      BAND_STAGES.find((s) => {
        if (s.maxBand === 9.0) {
          return userTargetBand >= s.minBand && userTargetBand <= 9.0;
        }
        return userTargetBand >= s.minBand && userTargetBand < s.maxBand;
      }) ?? BAND_STAGES[5] // Default Upper-Intermediate (6.5 - 7.5)
    );
  }, [userTargetBand]);

  const [selectedStage, setSelectedStage] = useState<BandStage>(initialStage);
  const [showBandDropdown, setShowBandDropdown] = useState(false);

  // 2. Audio & Visualizer States
  const [currentTrack, setCurrentTrack] = useState<FloatingAudioTrack>({
    id: CURATED_EXERCISES[0].id,
    title: CURATED_EXERCISES[0].title,
    subtitle: CURATED_EXERCISES[0].subtitle,
    accent: CURATED_EXERCISES[0].accent,
    bandRange: CURATED_EXERCISES[0].band,
    durationSec: CURATED_EXERCISES[0].durationSec,
    audioUrl: CURATED_EXERCISES[0].audioUrl,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [ambientNoise, setAmbientNoise] = useState<AmbientNoise>("off");
  const [visualMode, setVisualMode] = useState<VisualMode>("sphere");
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [abLoop, setAbLoop] = useState(false);

  // 3. Bento Grid State
  const [bentoSpeedPreview, setBentoSpeedPreview] = useState(1.25);
  const [bentoAccentPreview, setBentoAccentPreview] = useState("UK");

  // 4. Exercise Library & Filtering States
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUncompleted, setOnlyUncompleted] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    "ex-1",
    "ex-4",
  ]);
  const [vocabPopoverId, setVocabPopoverId] = useState<string | null>(null);

  // 5. Quick Practice Modal State
  const [activePracticeExercise, setActivePracticeExercise] =
    useState<CuratedExercise | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Web Speech API fallback synthesizer
  const speakText = useCallback((text: string, lang = "en-GB", rate = 1.0) => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignored if blocked by autoplay restrictions
    }
  }, []);

  // Merge Curated Exercises with real Supabase database items
  const allExercises = useMemo<CuratedExercise[]>(() => {
    const curated = [...CURATED_EXERCISES];

    if (items && items.length > 0) {
      items.forEach((item, idx) => {
        const exists = curated.some((c) => c.slug === item.slug);
        if (!exists) {
          curated.push({
            id: `db-${item.slug || idx}`,
            slug: item.slug,
            title: item.title,
            subtitle: item.summary,
            badge: "OFFICIAL",
            badgeColor:
              "from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30",
            accent: "UK Accent",
            accentFlag: "🇬🇧",
            band: item.difficulty || "6.0 - 7.5",
            bandGroup: "Band 6.5 - 7.5",
            duration: `${Math.floor((item.durationSeconds || 180) / 60)}m ${(item.durationSeconds || 180) % 60}s`,
            durationSec: item.durationSeconds || 180,
            questionsCount: item.questionCount || 10,
            category: item.testType || "IELTS Practice",
            section: "Section 2",
            isSpeedRun: false,
            completed: false,
            sampleSentence: item.summary,
            transcript: [
              { time: 0, text: item.title },
              { time: 10, text: item.summary },
            ],
            vocab: [
              {
                word: "Comprehensive",
                meaning: "Toàn diện, bao quát",
                ipa: "/ˌkɒm.prɪˈhen.sɪv/",
              },
            ],
            questions: [
              {
                id: 1,
                q: `${item.title}: Check comprehension.`,
                answer: "yes",
                hint: "Nghe kỹ bối cảnh mở đầu",
              },
            ],
          });
        }
      });
    }

    return curated;
  }, [items]);

  // Filtered Exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      if (onlyUncompleted && ex.completed) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = ex.title.toLowerCase().includes(q);
        const matchSub = ex.subtitle.toLowerCase().includes(q);
        const matchCat = ex.category.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchCat) return false;
      }

      if (activeFilter === "ALL") return true;
      if (activeFilter === "UK") return ex.accent.toLowerCase().includes("uk");
      if (activeFilter === "US") return ex.accent.toLowerCase().includes("us");
      if (activeFilter === "AUS")
        return ex.accent.toLowerCase().includes("aus");
      if (activeFilter === "SPEED") return ex.isSpeedRun;
      if (activeFilter === "BAND_LOW") return ex.bandGroup === "Band 4.5 - 6.5";
      if (activeFilter === "BAND_MID") return ex.bandGroup === "Band 6.5 - 7.5";
      if (activeFilter === "BAND_HIGH")
        return ex.bandGroup === "Band 7.5 - 9.0";
      return true;
    });
  }, [allExercises, activeFilter, searchQuery, onlyUncompleted]);

  // Audio Sync & Playback Timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentTrack.durationSec) {
          if (abLoop) return 0;
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, currentTrack.durationSec, playbackSpeed, abLoop]);

  // Audio element sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.muted = isMuted;
  }, [playbackSpeed, isMuted]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack.audioUrl) return;

    if (isPlaying) {
      try {
        const p = audioRef.current.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            // Fallback to speech synthesis if autoplay is blocked
          });
        }
      } catch {}
    } else {
      try {
        audioRef.current.pause();
      } catch {}
    }
  }, [isPlaying, currentTrack]);

  // Find active transcript line
  const activeExerciseObj =
    allExercises.find((e) => e.id === currentTrack.id) || allExercises[0];
  const currentTranscriptLine = useMemo(() => {
    if (
      !activeExerciseObj?.transcript ||
      activeExerciseObj.transcript.length === 0
    ) {
      return activeExerciseObj?.sampleSentence || "";
    }
    const lines = activeExerciseObj.transcript;
    let activeLine = lines[0]?.text || "";
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        activeLine = lines[i].text;
      }
    }
    return activeLine;
  }, [activeExerciseObj, currentTime]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      if (!currentTrack.audioUrl && activeExerciseObj) {
        const lang = activeExerciseObj.accent.includes("US")
          ? "en-US"
          : activeExerciseObj.accent.includes("AUS")
            ? "en-AU"
            : "en-GB";
        speakText(activeExerciseObj.sampleSentence, lang, playbackSpeed);
      }
      showToast("Đang phát âm thanh");
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      showToast("Đã tạm dừng");
    }
  };

  // Preview an exercise
  const handlePreviewExercise = (exercise: CuratedExercise) => {
    if (currentTrack.id === exercise.id && isPlaying) {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      showToast("Đã dừng phát");
    } else {
      setCurrentTrack({
        id: exercise.id,
        title: exercise.title,
        subtitle: exercise.subtitle,
        accent: exercise.accent,
        bandRange: exercise.band,
        durationSec: exercise.durationSec,
        audioUrl: exercise.audioUrl,
      });
      setCurrentTime(0);
      setIsPlaying(true);
      setIsDockMinimized(false);

      if (!exercise.audioUrl) {
        const lang = exercise.accent.includes("US")
          ? "en-US"
          : exercise.accent.includes("AUS")
            ? "en-AU"
            : "en-GB";
        speakText(exercise.sampleSentence, lang, playbackSpeed);
      }
      showToast(`Đang nghe thử: ${exercise.title}`);
    }
  };

  // Open Quick Practice Modal
  const handleOpenPracticeModal = (exercise: CuratedExercise) => {
    setActivePracticeExercise(exercise);
    setCurrentTrack({
      id: exercise.id,
      title: exercise.title,
      subtitle: exercise.subtitle,
      accent: exercise.accent,
      bandRange: exercise.band,
      durationSec: exercise.durationSec,
      audioUrl: exercise.audioUrl,
    });
    setCurrentTime(0);
    setIsPlaying(true);

    if (!exercise.audioUrl) {
      const lang = exercise.accent.includes("US")
        ? "en-US"
        : exercise.accent.includes("AUS")
          ? "en-AU"
          : "en-GB";
      speakText(exercise.sampleSentence, lang, playbackSpeed);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    showToast(
      bookmarkedIds.includes(id) ? "Đã gỡ bài tập" : "Đã lưu bài vào yêu thích",
    );
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setPlaybackSpeed(next);
    showToast(`Tốc độ nghe: ${next}x`);
  };

  return (
    <div className="listening-theme-root relative overflow-x-hidden pb-32 selection:bg-indigo-500 selection:text-white">
      {/* Hidden real audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        preload="metadata"
        onEnded={() => {
          if (!abLoop) setIsPlaying(false);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="animate-fadeIn fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-indigo-400/40 bg-indigo-600/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-md">
          <Sparkles size={14} className="text-[#F6E85C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-1/4 right-0 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[500px] rounded-full bg-cyan-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10 px-4 pt-4 sm:px-6 lg:px-8">
        {/* =========================================================
            1. HERO SECTION WITH THREE.JS 3D SONIC VISUALIZER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl border border-[#2B3060] bg-gradient-to-br from-[#141731] via-[#0E1128] to-[#17143C] shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

          <div className="relative grid grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
            {/* Left 7 Columns */}
            <div className="relative z-10 space-y-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-300 uppercase">
                  <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                  <span className="-ml-4 h-2 w-2 rounded-full bg-emerald-400" />
                  LISTENING TRAINING CENTER
                </div>

                {/* Band Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowBandDropdown(!showBandDropdown)}
                    className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/30"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      {selectedStage.name} (Band {selectedStage.bandRange})
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>

                  {showBandDropdown && (
                    <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-[#2B3060] bg-[#141731] p-2 shadow-2xl backdrop-blur-xl">
                      {BAND_STAGES.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedStage(b);
                            setShowBandDropdown(false);
                            showToast(
                              `Đã chọn mục tiêu: ${b.name} (${b.bandRange})`,
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            selectedStage.id === b.id
                              ? "bg-indigo-600 text-white"
                              : "text-zinc-300 hover:bg-[#1B1F40]"
                          }`}
                        >
                          <div>
                            <div className="font-bold">
                              {b.name} ({b.bandRange})
                            </div>
                            <div className="text-[10px] font-normal text-zinc-400">
                              {b.vietnameseTitle}
                            </div>
                          </div>
                          {selectedStage.id === b.id && (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Luyện Nghe IELTS Thực Chiến{" "}
                  <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-violet-300 to-[#F6E85C] bg-clip-text text-transparent">
                    Chuẩn Format & Phản Xạ Nhanh.
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Luyện tập với âm thanh người bản ngữ đa quốc gia (
                  <span className="font-medium text-indigo-300">
                    UK, US, AUS
                  </span>
                  ), nhận diện{" "}
                  <span className="font-medium text-[#F6E85C]">
                    bẫy Paraphrase
                  </span>
                  , làm chủ âm đuôi{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-300">
                    -s / -ed
                  </code>{" "}
                  và bứt phá điểm số Listening.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById("live-mini-lab");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] hover:from-amber-400 hover:to-orange-400 active:scale-[0.98]"
                >
                  <Mic className="h-4 w-4 stroke-[2.5]" />
                  <span>Luyện Chép Chính Tả Ngay</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById("exercise-library");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-600/30 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-indigo-600/45"
                >
                  <span>Khám phá kho bài tập</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    isPlaying
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Radio
                    className={`h-4 w-4 ${
                      isPlaying
                        ? "animate-spin text-emerald-400"
                        : "text-indigo-400"
                    }`}
                  />
                  <span>
                    {isPlaying
                      ? "Sóng Âm 3D Đang Phát"
                      : "Kích hoạt Sóng Âm 3D"}
                  </span>
                </button>
              </div>

              {/* Mini Metrics */}
              <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    MỤC TIÊU NGÀY
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-black text-white">
                      {profile?.daily_study_minutes ?? 45}m
                    </span>
                    <span className="text-xs text-zinc-400">/ngày</span>
                    <span className="ml-auto text-[11px] font-semibold text-indigo-300">
                      {attemptsCount} lượt bài
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1B1F40]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${Math.min(100, attemptsCount * 20)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    ĐỘ CHÍNH XÁC
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-black text-emerald-400">
                      {accuracy !== null ? `${accuracy}%` : "--"}
                    </span>
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-300/80">
                      {accuracy !== null ? "Đã chấm điểm" : "Chưa có dữ liệu"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1B1F40]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${accuracy ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2B3060] bg-[#0C0E1D]/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    MỤC TIÊU BAND
                  </div>
                  <div className="mt-1">
                    <span className="block truncate text-xs font-bold text-amber-300">
                      {profile?.target_band
                        ? `Target Band ${profile.target_band.toFixed(1)}`
                        : "Phản xạ Section 1-4"}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {attemptsCount > 0
                        ? `${attemptsCount} bài đã thực hành`
                        : "Chưa có bài chấm điểm"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: 3D Sonic Neural Engine */}
            <div className="relative flex flex-col gap-4 lg:col-span-5">
              <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#0C0E1D]/90 shadow-2xl">
                {/* 3D Header Controls */}
                <div className="relative z-10 flex items-center justify-between border-b border-[#2B3060]/70 bg-[#0C0E1D]/50 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Activity
                      className={`h-4 w-4 ${
                        isPlaying
                          ? "animate-pulse text-cyan-400"
                          : "text-indigo-400"
                      }`}
                    />
                    <span className="text-xs font-bold tracking-wide text-zinc-200">
                      3D SONIC NEURAL ENGINE
                    </span>
                  </div>

                  {/* Visual Mode Selector */}
                  <div className="flex items-center gap-1 rounded-lg border border-[#2B3060] bg-[#141731] p-0.5">
                    {(
                      [
                        { id: "sphere" as const, label: "Orb" },
                        { id: "wave" as const, label: "Wave" },
                        { id: "matrix" as const, label: "Matrix" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setVisualMode(m.id)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                          visualMode === m.id
                            ? "bg-indigo-600 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Canvas */}
                <div className="relative flex flex-1 items-center justify-center">
                  <ThreeSonicVisualizer
                    isPlaying={isPlaying}
                    visualMode={visualMode}
                    playbackSpeed={playbackSpeed}
                    ambientNoise={ambientNoise}
                  />

                  {/* Floating Interaction Info */}
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-[#2B3060] bg-[#141731]/85 px-3 py-2 text-[11px] backdrop-blur-md">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPlaying
                            ? "animate-ping bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <span className="truncate font-medium text-zinc-300">
                        {isPlaying
                          ? `Đang phát: ${currentTrack.title}`
                          : "Di chuột để xoay sóng âm 3D"}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 font-mono font-bold text-indigo-300">
                      {playbackSpeed}x • {currentTrack.accent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. LIVE MINI-LAB (CHÉP CHÍNH TẢ DIFF & BẪY PARAPHRASE)
        ========================================================= */}
        <LiveMiniLab playbackSpeed={playbackSpeed} onSpeak={speakText} />

        {/* =========================================================
            3. 4 CHẾ ĐỘ LUYỆN NGHE CHUYÊN SÂU (BENTO GRID)
        ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
                <Sliders className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                4 Chế Độ Luyện Nghe Chuyên Sâu
              </h2>
            </div>
            <p className="text-xs text-zinc-400 sm:text-sm">
              Chọn phương pháp phù hợp với giai đoạn ôn luyện của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Bento 1: Deep Dictation */}
            <Link
              href="/dictation"
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#141731] via-[#10132B] to-[#1C153B] p-6 shadow-lg transition-all duration-300 hover:border-amber-400 hover:shadow-amber-500/10 lg:col-span-5"
            >
              <Mic className="pointer-events-none absolute -top-2 -right-4 h-28 w-28 text-amber-500/[0.07] transition-all duration-500 group-hover:scale-110 group-hover:text-amber-500/[0.12]" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
                    <Mic className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold tracking-wide text-amber-300 uppercase">
                    ★ HIỆU QUẢ NHẤT
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white transition-colors group-hover:text-amber-200">
                    Deep Dictation (Chép Chính Tả)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Gõ chính xác từng từ trong câu nói. So khớp{" "}
                    <span className="font-medium text-amber-300">
                      diff ký tự tức thì
                    </span>{" "}
                    để chữa triệt để lỗi nghe sót âm đuôi (
                    <code className="text-amber-300">-s, -ed</code>
                    ), mạo từ và nối âm.
                  </p>
                </div>

                {/* Visual diff snippet */}
                <div className="space-y-1 rounded-2xl border border-[#2B3060] bg-[#0C0E1D] p-3 font-mono text-xs">
                  <div className="text-zinc-400">
                    Audio: "...two certified copies of transcripts"
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓ two</span>
                    <span className="rounded border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-amber-300">
                      certifi<u>ed</u>
                    </span>
                    <span className="text-emerald-400">✓ copies</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-amber-400 transition-colors group-hover:text-amber-300">
                <span className="underline underline-offset-4">
                  Bắt đầu chép chính tả ngay
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Bento 2: Speed Run */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-rose-500/40 lg:col-span-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/15 text-rose-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="rounded-lg border border-rose-500/25 bg-rose-500/15 px-2.5 py-1 font-mono text-xs font-bold text-rose-300">
                    Đang chọn: {bentoSpeedPreview}x
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Speed Run (1.25x - 1.5x)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Tăng tốc độ nghe để rèn luyện phản xạ não bộ, giúp bài thi
                    thật ở 1.0x trở nên chậm rãi và dễ nắm bắt.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1.0, 1.25, 1.5, 1.75].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setBentoSpeedPreview(spd);
                        setPlaybackSpeed(spd);
                        showToast(`Đặt tốc độ: ${spd}x`);
                      }}
                      className={`rounded-xl border py-1.5 text-xs font-bold transition-colors ${
                        bentoSpeedPreview === spd
                          ? "border-rose-400 bg-rose-500/25 text-rose-200"
                          : "border-[#2B3060] bg-[#0C0E1D] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveFilter("SPEED");
                  document
                    .getElementById("exercise-library")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-rose-400 transition-colors hover:text-rose-300"
              >
                <span>Luyện phản xạ tốc độ cao</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Bento 3: Luyện Giọng Accents */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-cyan-500/40 lg:col-span-3">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-400">
                  <Globe2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Luyện Giọng (Accents)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Làm chủ các biến thể phát âm trong bài thi IELTS: Anh-Anh,
                    Anh-Mỹ, và Anh-Úc.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { code: "UK", label: "🇬🇧 UK (50%)" },
                    { code: "US", label: "🇺🇸 US (30%)" },
                    { code: "AUS", label: "🇦🇺 AUS (20%)" },
                  ].map((acc) => (
                    <button
                      key={acc.code}
                      onClick={() => {
                        setBentoAccentPreview(acc.code);
                        setActiveFilter(acc.code);
                        document
                          .getElementById("exercise-library")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        bentoAccentPreview === acc.code
                          ? "border-cyan-400 bg-cyan-500/25 text-cyan-200"
                          : "border-[#2B3060] bg-[#0C0E1D] text-zinc-300 hover:text-white"
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveFilter(bentoAccentPreview);
                  document
                    .getElementById("exercise-library")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 flex items-center justify-between border-t border-[#2B3060]/70 pt-4 text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                <span>Lọc giọng đọc ({bentoAccentPreview})</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Bento Banner 4: Full Test Banner */}
          <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-r from-[#141731] via-[#1B1B47] to-[#251A4C] p-6 shadow-xl sm:p-7 lg:flex-row lg:items-center">
            <div className="relative z-10 flex items-start gap-4 sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/40 bg-indigo-500/25 text-indigo-300 shadow-lg shadow-indigo-500/20">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white sm:text-xl">
                    Full Comprehension Test (Đề Thi Thử Chuẩn Phòng Thi)
                  </h3>
                  <span className="rounded-full border border-indigo-400/40 bg-indigo-500/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200">
                    CAMBRIDGE FORMAT
                  </span>
                </div>
                <p className="max-w-3xl text-xs leading-relaxed text-zinc-300 sm:text-sm">
                  Mô phỏng áp lực phòng thi thật với{" "}
                  <strong className="text-white">
                    4 Sections liên tục (40 câu hỏi, 30 phút)
                  </strong>
                  . Hệ thống bấm giờ tự động, khóa tua lại và chấm điểm chuẩn
                  thang điểm IELTS 9.0.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                handleOpenPracticeModal(allExercises[3] || allExercises[0])
              }
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:from-indigo-400 hover:to-violet-500 active:scale-[0.98] sm:w-auto"
            >
              <span>Vào thi thử Full Test</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* =========================================================
            4. KHO BÀI LUYỆN NGHE THỰC CHIẾN (SMART EXERCISE LIBRARY)
        ========================================================= */}
        <section id="exercise-library" className="scroll-mt-20 space-y-6 pt-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <Compass className="h-6 w-6 text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  Kho Bài Luyện Nghe ({filteredExercises.length})
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Đang lọc theo:{" "}
                <strong className="text-indigo-300">
                  {selectedStage.name} (Band {selectedStage.bandRange})
                </strong>{" "}
                • Tích hợp từ vựng & giải thích Paraphrase
              </p>
            </div>

            {/* Search & Only Uncompleted Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài nghe, chủ đề, Section..."
                  className="w-full rounded-2xl border border-[#2B3060] bg-[#141731] py-2.5 pr-4 pl-10 text-xs text-white placeholder-zinc-500 transition-colors outline-none focus:border-indigo-400 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setOnlyUncompleted(!onlyUncompleted)}
                className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  onlyUncompleted
                    ? "border-indigo-400 bg-indigo-600/25 text-indigo-200"
                    : "border-[#2B3060] bg-[#141731] text-zinc-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Chưa làm</span>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "ALL", label: "Tất cả bài tập" },
              { id: "UK", label: "🇬🇧 UK Accent" },
              { id: "US", label: "🇺🇸 US Accent" },
              { id: "AUS", label: "🇦🇺 AUS Accent" },
              { id: "SPEED", label: "⚡ Speed Run (Ngắn)" },
              { id: "BAND_LOW", label: "Band 4.5 - 6.5" },
              { id: "BAND_MID", label: "Band 6.5 - 7.5" },
              { id: "BAND_HIGH", label: "Band 7.5 - 9.0" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === chip.id
                    ? "border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "border-[#2B3060] bg-[#141731] text-zinc-300 hover:bg-[#1B1F40] hover:text-white"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Exercise Grid */}
          {filteredExercises.length === 0 ? (
            <div className="space-y-3 rounded-3xl border border-[#2B3060] bg-[#141731] p-12 text-center">
              <Headphones className="mx-auto h-10 w-10 text-zinc-500" />
              <div className="text-base font-bold text-white">
                Không tìm thấy bài luyện nghe phù hợp
              </div>
              <p className="text-xs text-zinc-400">
                Hãy thử xóa bộ lọc hoặc tìm kiếm bằng từ khóa khác.
              </p>
              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  setSearchQuery("");
                  setOnlyUncompleted(false);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((ex) => {
                const isThisPlaying = currentTrack.id === ex.id && isPlaying;
                const isBookmarked = bookmarkedIds.includes(ex.id);

                return (
                  <article
                    key={ex.id}
                    className={`group relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 ${
                      isThisPlaying
                        ? "border-indigo-400 bg-gradient-to-b from-[#181C45] to-[#111435] shadow-xl shadow-indigo-500/15"
                        : "border-[#2B3060] bg-[#141731] hover:border-indigo-500/40 hover:bg-[#1B1F40]"
                    }`}
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-md border bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${ex.badgeColor}`}
                          >
                            {ex.badge}
                          </span>
                          <span className="rounded-md border border-[#2B3060] bg-[#0C0E1D] px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                            {ex.accentFlag} {ex.accent}
                          </span>
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            {ex.band}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => toggleBookmark(ex.id)}
                            title={
                              isBookmarked ? "Gỡ khỏi yêu thích" : "Lưu bài tập"
                            }
                            aria-label="Lưu bài tập"
                            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                              isBookmarked
                                ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                                : "border-[#2B3060] bg-[#0C0E1D] text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${isBookmarked ? "fill-indigo-400 text-indigo-400" : ""}`}
                            />
                          </button>

                          <button
                            onClick={() => handlePreviewExercise(ex)}
                            title="Nghe thử"
                            aria-label="Nghe thử âm thanh"
                            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                              isThisPlaying
                                ? "border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
                                : "border-[#2B3060] bg-[#0C0E1D] text-zinc-300 hover:bg-indigo-600 hover:text-white"
                            }`}
                          >
                            <Headphones className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white transition-colors group-hover:text-indigo-300">
                          <span>{ex.title}</span>
                          {ex.completed && (
                            <span title="Đã hoàn thành">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            </span>
                          )}
                        </h3>
                        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                          {ex.subtitle}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex items-center justify-between border-t border-[#2B3060]/60 pt-3 text-xs text-zinc-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            {ex.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5 text-zinc-500" />
                            {ex.questionsCount} Câu hỏi
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-300/90">
                          {ex.category}
                        </span>
                      </div>

                      {/* Paraphrase & Vocab Trigger */}
                      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#2B3060]/60 bg-[#0C0E1D] px-3 py-1.5 text-[11px]">
                        <span className="font-medium text-amber-300/90">
                          {ex.paraphraseTraps !== undefined
                            ? `🎯 ${ex.paraphraseTraps} bẫy Paraphrase`
                            : `🎧 ${ex.questionsCount} câu hỏi thực hành`}
                        </span>
                        <button
                          onClick={() =>
                            setVocabPopoverId(
                              vocabPopoverId === ex.id ? null : ex.id,
                            )
                          }
                          className="font-semibold text-cyan-300 hover:underline"
                        >
                          {vocabPopoverId === ex.id
                            ? "Đóng từ vựng"
                            : "+ Xem từ vựng key"}
                        </button>
                      </div>

                      {/* Vocab Accordion */}
                      {vocabPopoverId === ex.id && (
                        <div className="animate-fadeIn mt-2 space-y-1.5 rounded-2xl border border-cyan-500/30 bg-[#0C0E1D] p-3 text-xs">
                          {ex.vocab.map((v, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="font-bold text-white">
                                {v.word}
                              </span>
                              <span className="text-zinc-400">{v.meaning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Nghe thử & Làm bài */}
                    <div className="mt-5 grid grid-cols-12 gap-2.5 pt-1">
                      <button
                        onClick={() => handlePreviewExercise(ex)}
                        className={`col-span-7 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors ${
                          isThisPlaying
                            ? "border-indigo-400 bg-indigo-600/30 text-indigo-200"
                            : "border-[#2B3060] bg-[#1B1F40] text-zinc-200 hover:bg-[#252A56]"
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="h-3.5 w-3.5 fill-current" />
                            <span>Đang phát thử...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Nghe thử</span>
                          </>
                        )}
                      </button>

                      {ex.id.startsWith("db-") ? (
                        <Link
                          href={`/practice/listening/${ex.slug}`}
                          className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/25 to-orange-500/25 px-4 py-2.5 text-xs font-extrabold text-amber-300 shadow-sm transition-all hover:from-amber-500 hover:to-orange-500 hover:text-slate-950"
                        >
                          <span>Làm bài</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleOpenPracticeModal(ex)}
                          className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/25 to-orange-500/25 px-4 py-2.5 text-xs font-extrabold text-amber-300 shadow-sm transition-all hover:from-amber-500 hover:to-orange-500 hover:text-slate-950"
                        >
                          <span>Làm bài</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================
            5. CHUYÊN ĐỀ LUYỆN NGHE THEO CHỦ ĐỀ (TOPIC TRACKS)
        ========================================================= */}
        <section className="space-y-5 pt-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  Chuyên Đề Luyện Nghe Theo Chủ Đề
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Bao quát toàn diện các ngữ cảnh Section 1, 2, 3 và 4 kèm lộ
                trình kỹ năng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TOPIC_TRACKS.map((track) => {
              const IconComponent = track.icon;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setSearchQuery(track.title.split(" ")[0]);
                    document
                      .getElementById("exercise-library")
                      ?.scrollIntoView({ behavior: "smooth" });
                    showToast(`Lọc bài tập theo chuyên đề: ${track.title}`);
                  }}
                  className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-[#2B3060] bg-[#141731] p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-[#1B1F40]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2B3060] bg-[#0C0E1D] text-indigo-300 transition-transform group-hover:scale-110">
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-[11px] font-bold text-indigo-300">
                        {track.focusBadge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white transition-colors group-hover:text-indigo-300 sm:text-lg">
                        {track.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {track.subtitle}
                      </p>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-[#2B3060] bg-[#0C0E1D] px-2 py-0.5 text-[10px] text-zinc-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Topic filter footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#2B3060]/60 pt-3 text-xs">
                    <span className="font-medium text-zinc-400">
                      {track.exercisesCount} bài tham khảo
                    </span>
                    <span className="flex items-center gap-1 font-bold text-indigo-300 transition-transform group-hover:translate-x-0.5">
                      <span>Lọc chuyên đề</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* =========================================================
          6. FLOATING CYBER AUDIO DOCK PLAYER
      ========================================================= */}
      <FloatingAudioDock
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={currentTrack.durationSec}
        playbackSpeed={playbackSpeed}
        ambientNoise={ambientNoise}
        isDockMinimized={isDockMinimized}
        isMuted={isMuted}
        abLoop={abLoop}
        currentTranscriptLine={currentTranscriptLine}
        onTogglePlay={handleTogglePlay}
        onSeek={(sec) => {
          const next = Math.max(
            0,
            Math.min(currentTrack.durationSec, currentTime + sec),
          );
          setCurrentTime(next);
          if (audioRef.current) audioRef.current.currentTime = next;
        }}
        onSeekTo={(newTime) => {
          setCurrentTime(newTime);
          if (audioRef.current) audioRef.current.currentTime = newTime;
        }}
        onChangeSpeed={cycleSpeed}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleAbLoop={() => {
          setAbLoop(!abLoop);
          showToast(abLoop ? "Đã tắt lặp A-B" : "Đã bật lặp câu A-B");
        }}
        onSetAmbientNoise={(noise) => {
          setAmbientNoise(noise);
          showToast(
            noise === "off" ? "Môi trường: Chuẩn" : `Môi trường: ${noise}`,
          );
        }}
        onSetDockMinimized={setIsDockMinimized}
      />

      {/* =========================================================
          7. QUICK PRACTICE MODAL (IN-PLACE TEST EXECUTION)
      ========================================================= */}
      {activePracticeExercise && (
        <QuickPracticeModal
          exercise={activePracticeExercise}
          hasFullRunner={items.some(
            (item) => item.slug === activePracticeExercise.slug,
          )}
          fallbackSlug={items[0]?.slug}
          playbackSpeed={playbackSpeed}
          onClose={() => setActivePracticeExercise(null)}
          onSeekTo={(sec) => {
            setCurrentTime(sec);
            if (audioRef.current) audioRef.current.currentTime = sec;
          }}
          onSpeak={speakText}
        />
      )}
    </div>
  );
}
