"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, X, Compass, MapPin, Check } from "lucide-react";
import type { QuestionOption } from "./true-false-button-group";

export interface MapPinData {
  letter: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  title?: string;
}

export interface MapLabellingRendererProps {
  questionId: string;
  promptMarkdown?: string;
  options: QuestionOption[];
  selectedOptionIds: string[];
  answerText?: string;
  mapImageUrl?: string;
  pins?: MapPinData[];
  onChange: (draft: {
    answerText: string;
    selectedOptionIds: string[];
  }) => void;
}

const DEFAULT_PINS: MapPinData[] = [
  { letter: "A", x: 22, y: 28, title: "West Wing Building" },
  { letter: "B", x: 50, y: 20, title: "Central Library" },
  { letter: "C", x: 78, y: 32, title: "Science Complex" },
  { letter: "D", x: 30, y: 60, title: "Student Union" },
  { letter: "E", x: 72, y: 65, title: "Sports Pavilion" },
  { letter: "F", x: 50, y: 75, title: "Main Square Fountain" },
  { letter: "G", x: 88, y: 80, title: "Bicycle Parking" },
];

export function MapLabellingRenderer({
  questionId,
  options,
  selectedOptionIds,
  answerText = "",
  mapImageUrl,
  pins = DEFAULT_PINS,
  onChange,
}: MapLabellingRendererProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  // Selected letter can be derived from answerText or selected option
  const selectedLetter =
    answerText.trim() ||
    options
      .find((o) => selectedOptionIds.includes(o.id))
      ?.label?.trim()
      .slice(0, 1) ||
    "";

  const handleSelectLetter = (letter: string) => {
    const matchedOpt = options.find((o) =>
      o.label.trim().toLowerCase().startsWith(letter.toLowerCase()),
    );
    onChange({
      answerText: letter,
      selectedOptionIds: matchedOpt ? [matchedOpt.id] : [],
    });
  };

  const renderMapCanvas = (zoomMode = false) => (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-[#2B3060] bg-[#0C0E1D] select-none ${
        zoomMode ? "h-[500px]" : "h-72 sm:h-80"
      }`}
    >
      {/* Compass Indicator */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg border border-[#2B3060] bg-[#141731]/80 px-2.5 py-1 text-[10px] font-bold text-zinc-300 backdrop-blur-md">
        <Compass size={13} className="text-[#F6E85C]" />
        <span>N</span>
      </div>

      {/* Main Entrance Marker */}
      <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#2B3060] bg-[#1B1F40] px-3 py-0.5 text-[10px] font-semibold tracking-widest text-zinc-300 uppercase shadow-md">
        Main Entrance
      </div>

      {mapImageUrl ? (
        <Image
          src={mapImageUrl}
          alt="IELTS Listening Map"
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        /* Vector SVG Architectural Map Fallback */
        <svg
          className="h-full w-full"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`grid-${questionId}`}
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="#1B1F40"
                strokeWidth="0.75"
              />
            </pattern>
            <linearGradient id="road-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B1F40" />
              <stop offset="100%" stopColor="#141731" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill={`url(#grid-${questionId})`} />

          {/* Pathway / River */}
          <path
            d="M 300 400 L 300 240 Q 300 150 450 120 L 600 120"
            fill="none"
            stroke="#2B3060"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M 300 280 L 120 280 Q 80 280 80 200 L 80 60"
            fill="none"
            stroke="#2B3060"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 300 220 L 480 220"
            fill="none"
            stroke="#2B3060"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Buildings / Zones */}
          <rect
            x="70"
            y="60"
            width="130"
            height="90"
            rx="12"
            fill="#141731"
            stroke="#3B4280"
            strokeWidth="2"
          />
          <text
            x="135"
            y="110"
            fill="#94A3B8"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            West Wing
          </text>

          <rect
            x="230"
            y="40"
            width="140"
            height="90"
            rx="12"
            fill="#141731"
            stroke="#3B4280"
            strokeWidth="2"
          />
          <text
            x="300"
            y="90"
            fill="#94A3B8"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            Library
          </text>

          <rect
            x="410"
            y="70"
            width="120"
            height="85"
            rx="12"
            fill="#141731"
            stroke="#3B4280"
            strokeWidth="2"
          />
          <text
            x="470"
            y="115"
            fill="#94A3B8"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            Sciences
          </text>

          <rect
            x="110"
            y="210"
            width="110"
            height="70"
            rx="12"
            fill="#141731"
            stroke="#3B4280"
            strokeWidth="2"
          />
          <text
            x="165"
            y="250"
            fill="#94A3B8"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            Union
          </text>

          <circle
            cx="300"
            cy="240"
            r="32"
            fill="#141731"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <text
            x="300"
            y="244"
            fill="#38BDF8"
            fontSize="10"
            textAnchor="middle"
          >
            Lake
          </text>

          <rect
            x="380"
            y="210"
            width="110"
            height="70"
            rx="12"
            fill="#141731"
            stroke="#3B4280"
            strokeWidth="2"
          />
          <text
            x="435"
            y="250"
            fill="#94A3B8"
            fontSize="11"
            textAnchor="middle"
            fontWeight="bold"
          >
            Pavilion
          </text>
        </svg>
      )}

      {/* Interactive Pins Overlay */}
      {pins.map((pin) => {
        const isSelected =
          selectedLetter.toUpperCase() === pin.letter.toUpperCase();
        const isHovered = hoveredLetter === pin.letter;

        return (
          <button
            key={pin.letter}
            type="button"
            onClick={() => handleSelectLetter(pin.letter)}
            onMouseEnter={() => setHoveredLetter(pin.letter)}
            onMouseLeave={() => setHoveredLetter(null)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            aria-label={`Vị trí ${pin.letter}`}
            className={`absolute z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-xs font-bold shadow-lg transition-all duration-200 ${
              isSelected
                ? "z-40 scale-125 bg-[#F6E85C] text-[#0C0E1D] ring-4 ring-[#F6E85C]/40"
                : isHovered
                  ? "scale-110 bg-indigo-500 text-white ring-4 ring-indigo-500/30"
                  : "border-2 border-indigo-400/80 bg-[#141731] text-indigo-200 hover:border-indigo-300"
            }`}
          >
            {pin.letter}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Map Header with Zoom button */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
          <MapPin size={14} className="text-[#F6E85C]" />
          Bản đồ vị trí (Nhấp vào ký tự A-G để chọn đáp án)
        </span>
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="flex items-center gap-1 rounded-lg border border-[#2B3060] bg-[#141731] px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-[#1B1F40] hover:text-white"
        >
          <Maximize2 size={13} />
          Phóng to
        </button>
      </div>

      {/* Map Canvas */}
      {renderMapCanvas(false)}

      {/* Quick Letter Pill Selectors */}
      <div className="pt-2">
        <p className="mb-2 text-xs font-medium text-zinc-400">
          Chọn ký tự tương ứng trên bản đồ:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {pins.map((pin) => {
            const isSelected =
              selectedLetter.toUpperCase() === pin.letter.toUpperCase();
            return (
              <button
                key={pin.letter}
                type="button"
                onClick={() => handleSelectLetter(pin.letter)}
                onMouseEnter={() => setHoveredLetter(pin.letter)}
                onMouseLeave={() => setHoveredLetter(null)}
                className={`flex h-10 items-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition-all ${
                  isSelected
                    ? "border-[#F6E85C] bg-[#F6E85C] text-[#0C0E1D] shadow-lg shadow-[#F6E85C]/20"
                    : "border-[#2B3060] bg-[#141731] text-zinc-200 hover:bg-[#1B1F40] hover:text-white"
                }`}
              >
                {pin.letter}
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl border border-[#2B3060] bg-[#141731] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <MapPin size={18} className="text-[#F6E85C]" />
                Bản đồ vị trí chi tiết
              </h3>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="rounded-lg border border-[#2B3060] bg-[#1B1F40] p-1.5 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {renderMapCanvas(true)}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Nhấp trực tiếp vào điểm ghim A-G trên bản đồ để chọn đáp án.
              </p>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
