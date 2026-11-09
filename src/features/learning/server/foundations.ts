import { cache } from "react";

import { learningSlugSchema } from "@/features/learning/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";

export type VocabularyEntry = {
  id: string;
  slug: string;
  term: string;
  partOfSpeech: string;
  definitionVi: string;
  exampleSentence: string;
  topic: string;
  tags: string[];
  difficulty: string;
  exerciseSlug: string | null;
};

export type GrammarExample = { correct: string; note: string };
export type GrammarMistake = { wrong: string; correction: string };

export type GrammarTopic = {
  id: string;
  slug: string;
  title: string;
  explanationMarkdown: string;
  examples: GrammarExample[];
  commonMistakes: GrammarMistake[];
  difficulty: string;
  exerciseSlug: string | null;
};

export class LearningFoundationReadError extends Error {
  constructor() {
    super("Không thể đọc nội dung Vocabulary hoặc Grammar.");
    this.name = "LearningFoundationReadError";
  }
}

export const getVocabularyCatalog = cache(
  async (): Promise<VocabularyEntry[]> => {
    await requireCompletedOnboarding();
    const supabase = await createSupabaseServerClient();
    const [entriesResult, versionsResult, exercisesResult] = await Promise.all([
      supabase
        .from("vocabulary_entries")
        .select("id, slug, part_of_speech, display_order")
        .order("display_order"),
      supabase
        .from("vocabulary_entry_versions")
        .select(
          "id, vocabulary_entry_id, term, definition_vi, example_sentence, topic, tags, difficulty, related_exercise_set_id, status",
        )
        .eq("status", "published"),
      supabase.from("exercise_sets").select("id, slug"),
    ]);
    if (entriesResult.error || versionsResult.error || exercisesResult.error) {
      throw new LearningFoundationReadError();
    }
    const versionByEntry = new Map(
      versionsResult.data.map((item) => [item.vocabulary_entry_id, item]),
    );
    const exerciseById = new Map(
      exercisesResult.data.map((item) => [item.id, item.slug]),
    );

    return entriesResult.data.flatMap((entry): VocabularyEntry[] => {
      const version = versionByEntry.get(entry.id);
      if (!version) return [];
      return [
        {
          id: entry.id,
          slug: entry.slug,
          term: version.term,
          partOfSpeech: entry.part_of_speech,
          definitionVi: version.definition_vi,
          exampleSentence: version.example_sentence,
          topic: version.topic,
          tags: version.tags,
          difficulty: version.difficulty,
          exerciseSlug: version.related_exercise_set_id
            ? (exerciseById.get(version.related_exercise_set_id) ?? null)
            : null,
        },
      ];
    });
  },
);

export async function getVocabularyEntry(slug: string) {
  if (!learningSlugSchema.safeParse(slug).success) return null;
  const entries = await getVocabularyCatalog();
  return entries.find((entry) => entry.slug === slug) ?? null;
}

export async function getVocabularyProgressSummary() {
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_vocabulary_progress_summary");
  if (error) throw new LearningFoundationReadError();
  const summary = data[0];
  return {
    reviewing: Number(summary?.reviewing ?? 0),
    mastered: Number(summary?.mastered ?? 0),
    reviewedToday: Number(summary?.reviewed_today ?? 0),
  };
}

export const getGrammarCatalog = cache(async (): Promise<GrammarTopic[]> => {
  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const [topicsResult, versionsResult, exercisesResult] = await Promise.all([
    supabase
      .from("grammar_topics")
      .select("id, slug, display_order")
      .order("display_order"),
    supabase
      .from("grammar_topic_versions")
      .select(
        "id, grammar_topic_id, title, explanation_markdown, examples, common_mistakes, difficulty, related_exercise_set_id, status",
      )
      .eq("status", "published"),
    supabase.from("exercise_sets").select("id, slug"),
  ]);
  if (topicsResult.error || versionsResult.error || exercisesResult.error) {
    throw new LearningFoundationReadError();
  }
  const versionByTopic = new Map(
    versionsResult.data.map((item) => [item.grammar_topic_id, item]),
  );
  const exerciseById = new Map(
    exercisesResult.data.map((item) => [item.id, item.slug]),
  );

  return topicsResult.data.flatMap((topic): GrammarTopic[] => {
    const version = versionByTopic.get(topic.id);
    if (!version) return [];
    return [
      {
        id: topic.id,
        slug: topic.slug,
        title: version.title,
        explanationMarkdown: version.explanation_markdown,
        examples: parseExamples(version.examples),
        commonMistakes: parseMistakes(version.common_mistakes),
        difficulty: version.difficulty,
        exerciseSlug: version.related_exercise_set_id
          ? (exerciseById.get(version.related_exercise_set_id) ?? null)
          : null,
      },
    ];
  });
});

export async function getGrammarTopic(slug: string) {
  if (!learningSlugSchema.safeParse(slug).success) return null;
  const topics = await getGrammarCatalog();
  return topics.find((topic) => topic.slug === slug) ?? null;
}

function parseExamples(value: Error | unknown): GrammarExample[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): GrammarExample[] => {
    if (!item || typeof item !== "object") return [];
    const correct = "correct" in item ? item.correct : null;
    const note = "note" in item ? item.note : null;
    return typeof correct === "string" && typeof note === "string"
      ? [{ correct, note }]
      : [];
  });
}

function parseMistakes(value: Error | unknown): GrammarMistake[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): GrammarMistake[] => {
    if (!item || typeof item !== "object") return [];
    const wrong = "wrong" in item ? item.wrong : null;
    const correction = "correction" in item ? item.correction : null;
    return typeof wrong === "string" && typeof correction === "string"
      ? [{ wrong, correction }]
      : [];
  });
}
