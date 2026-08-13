import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROLES } from "../src/core/abilities.ts";
import { ROLE_OPTION_SETS } from "../src/core/roleOptions.ts";
import { ROLE_NODE_VARIANTS } from "../src/core/story.ts";
import { TRAINING_EXTRAS } from "../src/core/trainingExtras.ts";
import { TRAINING_EXTRAS_EN } from "../src/core/trainingExtrasEn.ts";
import { EXPANDED_TRAINING } from "../src/core/trainingExtras.ts";
import { ROLE_ROADMAPS } from "../src/core/roleTraining.ts";

const roles = Object.keys(ROLES);
const qualities = ["expert", "partial", "risk"];
const issues = [];
const stats = {
  roles: roles.length,
  focusAbilities: 0,
  roleApplications: 0,
  roleOptionViews: 0,
  variantNodes: Object.keys(ROLE_NODE_VARIANTS).length,
  roadmaps: Object.keys(ROLE_ROADMAPS).length
};

for (const role of roles) {
  const roleDef = ROLES[role];
  for (const abilityId of roleDef.focusAbilities) {
    stats.focusAbilities += 1;
    if (!EXPANDED_TRAINING[abilityId]) {
      issues.push(`missing training for ${role} focus ${abilityId}`);
    }
  }

  for (const quality of qualities) {
    const views = ROLE_OPTION_SETS[role]?.[quality];
    stats.roleOptionViews += views?.length ?? 0;
    if (!views || views.length !== 3) {
      issues.push(`role ${role}/${quality} must have 3 option views`);
    }
  }

  for (const abilityId of Object.keys(TRAINING_EXTRAS)) {
    const zh = TRAINING_EXTRAS[abilityId]?.roleApplications?.[role];
    const en = TRAINING_EXTRAS_EN[abilityId]?.roleApplications?.[role];
    stats.roleApplications += 1;
    if (!zh || !zh.trim() || !en || !en.trim()) {
      issues.push(`missing roleApplication ${role}/${abilityId}`);
    }
  }

  const roadmap = ROLE_ROADMAPS[role];
  if (!roadmap || roadmap.stages.length < 4) {
    issues.push(`role ${role} roadmap must have 4+ stages`);
  }
  if (roadmap) {
    const covered = new Set(roadmap.stages.flatMap((stage) => stage.abilities));
    for (const abilityId of roleDef.focusAbilities) {
      if (!covered.has(abilityId)) {
        issues.push(`role ${role} roadmap missing focus ${abilityId}`);
      }
    }
  }
}

for (const role of roles) {
  const missing = Object.keys(ROLE_NODE_VARIANTS).filter(
    (nodeId) => !ROLE_NODE_VARIANTS[nodeId]?.[role]
  );
  if (missing.length > 0) {
    issues.push(`role ${role} missing ${missing.length} node variants`);
  }
}

const appSource = readFileSync(
  resolve(import.meta.dirname, "..", "src", "ui", "App.ts"),
  "utf8"
);
if (!appSource.includes("aiOpponentRole")) {
  issues.push("AI duel opponent role rotation missing");
}

console.log(
  JSON.stringify(
    {
      stats,
      issueCount: issues.length,
      issues
    },
    null,
    2
  )
);
