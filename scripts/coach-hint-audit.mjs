import { STORY_NODES } from "../src/core/story.ts";
import { EXTRA_MAIN_NODES } from "../src/core/mainScenarios.ts";
import { scenarioCoachHint } from "../src/core/coach-hints.ts";

const ROLES = ["parachute", "founder", "highPotential"];
const LANGUAGES = ["zh", "en"];

function mockSave(role) {
  return {
    version: 1,
    profileCreated: true,
    profile: {
      name: "Coach Hint Audit",
      role,
      abilities: {
        insight: 40,
        deploy: 40,
        mobilize: 40,
        strategy: 40,
        authority: 40,
        stability: 40,
        recovery: 40,
        execution: 40,
        structure: 40,
        communication: 40
      },
      resources: { energy: 80, trust: 50, influence: 50, capital: 50 }
    },
    chapterRecords: [],
    unlockedChapters: [1],
    decisionHistory: [],
    scenarioSeed: 7
  };
}

const nodes = new Map();
for (const node of STORY_NODES) nodes.set(node.id, node);
for (const node of EXTRA_MAIN_NODES) nodes.set(node.id, node);
const allNodes = [...nodes.values()];

let totalHints = 0;
for (const language of LANGUAGES) {
  for (const role of ROLES) {
    const save = mockSave(role);
    const hints = new Map();
    for (const node of allNodes) {
      const hint = scenarioCoachHint({
        node,
        save,
        language,
        seed: save.scenarioSeed
      });
      if (!hint || hint.length > 500) {
        throw new Error(
          `bad hint length for ${language}/${role}/${node.id}: ${hint?.length}`
        );
      }
      if (!hint.includes(node.title)) {
        throw new Error(
          `hint missing scenario title for ${language}/${role}/${node.id}`
        );
      }
      hints.set(node.id, hint);
      totalHints += 1;
    }
    const unique = new Set(hints.values());
    if (unique.size !== hints.size) {
      throw new Error(
        `duplicate coach hints for ${language}/${role}: ${hints.size} nodes, ${unique.size} unique`
      );
    }
  }
}

const sampleIds = ["c1n1", "r1", "s1", "c4-fork-expert"];
for (const id of sampleIds) {
  const node = allNodes.find((item) => item.id === id);
  if (!node) continue;
  const save = mockSave("parachute");
  console.log(
    `\n[${id} ${node.title}] zh:\n${scenarioCoachHint({
      node,
      save,
      language: "zh",
      seed: save.scenarioSeed
    })}`
  );
  console.log(
    `[${id} ${node.title}] en:\n${scenarioCoachHint({
      node,
      save,
      language: "en",
      seed: save.scenarioSeed
    })}`
  );
}

console.log(
  `PASS coach hint audit (${allNodes.length} scenarios × ${ROLES.length} roles × ${LANGUAGES.length} languages, ${totalHints} unique hints)`
);
