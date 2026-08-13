# 内容管线

## 当前结构

- `src/core/story.ts`：主线、支线、分支、随机事件数据
- `src/core/roleOptions.ts`：角色独立选项模板
- `src/core/assessment.ts`：30 题能力测评
- `src/core/training.ts`：10 项能力的经典故事、训练路线和测验题
- `src/core/trainingExtras.ts`：训练问题、类比、公式/模型、角色应用、例题和题解
- `src/core/trials.ts`：成长试炼、MBA 高难案例和修炼任务
- `PROGRESSION_DESIGN.md`：成长循环、解锁逻辑和 GitHub 参照
- `scripts/content-audit.mjs`：内容完整性审计
- `scripts/unit-test.mjs`：核心数据单元测试

## 目标

把“模板组合生成”逐步升级为“手写内容 + 生成校验”：

1. 每个章节维护三套手写角色分支
2. 每个角色分支拥有独立选项、说明、反馈
3. 随机事件拥有权重、前置、NPC 影响、结局影响
4. 审计能发现重复文本、缺失引用、缺失情报

## 内容新增流程

1. 在 `story.ts` 增加节点
2. 在 `NODE_INTEL` 增加情报
3. 如果新增角色分支，配置 `branchTo`
4. 如果新增随机事件，加入 `RANDOM_EVENT_META`
5. 运行 `npm run content-audit`
6. 运行 `npm run test:unit`

## 后续

- 将 `roleOptions.ts` 从模板改为按节点维护的手写数据
- 为每条分支增加专属 NPC 和结局差异
- 将随机事件扩到 20-30 个
