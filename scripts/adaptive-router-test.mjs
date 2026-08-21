const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};
const backupStore = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (backupStore.has(key) ? backupStore.get(key) : null),
  setItem: (key, value) => backupStore.set(key, String(value)),
  removeItem: (key) => backupStore.delete(key)
};

import { ABILITY_ORDER } from "../src/core/abilities.ts";
import { adaptiveFeedbackForDecision } from "../src/core/adaptive-feedback.ts";
import { analyzeRecentDecisions } from "../src/core/consequence-rules.ts";
import {
  deriveScenarioAbilityIds,
  recommendAiScenario,
  recommendScenario,
  scoreScenario
} from "../src/core/scenario-router.ts";
import {
  DEFAULT_SAVE,
  applyStoryChoice
} from "../src/core/game.ts";
import { STORY_NODES, getChapter, getNode } from "../src/core/story.ts";
import { EXTRA_MAIN_NODES } from "../src/core/mainScenarios.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`adaptive-router assertion failed: ${message}`);
  }
}

const allNodes = [...STORY_NODES, ...EXTRA_MAIN_NODES];
assert(
  allNodes.every((node) => deriveScenarioAbilityIds(node).length > 0),
  "every story node has derivable ability metadata"
);

const save = structuredClone(DEFAULT_SAVE);
save.profileCreated = true;
save.profile.name = "Router Test";
save.profile.role = "founder";
save.scenarioSeed = 42;
save.unlockedChapters = [1];

const recommendation = recommendScenario(save, 42);
assert(recommendation !== null, "scenario recommendation exists");
assert(recommendation.score > 0, "scenario score is positive");
assert(
  recommendation.candidate.node.chapterId === 1,
  "recommendation stays in unlocked chapter"
);

const firstScore = scoreScenario(
  save,
  recommendation.candidate,
  42
);
const secondScore = scoreScenario(
  save,
  recommendation.candidate,
  42
);
assert(firstScore === secondScore, "scenario score is seed deterministic");

const auto = recommendAiScenario(save);
assert(ABILITY_ORDER.includes(auto.abilityId), "auto ability is valid");
assert(
  ["easy", "medium", "hard"].includes(auto.difficulty),
  "auto difficulty is valid"
);

const chapterOne = getChapter(1).nodeIds;
const riskIndex = (nodeId) =>
  getNode(nodeId).options.findIndex((option) => option.quality === "risk");
const riskNodes = chapterOne.filter((nodeId) => riskIndex(nodeId) >= 0);
assert(riskNodes.length >= 2, "chapter one has at least two risk options");
const riskNodeOne = riskNodes[0];
const riskNodeTwo = riskNodes[1];
applyStoryChoice(save, riskNodeOne, riskIndex(riskNodeOne), {
  decisionTimeMs: 8000,
  morale: 30
});
applyStoryChoice(save, riskNodeTwo, riskIndex(riskNodeTwo), {
  decisionTimeMs: 7000,
  morale: 25
});
const thirdNode = chapterOne.find((nodeId) => !riskNodes.includes(nodeId));
assert(thirdNode !== undefined, "chapter one has a non-risk node");
applyStoryChoice(save, thirdNode, 0, {
  decisionTimeMs: 30000,
  morale: 40
});

save.morale = 25;
const advice = analyzeRecentDecisions(save);
assert(
  advice.some((item) => item.type === "risk_spiral"),
  "two risk decisions trigger risk spiral advice"
);
assert(
  advice.some((item) => item.type === "morale_low"),
  "low morale triggers advice"
);

const lastRecord = save.decisionHistory.at(-1);
const feedback = adaptiveFeedbackForDecision(save, lastRecord, "zh");
assert(feedback.nextAction.length > 0, "adaptive feedback has next action");
assert(feedback.gaps.length > 0, "adaptive feedback identifies gaps");

const afterRecommend = recommendScenario(save, 42);
assert(
  afterRecommend.candidate.node.id !== riskNodeOne,
  "completed node is excluded from recommendations"
);

console.log("PASS adaptive router");
