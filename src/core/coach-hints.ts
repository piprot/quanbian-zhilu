import type {
  AbilityId,
  RoleId,
  SaveState,
  StoryNode
} from "./types.ts";
import { ABILITIES, abilityLevel } from "./abilities.ts";
import {
  ABILITY_EN,
  BRANCH_NODE_EN,
  FORK_NODE_EN,
  MAIN_NODE_EN,
  RANDOM_NODE_EN,
  SIDE_NODE_EN
} from "./translations.ts";
import { scenarioShellFor } from "./scenarioShell.ts";

export type CoachHintLanguage = "zh" | "en";

export interface CoachHintInput {
  node: StoryNode;
  save: SaveState;
  language: CoachHintLanguage;
  seed?: number;
}

const CRISIS_QUESTIONS: Record<string, { zh: string; en: string }> = {
  "authority vacuum": {
    zh: "权力真空里，先补关键位置，还是先补决策规则？",
    en: "In an authority vacuum, fill the critical seat first or set the decision rules first?"
  },
  "faction rivalry": {
    zh: "两派都在等你表态，先听哪一派的信息更完整？",
    en: "Both factions are waiting for you; which side holds the more complete picture?"
  },
  "key talent churn": {
    zh: "谁是不可替代的，谁只是暂时离不开？",
    en: "Who is truly irreplaceable and who is only temporarily essential?"
  },
  "strategic shift": {
    zh: "转型期先保护现金流，还是先让团队看见新方向？",
    en: "During the shift, protect cash flow first or show the team the new direction first?"
  },
  "merger integration": {
    zh: "先统一汇报线，还是先统一考核口径？",
    en: "Unify reporting lines first or performance criteria first?"
  },
  "process disorder": {
    zh: "先补流程，还是先让关键业务恢复节奏？",
    en: "Fix the process first or restore the business rhythm first?"
  },
  "succession gap": {
    zh: "继任断层的真正风险，是能力缺口还是信任缺口？",
    en: "Is the succession risk really a capability gap or a trust gap?"
  },
  "market crisis": {
    zh: "市场危机里，先止损还是先找新增长点？",
    en: "In a market crisis, cut losses first or find the next growth point?"
  },
  "growth stall": {
    zh: "增长停滞时，先改进老业务，还是先开新战场？",
    en: "When growth stalls, improve the core business first or open a new front?"
  }
};

const CHAPTER_ASKS: Record<number, { zh: string; en: string }> = {
  1: {
    zh: "先弄清楚谁掌握关键信息，还是先搭一套事实核验流程？",
    en: "Find out who holds the critical information first, or build a verification routine first?"
  },
  2: {
    zh: "先向上对齐授权，还是先让关键支持者看到你的判断？",
    en: "Align authority upward first, or let key supporters see your judgment first?"
  },
  3: {
    zh: "先确认谁真正适合这个位置，还是先补眼前的能力缺口？",
    en: "Confirm who truly fits the role first, or patch the immediate capability gap first?"
  },
  4: {
    zh: "先扩大共识，还是先让核心圈形成承诺？",
    en: "Broaden consensus first, or turn the core circle into committed owners first?"
  },
  5: {
    zh: "先守住执行节奏，还是先解决授权边界？",
    en: "Protect the execution cadence first, or settle the delegation boundary first?"
  },
  6: {
    zh: "先立规矩，还是先稳住关键关系？",
    en: "Set the rules first, or stabilize the key relationships first?"
  },
  7: {
    zh: "先把成果制度化，还是先把团队能力补上？",
    en: "Institutionalize the results first, or close the team capability gaps first?"
  },
  8: {
    zh: "先止血恢复，还是先重构流程？",
    en: "Stop the bleeding and recover first, or rebuild the process first?"
  },
  9: {
    zh: "先守住基本盘，还是先打开新增长？",
    en: "Defend the core business first, or open the next growth curve first?"
  }
};

const KIND_LABELS: Record<StoryNode["kind"], { zh: string; en: string }> = {
  main: { zh: "主线情境", en: "main scenario" },
  side: { zh: "支线情境", en: "side quest" },
  branch: { zh: "角色分支", en: "role branch" },
  random: { zh: "随机事件", en: "random event" }
};

const ROLE_COACH_NOTES: Record<RoleId, { zh: string; en: string }> = {
  parachute: {
    zh: "你还在建立信任期，动作要能被验证。",
    en: "You are still building credibility; make moves you can verify."
  },
  founder: {
    zh: "资源有限，先活下来再谈制度。",
    en: "Resources are tight; survive before you institutionalize."
  },
  highPotential: {
    zh: "没有职位授权，靠专业和关系推动。",
    en: "You lack positional authority; drive through expertise and relationships."
  }
};

function abilityText(
  id: AbilityId,
  en: boolean
): { name: string; tagline: string } {
  return en ? ABILITY_EN[id] : ABILITIES[id];
}

function weakestAffectedAbility(
  node: StoryNode,
  save: SaveState
): AbilityId | null {
  const relevant = [
    ...new Set(
      node.options.flatMap((option) =>
        Object.keys(option.effects) as AbilityId[]
      )
    )
  ];
  if (relevant.length === 0) return null;
  return relevant.sort(
    (a, b) =>
      abilityLevel(save.profile.abilities[a] ?? 0) -
      abilityLevel(save.profile.abilities[b] ?? 0)
  )[0];
}

function excerpt(context: string, max: number): string {
  const clean = context.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sentenceEnd = clean.search(/[。；！？.!?]/);
  if (sentenceEnd > 0 && sentenceEnd + 1 <= max) {
    return clean.slice(0, sentenceEnd + 1);
  }
  return `${clean.slice(0, max).trimEnd()}…`;
}

function hintStyle(node: StoryNode, seed: number | undefined): number {
  const base =
    Math.abs(seed ?? 1) +
    node.id.length * 7 +
    node.chapterId * 13 +
    node.options.length * 3;
  return base % 3;
}

const CJK_PATTERN = /[一-鿿]/;

/**
 * 英文提示的自包含翻译。node.title 已是英文（调用方已通过 storyNodeDisplay
 * 本地化）则原样使用；否则按节点类型从 EN 翻译表取 title/context，保证
 * 无论调用方传入已翻译还是原始 node，英文提示都不混中文。
 */
function enNodeText(
  node: StoryNode
): { title: string; context: string } {
  if (!CJK_PATTERN.test(node.title)) {
    return { title: node.title, context: node.context };
  }
  let entry: { title: string; context: string } | undefined;
  if (node.kind === "main") entry = MAIN_NODE_EN[node.id];
  else if (node.kind === "side") entry = SIDE_NODE_EN[node.id];
  else if (node.kind === "random") entry = RANDOM_NODE_EN[node.id];
  else entry = FORK_NODE_EN[node.id] ?? BRANCH_NODE_EN[node.id];
  if (!entry) return { title: node.title, context: node.context };
  return { title: entry.title, context: entry.context };
}

/**
 * Generate a scenario-specific coach hint.
 *
 * The hint is derived from the node title and context, the chapter focus, the
 * scenario shell (industry/team/crisis for main scenarios), the player's
 * weakest relevant ability, and the player's role. Every scenario therefore
 * receives a distinct observation and coaching question instead of the same
 * generic ability reminder.
 */
export function scenarioCoachHint(input: CoachHintInput): string {
  const { node, save, language, seed } = input;
  const en = language === "en";
  const shell =
    node.kind === "main"
      ? scenarioShellFor(node.chapterId, seed ?? save.scenarioSeed ?? 1)
      : undefined;
  const weak = weakestAffectedAbility(node, save);
  const kindLabel = KIND_LABELS[node.kind][language];
  const ask =
    (shell && CRISIS_QUESTIONS[shell.key]?.[language]) ||
    CHAPTER_ASKS[node.chapterId]?.[language] ||
    (en
      ? "What is the real tension this situation asks you to resolve?"
      : "这一局真正要你解决的核心张力是什么？");
  const roleNote = ROLE_COACH_NOTES[save.profile.role][language];
  const abilityLine = weak
    ? en
      ? `This scenario stretches your ${abilityText(weak, true).name} most.`
      : `本局最考验你的「${abilityText(weak, false).name}」。`
    : en
      ? "Coach sees no single ability dominating here; read the relationships before you decide."
      : "教练看到本局没有单一能力主导，先读关系再行动。";
  const { title, context } = en
    ? enNodeText(node)
    : { title: node.title, context: node.context };
  const lead = shell
    ? en
      ? `This is "${title}" (${shell.en}): ${excerpt(context, 90)}`
      : `本局「${title}」是${shell.zh}场景：${excerpt(context, 44)}`
    : en
      ? `This is "${title}" (${kindLabel}): ${excerpt(context, 90)}`
      : `本局「${title}」（${kindLabel}）：${excerpt(context, 44)}`;
  const style = hintStyle(node, seed);
  if (style === 0) {
    return `${lead} ${ask} ${abilityLine} ${roleNote}`.trim();
  }
  if (style === 1) {
    return `${ask} ${lead} ${abilityLine} ${roleNote}`.trim();
  }
  return `${lead} ${abilityLine} ${ask} ${roleNote}`.trim();
}
