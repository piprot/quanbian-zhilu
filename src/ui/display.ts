import { ABILITIES, ROLES, RESOURCE_NAMES } from "../core/abilities";
import { ACHIEVEMENTS } from "../core/achievements";
import { ASSESSMENT_QUESTIONS } from "../core/assessment";
import type { ChallengeState } from "../core/challenges";
import { optionQualityLabel } from "../core/game";
import type { Language } from "../core/i18n";
import { NPCS } from "../core/npcs";
import { CHAPTER_REFLECTIONS, SIDE_QUEST_ARCS } from "../core/story";
import {
  ABILITY_DETAIL_EN,
  ABILITY_EN,
  ACHIEVEMENT_EN,
  ASSESSMENT_EN,
  CHAPTER_EN,
  CHAPTER_REFLECTION_EN,
  CHALLENGE_EN,
  NPC_EN,
  RESOURCE_EN,
  ROLE_EN,
  SIDE_ARC_EN
} from "../core/translations";
import type {
  AbilityId,
  AiArchetype,
  ChapterDef,
  OptionQuality,
  ResourceKey,
  RoleId
} from "../core/types";

/** 显示辅助：从 App 抽出的、仅依赖 language 的纯格式化函数。 */

export function rankName(
  language: Language,
  rank: { name: string; nameEn: string }
): string {
  return language === "en" ? rank.nameEn : rank.name;
}

export function chapterDisplay(
  language: Language,
  chapter: ChapterDef
): ChapterDef {
  if (language !== "en") return chapter;
  const en = CHAPTER_EN[chapter.id];
  return en
    ? { ...chapter, title: en.title, subtitle: en.subtitle }
    : chapter;
}

export function abilityDisplay(
  language: Language,
  id: AbilityId
): { name: string; tagline: string } {
  const ability = ABILITIES[id];
  const en = ABILITY_EN[id];
  return language === "en" && en
    ? { name: en.name, tagline: en.tagline }
    : { name: ability.name, tagline: ability.tagline };
}

export function abilityDetailDisplay(language: Language, id: AbilityId) {
  const en = ABILITY_DETAIL_EN[id];
  return language === "en" && en
    ? en
    : {
        subSkills: ABILITIES[id].subSkills,
        trainingPath: ABILITIES[id].trainingPath,
        sources: ABILITIES[id].sources
      };
}

export function roleDisplay(
  language: Language,
  role: RoleId
): { name: string; shortName: string } {
  const def = ROLES[role];
  const en = ROLE_EN[role];
  return language === "en" && en
    ? { name: en.name, shortName: en.shortName }
    : { name: def.name, shortName: def.shortName };
}

export function resourceDisplay(language: Language, key: ResourceKey): string {
  return language === "en" ? RESOURCE_EN[key] : RESOURCE_NAMES[key];
}

export function qualityLabel(language: Language, quality: OptionQuality): string {
  if (language === "en") {
    return quality === "expert"
      ? "Expert Response"
      : quality === "partial"
        ? "Partially Effective"
        : "High-Risk Response";
  }
  return optionQualityLabel(quality);
}

export function npcDisplay(
  language: Language,
  npc: (typeof NPCS)[number]
): { name: string; title: string; description: string } {
  const en = NPC_EN[npc.id];
  return language === "en" && en
    ? { name: en.name, title: en.title, description: en.description }
    : { name: npc.name, title: npc.title, description: npc.description };
}

export function relationStatusText(language: Language, status: string): string {
  if (language !== "en") return status;
  if (status === "已建立关系") return "Established";
  if (status === "存在线索") return "Lead Found";
  return "Not Contacted";
}

export function sideArcDisplay(
  language: Language,
  arc: (typeof SIDE_QUEST_ARCS)[number]
): { title: string; summary: string; intro: string; conclusion: string } {
  const en = SIDE_ARC_EN[arc.id];
  return language === "en" && en
    ? {
        title: en.title,
        summary: en.summary,
        intro: en.intro,
        conclusion: en.conclusion
      }
    : {
        title: arc.title,
        summary: arc.summary,
        intro: arc.intro,
        conclusion: arc.conclusion
      };
}

export function npcAvatarColor(id: string): string {
  const colors: Record<string, string> = {
    "npc-assistant": "#4db7d6",
    "npc-finance": "#e9826c",
    "npc-ops": "#f2c14e",
    "npc-young": "#57c7a3",
    "npc-veteran": "#d97aa2",
    "npc-chen": "#5ca9e9",
    "npc-shen": "#8f8cd9",
    "npc-xu": "#7fb069",
    "npc-he": "#e9b872",
    "npc-tang": "#d4a5e8",
    "npc-fang": "#e9826c"
  };
  return colors[id] ?? "#41c7c0";
}

export function achievementDisplay(language: Language, id: string) {
  const fallback = ACHIEVEMENTS.find((item) => item.id === id);
  const en = ACHIEVEMENT_EN[id];
  return language === "en" && en
    ? { name: en.name, description: en.description }
    : {
        name: fallback?.name ?? id,
        description: fallback?.description ?? ""
      };
}

export function challengeDisplay(language: Language, challenge: ChallengeState) {
  const en = CHALLENGE_EN[challenge.id];
  return language === "en" && en
    ? { ...challenge, title: en.title, description: en.description }
    : challenge;
}

export function challengeCategoryLabel(
  language: Language,
  category: "ability" | "chapter" | "trial" | "duel"
): string {
  if (language === "en") {
    return (
      {
        ability: "Ability",
        chapter: "Chapter",
        trial: "Trial",
        duel: "Duel"
      }[category] ?? category
    );
  }
  return (
    {
      ability: "能力",
      chapter: "章节",
      trial: "试炼",
      duel: "对决"
    }[category] ?? category
  );
}

export function assessmentDisplay(
  language: Language,
  question: (typeof ASSESSMENT_QUESTIONS)[number]
) {
  const en = ASSESSMENT_EN[question.id];
  if (language !== "en" || !en) return question;
  return {
    ...question,
    prompt: en.prompt,
    options: question.options.map((option, index) => ({
      ...option,
      label: en.options[index] ?? option.label
    }))
  };
}

export function chapterReflectionText(
  language: Language,
  chapterId: number
): string {
  return language === "en"
    ? CHAPTER_REFLECTION_EN[chapterId] ?? ""
    : CHAPTER_REFLECTIONS[chapterId] ?? "";
}

export function aiArchetypeLabel(
  language: Language,
  archetype: AiArchetype
): string {
  if (language === "en") {
    return archetype === "executor"
      ? "Iron Executor"
      : archetype === "builder"
        ? "Relationship Builder"
        : "Gambler";
  }
  return archetype === "executor"
    ? "铁血执行者"
    : archetype === "builder"
      ? "关系构建者"
      : "赌徒";
}

export function leadershipLensText(
  language: Language,
  quality: OptionQuality
): string {
  if (language === "en") {
    if (quality === "expert") {
      return "Adaptive move: diagnose from the balcony, hold the tension, and give the work back to the team. This builds long-term capacity instead of short-term compliance.";
    }
    if (quality === "partial") {
      return "Technical move: it solves the symptom quickly but keeps ownership with you. Follow up by returning the work and adding a check node.";
    }
    return "Authority or avoidance move: useful only for urgent technical problems. Used too often, it suppresses dissent and the team stops bringing real information.";
  }
  if (quality === "expert") {
    return "自适应动作：登台观察、稳住张力、把工作还给团队。它建设的是长期能力，而不是短期服从。";
  }
  if (quality === "partial") {
    return "技术性解决：快速处理了症状，但责任仍在你手里。下一步要把工作还回去，并补一个验证节点。";
  }
  return "权威或回避动作：只适合紧急的技术问题。用得太多，会压住不同意见，团队不再带真实信息上来。";
}

export function roleMove(
  language: Language,
  role: RoleId,
  quality: OptionQuality
): string {
  const label = roleDisplay(language, role).shortName;
  if (language === "en") {
    if (role === "parachute") {
      return quality === "expert"
        ? `${label} play: diagnose the power map before acting publicly`
        : quality === "partial"
          ? `${label} play: build authority first, repair relationships later`
          : `${label} play: move fast and set boundaries without waiting for consensus`;
    }
    if (role === "founder") {
      return quality === "expert"
        ? `${label} play: validate cash flow before scaling`
        : quality === "partial"
          ? `${label} play: protect delivery before adding systems`
          : `${label} play: push decisively and test fast`;
    }
    return quality === "expert"
      ? `${label} play: build horizontal consensus before deciding`
      : quality === "partial"
        ? `${label} play: win key support before broad execution`
        : `${label} play: escalate around resistance`;
  }
  if (role === "parachute") {
    return quality === "expert"
      ? `${label}打法：先诊断权力结构，再公开行动`
      : quality === "partial"
        ? `${label}打法：先建立权威，再补关系`
        : `${label}打法：快速立威，不等待共识`;
  }
  if (role === "founder") {
    return quality === "expert"
      ? `${label}打法：先验证现金流，再规模化`
      : quality === "partial"
        ? `${label}打法：先保交付，再谈体系`
        : `${label}打法：用创始人权力强推，快速试错`;
  }
  return quality === "expert"
    ? `${label}打法：先建立横向共识，再推动决策`
    : quality === "partial"
      ? `${label}打法：先争取关键支持，再尝试落地`
      : `${label}打法：越级推动，绕过部门阻力`;
}
