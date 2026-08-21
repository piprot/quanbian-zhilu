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
  DEFAULT_SAVE,
  applyStoryChoice
} from "../src/core/game.ts";
import { getChapter, getNode } from "../src/core/story.ts";
import { adaptiveMetricsSummary } from "../src/core/adaptive-metrics.ts";

function pickIndex(node, tier, seed) {
  const expertIndex = node.options.findIndex(
    (option) => option.quality === "expert"
  );
  const partialIndex = node.options.findIndex(
    (option) => option.quality === "partial"
  );
  const riskIndex = node.options.findIndex(
    (option) => option.quality === "risk"
  );
  const roll = (seed % 97) / 97;
  if (tier === "stretch") {
    if (roll < 0.3 && riskIndex >= 0) return riskIndex;
    if (roll < 0.65 && partialIndex >= 0) return partialIndex;
    if (expertIndex >= 0) return expertIndex;
    return 0;
  }
  if (tier === "recovery") {
    if (roll < 0.55 && expertIndex >= 0) return expertIndex;
    if (roll < 0.85 && partialIndex >= 0) return partialIndex;
    if (riskIndex >= 0) return riskIndex;
    return 0;
  }
  if (roll < 0.4 && expertIndex >= 0) return expertIndex;
  if (roll < 0.7 && partialIndex >= 0) return partialIndex;
  if (riskIndex >= 0) return riskIndex;
  return 0;
}

function runSimulation(seedBase) {
  const save = structuredClone(DEFAULT_SAVE);
  save.profileCreated = true;
  save.profile.name = `Sim ${seedBase}`;
  save.profile.role = "founder";
  save.scenarioSeed = seedBase;
  save.unlockedChapters = [1];
  let decisions = 0;
  for (let chapterId = 1; chapterId <= 9; chapterId += 1) {
    const nodeIds = getChapter(chapterId).nodeIds;
    for (let i = 0; i < nodeIds.length; i += 1) {
      const node = getNode(nodeIds[i]);
      const tier = save.adaptive?.pps.tier ?? "standard";
      const optionIndex = pickIndex(
        node,
        tier,
        seedBase * 31 + chapterId * 17 + i * 7
      );
      applyStoryChoice(save, node.id, optionIndex, {
        decisionTimeMs: 18000 + ((seedBase + i) % 9) * 5000
      });
      decisions += 1;
    }
    if (!save.unlockedChapters.includes(chapterId + 1)) break;
  }
  return {
    decisions,
    metrics: adaptiveMetricsSummary(save)
  };
}

const runs = Number(process.argv[2] ?? "10");
const results = [];
for (let i = 1; i <= runs; i += 1) {
  results.push(runSimulation(i * 7919 + 13));
}
const average = (key) =>
  results.reduce((sum, item) => sum + item.metrics[key], 0) /
  Math.max(1, results.length);
const totalDecisions = results.reduce(
  (sum, item) => sum + item.decisions,
  0
);
console.log(
  JSON.stringify(
    {
      runs: results.length,
      totalDecisions,
      averageExpertRate: Number(average("expertRate").toFixed(3)),
      averageFlowZoneRatio: Number(average("flowZoneRatio").toFixed(3)),
      averagePps: Number(average("pps").toFixed(2)),
      averageDemonstrated: Number(average("demonstratedCount").toFixed(2))
    },
    null,
    2
  )
);
