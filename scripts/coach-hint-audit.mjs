import { STORY_NODES } from "../src/core/story.ts";
import { EXTRA_MAIN_NODES } from "../src/core/mainScenarios.ts";
import { scenarioCoachHint } from "../src/core/coach-hints.ts";
import {
  BRANCH_NODE_EN,
  FORK_NODE_EN,
  MAIN_NODE_EN,
  RANDOM_NODE_EN,
  SIDE_NODE_EN
} from "../src/core/translations.ts";

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

/** 与 coach-hints 内部 enNodeText 对齐：取节点的英文标题（audit 传入原始 node）。 */
function enTitle(node) {
  let entry;
  if (node.kind === "main") entry = MAIN_NODE_EN[node.id];
  else if (node.kind === "side") entry = SIDE_NODE_EN[node.id];
  else if (node.kind === "random") entry = RANDOM_NODE_EN[node.id];
  else entry = FORK_NODE_EN[node.id] ?? BRANCH_NODE_EN[node.id];
  return entry?.title ?? node.title;
}

const CJK_PATTERN = /[一-鿿]/;

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
      const expectedTitle =
        language === "en" ? enTitle(node) : node.title;
      if (!hint.includes(expectedTitle)) {
        throw new Error(
          `hint missing scenario title for ${language}/${role}/${node.id}`
        );
      }
      if (language === "en" && CJK_PATTERN.test(hint)) {
        throw new Error(
          `en coach hint contains Chinese for ${role}/${node.id}: ${hint}`
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
