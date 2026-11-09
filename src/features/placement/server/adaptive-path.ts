import "server-only";

export interface TaxonomyAccuracy {
  tagId: string;
  tagName: string;
  accuracyRate: number; // 0 to 100
}

export interface AdaptiveRecommendation {
  domain:
    "reading" | "listening" | "writing" | "speaking" | "grammar" | "vocabulary";
  title: string;
  recommendationReason: string;
  targetSlug: string;
  priority: "high" | "medium" | "low";
}

export function generateAdaptiveLearningPath(
  weakTags: TaxonomyAccuracy[],
  targetBandScore = 7.0,
): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];

  const sortedWeak = [...weakTags].sort(
    (a, b) => a.accuracyRate - b.accuracyRate,
  );

  for (const tag of sortedWeak) {
    if (tag.accuracyRate < 70) {
      const rec = mapTagToRecommendation(
        tag.tagId,
        tag.tagName,
        tag.accuracyRate,
        targetBandScore,
      );
      if (rec) recommendations.push(rec);
    }
  }

  // Fallback defaults if no weak tags identified
  if (recommendations.length === 0) {
    recommendations.push({
      domain: "reading",
      title: "IELTS Reading Academic Passage Practice",
      recommendationReason: "Maintain daily comprehension momentum",
      targetSlug: "reading-passage-1",
      priority: "medium",
    });
    recommendations.push({
      domain: "listening",
      title: "IELTS Listening Section 3 Dictation",
      recommendationReason:
        "Sharpen exact spelling and fill-in-blanks accuracy",
      targetSlug: "dictation-section-3",
      priority: "medium",
    });
  }

  return recommendations;
}

function mapTagToRecommendation(
  tagId: string,
  tagName: string,
  accuracy: number,
  targetBand: number,
): AdaptiveRecommendation | null {
  const priority = accuracy < 50 ? "high" : "medium";

  if (tagId.includes("reading") || tagName.toLowerCase().includes("reading")) {
    return {
      domain: "reading",
      title: `Focused Reading: ${tagName}`,
      recommendationReason: `Your accuracy in ${tagName} is ${accuracy}%. Aiming for Band ${targetBand}.`,
      targetSlug: `practice-reading-${tagId}`,
      priority,
    };
  }

  if (
    tagId.includes("listening") ||
    tagName.toLowerCase().includes("listening")
  ) {
    return {
      domain: "listening",
      title: `Listening Drill: ${tagName}`,
      recommendationReason: `Your accuracy in ${tagName} is ${accuracy}%.`,
      targetSlug: `practice-listening-${tagId}`,
      priority,
    };
  }

  if (tagId.includes("writing") || tagName.toLowerCase().includes("writing")) {
    return {
      domain: "writing",
      title: `Writing Task 2 Structure: ${tagName}`,
      recommendationReason: `Need improvement on ${tagName} (${accuracy}% accuracy).`,
      targetSlug: `practice-writing-${tagId}`,
      priority,
    };
  }

  return {
    domain: "grammar",
    title: `Grammar & Vocab Booster: ${tagName}`,
    recommendationReason: `Target accuracy ${accuracy}% below 70% threshold.`,
    targetSlug: `learn-grammar-${tagId}`,
    priority,
  };
}
