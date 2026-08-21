import { ABILITIES, ABILITY_ORDER, ROLES } from "./abilities.ts";
import type {
  AbilityId,
  OptionQuality,
  ResourceKey,
  RoleId,
  StoryNode
} from "./types.ts";

export type AiDifficulty = "easy" | "medium" | "hard";
export type AiLanguage = "zh" | "en";

export interface AiScenarioInput {
  role: RoleId;
  abilities: Record<AbilityId, number>;
  abilityId: AbilityId;
  difficulty: AiDifficulty;
  chapterId: number;
  seed: number;
  language: AiLanguage;
}

const DIFFICULTY_NOTE: Record<
  AiDifficulty,
  { zh: string; en: string }
> = {
  easy: {
    zh: "局面刚起，信息还不算复杂。",
    en: "The situation is early and the signals are still readable."
  },
  medium: {
    zh: "两股力量同时拉扯，任何选择都有代价。",
    en: "Two forces pull at once; every choice has a cost."
  },
  hard: {
    zh: "时间紧迫，多方信息互相矛盾，容错很低。",
    en: "Time is short, signals conflict, and the margin for error is thin."
  }
};

const ABILITY_SITUATIONS: Record<
  AbilityId,
  { zh: string; en: string }
> = {
  insight: {
    zh: "你面前站着两个都很有说服力的关键人，真正的事实藏在他们的利益里。",
    en: "Two persuasive key people stand before you, and the real facts sit inside their interests."
  },
  deploy: {
    zh: "一个关键岗位出现了空缺，候选人的长板突出，短板也清晰可见。",
    en: "A key role is open; the candidate's strength is obvious and so is the gap."
  },
  mobilize: {
    zh: "团队嘴上不说，动作却开始减速，你需要把人心重新聚起来。",
    en: "The team slows down without saying why; you must bring people back into motion."
  },
  strategy: {
    zh: "你还没有正式授权，但一个能改变局面的机会正从窗口经过。",
    en: "You do not yet have formal authority, and a window that could change the game is passing."
  },
  authority: {
    zh: "有人绕过你的边界直接做了决定，场面没有失控，但信号很危险。",
    en: "Someone decided past your boundary; the room has not collapsed, but the signal is dangerous."
  },
  stability: {
    zh: "组织开始依赖你个人运转，你越是忙，越发现没人接得住。",
    en: "The organization starts running through you personally; the busier you get, the fewer people can hold it."
  },
  recovery: {
    zh: "连续高压之后，你的判断开始变钝，但下一场硬仗就在明天。",
    en: "After sustained pressure, your judgment is dulling, and the next hard fight is tomorrow."
  },
  execution: {
    zh: "目标很清晰，资源却不够，所有人都在等一个取舍。",
    en: "The goal is clear but resources are short, and everyone is waiting for one trade-off."
  },
  structure: {
    zh: "你收到大量互相冲突的信息，问题本身还很模糊。",
    en: "Conflicting information floods in while the problem itself is still vague."
  },
  communication: {
    zh: "跨部门会议陷入了立场对抗，目标一致，语言却各说各话。",
    en: "The cross-team meeting turns into positional combat; goals align but language does not."
  }
};

export function generateAiScenario(input: AiScenarioInput): StoryNode {
  const en = input.language === "en";
  const ability = ABILITIES[input.abilityId];
  const roleName = ROLES[input.role].name;
  const situation = ABILITY_SITUATIONS[input.abilityId];
  const note = DIFFICULTY_NOTE[input.difficulty];
  const title = en
    ? `${ability.name} · Dynamic Dilemma`
    : `${ability.name} · 动态两难`;
  const context = en
    ? `${roleName} lens · ${ability.name}: ${situation.en} ${note.en}`
    : `${roleName}视角 · ${ability.name}现场：${situation.zh}${note.zh}`;
  const stake = en
    ? "The key is not choosing something impressive, but seeing who can move the result and where the cost will land."
    : "这一局的关键不是选得漂亮，而是先看清谁能推动结果、代价落在哪里。";
  const expertLabel = en
    ? "Diagnose first, then act with a verifiable standard"
    : "先诊断，再行动，握紧验证标准";
  const partialLabel = en
    ? "Hold the room steady, then verify the key variable"
    : "先稳住场面，再补上关键验证";
  const riskLabel = en
    ? "Send a strong signal now and pay for it openly"
    : "立刻亮明态度，公开承担代价";
  return {
    id: `ai-${input.seed}-${input.abilityId}-${input.difficulty}`,
    chapterId: input.chapterId,
    title,
    kind: "random",
    context,
    stake,
    options: [
      {
        label: expertLabel,
        summary: en
          ? "Turn the contradiction into a small verifiable test."
          : "把矛盾变成一个可以快速验证的小测试。",
        quality: "expert",
        effects: { [input.abilityId]: 2 },
        resources: { trust: 1 },
        feedback: en
          ? "The situation starts moving in your direction and trust is not lost."
          : "这一手让局面开始向你可控的方向移动，信任没有丢。",
        theory: en
          ? "Diagnose first, act second, and keep the verification standard in your own hands."
          : "先诊断、再行动，把验证标准握在自己手里。"
      },
      {
        label: partialLabel,
        summary: en
          ? "Stabilize the room and buy time to check facts."
          : "先稳住在场的人，争取时间核实事实。",
        quality: "partial",
        effects: { [input.abilityId]: 1 },
        resources: { capital: -1 },
        feedback: en
          ? "The room is steady for now, but the key variable is still unverified."
          : "局面暂时稳住，但关键变量还没有验证。",
        theory: en
          ? "Hold the line first, then close the verification gap."
          : "先稳住，再补上验证，别把悬而未决当结论。"
      },
      {
        label: riskLabel,
        summary: en
          ? "Use a strong public signal to break the deadlock."
          : "用强公开信号打破僵局，同时亮出代价。",
        quality: "risk",
        effects: { [input.abilityId]: 3 },
        resources: { trust: -2 },
        feedback: en
          ? "The signal lands loudly and the cost starts to show."
          : "信号很强，代价也开始显现。",
        theory: en
          ? "Strong signals can break a room, but they require an exit route."
          : "强信号可以破局，也要为代价预留退路。"
      }
    ]
  };
}

export function validateAiScenario(value: unknown): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== "object") {
    return ["AI scenario must be an object"];
  }
  const node = value as Partial<StoryNode>;
  if (typeof node.id !== "string" || !node.id) errors.push("missing node id");
  if (typeof node.title !== "string" || !node.title.trim()) {
    errors.push("missing title");
  }
  if (typeof node.context !== "string" || !node.context.trim()) {
    errors.push("missing context");
  }
  if (typeof node.stake !== "string" || !node.stake.trim()) {
    errors.push("missing stake");
  }
  if (!Number.isInteger(node.chapterId)) errors.push("chapterId must be an integer");
  if (!Array.isArray(node.options) || node.options.length < 2) {
    errors.push("options must contain at least 2 items");
    return errors;
  }
  const validQualities: OptionQuality[] = ["expert", "partial", "risk"];
  for (const option of node.options as Array<Partial<StoryNode["options"][number]>>) {
    if (typeof option.label !== "string" || !option.label.trim()) {
      errors.push("option label missing");
    }
    if (!option.quality || !validQualities.includes(option.quality)) {
      errors.push(`invalid option quality: ${String(option.quality)}`);
    }
    if (!option.effects || typeof option.effects !== "object") {
      errors.push("option effects missing");
    } else {
      for (const abilityId of Object.keys(option.effects)) {
        if (!ABILITY_ORDER.includes(abilityId as AbilityId)) {
          errors.push(`unknown ability effect: ${abilityId}`);
        }
      }
    }
  }
  return errors;
}

export function weakestAbilityFor(
  abilities: Record<AbilityId, number>
): AbilityId {
  return ABILITY_ORDER.slice().sort(
    (a, b) => abilities[a] - abilities[b]
  )[0];
}
