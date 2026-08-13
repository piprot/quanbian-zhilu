# 权变之路 · Wave 1 机制规格（二）：能力成长真正改变玩法

> **对应问题**：P0#3 —— 能力等级只影响评分/排行榜/认证/AI 强度，不解锁新选项、情境、路线或结局；升级"没有手感"。

| 项目 | 内容 |
| --- | --- |
| 文档类型 | 机制设计规格（Design Spec），**不含实现代码** |
| 作者 | 文策渊（design-strategist） |
| 代码基线 | 分支 `remediation/wave0`，HEAD `542bd0a`，**工作树未提交改动快照时间 2026-08-07 18:32** |
| 状态 | 待主理人/用户拍板 → 交工程实现 |
| 边界声明 | 本文所有挂载点为**设计建议**，需内容团队与最新工作树复核具体 `nodeId`；本文作者未修改任何 `src/` 代码 |
| 关联文档 | 文档一 `design/wave1-economy-loop.md`（经济闭环），本文 §6 与其协同 |

> ⚠️ **并发提示**：撰写期间 `src/core/game.ts`、`src/core/types.ts`、`src/ui/App.ts` 正被其他成员实时修改（18:30–18:32）。本文方案为**兼容加法**，落地前请以最新工作树复核行号。

---

## 0. 关于"13 条能力"的澄清（重要）

任务描述写"13 条能力"，但代码 `ABILITY_ORDER`（`src/core/abilities.ts` L3–14）**实际只有 10 条**：

```
insight 识人 / deploy 用人 / mobilize 驭人 / strategy 谋权 / authority 掌权
stability 固权 / recovery 情绪自愈 / execution 执行力 / structure 结构思考 / communication 协同沟通
```

推测是把"10 能力 + 3 角色起始配置"误计为 13。本文**以代码为准，覆盖这 10 条**；若后续要补到 13 条，同一张表（§4）按相同模式扩展即可。这是需要用户确认的一个前提（见 §11 决策①）。

---

## 1. 现状复盘：能力等级现在"只长在分数上"

`abilityLevel(exp)`（`abilities.ts` L172，阈值 `[0,4,10,18,28,40]` → 返回 1–6）在代码里被读取的地方：

| 读取点 | 影响 | 是否改变"玩法内容" |
| --- | --- | --- |
| `duel.ts` L111 `scorePick`：`base + relevantLevel*4 + energy/15` | 对决评分 | ❌ 仅数值 |
| `trials.ts` L719 `canEnterTrial`：`abilityLevel < gate.level` 判失败 | 试炼**入场门槛**（已是玩法内容） | ✅ 但只限试炼子系统 |
| `App.ts` L1328 `unlockAbility` banner | 仅在情境页显示"某能力 Lv3+"横幅 | ❌ 纯展示，不改选项 |
| 排行榜 / 认证 / AI 强度 | 结算与展示 | ❌ 仅数值 |

**核心问题**：能力等级除了"试炼入场门"之外，**没有解锁任何主线情境选项、支线分支、路线或结局**。玩家升到 Lv5，只是分数更高、AI 更强——他**做不了之前做不了的事**。这正是评审 P0#3 的靶心。

> 好消息：试炼系统已经证明"用能力等级做门禁"是可行的（`canEnterTrial` L713 是成熟模板）。我们要把同一套门禁语义**从试炼扩展到叙事内容**。

---

## 2. 设计原则与体验目标

### 2.1 唯一原则（所有取舍的裁决标准）

> **Lv3 / Lv5 必须让玩家"明显感到更强的我能做之前做不了的事"。**

具体化为三条可验收标准：

1. **内容增量可见**：达到门槛的当刻，情境页出现一个**之前不存在的高阶行动**（按钮 / 隐藏分支 / 新结局入口），而非只是分数 +N。
2. **不因升级而剥夺**：高阶解锁是**叠加**（additive），绝不替换或移除原有 3 个基础选项——低等级玩家看到的选项，高等级玩家**依然能看到并可用**。
3. **值得**：Lv5 解锁的内容必须显著优于 Lv3（通常是"稀有分支 / 真结局路线"），否则玩家感觉"升了等于没升"。

### 2.2 与 P0#2 的分工

| 维度 | 文档一（经济） | 本文（能力门槛） |
| --- | --- | --- |
| 解锁的"钥匙" | 资源（trust/influence/capital/energy 花费） | 能力等级（abilityLevel ≥ 3 / 5） |
| 解锁的"内容" | 支线弧、情报、训练加速、投资 | 高阶选项、隐藏分支、路线、结局 |
| 协同点 | 能力 Lv3 提高资源收益 ×1.25（E15）；能力 Lv5 + 资源花费解锁最稀有内容 | 见 §6 |

---

## 3. 能力等级阶梯与"单周目可达性"（关键约束）

来自 `.tmp-analysis/` 的 EXP 上限测算（已核对 `ABILITY_EXP_TABLE` 与全部内容底盘产出）：

| 能力 | 单周目 EXP 上限 | 可达等级 | 能到 Lv3? | 能到 Lv5? |
| --- | --- | --- | --- | --- |
| insight 识人 | 14 | Lv3 | ✅ | ❌（阈值 28，差 14） |
| deploy 用人 | 46 | Lv6 | ✅ | ✅ |
| mobilize 驭人 | 35 | Lv6 | ✅ | ✅ |
| strategy 谋权 | 67 | Lv6 | ✅ | ✅ |
| authority 掌权 | 106 | Lv6 | ✅ | ✅ |
| stability 固权 | 24 | Lv4 | ✅ | ❌（阈值 28，差 4） |
| recovery 情绪自愈 | 42 | Lv6 | ✅ | ✅ |
| execution 执行力 | 88 | Lv6 | ✅ | ✅ |
| structure 结构思考 | 116 | Lv6 | ✅ | ✅ |
| communication 协同沟通 | 107 | Lv6 | ✅ | ✅ |

**关键事实**：`insight` 与 `stability` 在**单周目内无法达到 Lv5**（即使计入训练 +6 与试炼经验，仍停在 Lv4）。因此：

- **这两条能力的 Lv5 解锁 = "重玩 / NG+"专属内容**，或需配合文档一 E19「雇外部顾问 +4 经验」才能临门一脚（stability 差 4，恰好够；insight 差 14，仍不够）。
- 设计上必须**显式告知玩家**（UI 标注"重玩可解锁"），避免"我明明升满却没看到 Lv5 内容"的困惑。
- 这是 §11 决策②的议题。

---

## 4. 逐能力 Lv3 / Lv5 解锁表（10 条能力）

> 挂载点 `nodeId` 取自真实底盘（`c1n1`–`c9n2` 主线 / `s1`–`s6` 支线 / `c1b-*`–`c9b-*` 分岔 / `r1`–`r20` 随机，均已确认存在）。具体 `nodeId` 需内容团队与最新工作树复核。
> `成本` 列引用文档一（P0#2）的资源花费，实现时复用同一套 `spendResource`。

| 能力 | Lv3 解锁（内容 / 挂载点 / 成本） | Lv5 解锁（内容 / 挂载点 / 成本） | 可达性 |
| --- | --- | --- | --- |
| **insight 识人** | 隐藏情报线索：c1n1 解锁"提前识别关键反对者"（NODE_INTEL hidden，呼应 E3 深挖情报 −8 energy） | 「逆转留人」隐藏结局：r6 离职面谈解锁（呼应 E20 保人 −30 trust） | Lv3 ✅ / Lv5 ❌单周目→重玩专属 |
| **deploy 用人** | 高阶选项：c2n1 解锁"组建临时攻坚组"（多 1 个 expert 级选项） | 支线：r20 CEO 要你接手新业务 解锁"搭建人才梯队图"（关联试炼 mba_people） | ✅ 均可达 |
| **mobilize 驭人** | 高阶选项：c4n1 解锁"动员大会"（qualityScore +） | 真结局分支：韧性组织弧 s5/s3/s6 解锁"文化共识"结局 | ✅ 均可达 |
| **strategy 谋权** | 路径开放：c3n1 解锁"先立小功再争权"（影响后续 authority 节点） | 隐藏分支：c5n1 解锁"布局谋势"（提升结局权重，关联 mba_supplychain） | ✅ 均可达 |
| **authority 掌权** | 选项：c5n1 解锁"联签机制"（降低风险决策惩罚） | 结局分支：c6n1 解锁"制度化收权"（关联 mba_supplychain authority Lv3） | ✅ 均可达 |
| **stability 固权** | 选项：c6n1 解锁"梯队陪跑"（减缓 trust 衰减，呼应文档一 §4.2） | 真结局：c7n1 解锁"基业长青"路线 | Lv3 ✅ / Lv5 ⚠️单周目差 4，需 E19 顾问 +4 或重玩 |
| **recovery 情绪自愈** | 全局机制：解锁"恢复时段"（每日 energy 回复 +recovery等级×3，呼应文档一 §4.1 上限） | 隐藏分支：c2n2 解锁"抗 burnout 复盘"（energy 下限惩罚减半） | ✅ 均可达 |
| **execution 执行力** | 选项：c2n1 解锁"验收清单"（提升 qualityScore 验收分） | 分支结局：c5n2 解锁"三倍交付"（关联 mba_cashflow execution Lv3） | ✅ 均可达 |
| **structure 结构思考** | 选项：c4n1 解锁"问题定义拆解"（解锁更多 NODE_INTEL） | 真结局：c7n1/c7n2 解锁"系统重构"路线（关联 domain_* 试炼 structure Lv3） | ✅ 均可达 |
| **communication 协同沟通** | 选项：c3n2 解锁"会前对齐"（降低跨部门事件难度） | 真结局：c9n1 解锁"全组织共识"（关联 mba_people communication Lv3） | ✅ 均可达 |

**路线/结局门（ENDING_GATES，设计建议）**：在现有"章节完成 → 结局"逻辑上叠加能力 Lv5 门。建议至少 3 条真结局路线由 Lv5 解锁：

| 真结局路线 | 所需 Lv5 能力 | 触发节点 |
| --- | --- | --- |
| 「基业长青」 | stability | c7n1 |
| 「系统重构」 | structure | c7n1/c7n2 |
| 「全组织共识」 | communication | c9n1 |

> 这些结局路线**在 Lv5 前不可见、不可达**，但 Lv5 之前玩家仍能通过基础选项走到"普通结局"——**绝不因能力不足而失去通关资格**（见 §8）。

---

## 5. App.ts 触发集成（按 abilityLevel 渲染高阶选项）

### 5.1 不改 `node.options` —— 新增独立侧表

新增 `src/core/advancedOptions.ts`：

```ts
// 设计示意（非实现代码）
export interface AdvancedOption {
  id: string;
  nodeId: string;                 // 挂载的情境节点（c1n1 / r6 / s5 ...）
  requiredAbility: AbilityId;
  requiredLevel: 3 | 5;
  cost?: { key: ResourceKey; amount: number };   // 与文档一联动
  effects?: Partial<Record<AbilityId, number>>;
  resources?: Partial<Record<ResourceKey, number>>;
  outcomeNodeId?: string;         // 解锁的隐藏分支 / 结局节点
  label: { zh: string; en: string };
  summary: { zh: string; en: string };
}
export const ADVANCED_OPTIONS: AdvancedOption[] = [ /* ... 见 §4 表 ... */ ];
```

### 5.2 门禁判定 —— 复用 `canEnterTrial` 模板

`trials.ts` L718–740 已跑通"能力门 + 章节门 + 资源门 + 成本门"五重判定。本文引入同语义的两个纯函数（放在 `advancedOptions.ts` 或 `game.ts`），**全项目门禁语义统一**：

```ts
// 设计示意
function meetsGate(save: SaveState, o: AdvancedOption): boolean {
  return abilityLevel(save.profile.abilities[o.requiredAbility]) >= o.requiredLevel;
}
function canAfford(save: SaveState, o: AdvancedOption): boolean {
  if (!o.cost) return true;
  return save.profile.resources[o.cost.key] >= o.cost.amount;
}
```

### 5.3 在 `renderStory` 中渲染"高阶行动"面板

现有 `App.ts` L1328 `unlockAbility` 横幅（L1375–1384）**只展示不生效**。改为：在该横幅下方新增一个 `renderAdvancedOptions(node)` 段，遍历 `ADVANCED_OPTIONS.filter(o => o.nodeId === node.id)`：

- **满足 `meetsGate` 且 `canAfford`** → 渲染为可点按钮，点击后复用现有 `applyStoryChoice(save, { effects, resources })` 的结算路径（或等价 mutation），跳转到 `outcomeNodeId`。
- **满足 `meetsGate` 但不 `canAfford`** → 按钮置灰，显示"需 [资源名] X"（与文档一经济联动）。
- **不满足 `meetsGate`** → 显示锁定态"需 [能力名] LvX"（insight/stability 的 Lv5 额外标注"重玩可解锁"）。

> **关键点**：高阶行动是 `node.options` **之外**的独立 UI 面板，**绝不往 `STORY_NODES[].options` 里塞第 4 项**——这是 content-audit 红线（见 §7）。同时完全复用既有 `applyStoryChoice` 资源/能力结算，与文档一经济一致。

### 5.4 既有 `unlockAbility` 横幅的演进

保留 L1375 横幅作为"即时反馈"，但文案升级为引导："**[能力名] LvX 已解锁高阶行动 ↓**"，箭头指向下方新增面板。让玩家**明确感知**升级带来的内容增量（满足 §2.1 标准 1）。

---

## 6. 与文档一（经济闭环）的协同

| 协同点 | 文档一（经济） | 文档二（能力） | 合力 |
| --- | --- | --- | --- |
| **能力 Lv3 资源收益 ×1.25** | E15：能力 Lv3 使该情境资源产出 ×1.25 | Lv3 触发的"高阶选项"本身也吃这个倍率 | 升到 Lv3 既解锁内容、又提高产出，双回馈 |
| **最稀有内容的"双钥匙"** | trust −25 / capital −50 等大额花费 | insight/stability 的 Lv5 + 资源花费解锁隐藏分支 | "能力够 + 愿意花资源"才拿到最稀有内容，避免单一维度碾压 |
| **回路二（关系资本）** | trust 支付 → 支线弧 → 给 insight/stability 经验 | insight/stability 经验正是单周目最缺的 | 能力门槛与资源循环正向耦合（呼应文档一 §5.2 回路二） |
| **energy 作为通用货币** | 合并后 energy 有 19 个 sink | 部分高阶选项成本用 energy（如 insight Lv3 的 NODE_INTEL 解锁 −8 energy） | 一次花费，两处生效 |

> 实现顺序建议：**先落地文档一 E15（能力 Lv3 收益倍率）**，因为它与本文 §5 的高阶选项渲染是**同一个改动点**（`applyStoryChoice` 资源结算处），可一并完成。

---

## 7. content-audit 3-选项约束的处理（工程红线）

`scripts/content-audit.mjs` L83 强制 `node.options.length === 3`，L86 强制每节点有 `NODE_INTEL`；`App.ts` `roleOptionView`（L4995）用 `index % 3` 索引 `ROLE_OPTION_SETS`。

**结论**：任何"给情境加第 4 个选项"的做法都会撞审计且破坏 `index % 3` 管线。本文方案**从架构上规避**：

1. 高阶行动走独立 `ADVANCED_OPTIONS` 侧表，**不修改 `STORY_NODES[].options`**，审计绿灯。
2. 若高阶行动需要双语文案，按 `label/summary: { zh, en }` 字段，**不走 `ROLE_OPTION_SETS` 的 `index % 3` 体系**（那是给基础 3 选项用的）。
3. 隐藏分支节点（`outcomeNodeId` 指向的节点）若是**全新节点**，需补 `NODE_INTEL`（L86 要求）与 `en` 双语键，纳入审计范围。

---

## 8. 边界（Boundaries）

1. **叠加而非替换（additive）**：高阶选项**追加**在 3 个基础选项之外，低等级玩家看到的选项高等级玩家全部保留。杜绝"升级反而选项变少"。
2. **绝不卡死主线**：所有"真结局路线"都有对应的"普通结局"兜底；能力不足只失去**额外路线**，不失去**通关资格**（满足文档一 P3）。
3. **解锁必须"值得"**：Lv5 内容显著优于 Lv3（稀有分支 / 真结局），由 §4 表与 playtest 验收；若出现"Lv5 和 Lv3 差不多"的项，退回重做。
4. **单周目不可达的 Lv5 必须明示**：insight/stability 的 Lv5 面板标注"重玩可解锁"，并提供 E19「雇外部顾问 +4」作为 stability 的临门一脚路径。
5. **不改经验阈值表**：`ABILITY_EXP_TABLE` 属评分/排行榜/认证系统，本文不动（文档一 §2.3 非目标一致）。
6. **不引入新资源**：不新增第五种资源做解锁钥匙，复用现有 4 项 + 能力等级两把钥匙。

---

## 9. 风险与红线

| 风险 | 等级 | 说明 | 兜底 |
| --- | --- | --- | --- |
| **升级无手感（P0#3 复发）** | 🔴 红线 | 若 Lv5 解锁内容薄弱，等于没解决原问题 | §2.1 三标准 + playtest 验收"明显感到更强" |
| **卡死主线** | 🔴 红线 | 真结局路线变成唯一出口 | §8 #2：普通结局兜底；主线节点永不加能力门槛 |
| **破坏 content-audit** | 🟡 | 误把高阶选项塞进 `node.options` | §7：独立侧表，不碰 `node.options` |
| **认知过载** | 🟠 | 高阶面板 + 基础选项 + 经济按钮同屏过挤 | 高阶面板仅在 `meetsGate` 满足时出现；未满足时只显示锁定提示 |
| **主导策略（只刷某能力）** | 🟠 | 玩家发现某能力 Lv5 收益碾压，全局面只养它 | 各能力解锁内容**互相独立、不可互相替代**；无单一"最优能力" |
| **单周目不可达误导** | 🟠 | insight/stability Lv5 玩家以为 bug | §8 #4：UI 明示"重玩可解锁" |
| **并发改写** | 🟠 | 工作树实时改动 | 落地前复核最新工作树行号 |

---

## 10. 分期落地建议

### 10.1 MVP（Wave 1 必做）
1. **建 `ADVANCED_OPTIONS` 侧表骨架 + `meetsGate`/`canAfford`**（复用 `canEnterTrial` 模板）—— 零审计风险。
2. **接入 `renderStory` 的"高阶行动"面板**，先挂 **4–6 条核心能力**的 Lv3 解锁（建议 insight/deploy/strategy/authority/execution/communication，覆盖 6 个章节主题）。
3. **升级 `unlockAbility` 横幅文案**为引导箭头。
4. **落地文档一 E15**（能力 Lv3 资源收益 ×1.25）—— 与本文同改动点。

### 10.2 目标层
- 补齐剩余能力的 Lv3 解锁 + 全部 Lv5 解锁。
- `ENDING_GATES` 真结局路线（stability/structure/communication 三条）。
- insight/stability Lv5 的"重玩专属"标注 + E19 顾问路径。

### 10.3 愿景层
- 高阶选项与文档一经济深度联动（双钥匙稀有内容）。
- 能力组合解锁（如"strategy Lv5 + authority Lv5"解锁联合结局）。

---

## 11. 需要用户拍板的决策

> 以下方向我**保留为草案**，不替用户定稿。具体数值与挂载点交由内容团队与 playtest 校准。

**决策① · 能力条数确认（前提）**
- **A 按代码 10 条（推荐）**：以 `ABILITY_ORDER` 为准，本文 §4 覆盖这 10 条。
- B 补到 13 条：需先定义新增的 3 条能力（名称/经验源/定位），本文 §4 表按相同模式扩展。
- **推荐 A**：与代码基线一致，避免凭空造能力。

**决策② · insight / stability 单周目不可达 Lv5 怎么处理**
- **A 标为"重玩专属"（推荐）**：Lv5 面板明示"重玩可解锁"，不强行让单周目可达。
- B 给这两能力额外 EXP 源：在 3 星章节 / 挑战奖励里给 insight/stability 加权，使其单周目可达 Lv5。
- C 降低这两能力的 Lv5 阈值：把 `ABILITY_EXP_TABLE` 末档从 28 调到更低（⚠️ 会牵动评分/排行榜/认证，**不推荐**，违反 §8 #5 非目标）。
- **推荐 A**：最干净；stability 可额外提供 E19 顾问 +4 作为临门一脚。

**决策③ · MVP 覆盖范围**
- **A 核心 6 能力 Lv3（推荐）**：insight/deploy/strategy/authority/execution/communication，最快验证"升级有手感"。
- B 全部 10 能力 Lv3：内容量大，MVP 周期更长。
- C 仅 4 能力 Lv3 + 2 能力 Lv5：更聚焦但样本少。
- **推荐 A**：覆盖 6 个章节主题，足以在 playtest 中验证 §2.1 三标准。

**决策④ · 真结局路线是否 Wave 1 做**
- **A 路线门留接口、内容 Wave 2（推荐）**：MVP 先打通"高阶选项"机制，真结局 `ENDING_GATES` 在目标层落地，避免 MVP 范围膨胀。
- B Wave 1 即做 3 条真结局：范围大、需结局系统配合。
- **推荐 A**：机制优先，内容后置。

---

*（文档二完。与文档一 `design/wave1-economy-loop.md` 共同构成 Wave 1 的两项 P0 设计规格。）*
