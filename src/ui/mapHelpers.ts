import { getChapter, getNode, SIDE_QUEST_ARCS } from "../core/story";
import { isNodeComplete } from "../core/game";
import { uiString, type Language } from "../core/i18n";
import type { SaveState, StoryNode } from "../core/types";
import { sideArcDisplay } from "./display";
import { escapeHtml } from "./escape";
import { storyNodeDisplay } from "./nodeView";

export function canEnterSideNode(nodeId: string, save: SaveState): boolean {
  const arc = SIDE_QUEST_ARCS.find((item) => item.nodes.includes(nodeId));
  if (!arc) {
    return false;
  }
  if (
    arc.id === "trust_rebuild" &&
    save.profile.resources.trust < 30
  ) {
    return false;
  }
  if (
    arc.id === "resilience" &&
    save.profile.resources.influence < 30
  ) {
    return false;
  }
  const index = arc.nodes.indexOf(nodeId);
  if (index > 0) {
    return isNodeComplete(save, arc.nodes[index - 1]);
  }
  const node = getNode(nodeId);
  return getChapter(node.chapterId).nodeIds.some((mainId) =>
    isNodeComplete(save, mainId)
  );
}

export function sideNodeLockReason(
  nodeId: string,
  save: SaveState,
  language: Language
): string {
  const arc = SIDE_QUEST_ARCS.find((item) => item.nodes.includes(nodeId));
  if (!arc) {
    return language === "en" ? "Locked" : "未解锁";
  }
  if (
    arc.id === "trust_rebuild" &&
    save.profile.resources.trust < 30
  ) {
    return language === "en" ? "Needs Trust 30+" : "需要信任 30+";
  }
  if (
    arc.id === "resilience" &&
    save.profile.resources.influence < 30
  ) {
    return language === "en"
      ? "Needs Influence 30+"
      : "需要影响力 30+";
  }
  const index = arc.nodes.indexOf(nodeId);
  if (index > 0 && !isNodeComplete(save, arc.nodes[index - 1])) {
    const previousNode = getNode(arc.nodes[index - 1]);
    const previousView = storyNodeDisplay(language, save, previousNode);
    return language === "en"
      ? `Complete "${previousView.title}" first`
      : `需先完成「${previousView.title}」`;
  }
  const node = getNode(nodeId);
  const mainIds = getChapter(node.chapterId).nodeIds;
  const doneMain = mainIds.filter((id) =>
    isNodeComplete(save, id)
  ).length;
  const chapterReady = mainIds.some((mainId) =>
    isNodeComplete(save, mainId)
  );
  return chapterReady
    ? (language === "en" ? "Available" : "可接取")
    : language === "en"
      ? `Finish Chapter ${getChapter(node.chapterId).code} main scenarios first (${doneMain}/${mainIds.length})`
      : `需先完成第 ${getChapter(node.chapterId).code} 章主线情境（${doneMain}/${mainIds.length}）`;
}

export function questArcMarkup(
  arc: (typeof SIDE_QUEST_ARCS)[number],
  save: SaveState,
  language: Language
): string {
  const doneCount = arc.nodes.filter((id) =>
    isNodeComplete(save, id)
  ).length;
  const done = doneCount === arc.nodes.length;
  const view = sideArcDisplay(language, arc);
  return `
    <div class="quest-arc ${done ? "complete" : ""}">
      <div class="quest-arc-head">
        <div>
          <strong>${view.title}</strong>
          <span>${doneCount} / ${arc.nodes.length} ${language === "en" ? "nodes" : "节点"}</span>
        </div>
        <small>${done ? (language === "en" ? "Complete" : "已完成") : (language === "en" ? "In Progress" : "进行中")}</small>
      </div>
      <p class="quest-summary">${escapeHtml(view.summary)}</p>
      <p class="quest-intro">${escapeHtml(view.intro)}</p>
      <div class="quest-nodes">
        ${arc.nodes
          .map((nodeId, index) => {
            const node = getNode(nodeId);
            const nodeView = storyNodeDisplay(language, save, node);
            const unlocked = canEnterSideNode(nodeId, save);
            const nodeDone = isNodeComplete(save, nodeId);
            return `
              <button class="quest-node ${nodeDone ? "done" : ""} ${unlocked ? "" : "locked"}" data-action="open-node" data-node="${nodeId}" ${unlocked && !nodeDone ? "" : "disabled aria-disabled=\"true\""}>
                <span>${index + 1}</span>
                <div>
                  <strong>${escapeHtml(nodeView.title)}</strong>
                  <em>${nodeDone ? (language === "en" ? "Complete" : "已完成") : unlocked ? (language === "en" ? "Available" : "可接取") : escapeHtml(sideNodeLockReason(nodeId, save, language))}</em>
                </div>
              </button>
            `;
          })
          .join("")}
      </div>
      ${done ? `<p class="quest-conclusion">${escapeHtml(view.conclusion)}</p>` : ""}
    </div>
  `;
}

export function nodeRow(
  node: StoryNode,
  save: SaveState,
  language: Language
): string {
  const done = isNodeComplete(save, node.id);
  const chapter = getChapter(node.chapterId);
  const view = storyNodeDisplay(language, save, node);
  const isExtraMain = node.kind === "main" && /n[3-9]$/.test(node.id);
  const kindLabel =
    node.kind === "side"
      ? uiString(language, "storyKindSide")
      : node.kind === "branch"
        ? uiString(language, "storyKindBranch")
        : node.kind === "random"
          ? uiString(language, "storyKindRandom")
          : isExtraMain
            ? language === "en"
              ? "Extended Main Scenario"
              : "主线扩展情境"
            : uiString(language, "storyKindMain");
  const statusLabel = done
    ? language === "en"
      ? "Complete"
      : "已完成"
    : language === "en"
      ? "Available"
      : "可进入";
  return `
    <button class="node-row ${done ? "done" : ""}" data-action="open-node" data-node="${node.id}" ${done ? "disabled aria-disabled=\"true\"" : ""}>
      <span class="node-state">${done ? "✓" : node.kind === "side" ? "支" : chapter.code}</span>
      <span>
        <strong>${escapeHtml(view.title)}</strong>
        <em>${kindLabel}</em>
      </span>
      <small>${statusLabel}</small>
    </button>
  `;
}
