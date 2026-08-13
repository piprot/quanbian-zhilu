import type { SaveState } from "./types";

export interface NpcDef {
  id: string;
  name: string;
  title: string;
  nodeId: string;
  arcId?: string;
  description: string;
}

export const NPCS: NpcDef[] = [
  {
    id: "npc-assistant",
    name: "行政主管",
    title: "组织信息节点",
    nodeId: "c1n2",
    description: "她比大多数管理层更清楚谁真正在影响组织。"
  },
  {
    id: "npc-finance",
    name: "财务经理",
    title: "资源真相守卫者",
    nodeId: "c1n2",
    description: "她的账本里藏着前任遗留的决策痕迹。"
  },
  {
    id: "npc-ops",
    name: "运营负责人",
    title: "资深阻力者",
    nodeId: "c4n1",
    description: "他的反对来自真实交付风险，也来自对新流程的失控感。"
  },
  {
    id: "npc-young",
    name: "年轻骨干",
    title: "可培养的独立执行者",
    nodeId: "c3n2",
    description: "他等待的不是批准，而是一个清晰的授权边界。"
  },
  {
    id: "npc-veteran",
    name: "老将",
    title: "核心客户守护者",
    nodeId: "c3n1",
    description: "他掌握客户，也害怕被组织边缘化。"
  },
  {
    id: "npc-chen",
    name: "陈屿",
    title: "被羞辱的核心员工",
    nodeId: "s1",
    arcId: "trust_rebuild",
    description: "他能力很强，但那次公开羞辱几乎让他失去继续表达的勇气。"
  },
  {
    id: "npc-shen",
    name: "沈捷",
    title: "销售负责人",
    nodeId: "s4",
    arcId: "trust_rebuild",
    description: "他擅长进攻客户，却不擅长在谈判中保护团队的一致性。"
  },
  {
    id: "npc-xu",
    name: "小许",
    title: "新人管培生",
    nodeId: "s2",
    arcId: "trust_rebuild",
    description: "她方案里有未经打磨的洞察，需要有人先保护她说话。"
  },
  {
    id: "npc-he",
    name: "何川",
    title: "数据工程师",
    nodeId: "s5",
    arcId: "resilience",
    description: "他能最快定位错误范围，但总在关键时被加班拖垮。"
  },
  {
    id: "npc-tang",
    name: "唐岚",
    title: "深夜同事",
    nodeId: "s3",
    arcId: "resilience",
    description: "她负责客户提案，也需要一个不被打断的恢复时段。"
  },
  {
    id: "npc-fang",
    name: "方然",
    title: "团队情绪中心",
    nodeId: "s6",
    arcId: "resilience",
    description: "连续失败后，他既想离开，也不愿意看到团队解散。"
  }
];

export interface NpcRelation {
  status: "已建立关系" | "存在线索" | "尚未接触";
  note: string;
}

export function npcRelation(save: SaveState, npc: NpcDef): NpcRelation {
  if (save.npcLeads?.includes(npc.id)) {
    return {
      status: "存在线索",
      note: "你在随机事件中发现了与这个人相关的线索，关系还有待继续深入。"
    };
  }
  if (
    npc.nodeId.startsWith("s") &&
    save.completedSideQuests.includes(npc.nodeId)
  ) {
    return {
      status: "已建立关系",
      note: "你在支线中选择真正面对了这个人，关系开始成为组织能力。"
    };
  }
  if (npc.nodeId.startsWith("c")) {
    const chapterId = Number(npc.nodeId.slice(1, 2));
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapterId
    );
    if (record && record.completedNodeIds.includes(npc.nodeId)) {
      return {
        status: "存在线索",
        note: "你在这个情境中接触过他，但还没有形成长期关系。"
      };
    }
  }
  return {
    status: "尚未接触",
    note: "完成对应主线或支线后，他/她会进入人物关系图。"
  };
}
