import {
  CHAPTERS,
  getNode,
  getNodeForRole,
  nodesForChapter
} from "../src/core/story.ts";
import {
  DEFAULT_SAVE,
  applyStoryChoice,
  isChapterPassed,
  optionGateFor,
  retryChapter
} from "../src/core/game.ts";

const roles = [
  { id: "parachute", zh: "空降管理者" },
  { id: "founder", zh: "创业者" },
  { id: "highPotential", zh: "高潜人才" }
];

function bestEnabledIndex(options, save, chapter) {
  const ranked = options
    .map((option, index) => ({
      index,
      option,
      gate: optionGateFor(save, option, chapter)
    }))
    .filter((candidate) => candidate.gate.kind === "ok")
    .sort((a, b) => {
      const priority = (quality) =>
        quality === "expert" ? 0 : quality === "partial" ? 1 : 2;
      return priority(a.option.quality) - priority(b.option.quality);
    });
  return ranked[0] ?? null;
}

function runRole(role) {
  const save = structuredClone(DEFAULT_SAVE);
  save.profile.role = role.id;
  const issues = [];
  const visited = [];
  const branches = [];

  const pickBest = (options, chapterId, energyRestoreUsedRef) => {
    let best = bestEnabledIndex(options, save, chapterId);
    if (!best) {
      const energyLocked = options.some(
        (option) => optionGateFor(save, option, chapterId).kind === "resource"
      );
      if (energyLocked && energyRestoreUsedRef.used < 2) {
        save.profile.resources.energy = Math.min(
          100,
          save.profile.resources.energy + 40
        );
        energyRestoreUsedRef.used += 1;
        best = bestEnabledIndex(options, save, chapterId);
      }
    }
    return best;
  };

  for (const chapter of CHAPTERS) {
    let attempts = 0;
    let passed = false;
    while (attempts < 3 && !passed) {
      attempts += 1;
      if (attempts > 1) retryChapter(save, chapter.id);
      const energyRestoreUsed = { used: 0 };
      const nodes = nodesForChapter(chapter.id).filter(
        (node) => node.kind === "main"
      );
      for (const node of nodes) {
        const roleNode = getNodeForRole(role.id, node.id);
        let best = pickBest(roleNode.options, chapter.id, energyRestoreUsed);
        if (!best) {
          issues.push(
            `chapter ${chapter.id} node ${node.id} has no enabled option`
          );
          break;
        }
        const expertLocked =
          roleNode.options.some((option) => option.quality === "expert") &&
          !roleNode.options.some(
            (option) =>
              option.quality === "expert" &&
              optionGateFor(save, option, chapter.id).kind === "ok"
          );
        applyStoryChoice(save, node.id, best.index);
        visited.push({
          chapter: chapter.id,
          node: roleNode.title,
          quality: roleNode.options[best.index].quality,
          expertLocked
        });
        const branchId = roleNode.options[best.index].branchTo?.[role.id];
        if (branchId) {
          const branchNode = getNodeForRole(role.id, branchId);
          const branchBest = pickBest(
            branchNode.options,
            chapter.id,
            energyRestoreUsed
          );
          if (!branchBest) {
            issues.push(`chapter ${chapter.id} branch ${branchId} blocked`);
            break;
          }
          applyStoryChoice(save, branchId, branchBest.index);
          branches.push(branchNode.title);
        }
      }
      passed = isChapterPassed(save, chapter.id);
      if (!passed && attempts < 3) {
        issues.push(`chapter ${chapter.id} retry ${attempts}`);
      }
    }
    if (!passed) {
      issues.push(`chapter ${chapter.id} failed after retries`);
      break;
    }
    if (chapter.id < CHAPTERS.length && !save.unlockedChapters.includes(chapter.id + 1)) {
      issues.push(`chapter ${chapter.id} passed but chapter ${chapter.id + 1} not unlocked`);
    }
  }

  const completedNodes = save.chapterRecords.reduce(
    (sum, record) => sum + record.completedNodeIds.length,
    0
  );
  return {
    role: role.id,
    visitedCount: visited.length,
    uniqueMainTitles: [...new Set(visited.map((item) => item.node))].length,
    completedNodes,
    branches: [...new Set(branches)],
    branchCount: branches.length,
    chaptersPassed: save.chapterRecords.filter((record) =>
      isChapterPassed(save, record.chapterId)
    ).length,
    endingReached: isChapterPassed(save, 9),
    issues
  };
}

const results = roles.map(runRole);
console.log(JSON.stringify(results, null, 2));
const bad = results.filter(
  (result) =>
    result.issues.length > 0 ||
    result.endingReached !== true ||
    result.completedNodes !== 81
);
if (bad.length > 0) {
  console.error("ROLE CAMPAIGN SIM FAILED");
  process.exit(1);
}
console.log("PASS role campaign sim");
