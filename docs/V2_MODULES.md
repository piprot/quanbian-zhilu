# V2 未接线模块处置清单

状态：2026-08-10。以下模块随并行 `main` 提交进入仓库。`coach-workshop` 已在 1.5.19 正式接入；其余模块未被 `main.ts` / `App.ts` 引用，也不在 `dist` 产物中（除 CSS 类名 `scenario-shell` 外），当前线上不生效。

## 模块清单

| 模块 | 内容 | 与现有系统的关系 | 处置建议 |
| --- | --- | --- | --- |
| `src/core/story-enhanced.ts` | 27 个节点、5 条支线、章间过渡节点 | 与 `story.ts` 数据重复，node id / 成就 / 进度不兼容 | 保留为内容增强候选；先做 content-audit 与存档兼容验证，再决定是否合并 |
| `src/core/coach-workshop.ts` | 教练端工作坊：小组雷达、决策盲区、讨论引导、实时推演 | 独立新功能，不替换现有系统 | 已接入（1.5.19）：菜单入口「教练工作坊」+ 演示/JSON 导入 + 小组雷达/盲区/讨论/工作坊流程；实时推演仍为后续迭代 |
| `src/core/duel-v2.ts` | 1v1 V2：情报购买、资源下注、暗牌、揭示、结算 | 与 `duel.ts` 接口兼容但玩法变化大 | 暂不替换；先做功能开关 A/B，验证玩法后再上线 |
| `src/core/scenario-shell.ts` | 程序化情境外壳 V2：行业×规模×危机+利益相关方矩阵 | 与已上线的 `scenarioShell.ts` 功能重叠，API 不兼容 | 保留为沙盒模式候选；待 UX 设计后接线 |

## 判定原则

1. 不把“更完整但会替换现有数据/玩法”的模块直接接线，避免破坏已验收的进度、成就、对局与内容审计。
2. 独立新功能（coach-workshop）已按最高优先级接入正式菜单。
3. 所有未接线模块保持可编译、可测试状态，并在文档中持续标注 `EXPERIMENTAL`。

## 复验命令

```bash
npm run build
rg -o "CoachWorkshopEngine|DuelEngineV2|STORY_NODES_ENHANCED|ScenarioShellGenerator" dist -g "*.js"
```

期望：构建通过，`dist` 中不出现上述标识符。

## 资产状态

- `public/npc/npc-tang.jpg` 与 `public/npc/npc-fang.jpg` 已入库（远程提交 `2118b23` / `a274e46`），人物关系页 11 张 NPC 位图全部可用。
- 位图加载失败自动回退到首字头像的逻辑保留，作为弱网/资源异常时的兜底，不依赖新增资产。
