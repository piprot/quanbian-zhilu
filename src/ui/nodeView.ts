import { branchVariantFor } from "../core/branchVariants";
import { duelBankEn } from "../core/duelBank";
import type { Language } from "../core/i18n";
import { EXTRA_MAIN_OPTIONS_EN } from "../core/mainScenarios";
import { ROLE_OPTION_SETS } from "../core/roleOptions";
import { randomEventVariantContext } from "../core/story";
import {
  BRANCH_NODE_EN,
  FORK_NODE_EN,
  MAIN_NODE_EN,
  MAIN_NODE_THEORY_EN,
  RANDOM_NODE_EN,
  ROLE_OPTION_EN,
  SIDE_NODE_EN
} from "../core/translations";
import type { SaveState, StoryNode } from "../core/types";

/** 情境节点展示视图：按语言/角色/难度/随机事件轮次把节点与选项本地化。 */
export function storyNodeDisplay(
  language: Language,
  save: SaveState,
  node: StoryNode
): StoryNode {
  if (node.id.startsWith("duel-")) {
    return language === "en" ? duelBankEn(node) : node;
  }
  if (
    language === "en" &&
    node.kind === "main" &&
    /n[3-9]$/.test(node.id)
  ) {
    const enOptions = EXTRA_MAIN_OPTIONS_EN[node.id];
    if (enOptions) {
      return {
        ...node,
        options: node.options.map((option, index) => ({
          ...option,
          ...(enOptions[index] ?? {})
        }))
      };
    }
  }
  if (node.kind === "random" && language === "zh") {
    const variant = randomEventVariantContext(
      save.profile.role,
      save.difficulty,
      save.randomEventCycle ?? 0,
      "zh"
    );
    return {
      ...node,
      context: `${node.context} ${variant}`.trim()
    };
  }
  if (language !== "en") return node;
  if (node.kind === "side") {
    const side = SIDE_NODE_EN[node.id];
    if (!side) return node;
    return {
      ...node,
      title: side.title,
      context: side.context,
      stake: side.stake,
      options: node.options.map((option, index) => ({
        ...option,
        ...(side.options[index] ?? {})
      }))
    };
  }
  if (node.kind === "random") {
    const random = RANDOM_NODE_EN[node.id];
    if (!random) return node;
    const variant = randomEventVariantContext(
      save.profile.role,
      save.difficulty,
      save.randomEventCycle ?? 0,
      "en"
    );
    return {
      ...node,
      title: random.title,
      context: `${random.context} ${variant}`.trim(),
      stake: random.stake,
      options: node.options.map((option, index) => ({
        ...option,
        ...(random.options[index] ?? {})
      }))
    };
  }
  if (node.kind === "branch") {
    const fork = FORK_NODE_EN[node.id];
    if (fork) {
      return {
        ...node,
        title: fork.title,
        context: fork.context,
        stake: fork.stake,
        options: node.options.map((option, index) => ({
          ...option,
          ...(fork.options[index] ?? {})
        }))
      };
    }
    const branch = BRANCH_NODE_EN[node.id];
    if (!branch) return node;
    return {
      ...node,
      title: branch.title,
      context: branch.context,
      stake: branch.stake,
      options: node.options.map((option, index) => {
        const handwritten = branchVariantFor(
          node.chapterId,
          option.quality,
          "en"
        );
        if (handwritten) {
          return {
            ...option,
            label: handwritten.label,
            summary: handwritten.summary,
            feedback: handwritten.feedback
          };
        }
        const set = ROLE_OPTION_EN[save.profile.role][option.quality];
        const sourceSet =
          ROLE_OPTION_SETS[save.profile.role][option.quality];
        const sourceIndex = sourceSet.findIndex(
          (view) => view.label === option.label
        );
        const qualityIndex = node.options
          .slice(0, index)
          .filter((item) => item.quality === option.quality).length;
        const view = set[
          sourceIndex >= 0 ? sourceIndex : qualityIndex % set.length
        ];
        return {
          ...option,
          label: view.label,
          summary: view.summary,
          feedback: view.feedback
        };
      })
    };
  }
  const en = MAIN_NODE_EN[node.id];
  const theories = MAIN_NODE_THEORY_EN[node.id];
  return en
    ? {
        ...node,
        title: en.title,
        context: en.context,
        stake: en.stake,
        options: node.options.map((option, index) => {
          const set = ROLE_OPTION_EN[save.profile.role][option.quality];
          const sourceSet =
            ROLE_OPTION_SETS[save.profile.role][option.quality];
          const sourceIndex = sourceSet.findIndex(
            (view) => view.label === option.label
          );
          const qualityIndex = node.options
            .slice(0, index)
            .filter((item) => item.quality === option.quality).length;
          const view = set[
            sourceIndex >= 0 ? sourceIndex : qualityIndex % set.length
          ];
          return {
            ...option,
            label: view.label,
            summary: view.summary,
            feedback: view.feedback,
            theory: theories?.[index] ?? option.theory
          };
        })
      }
    : node;
}
