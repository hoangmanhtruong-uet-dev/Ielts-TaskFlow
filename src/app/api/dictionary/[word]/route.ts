import { NextRequest, NextResponse } from "next/server";

import { dictionaryRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
}

interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
}

interface DatamuseWord {
  word: string;
  score: number;
}

const VALID_WORD_REGEX =
  /^[a-zA-Z][a-zA-Z'-]{0,39}(?:\s+[a-zA-Z][a-zA-Z'-]{0,39})?$/;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rateKey = user
      ? `dict_u_${user.id}`
      : `dict_ip_${getClientIp(request)}`;
    const { success: rateAllowed } = await dictionaryRateLimit.limit(rateKey);
    if (!rateAllowed) {
      return NextResponse.json(
        { error: "Too many dictionary requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const { word: rawWord } = await params;
    let decodedWord = "";
    try {
      decodedWord = decodeURIComponent(rawWord || "");
    } catch {
      return NextResponse.json(
        { error: "Invalid word query" },
        { status: 400 },
      );
    }

    const word = decodedWord.trim().replace(/\s+/g, " ").toLowerCase();

    if (!word || word.length > 50 || !VALID_WORD_REGEX.test(word)) {
      return NextResponse.json(
        { error: "Invalid word query" },
        { status: 400 },
      );
    }

    // Gọi song song Free Dictionary API và Datamuse API (Collocations & Related words)
    const [dictResult, collocationsResult, synonymsResult] =
      await Promise.allSettled([
        fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
          {
            next: { revalidate: 86400 }, // Cache 24 hours
            signal: AbortSignal.timeout(4_000),
          },
        ).then(async (r) =>
          r.ok ? ((await r.json()) as DictionaryApiResponse[]) : null,
        ),

        fetch(
          `https://api.datamuse.com/words?rel_jja=${encodeURIComponent(word)}&max=6`,
          {
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(4_000),
          },
        ).then(async (r) => (r.ok ? ((await r.json()) as DatamuseWord[]) : [])),

        fetch(
          `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=6`,
          {
            next: { revalidate: 86400 },
            signal: AbortSignal.timeout(4_000),
          },
        ).then(async (r) => (r.ok ? ((await r.json()) as DatamuseWord[]) : [])),
      ]);

    const dictData =
      dictResult.status === "fulfilled" ? dictResult.value : null;
    const collocations =
      collocationsResult.status === "fulfilled" &&
      Array.isArray(collocationsResult.value)
        ? collocationsResult.value.map((c) => c.word)
        : [];
    const synonymsFromDatamuse =
      synonymsResult.status === "fulfilled" &&
      Array.isArray(synonymsResult.value)
        ? synonymsResult.value.map((s) => s.word)
        : [];

    if (!dictData || !dictData[0]) {
      // Fallback nếu không có trên dictionaryapi.dev nhưng có trên Datamuse
      if (collocations.length > 0 || synonymsFromDatamuse.length > 0) {
        return NextResponse.json(
          {
            word,
            phonetic: null,
            audio: null,
            meanings: [],
            collocations,
            synonyms: synonymsFromDatamuse,
            source: "datamuse_fallback",
          },
          {
            headers: {
              "Cache-Control":
                "public, s-maxage=86400, stale-while-revalidate=604800",
            },
          },
        );
      }

      return NextResponse.json(
        { error: `Word '${word}' not found` },
        { status: 404 },
      );
    }

    const firstEntry = dictData[0];

    // Tìm IPA chuẩn
    const phoneticText =
      firstEntry.phonetic ||
      firstEntry.phonetics?.find((p) => p.text)?.text ||
      null;

    // Tìm audio URL (chỉ chấp nhận URL https:// hợp lệ)
    const httpsAudios = (firstEntry.phonetics || [])
      .map((p) => p.audio)
      .filter(
        (audio): audio is string =>
          typeof audio === "string" && audio.startsWith("https://"),
      );
    const audioUrl =
      httpsAudios.find((audio) => audio.endsWith(".mp3")) ??
      httpsAudios[0] ??
      null;

    // Tổng hợp meanings
    const meanings = (firstEntry.meanings || []).map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: (m.definitions || []).slice(0, 3).map((d) => ({
        definition: d.definition,
        example: d.example || null,
        synonyms: d.synonyms?.slice(0, 4) || [],
      })),
    }));

    return NextResponse.json(
      {
        word: firstEntry.word || word,
        phonetic: phoneticText,
        audio: audioUrl,
        meanings,
        collocations,
        synonyms: synonymsFromDatamuse,
        source: "free_dictionary_api",
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (err: unknown) {
    console.error(
      "GET /api/dictionary/[word] error:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
