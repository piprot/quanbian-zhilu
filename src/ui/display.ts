import { ABILITIES, ROLES, RESOURCE_NAMES } from "../core/abilities";
import { optionQualityLabel } from "../core/game";
import type { Language } from "../core/i18n";
import { NPCS } from "../core/npcs";
import { SIDE_QUEST_ARCS } from "../core/story";
import {
  ABILITY_DETAIL_EN,
  ABILITY_EN,
  CHAPTER_EN,
  NPC_EN,
  RESOURCE_EN,
  ROLE_EN,
  SIDE_ARC_EN
} from "../core/translations";
import type {
  AbilityId,
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
