import { ABILITIES, ROLES, RESOURCE_NAMES } from "../core/abilities";
import { optionQualityLabel } from "../core/game";
import type { Language } from "../core/i18n";
import {
  ABILITY_DETAIL_EN,
  ABILITY_EN,
  CHAPTER_EN,
  RESOURCE_EN,
  ROLE_EN
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
