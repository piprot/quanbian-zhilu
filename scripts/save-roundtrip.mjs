import {
  DEFAULT_SAVE,
  applyStoryChoice,
  computeSaveHash,
  importSaveJson
} from "../src/core/game.ts";
import { nodesForChapter } from "../src/core/story.ts";

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};
globalThis.sessionStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key)
};

const save = structuredClone(DEFAULT_SAVE);
save.profileCreated = true;
save.profile.name = "CrossBrowser";
save.profile.role = "highPotential";
const chapterOne = nodesForChapter(1);
applyStoryChoice(save, chapterOne[0].id, 0);
applyStoryChoice(save, chapterOne[1].id, 0);
const now = Date.now();
save.reviewCards = [
  {
    nodeId: chapterOne[0].id,
    easiness: 2.6,
    intervalDays: 1,
    repetition: 1,
    dueAt: now + 86400000,
    lastQuality: 1,
    wasEverIncorrect: true,
    lastReviewedAt: now
  }
];

const exported = JSON.stringify(save);
const imported = importSaveJson(exported);

const checks = [
  imported.profile.name === "CrossBrowser",
  imported.playCount === save.playCount,
  imported.chapterRecords.length === save.chapterRecords.length,
  imported.reviewCards?.[0]?.nodeId === save.reviewCards?.[0]?.nodeId,
  imported.reviewCards?.[0]?.intervalDays === 1,
  computeSaveHash(imported) === computeSaveHash(save)
];

if (checks.some((check) => !check)) {
  console.error("save round-trip failed", { checks });
  process.exitCode = 1;
} else {
  console.log("PASS save round-trip (export -> import across browser contexts)");
}
