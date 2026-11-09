import "server-only";

export interface WordTranscriptEvaluation {
  word: string;
  matchedTarget: boolean | null;
  phonemeScoreAvailable: false;
}

export interface PronunciationEvaluationResult {
  phonemeScoringAvailable: false;
  fluencyScore: number;
  wpm: number;
  completenessScore: number | null;
  pronunciationBand: null;
  notice: string;
  words: WordTranscriptEvaluation[];
}

function normalizeWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z'-]/g, "").toLowerCase())
    .filter((word) => word.length > 0);
}

/**
 * Evaluates speaking transcript delivery pace (WPM) and optional word-level
 * matching against a target prompt. Does NOT fabricate phoneme-level acoustic scores.
 */
export function evaluatePronunciationTranscript(
  transcript: string,
  audioDurationSeconds: number,
  targetPrompt?: string,
): PronunciationEvaluationResult {
  const spokenWords = normalizeWords(transcript);

  if (spokenWords.length === 0 || audioDurationSeconds <= 0) {
    return {
      phonemeScoringAvailable: false,
      fluencyScore: 0,
      wpm: 0,
      completenessScore: targetPrompt ? 0 : null,
      pronunciationBand: null,
      notice:
        "Chưa có dữ liệu lời nói hoặc thời lượng hợp lệ để tính tốc độ nói.",
      words: [],
    };
  }

  const wpm = Math.round((spokenWords.length / audioDurationSeconds) * 60);
  // Target conversational IELTS pace around 110-150 WPM.
  const fluencyScore = Math.min(
    100,
    Math.max(0, Math.round((wpm / 130) * 100)),
  );

  const targetWords = targetPrompt ? normalizeWords(targetPrompt) : [];
  const targetSet = new Set(targetWords);
  const spokenSet = new Set(spokenWords);

  let completenessScore: number | null = null;
  if (targetWords.length > 0) {
    const matchedTargetCount = targetWords.filter((w) =>
      spokenSet.has(w),
    ).length;
    completenessScore = Math.round(
      (matchedTargetCount / targetWords.length) * 100,
    );
  }

  const words: WordTranscriptEvaluation[] = spokenWords.map((word) => ({
    word,
    matchedTarget: targetWords.length > 0 ? targetSet.has(word) : null,
    phonemeScoreAvailable: false,
  }));

  return {
    phonemeScoringAvailable: false,
    fluencyScore,
    wpm,
    completenessScore,
    pronunciationBand: null,
    notice:
      "Hệ thống hiện chỉ đánh giá tốc độ nói (WPM) và đối chiếu từ khóa văn bản; chấm điểm âm vị (phoneme) từ âm thanh gốc chưa được hỗ trợ.",
    words,
  };
}
