# 升维 · Ascend 角色与训练审查

## 审查问题

1. 游戏是否符合自适应特点？
2. 三个角色（空降管理者 / 创业者 / 高潜人才）是否各具特点？
3. 每个角色的对应训练是否完整充分？

## GitHub 参照项目

修改前检索并参照：

- `nikkimehr/adaptiveleadership`：自适应领导力模拟，参照情境变化 → 诊断 → 干预的分层。
- `Jonathan-Havener/LeadershipGame`、`phursen/LeadershipGame`：领导力决策游戏，参照选择 → 后果 → 复盘闭环。
- `AndyFeegan/Situational-Leadership`、`Abdulrahman-6811/leadership-assessment`：情境领导力四象限与自评报告，用于校验“该指导还是该授权”。
- `claire-np/semantic-course-navigator`：基于角色的学习路径生成，参照按角色组织训练序列的做法。
- `OussamaHm/Shadow_Mentor`：角色化入职伴学，参照角色差异化的训练入口与进度提示。

## 审计结论

### 自适应特点

- 已闭环：能力门槛、难度档、路线选择、随机事件权重、AI 对手按玩家能力分布生成、训练公式与例题、对局快照续战、周常与无尽挑战。
- 本轮补充：AI 对手不再固定为“创业者”，改为按对局数在空降 / 创业 / 高潜三角色间轮换，让玩家反复面对三种角色特质的对手。

### 三角色差异化

- 三个角色各有独立焦点能力、起始能力与资源、情境视角、角色选项集（3 品质 × 3 措辞）、18 个主线节点的角色情境变体。
- 训练数据中已存在 30 条“角色应用”（10 能力 × 3 角色，中英齐全），但此前界面没有展示。

### 训练完整充分性

- 10 项能力训练全部具备：问题定义、类比、应用要点、公式、举一反三例题、30 道测验题。
- 三个角色的 12 个焦点能力全部有对应训练与角色应用。
- 本轮补充：每个角色新增 5 阶段训练路线（诊断/建势/对齐/掌权/认证 等），能力页展示路线进度与角色落地动作，训练页展示当前能力的角色应用。

## 本轮修改

1. `src/core/roleTraining.ts`：新增三套角色训练路线（主题、说明、陷阱、5 阶段与焦点能力）。
2. `src/ui/App.ts`：
   - 能力页新增“角色训练路线”面板（阶段进度、公式、角色落地动作、已完成标记）。
   - 训练页新增“角色应用”面板。
   - AI 对手按对局数轮换三角色。
3. `src/styles.css`：角色路线与角色应用样式。
4. `scripts/role-audit.mjs`：新增 `npm run role-audit` 角色训练审计脚本。

## 验证

- `npm run build` PASS
- `npm run role-audit` PASS（issueCount: 0）
- `npm run leadership-audit` PASS（issueCount: 0）
- `npm run test:unit` PASS
- `npm run content-audit` PASS
- `npm run i18n-audit` PASS
- `npm test` PASS
- `npm run audit` PASS
- `npm run test:features` PASS
