import "server-only";

export type WordLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface WordInfo {
  word: string;
  phonetics: string;
  type: string;
  level: WordLevel;
  definition: string;
  example: string;
}

const WORDS_BY_LEVEL: Record<WordLevel, WordInfo[]> = {
  A1: [
    {
      word: "Apple",
      phonetics: "/ˈæp.əl/",
      type: "noun",
      level: "A1",
      definition:
        "A round fruit with firm, white flesh and a green, red, or yellow skin.",
      example: "She ate an apple for breakfast.",
    },
    {
      word: "Book",
      phonetics: "/bʊk/",
      type: "noun",
      level: "A1",
      definition: "A set of pages bound together.",
      example: "I am reading a good book.",
    },
  ],
  A2: [
    {
      word: "Journey",
      phonetics: "/ˈdʒɜː.ni/",
      type: "noun",
      level: "A2",
      definition: "The act of travelling from one place to another.",
      example: "We had a long journey ahead of us.",
    },
    {
      word: "Weather",
      phonetics: "/ˈweð.ər/",
      type: "noun",
      level: "A2",
      definition: "The state of the atmosphere.",
      example: "The weather is very nice today.",
    },
  ],
  B1: [
    {
      word: "Challenge",
      phonetics: "/ˈtʃæl.ɪndʒ/",
      type: "noun",
      level: "B1",
      definition: "A difficult task or problem.",
      example: "Learning a new language is a great challenge.",
    },
    {
      word: "Improve",
      phonetics: "/ɪmˈpruːv/",
      type: "verb",
      level: "B1",
      definition: "To make something better.",
      example: "I want to improve my English speaking skills.",
    },
  ],
  B2: [
    {
      word: "Perspective",
      phonetics: "/pəˈspek.tɪv/",
      type: "noun",
      level: "B2",
      definition: "A particular way of considering something.",
      example: "Her attitude lends a fresh perspective to the subject.",
    },
    {
      word: "Significant",
      phonetics: "/sɪɡˈnɪf.ɪ.kənt/",
      type: "adjective",
      level: "B2",
      definition: "Important or noticeable.",
      example: "There has been a significant increase in sales.",
    },
  ],
  C1: [
    {
      word: "Resilience",
      phonetics: "/rɪˈzɪl.jəns/",
      type: "noun",
      level: "C1",
      definition:
        "The capacity to recover quickly from difficulties; toughness.",
      example: "The rescue workers showed remarkable resilience.",
    },
    {
      word: "Pragmatic",
      phonetics: "/præɡˈmæt.ɪk/",
      type: "adjective",
      level: "C1",
      definition: "Dealing with things sensibly and realistically.",
      example: "We need a pragmatic approach to the problem.",
    },
    {
      word: "Serendipity",
      phonetics: "/ˌser.ənˈdip.ə.ti/",
      type: "noun",
      level: "C1",
      definition:
        "The occurrence of events by chance in a happy or beneficial way.",
      example: "Finding that book at the market was pure serendipity.",
    },
  ],
  C2: [
    {
      word: "Ephemeral",
      phonetics: "/ɪˈfem.ər.əl/",
      type: "adjective",
      level: "C2",
      definition: "Lasting for a very short time.",
      example: "Fame in the world of rock and pop is largely ephemeral.",
    },
    {
      word: "Ubiquitous",
      phonetics: "/juːˈbɪk.wɪ.təs/",
      type: "adjective",
      level: "C2",
      definition: "Present, appearing, or found everywhere.",
      example: "Mobile phones have become ubiquitous.",
    },
  ],
};

/**
 * Lấy từ vựng của ngày được cá nhân hoá theo timezone và trình độ (level) của user.
 * Dùng Seed là chuỗi "YYYY-MM-DD" tính theo Timezone của thiết bị User.
 */
export function getWordOfTheDay(
  level: WordLevel,
  userTimezone: string = "UTC",
): WordInfo {
  // Convert current time to user's timezone string "YYYY-MM-DD"
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  const dateParts = formatter.formatToParts(new Date());
  const year = dateParts.find((p) => p.type === "year")?.value ?? "1970";
  const month = dateParts.find((p) => p.type === "month")?.value ?? "01";
  const day = dateParts.find((p) => p.type === "day")?.value ?? "01";

  const seedString = `${year}-${month}-${day}`;

  // Create a simple deterministic hash from the seed string
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (Math.imul(31, hash) + seedString.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  // Fallback to C1 if level is not found for some reason, though TS types it
  const words = WORDS_BY_LEVEL[level] || WORDS_BY_LEVEL["C1"];

  return words[hash % words.length];
}
