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
  ADAPTIVE_CONFIG,
  tierForPps
} from "../src/core/adaptive-config.ts";
import {
  createDefaultAdaptiveState,
  createDefaultPpsState,
  normalizeAdaptiveState,
  recordAdaptiveDecision
} from "../src/core/adaptive-dda.ts";
import {
  bktUpdate,
  createDefaultLearnerModel,
  masterySummary,
  updateLearnerModel,
  weakestAbilitiesByMastery
} from "../src/core/learner-model.ts";
import {
  DEFAULT_SAVE,
  applyStoryChoice,
  economyFactors,
  loadSave,
  saveState
} from "../src/core/game.ts";
import { getChapter, getNode } from "../src/core/story.ts";
import { ABILITY_ORDER } from "../src/core/abilities.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`adaptive-core assertion failed: ${message}`);
  }
}

const learner = createDefaultLearnerModel();
assert(Object.keys(learner.abilities).length === 10, "learner has 10 abilities");
assert(learner.abilities.insight.mastery === 0.3, "default mastery is 0.3");

const improved = updateLearnerModel(learner, {
  abilityIds: ["insight", "strategy"],
  quality: "expert",
  timestamp: 1000
});
assert(
  improved.abilities.insight.mastery > learner.abilities.insight.mastery,
  "expert decision raises mastery"
);
const declined = updateLearnerModel(improved, {
  abilityIds: ["insight"],
  quality: "risk",
  timestamp: 2000
});
assert(
  declined.abilities.insight.mastery < improved.abilities.insight.mastery,
  "risk decision lowers mastery"
);
assert(
  masterySummary(declined, "insight").stage === "estimated",
  "low evidence is estimated"
);

const bktUp = bktUpdate(
  { probMastery: 0.3, probLearn: 0.12, probGuess: 0.2, probSlip: 0.1 },
  true
);
const bktDown = bktUpdate(
  { probMastery: 0.3, probLearn: 0.12, probGuess: 0.2, probSlip: 0.1 },
  false
);
assert(bktUp > 0.3, "BKT correct raises mastery");
assert(bktDown < 0.3, "BKT wrong lowers mastery");

const adaptive = createDefaultAdaptiveState();
const first = recordAdaptiveDecision(adaptive, {
  abilityIds: ["insight"],
  quality: "expert",
  resourceDelta: { trust: 2, influence: 1 },
  decisionTimeMs: 25000,
  morale: 80,
  timestamp: 1000
});
assert(first.state.pps.calibrationRemaining === 4, "calibration counts down");
assert(first.state.pps.tier === "standard", "calibration keeps standard tier");
assert(first.state.pps.currentPps > adaptive.pps.currentPps, "expert raises PPS");

let state = createDefaultAdaptiveState();
for (let i = 0; i < 4; i += 1) {
  state = recordAdaptiveDecision(state, {
    abilityIds: ["insight"],
    quality: "expert",
    resourceDelta: { trust: 1 },
    timestamp: 2000 + i
  }).state;
}
state = recordAdaptiveDecision(state, {
  abilityIds: ["insight"],
  quality: "risk",
  resourceDelta: { capital: -4 },
  decisionTimeMs: 5000,
  timestamp: 3000
}).state;
assert(state.pps.calibrationRemaining === 0, "calibration ends after 5 decisions");

let riskState = createDefaultAdaptiveState();
riskState.pps.currentPps = 1.4;
riskState.pps.calibrationRemaining = 0;
riskState.pps.tier = "recovery";
riskState = recordAdaptiveDecision(riskState, {
  abilityIds: ["authority"],
  quality: "risk",
  resourceDelta: { capital: -8 },
  morale: 20,
  timestamp: 4000
}).state;
assert(riskState.pps.currentPps >= 0, "PPS stays non-negative under pressure");

let stretchState = createDefaultAdaptiveState();
stretchState.pps.currentPps = 4.5;
stretchState.pps.calibrationRemaining = 0;
stretchState.pps.tier = "stretch";
for (let i = 0; i < 4; i += 1) {
  stretchState = recordAdaptiveDecision(stretchState, {
    abilityIds: ["strategy"],
    quality: "expert",
    resourceDelta: { trust: 1 },
    timestamp: 5000 + i
  }).state;
}
assert(
  stretchState.pps.currentPps >= 4.5,
  "strong expert streak keeps PPS high"
);

assert(tierForPps(1.2) === "recovery", "low PPS maps to recovery");
assert(tierForPps(2.5) === "standard", "mid PPS maps to standard");
assert(tierForPps(4) === "stretch", "high PPS maps to stretch");

const normalized = normalizeAdaptiveState({
  configVersion: 1,
  learnerModel: {
    abilities: {
      insight: {
        attempts: 4,
        expert: 3,
        partial: 0,
        risk: 1,
        mastery: 0.8,
        confidence: 0.6,
        bktMastery: 0.75
      }
    }
  },
  pps: {
    currentPps: 3.1,
    previousPps: 2.8,
    tier: "stretch",
    calibrationRemaining: 0,
    observations: [],
    consecutiveExpert: 2,
    consecutiveRisk: 0
  }
});
assert(
  normalized.learnerModel.abilities.insight.attempts === 4,
  "normalize keeps learner attempts"
);
assert(normalized.pps.tier === "stretch", "normalize keeps tier");

const save = structuredClone(DEFAULT_SAVE);
save.profileCreated = true;
save.profile.name = "Adaptive Test";
const node = getNode(getChapter(1).nodeIds[0]);
const expertIndex = node.options.findIndex((option) => option.quality === "expert");
assert(expertIndex >= 0, "first chapter has expert option");
const factorBefore = economyFactors(save, 1);
assert(factorBefore.neg === 1 && factorBefore.pos === 1, "default adaptive factor is neutral");
applyStoryChoice(save, node.id, expertIndex, {
  decisionTimeMs: 30000,
  morale: 80
});
assert(save.adaptive !== undefined, "story choice creates adaptive state");
assert(save.adaptive.pps.currentPps > 2.5, "story choice raises PPS");
assert(
  weakestAbilitiesByMastery(save.adaptive.learnerModel, 3).length === 3,
  "weakest ability list available"
);
const factorAfter = economyFactors(save, 1);
assert(
  typeof factorAfter.neg === "number" && typeof factorAfter.pos === "number",
  "adaptive factor remains numeric"
);

saveState(save);
const reloaded = loadSave(save.profile.role);
assert(reloaded.adaptive !== undefined, "reload keeps adaptive state");
assert(
  reloaded.adaptive.pps.currentPps === save.adaptive.pps.currentPps,
  "reload roundtrips PPS"
);

console.log("PASS adaptive core");

