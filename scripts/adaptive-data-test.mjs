import {
  assignExperimentVariant,
  experimentEnabled,
  hashUserId
} from "../src/core/experiment.ts";
import {
  adaptiveMetricsSummary,
  flowZoneRatio
} from "../src/core/adaptive-metrics.ts";
import {
  DEFAULT_SAVE,
  applyStoryChoice
} from "../src/core/game.ts";
import { getChapter, getNode } from "../src/core/story.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`adaptive-data assertion failed: ${message}`);
  }
}

const hashA = hashUserId("player-a");
const hashB = hashUserId("player-b");
assert(hashA !== hashB, "user hash differs between users");
const variant = assignExperimentVariant("player-a", "dda", [
  "control",
  "adaptive"
]);
assert(
  ["control", "adaptive"].includes(variant),
  "experiment variant is valid"
);
assert(
  experimentEnabled("player-a", "dda", 1) === true,
  "100% ratio always enables experiment"
);
assert(
  experimentEnabled("player-a", "dda", 0) === false,
  "0% ratio never enables experiment"
);

const save = structuredClone(DEFAULT_SAVE);
save.profileCreated = true;
save.profile.name = "Data Test";
save.profile.role = "founder";
const node = getNode(getChapter(1).nodeIds[0]);
const expertIndex = node.options.findIndex((option) => option.quality === "expert");
applyStoryChoice(save, node.id, expertIndex, {
  decisionTimeMs: 30000
});
assert(flowZoneRatio(save) >= 0, "flow zone ratio is numeric");
const summary = adaptiveMetricsSummary(save);
assert(summary.totalDecisions === 1, "metrics count decisions");
assert(summary.expertRate === 1, "metrics expert rate is one");
assert(summary.pps > 0, "metrics includes pps");
assert(summary.reviewDue >= 0, "metrics includes review due");

console.log("PASS adaptive data");

