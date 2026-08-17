import { abilityLevel } from "./abilities.ts";
import { getChapter } from "./story.ts";
import type { AbilityId, RoleId, SaveState } from "./types.ts";

export interface AdaptiveStage {
  id: string;
  titleZh: string;
  titleEn: string;
  focus: AbilityId[];
  chapterId?: number;
}

export interface AdaptiveRoute {
  role: RoleId;
  titleZh: string;
  titleEn: string;
  stages: AdaptiveStage[];
}

export const ADAPTIVE_ROUTES: Record<RoleId, AdaptiveRoute> = {
  parachute: {
    role: "parachute",
    titleZh: "空降管理者 90 天引领路线",
    titleEn: "New Executive 90-Day Guided Route",
    stages: [
      { id: "diagnose", titleZh: "识局 · 权力地图", titleEn: "Diagnose · Power Map", focus: ["insight"], chapterId: 1 },
      { id: "build", titleZh: "建势 · 小胜换授权", titleEn: "Build · Small Wins for Authority", focus: ["strategy"], chapterId: 2 },
      { id: "align", titleZh: "对齐 · 把阻力变成责任", titleEn: "Align · Turn Resistance into Ownership", focus: ["communication"], chapterId: 3 },
      { id: "hold", titleZh: "掌权 · 制度守住边界", titleEn: "Hold · Guard Boundaries with Systems", focus: ["authority"], chapterId: 6 },
      { id: "certify", titleZh: "认证 · 四力达标", titleEn: "Certify · Four Focus Abilities", focus: ["insight", "strategy", "communication", "authority"] }
    ]
  },
  founder: {
    role: "founder",
    titleZh: "创业者 90 天引领路线",
    titleEn: "Founder 90-Day Guided Route",
    stages: [
      { id: "frame", titleZh: "定义 · 一句话问题", titleEn: "Frame · One-Line Problem", focus: ["structure"], chapterId: 1 },
      { id: "deliver", titleZh: "交付 · 现金流证据", titleEn: "Deliver · Cash Flow Evidence", focus: ["execution"], chapterId: 2 },
      { id: "recover", titleZh: "恢复 · 管理精力", titleEn: "Recover · Manage Energy", focus: ["recovery"], chapterId: 4 },
      { id: "shape", titleZh: "定方向 · 检查点校准", titleEn: "Shape · Calibrate with Checkpoints", focus: ["strategy"], chapterId: 5 },
      { id: "certify", titleZh: "认证 · 四力达标", titleEn: "Certify · Four Focus Abilities", focus: ["structure", "execution", "recovery", "strategy"] }
    ]
  },
  highPotential: {
    role: "highPotential",
    titleZh: "高潜人才 90 天引领路线",
    titleEn: "High-Potential 90-Day Guided Route",
    stages: [
      { id: "consensus", titleZh: "横向共识 · 先对齐关键人", titleEn: "Consensus · Align Key People First", focus: ["communication"], chapterId: 1 },
      { id: "expertise", titleZh: "专业 · 用证据立信", titleEn: "Expertise · Build Trust with Evidence", focus: ["structure"], chapterId: 2 },
      { id: "influence", titleZh: "影响力 · 让方案自己获得支持", titleEn: "Influence · Let the Plan Win Support", focus: ["strategy"], chapterId: 4 },
      { id: "system", titleZh: "结构 · 把协作变成机制", titleEn: "System · Turn Collaboration into Process", focus: ["deploy"], chapterId: 6 },
      { id: "certify", titleZh: "认证 · 四力达标", titleEn: "Certify · Four Focus Abilities", focus: ["communication", "deploy", "insight", "structure"] }
    ]
  }
};

export function adaptiveRouteFor(save: SaveState): AdaptiveRoute {
  return ADAPTIVE_ROUTES[save.profile.role] ?? ADAPTIVE_ROUTES.highPotential;
}

function chapterCompleted(save: SaveState, chapterId: number): boolean {
  const record = save.chapterRecords.find(
    (item) => item.chapterId === chapterId
  );
  return Boolean(
    record &&
      getChapter(chapterId).nodeIds.every((nodeId) =>
        record.completedNodeIds.includes(nodeId)
      )
  );
}

export function adaptiveStageRequirements(
  save: SaveState,
  stage: AdaptiveStage,
  language: "zh" | "en"
): string[] {
  const requirements: string[] = [];
  if (stage.chapterId !== undefined) {
    requirements.push(
      language === "en"
        ? `Complete all 9 scenarios in chapter ${stage.chapterId}`
        : `完成第 ${stage.chapterId} 章全部 9 个情境`
    );
  }
  return requirements;
}

export function adaptiveStageTasksDone(
  save: SaveState,
  stage: AdaptiveStage
): boolean {
  if (stage.chapterId !== undefined && !chapterCompleted(save, stage.chapterId)) {
    return false;
  }
  return true;
}

export function adaptiveStageMasteryReady(
  save: SaveState,
  stage: AdaptiveStage
): boolean {
  return stage.focus.every((id) => abilityLevel(save.profile.abilities[id]) >= 4);
}

export function adaptiveProgress(save: SaveState): {
  route: AdaptiveRoute;
  passed: string[];
  currentIndex: number;
  done: boolean;
} {
  const route = adaptiveRouteFor(save);
  const passed = Array.isArray(save.adaptiveRoutePassed)
    ? save.adaptiveRoutePassed.filter((id) =>
        route.stages.some((stage) => stage.id === id)
      )
    : [];
  const currentIndex = route.stages.findIndex(
    (stage) => !passed.includes(stage.id)
  );
  return {
    route,
    passed,
    currentIndex: currentIndex === -1 ? route.stages.length : currentIndex,
    done: currentIndex === -1
  };
}

export function completeAdaptiveStage(
  save: SaveState,
  stageId: string,
  via: "task" | "mastery"
): boolean {
  const progress = adaptiveProgress(save);
  const stage = progress.route.stages[progress.currentIndex];
  if (!stage || stage.id !== stageId || progress.done) {
    return false;
  }
  if (via === "task" && !adaptiveStageTasksDone(save, stage)) {
    return false;
  }
  if (via === "mastery" && !adaptiveStageMasteryReady(save, stage)) {
    return false;
  }
  save.adaptiveRoutePassed = [
    ...(save.adaptiveRoutePassed ?? []),
    stageId
  ];
  save.masteryPoints += 2;
  return true;
}
