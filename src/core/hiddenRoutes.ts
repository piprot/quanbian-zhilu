import { EXPANDED_TRAINING } from "./trainingExtras.ts";
import type { AbilityId } from "./types.ts";

export interface HiddenRouteStep {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  referenceAnswer: string;
}

export function hiddenRouteSteps(abilityId: AbilityId): HiddenRouteStep[] {
  return EXPANDED_TRAINING[abilityId].questions.slice(0, 3).map((question) => ({
    prompt: question.prompt,
    options: question.options.map((option) => option.label),
    answer: question.answer,
    explanation: question.options[question.answer].feedback,
    referenceAnswer: question.referenceAnswer
  }));
}
