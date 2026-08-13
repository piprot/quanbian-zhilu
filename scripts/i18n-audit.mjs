import { ABILITIES, ABILITY_ORDER, ROLES } from "../src/core/abilities.ts";
import { ASSESSMENT_QUESTIONS } from "../src/core/assessment.ts";
import { ACHIEVEMENTS } from "../src/core/achievements.ts";
import { NPCS } from "../src/core/npcs.ts";
import {
  CHAPTERS,
  CHAPTER_REFLECTIONS,
  SIDE_QUEST_ARCS,
  STORY_NODES
} from "../src/core/story.ts";
import {
  ABILITY_DETAIL_EN,
  ABILITY_EN,
  ACHIEVEMENT_EN,
  ASSESSMENT_EN,
  BRANCH_NODE_EN,
  CHALLENGE_EN,
  CHAPTER_EN,
  CHAPTER_REFLECTION_EN,
  MAIN_NODE_EN,
  MAIN_NODE_THEORY_EN,
  NPC_EN,
  RANDOM_NODE_EN,
  RESOURCE_EN,
  ROLE_EN,
  ROLE_OPTION_EN,
  SIDE_ARC_EN,
  SIDE_NODE_EN
} from "../src/core/translations.ts";

const problems = [];

function hasEnglish(map, id, label) {
  if (!map[id]) problems.push(`${label} ${id} missing English`);
}

for (const chapter of CHAPTERS) {
  hasEnglish(CHAPTER_EN, chapter.id, "chapter");
  if (!CHAPTER_REFLECTION_EN[chapter.id]) {
    problems.push(`chapter ${chapter.id} missing English reflection`);
  }
}

for (const id of ABILITY_ORDER) {
  hasEnglish(ABILITY_EN, id, "ability");
  if (
    !ABILITY_DETAIL_EN[id] ||
    ABILITY_DETAIL_EN[id].subSkills.length !== ABILITIES[id].subSkills.length
  ) {
    problems.push(`ability ${id} missing English detail`);
  }
}

for (const id of Object.keys(ROLES)) {
  hasEnglish(ROLE_EN, id, "role");
}

for (const id of ["energy", "trust", "influence", "capital"]) {
  hasEnglish(RESOURCE_EN, id, "resource");
}

for (const node of STORY_NODES) {
  if (node.kind === "main") {
    hasEnglish(MAIN_NODE_EN, node.id, "main node");
    if (
      !MAIN_NODE_THEORY_EN[node.id] ||
      MAIN_NODE_THEORY_EN[node.id].length !== node.options.length
    ) {
      problems.push(`main node ${node.id} missing English theory`);
    }
  } else if (node.kind === "side") {
    hasEnglish(SIDE_NODE_EN, node.id, "side node");
  } else if (node.kind === "branch") {
    hasEnglish(BRANCH_NODE_EN, node.id, "branch node");
  } else if (node.kind === "random") {
    hasEnglish(RANDOM_NODE_EN, node.id, "random node");
  }
}

for (const role of Object.keys(ROLE_OPTION_EN)) {
  for (const quality of Object.keys(ROLE_OPTION_EN[role])) {
    if (ROLE_OPTION_EN[role][quality].length !== 3) {
      problems.push(`${role}/${quality} role option English incomplete`);
    }
  }
}

for (const npc of NPCS) hasEnglish(NPC_EN, npc.id, "NPC");
for (const achievement of ACHIEVEMENTS) {
  hasEnglish(ACHIEVEMENT_EN, achievement.id, "achievement");
}
for (const question of ASSESSMENT_QUESTIONS) {
  hasEnglish(ASSESSMENT_EN, question.id, "assessment");
}
for (const arc of SIDE_QUEST_ARCS) {
  hasEnglish(SIDE_ARC_EN, arc.id, "side arc");
}
for (const challengeId of Object.keys(CHALLENGE_EN)) {
  hasEnglish(CHALLENGE_EN, challengeId, "challenge");
}

if (problems.length > 0) {
  console.error("I18N AUDIT FAILED");
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      chapters: CHAPTERS.length,
      storyNodes: STORY_NODES.length,
      abilities: ABILITY_ORDER.length,
      npcs: NPCS.length,
      achievements: ACHIEVEMENTS.length,
      assessmentQuestions: ASSESSMENT_QUESTIONS.length,
      roleOptionSets: Object.keys(ROLE_OPTION_EN).length * 3,
      challenges: Object.keys(CHALLENGE_EN).length,
      status: "full"
    },
    null,
    2
  )
);
console.log("PASS i18n audit");
