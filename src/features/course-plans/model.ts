export type PlanLevel =
  "stage_1" | "stage_2" | "stage_3" | "stage_4" | "stage_5" | "stage_6";

export type DayLessonItem = {
  dayNumber: number;
  title: string;
  skill:
    | "grammar"
    | "vocabulary"
    | "dictation"
    | "listening"
    | "reading"
    | "writing"
    | "speaking"
    | "mock_test";
  durationMins: number;
  linkHref: string;
  isMilestone?: boolean;
};

export type PlanWeek = {
  weekNumber: number;
  title: string;
  summary: string;
  days: DayLessonItem[];
};

export type PlanPhase = {
  phaseNumber: number;
  title: string;
  targetOutcome: string;
  weeks: PlanWeek[];
};

export type CoursePlan = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: PlanLevel;
  targetBand: string;
  startingLevel: string;
  durationWeeks: number;
  totalDays: number;
  recommendedDailyMins: number;
  enrolledLearnersCount: number;
  completionRatePercent: number;
  iconName: string;
  colorScheme: "emerald" | "blue" | "violet" | "cyan" | "amber" | "rose";
  phases: PlanPhase[];
  highlights: string[];
};

export function formatSkillLabel(skill: DayLessonItem["skill"]): string {
  const map: Record<DayLessonItem["skill"], string> = {
    grammar: "Ngữ pháp",
    vocabulary: "Từ vựng SRS",
    dictation: "Dictation (Chép chính tả)",
    listening: "Luyện nghe Listening",
    reading: "Luyện đọc Reading",
    writing: "Writing AI Chấm chữa",
    speaking: "Speaking AI 1:1",
    mock_test: "Mock Test Kiểm tra",
  };
  return map[skill];
}

export function getLevelBadge(level: PlanLevel) {
  switch (level) {
    case "stage_1":
      return {
        label: "0.0 - 2.5 | Foundation",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "stage_2":
      return {
        label: "2.5 - 3.5 | Elementary",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "stage_3":
      return {
        label: "3.5 - 4.5 | Pre-IELTS",
        color: "bg-violet-100 text-violet-800 border-violet-200",
      };
    case "stage_4":
      return {
        label: "4.5 - 5.5 | Intermediate",
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
      };
    case "stage_5":
      return {
        label: "5.5 - 6.5 | Upper-Inter",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "stage_6":
      return {
        label: "6.5 - 7.0 | Advanced",
        color: "bg-rose-100 text-rose-800 border-rose-200",
      };
  }
}
