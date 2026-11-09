import { describe, expect, it } from "vitest";

import { generateAdaptiveLearningPath } from "./adaptive-path";

describe("generateAdaptiveLearningPath", () => {
  it("generates prioritized recommendations for tags with < 70% accuracy", () => {
    const weakTags = [
      {
        tagId: "reading_matching_headings",
        tagName: "Matching Headings",
        accuracyRate: 45,
      },
      {
        tagId: "listening_section3",
        tagName: "Section 3 Multiple Choice",
        accuracyRate: 60,
      },
      {
        tagId: "grammar_articles",
        tagName: "Articles & Determiners",
        accuracyRate: 85,
      },
    ];

    const recommendations = generateAdaptiveLearningPath(weakTags, 7.5);

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].domain).toBe("reading");
    expect(recommendations[0].priority).toBe("high");
    expect(recommendations[1].domain).toBe("listening");
    expect(recommendations[1].priority).toBe("medium");
  });

  it("returns default fallback recommendations when no weak tags exist", () => {
    const recommendations = generateAdaptiveLearningPath([]);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].domain).toBe("reading");
  });
});
