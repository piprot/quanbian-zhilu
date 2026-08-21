import { STORY_NODES, getChapter } from "./story.ts";
import { EXTRA_MAIN_NODES } from "./mainScenarios.ts";
import {
  abilityGap,
  weakestAbilitiesByMastery
} from "./learner-model.ts";
import { adjustmentForSave } from "./adaptive-dda.ts";
import { generateAiScenario, type AiDifficulty } from "./aiScenario.ts";
import type {
  AbilityId,
  SaveState,
  StoryNode
} from "./types.ts";

export type ScenarioSource =
  | "main"
  | "side"
  | "random"
  | "branch"
  | "generated";

export interface ScenarioCandidate {
  node: StoryNode;
  abilityIds: AbilityId[];
  source: ScenarioSource;
}

export interface ScenarioRecommendation {
  candidate: ScenarioCandidate;
  score: number;
  reason: string;
}

export function deriveScenarioAbilityIds(
  node: StoryNode
): AbilityId[] {
  return [
    ...new Set(
      node.options.flatMap((option) =>
        Object.keys(option.effects) as AbilityId[]
      )
    )
  ];
}

function completedNodeIds(save: SaveState): Set<string> {
  const ids = new Set<string>();
  for (const record of save.chapterRecords) {
    for (const nodeId of record.completedNodeIds) ids.add(nodeId);
  }
  for (const list of [
    save.completedSideQuests,
    save.completedRandomEvents,
    save.completedBranchNodes
  ]) {
    for (const nodeId of list) ids.add(nodeId);
  }
  return ids;
}

function candidateNodes(save: SaveState): ScenarioCandidate[] {
  const completed = completedNodeIds(save);
  const byId = new Map<string, StoryNode>();
  for (const node of STORY_NODES) byId.set(node.id, node);
  for (const node of EXTRA_MAIN_NODES) byId.set(node.id, node);
  const unlocked = new Set(save.unlockedChapters);
  return [...byId.values()]
    .filter(
      (node) =>
        !completed.has(node.id) && unlocked.has(node.chapterId)
    )
    .map((node) => ({
      node,
      abilityIds: deriveScenarioAbilityIds(node),
      source: (node.kind === "random"
        ? "random"
        : node.kind === "side"
          ? "side"
          : node.kind === "branch"
            ? "branch"
            : "main") as ScenarioSource
    }));
}

function seededNoise(seed: number, key: string): number {
  let hash = seed >>> 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  }
  const value = (hash >>> 0) % 10000;
  return value / 10000 - 0.5;
}

function recentNodeIds(save: SaveState): Set<string> {
  return new Set(
    save.decisionHistory
      .slice(-8)
      .map((record) => record.nodeId)
  );
}

export function scoreScenario(
  save: SaveState,
  candidate: ScenarioCandidate,
  seed: number
): number {
  const model = save.adaptive?.learnerModel;
  const gaps = candidate.abilityIds.map((id) =>
    model ? abilityGap(model, id) : 0.3
  );
  const gapScore = gaps.length
    ? Math.max(...gaps)
    : 0.15;
  const chapter = getChapter(candidate.node.chapterId);
  const focusBonus = candidate.abilityIds.some((id) =>
    chapter.focus.includes(id)
  )
    ? 0.12
    : 0;
  const recentPenalty = recentNodeIds(save).has(candidate.node.id)
    ? -0.35
    : 0;
  const tier = adjustmentForSave(save).tier;
  const difficultyBias =
    tier === "stretch"
      ? (candidate.node.chapterId / 9) * 0.12
      : tier === "recovery"
        ? (1 - candidate.node.chapterId / 9) * 0.06
        : 0.06;
  const noise = seededNoise(seed, candidate.node.id) * 0.2;
  return gapScore * 0.7 + focusBonus + difficultyBias + recentPenalty + noise;
}

export function recommendScenario(
  save: SaveState,
  seed = save.scenarioSeed ?? 7
): ScenarioRecommendation | null {
  const candidates = candidateNodes(save);
  if (candidates.length === 0) return null;
  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreScenario(save, candidate, seed)
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const abilityText = best.candidate.abilityIds[0] ?? "insight";
  return {
    candidate: best.candidate,
    score: Number(best.score.toFixed(3)),
    reason: `教练推荐优先补「${abilityText}」相关的情境，理由是当前掌握度缺口最大。`
  };
}

export function recommendAiScenario(save: SaveState): {
  abilityId: AbilityId;
  difficulty: AiDifficulty;
  reason: string;
} {
  const model = save.adaptive?.learnerModel;
  const weakest =
    (model && weakestAbilitiesByMastery(model, 1)[0]) ?? "insight";
  const tier = adjustmentForSave(save).tier;
  const difficulty: AiDifficulty =
    tier === "recovery" ? "easy" : tier === "stretch" ? "hard" : "medium";
  const reason =
    tier === "recovery"
      ? "当前处于恢复档，先选低压力情境重建信心。"
      : tier === "stretch"
        ? "当前处于拉伸档，用高压力情境维持挑战。"
        : "当前处于标准档，保持真实两难节奏。";
  return { abilityId: weakest, difficulty, reason };
}

export function suggestedDynamicScenario(
  save: SaveState,
  seed = save.scenarioSeed ?? 7
): StoryNode {
  const recommendation = recommendScenario(save, seed);
  if (recommendation) {
    return recommendation.candidate.node;
  }
  const auto = recommendAiScenario(save);
  return generateAiScenario({
    role: save.profile.role,
    abilities: save.profile.abilities,
    abilityId: auto.abilityId,
    difficulty: auto.difficulty,
    chapterId: save.unlockedChapters.at(-1) ?? 1,
    seed,
    language: "zh"
  });
}

