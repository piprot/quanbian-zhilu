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

import {
  dueFsrsCards,
  fsrsStats,
  normalizeFsrsCards,
  scheduleFsrsReview
} from "../src/core/fsrs-schedule.ts";
import { computeCoachAlerts } from "../src/core/coach-alerts.ts";
import {
  DEFAULT_SAVE,
  applyStoryChoice
} from "../src/core/game.ts";
import { getChapter, getNode } from "../src/core/story.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`adaptive-coach assertion failed: ${message}`);
  }
}

const now = 1_800_000_000_000;
let cards = scheduleFsrsReview(
  [],
  "n1",
  ["insight", "strategy"],
  "expert",
  now
);
assert(cards.length === 1, "fsrs creates card");
assert(cards[0].stability > 1, "expert raises stability");
assert(cards[0].retrievability > 0.9, "expert raises retrievability");
const dueAtAfterExpert = cards[0].dueAt;
assert(dueAtAfterExpert > now, "expert schedules future review");

cards = scheduleFsrsReview(cards, "n1", ["insight"], "risk", now + 1000);
assert(cards[0].stability < 1.5, "risk lowers stability");
assert(cards[0].retrievability < 0.92, "risk lowers retrievability");

const normalized = normalizeFsrsCards([
  {
    nodeId: "n2",
    abilityIds: ["authority"],
    stability: 3,
    difficulty: 0.4,
    retrievability: 0.5,
    dueAt: now - 1000,
    lastReviewedAt: now - 2000,
    reviews: 2
  }
]);
assert(normalized.length === 1, "normalize keeps one card");
assert(
  fsrsStats(normalized, now).forgotten === 1,
  "low retrievability counts as forgotten"
);
assert(dueFsrsCards(normalized, now).length === 1, "due cards returned");

const save = structuredClone(DEFAULT_SAVE);
save.profileCreated = true;
save.profile.name = "Coach Test";
save.profile.role = "founder";
save.fsrsCards = [
  {
    nodeId: "old-node",
    abilityIds: ["insight"],
    stability: 0.5,
    difficulty: 0.7,
    retrievability: 0.4,
    dueAt: now - 5000,
    lastReviewedAt: now - 10000,
    reviews: 3
  }
];
save.profile.resources.energy = 20;
save.morale = 30;
save.decisionHistory = [
  { nodeId: "a", optionIndex: 0, quality: "risk", qualityScore: 20, chapterId: 1 },
  { nodeId: "b", optionIndex: 0, quality: "risk", qualityScore: 20, chapterId: 1 },
  { nodeId: "c", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 },
  { nodeId: "d", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 }
];

const alerts = computeCoachAlerts(save, now);
const types = alerts.map((alert) => alert.type);
assert(types.includes("forgetting"), "forgetting alert fires");
assert(types.includes("overload"), "overload alert fires");
assert(types.includes("affect_negative"), "low morale alert fires");
assert(alerts.length <= 3, "alerts capped at three");

const depSave = structuredClone(DEFAULT_SAVE);
depSave.profileCreated = true;
depSave.profile.role = "founder";
depSave.decisionHistory = [
  { nodeId: "a", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 },
  { nodeId: "b", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 },
  { nodeId: "c", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 },
  { nodeId: "d", optionIndex: 0, quality: "partial", qualityScore: 55, chapterId: 1 }
];
const depAlerts = computeCoachAlerts(depSave, now);
assert(
  depAlerts.some((alert) => alert.type === "dependency_increasing"),
  "partial-heavy decisions alert fires"
);

const storySave = structuredClone(DEFAULT_SAVE);
storySave.profileCreated = true;
storySave.profile.role = "founder";
const node = getNode(getChapter(1).nodeIds[0]);
const expertIndex = node.options.findIndex((option) => option.quality === "expert");
assert(expertIndex >= 0, "chapter node has expert option");
applyStoryChoice(storySave, node.id, expertIndex);
assert(storySave.fsrsCards.length === 1, "story choice writes fsrs card");

console.log("PASS adaptive coach");
