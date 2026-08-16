import { ABILITY_ORDER } from "../src/core/abilities.ts";
import { CHAPTERS, STORY_NODES } from "../src/core/story.ts";

const counts = Object.fromEntries(
  ABILITY_ORDER.map((id) => [
    id,
    { expert: 0, partial: 0, risk: 0, expertGain: 0, total: 0 }
  ])
);

for (const node of STORY_NODES) {
  for (const option of node.options) {
    for (const abilityId of Object.keys(option.effects ?? {})) {
      const entry = counts[abilityId];
      if (!entry) continue;
      entry[option.quality] += 1;
      if (option.quality === "expert") {
        entry.expertGain += option.effects[abilityId];
      }
      entry.total += 1;
    }
  }
}

const issues = [];
for (const abilityId of ABILITY_ORDER) {
  const entry = counts[abilityId];
  if (entry.total < 6) {
    issues.push(`${abilityId} only appears ${entry.total} times across all nodes`);
  }
  if (entry.expert < 2) {
    issues.push(`${abilityId} only has ${entry.expert} expert appearances`);
  }
}

const chapterFocus = CHAPTERS.map((chapter) => {
  const nodes = STORY_NODES.filter(
    (node) =>
      node.chapterId === chapter.id &&
      (node.kind === "main" || node.kind === "branch")
  );
  const expertCounts = Object.fromEntries(
    chapter.focus.map((abilityId) => [
      abilityId,
      nodes.flatMap((node) => node.options).filter(
        (option) =>
          option.quality === "expert" && (option.effects?.[abilityId] ?? 0) > 0
      ).length
    ])
  );
  for (const abilityId of chapter.focus) {
    if (expertCounts[abilityId] < 3) {
      issues.push(
        `chapter ${chapter.id} focus ability ${abilityId} only has ${expertCounts[abilityId]} expert appearances`
      );
    }
  }
  return { chapter: chapter.id, expertCounts };
});

console.log(
  JSON.stringify({ counts, chapterFocus, issueCount: issues.length, issues }, null, 2)
);
if (issues.length > 0) {
  process.exitCode = 1;
}
