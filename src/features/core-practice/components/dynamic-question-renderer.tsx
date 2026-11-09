"use client";

import React from "react";
import {
  TrueFalseButtonGroup,
  type QuestionOption,
} from "./question-registry/true-false-button-group";
import { InlineBlankInput } from "./question-registry/inline-blank-input";
import { MatchingHeadingsSelector } from "./question-registry/matching-headings-selector";
import { MatchingPillSelector } from "./question-registry/matching-pill-selector";
import { MapLabellingRenderer } from "./question-registry/map-labelling-renderer";
import { MultipleChoiceCard } from "./question-registry/multiple-choice-card";

export interface DynamicQuestion {
  id: string;
  type: string;
  position?: number;
  promptMarkdown: string;
  options?: QuestionOption[];
}

export interface DynamicDraft {
  answerText: string;
  selectedOptionIds: string[];
}

export interface DynamicQuestionRendererProps {
  question: DynamicQuestion;
  draft: DynamicDraft;
  maxAnswerWords?: number | null;
  onChange: (draft: DynamicDraft) => void;
}

export function DynamicQuestionRenderer({
  question,
  draft,
  maxAnswerWords,
  onChange,
}: DynamicQuestionRendererProps) {
  const qType = (question.type || "").toLowerCase().trim();
  const options = question.options || [];

  // 1. True / False / Not Given & Yes / No / Not Given
  if (
    qType === "true_false_not_given" ||
    qType === "yes_no_not_given" ||
    qType === "true_false"
  ) {
    const isYesNo =
      qType === "yes_no_not_given" || question.promptMarkdown.includes("YES");
    return (
      <TrueFalseButtonGroup
        questionId={question.id}
        options={options}
        selectedOptionIds={draft.selectedOptionIds}
        answerText={draft.answerText}
        isYesNo={isYesNo}
        onChange={onChange}
      />
    );
  }

  // 2. Summary completion, short text, fill in blanks
  if (
    qType === "summary_completion" ||
    qType === "short_text" ||
    qType === "fill_in_blanks" ||
    qType === "sentence_completion"
  ) {
    return (
      <InlineBlankInput
        questionId={question.id}
        promptMarkdown={question.promptMarkdown}
        answerText={draft.answerText}
        maxAnswerWords={maxAnswerWords}
        onChange={onChange}
      />
    );
  }

  // 3. Map & Diagram Labelling
  if (
    qType === "map_labelling" ||
    qType === "diagram_labelling" ||
    qType === "plan_labelling"
  ) {
    return (
      <MapLabellingRenderer
        questionId={question.id}
        promptMarkdown={question.promptMarkdown}
        options={options}
        selectedOptionIds={draft.selectedOptionIds}
        answerText={draft.answerText}
        onChange={onChange}
      />
    );
  }

  // 4. Matching classification / 1-touch pill selection
  if (
    qType === "matching" ||
    qType === "matching_classification" ||
    qType === "classification"
  ) {
    return (
      <MatchingPillSelector
        questionId={question.id}
        options={options}
        selectedOptionIds={draft.selectedOptionIds}
        answerText={draft.answerText}
        onChange={onChange}
      />
    );
  }

  // 5. Matching headings / Matching features (Reading style dropdowns)
  if (
    qType === "matching_headings" ||
    qType === "matching_features" ||
    qType === "matching_information"
  ) {
    return (
      <MatchingHeadingsSelector
        questionId={question.id}
        options={options}
        selectedOptionIds={draft.selectedOptionIds}
        answerText={draft.answerText}
        onChange={onChange}
      />
    );
  }

  // 4. Multiple Choice & Single Choice (hoặc default)
  const isMultiple = qType === "multiple_choice" && options.length > 4;

  return (
    <MultipleChoiceCard
      questionId={question.id}
      options={options}
      selectedOptionIds={draft.selectedOptionIds}
      isMultiple={isMultiple}
      onChange={onChange}
    />
  );
}
