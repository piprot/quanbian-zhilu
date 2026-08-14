// 内容深度分层审计：把「核心 18 主线 vs 扩展 63 主线」的深度分层变成可验证的度量。
// 深度不靠真人数据，而是用可测量的结构信号：情境长度、情报条数、反馈/理论长度、
// 角色变体覆盖、NPC 覆盖。核心情境应至少不浅于扩展情境。
import {
  CHAPTERS,
  NODE_INTEL,
  ROLE_NODE_VARIANTS,
  STORY_NODES
} from "../src/core/story.ts";
import { NPCS } from "../src/core/npcs.ts";

const ROLES = ["parachute", "founder", "highPotential"];

function depthScore(node) {
  const intelCount = NODE_INTEL[node.id]?.length ?? 0;
  const feedbackLen =
    node.options.reduce((sum, option) => sum + (option.feedback ?? "").length, 0) /
    node.options.length;
  const theoryLen =
    node.options.reduce((sum, option) => sum + (option.theory ?? "").length, 0) /
    node.options.length;
  const variants = ROLE_NODE_VARIANTS[node.id] ?? {};
  const variantCoverage =
    ROLES.filter(
      (role) => variants[role]?.context && variants[role]?.stake
    ).length / ROLES.length;
  const npcCoverage = NPCS.some((npc) => npc.nodeId === node.id) ? 1 : 0;
  return {
    intelCount,
    feedbackLen,
    theoryLen,
    variantCoverage,
    npcCoverage,
    // 加权深度分（用于排序与横向比较）
    score:
      Math.min(node.context.length, 400) * 0.15 +
      Math.min(node.stake.length, 200) * 0.15 +
      Math.min(intelCount * 40, 160) * 0.2 +
      Math.min(feedbackLen, 300) * 0.25 +
      Math.min(theoryLen, 200) * 0.15 +
      variantCoverage * 40 +
      npcCoverage * 20
  };
}

function summarize(label, nodes) {
  if (nodes.length === 0) return null;
  const stats = nodes.map(depthScore);
  const avg = (key) =>
    Math.round(stats.reduce((sum, item) => sum + item[key], 0) / stats.length);
  const min = (key) => Math.min(...stats.map((item) => item[key]));
  const max = (key) => Math.max(...stats.map((item) => item[key]));
  return {
    label,
    count: nodes.length,
    avgIntel: avg("intelCount"),
    avgFeedback: avg("feedbackLen"),
    avgTheory: avg("theoryLen"),
    avgVariantCoverage: avg("variantCoverage"),
    npcCoverage: stats.filter((item) => item.npcCoverage).length,
    minScore: Math.round(min("score")),
    avgScore: Math.round(avg("score")),
    maxScore: Math.round(max("score"))
  };
}

const mainNodes = STORY_NODES.filter((node) => node.kind === "main");
const core = mainNodes.filter((node) => /n[12]$/.test(node.id));
const extended = mainNodes.filter((node) => /n[3-9]$/.test(node.id));
const others = STORY_NODES.filter((node) => node.kind !== "main");

const groups = [
  summarize("core (18 主线核心 n1-n2)", core),
  summarize("extended (63 主线扩展 n3-n9)", extended),
  summarize("side/branch/random", others)
].filter(Boolean);

console.log("\n=== 内容深度分层审计 ===");
console.log(
  `主线核心 ${core.length} · 主线扩展 ${extended.length} · 其他 ${others.length} · 章节 ${CHAPTERS.length}`
);
console.table(
  groups.map((group) => ({
    分组: group.label,
    数量: group.count,
    平均情报条数: group.avgIntel,
    平均反馈字数: group.avgFeedback,
    平均理论字数: group.avgTheory,
    角色变体覆盖: group.avgVariantCoverage.toFixed(2),
    NPC覆盖数: group.npcCoverage,
    深度分min: group.minScore,
    深度分avg: group.avgScore,
    深度分max: group.maxScore
  }))
);

// 核心情境不应显著浅于扩展情境：列出深度分低于扩展组中位数的核心情境。
const extendedScores = extended.map((node) => depthScore(node).score);
extendedScores.sort((a, b) => a - b);
const extendedMedian = extendedScores[Math.floor(extendedScores.length / 2)];

const shallowCore = core
  .map((node) => ({ id: node.id, ...depthScore(node) }))
  .filter((item) => item.score < extendedMedian)
  .sort((a, b) => a.score - b.score);

if (shallowCore.length > 0) {
  console.log(
    `\n⚠ 以下核心情境深度分低于扩展组中位数 ${Math.round(extendedMedian)}，建议优先加强：`
  );
  console.table(
    shallowCore.map((item) => ({
      节点: item.id,
      深度分: Math.round(item.score),
      情报条数: item.intelCount,
      反馈字数: Math.round(item.feedbackLen),
      理论字数: Math.round(item.theoryLen),
      角色变体: item.variantCoverage.toFixed(2)
    }))
  );
} else {
  console.log(
    `\n✓ 全部 ${core.length} 个核心情境深度分均不低于扩展组中位数 ${Math.round(extendedMedian)}。`
  );
}
