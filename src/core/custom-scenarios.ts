import type { StoryNode } from "./types";

export type CustomOptionQuality = "expert" | "partial" | "risk";

export interface CustomScenarioOption {
  label: string;
  summary: string;
  feedback: string;
  quality: CustomOptionQuality;
}

export interface CustomScenario {
  id: string;
  title: string;
  context: string;
  stake: string;
  options: CustomScenarioOption[];
  createdAt: number;
}

export interface CustomScenarioInput {
  title: string;
  context: string;
  stake: string;
  options: CustomScenarioOption[];
}

const STORAGE_KEY = "adaptive-ascent-custom-scenarios-v1";

export function validateCustomScenario(
  input: CustomScenarioInput
): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push("标题不能为空");
  if (!input.context.trim()) errors.push("现场描述不能为空");
  if (!input.stake.trim()) errors.push("利害关系不能为空");
  if (input.options.length !== 3) {
    errors.push("必须提供 3 个选项");
  } else {
    const qualities = input.options.map((option) => option.quality);
    if (!qualities.includes("expert")) errors.push("必须包含一个专家选项");
    if (!qualities.includes("partial")) errors.push("必须包含一个部分有效选项");
    if (!qualities.includes("risk")) errors.push("必须包含一个高风险选项");
    input.options.forEach((option, index) => {
      if (!option.label.trim()) errors.push(`第 ${index + 1} 个选项缺少标题`);
      if (!option.summary.trim()) errors.push(`第 ${index + 1} 个选项缺少摘要`);
      if (!option.feedback.trim()) errors.push(`第 ${index + 1} 个选项缺少反馈`);
    });
  }
  return errors;
}

export function createCustomScenario(
  input: CustomScenarioInput,
  now = Date.now()
): CustomScenario {
  return {
    id: `custom-${now}-${Math.floor(Math.random() * 100000)}`,
    title: input.title.trim(),
    context: input.context.trim(),
    stake: input.stake.trim(),
    options: input.options.map((option) => ({
      label: option.label.trim(),
      summary: option.summary.trim(),
      feedback: option.feedback.trim(),
      quality: option.quality
    })),
    createdAt: now
  };
}

export function customScenarioToNode(
  scenario: CustomScenario
): StoryNode {
  return {
    id: scenario.id,
    chapterId: 9,
    title: scenario.title,
    kind: "main",
    context: scenario.context,
    stake: scenario.stake,
    options: scenario.options.map((option) => ({
      label: option.label,
      summary: option.summary,
      quality: option.quality,
      effects: {},
      resources: {},
      feedback: option.feedback,
      theory: "自定义情境：由玩家或教练提交，用于团队研讨与复盘。"
    }))
  };
}

export function loadCustomScenarios(): CustomScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CustomScenario[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomScenarios(
  scenarios: CustomScenario[]
): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    return true;
  } catch {
    return false;
  }
}

export function exportCustomScenarios(
  scenarios: CustomScenario[]
): string {
  return JSON.stringify(
    {
      app: "shengwei-game-starter",
      kind: "custom-scenarios",
      version: 1,
      scenarios
    },
    null,
    2
  );
}

export function importCustomScenarios(
  text: string,
  now = Date.now()
): CustomScenario[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(
          (parsed as { scenarios?: unknown }).scenarios
        )
        ? (parsed as { scenarios: CustomScenarioInput[] }).scenarios
        : [];
    return list
      .filter(
        (item): item is CustomScenarioInput =>
          Boolean(item) &&
          typeof item === "object" &&
          validateCustomScenario(item).length === 0
      )
      .map((item) => createCustomScenario(item, now));
  } catch {
    return [];
  }
}
