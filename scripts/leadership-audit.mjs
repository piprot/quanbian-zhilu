import {
  CHAPTERS,
  STORY_NODES,
  SIDE_QUEST_ARCS,
  getNode,
  getNodeForRole
} from "../src/core/story.ts";
import { ABILITY_ORDER, ROLES } from "../src/core/abilities.ts";
import { EXPANDED_TRAINING } from "../src/core/trainingExtras.ts";
import { TRIAL_STAGES } from "../src/core/trials.ts";
import { ROLE_OPTION_SETS } from "../src/core/roleOptions.ts";

const issues = [];
const stats = {
  nodes: STORY_NODES.length,
  main: 0,
  side: 0,
  branch: 0,
  random: 0,
  options: 0,
  expert: 0,
  partial: 0,
  risk: 0,
  missingTheory: 0,
  missingFeedback: 0,
  emptyEffects: 0,
  roleOptionViews: 0
};

function push(issue) {
  issues.push(issue);
}

for (const node of STORY_NODES) {
  if (node.kind === "main") stats.main += 1;
  if (node.kind === "side") stats.side += 1;
  if (node.kind === "branch") stats.branch += 1;
  if (node.kind === "random") stats.random += 1;

  node.options.forEach((option) => {
    stats.options += 1;
    if (option.quality === "expert") stats.expert += 1;
    if (option.quality === "partial") stats.partial += 1;
    if (option.quality === "risk") stats.risk += 1;
    if (!option.theory || !option.theory.trim()) {
      stats.missingTheory += 1;
      push(`missing theory: ${node.id} option ${option.quality}`);
    }
    if (!option.feedback || !option.feedback.trim()) {
      stats.missingFeedback += 1;
      push(`missing feedback: ${node.id} option ${option.quality}`);
    }
    if (!option.effects || Object.keys(option.effects).length === 0) {
      stats.emptyEffects += 1;
      push(`empty effects: ${node.id} option ${option.quality}`);
    }
  });

  if (node.kind === "main") {
    const chapter = CHAPTERS.find((item) => item.id === node.chapterId);
    if (chapter) {
      node.options.forEach((option) => {
        if (option.quality !== "expert") return;
        const abilities = Object.keys(option.effects);
        const focusHits = abilities.filter((id) =>
          chapter.focus.includes(id)
        ).length;
        if (focusHits === 0) {
          push(
            `expert without chapter focus ability: ${node.id} (${chapter.title}) effects=${abilities.join(",")} focus=${chapter.focus.join(",")}`
          );
        }
      });
    }
  }
}

for (const role of Object.keys(ROLE_OPTION_SETS)) {
  for (const quality of ["expert", "partial", "risk"]) {
    stats.roleOptionViews += ROLE_OPTION_SETS[role][quality].length;
  }
}

const training = Object.values(EXPANDED_TRAINING);
const trainingStats = {
  abilities: training.length,
  withFormula: training.filter((item) => item.formula?.expression).length,
  withWorkedExamples: training.filter(
    (item) => item.workedExamples?.length > 0
  ).length,
  withApplicationPoints: training.filter(
    (item) => item.applicationPoints?.length > 0
  ).length,
  questions: training.reduce(
    (sum, item) => sum + item.questions.length,
    0
  )
};

const trialStats = {
  stages: TRIAL_STAGES.length,
  withCalculation: TRIAL_STAGES.filter(
    (stage) => stage.source?.kind === "custom" && stage.source.question?.calculation
  ).length
};

const sideArcs = SIDE_QUEST_ARCS.map((arc) => ({
  id: arc.id,
  nodes: arc.nodes.length,
  order: arc.nodes.join(" -> ")
}));

console.log(
  JSON.stringify(
    {
      stats,
      trainingStats,
      trialStats,
      sideArcs,
      issueCount: issues.length,
      issues: issues.slice(0, 80)
    },
    null,
    2
  )
);
