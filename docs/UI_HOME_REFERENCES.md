# 主页信息架构与对决场景 · GitHub 参照说明

状态：2026-08-13。通过 GitHub 搜索同类“管理训练 / 情境决策 / 对战 / 学习平台”项目，确认了两类做法：一是把学习平台主页按用户身份和场景分组，二是把对战/训练场景做成“可见场地 + 中调基底”，而不是用接近全黑的遮罩盖住美术。

## 本次检索到的项目

| 项目 | 可借鉴点 | 对应到本模块 |
| --- | --- | --- |
| [PhishGuard](https://github.com/ManINeedToSleep/PhishingSimulationTool) | 角色化学习主页：按模块分组、进度可视化、情境练习与反馈分离 | 主页四组分类、每组卡片聚合 |
| [michelin/UX-Scape](https://github.com/michelin/UX-Scape) | 桌游式团队训练：把个人练习与多人工作坊明确分开 | 「个人训练」与「团体训练」分组 |
| [juTelles/systemic](https://github.com/juTelles/systemic) | Web 多人合作训练游戏，面向团队而非单人 | 「团体训练」分组 |
| [EthiQuest-AI-Dilemma-Game](https://github.com/EthiQuest/EthiQuest-AI-Dilemma-Game) | 情境决策后形成领导力画像，个人成长闭环 | 「个人训练」下的对决/报告/能力图谱 |
| [SamirSaad786/the-hire-wire](https://github.com/SamirSaad786/the-hire-wire) | 面向教练/培训师的情境判断游戏 | 「培训师模块」分组 |
| [Mystic Realm Duels](https://github.com/MartAndrey/Mystic_Realm_Duels) | 对战场景使用可见场地、元素配色与明亮氛围 | 1v1 大厅/对战场景的亮色基底与滤色混合 |
| [Decision-Duel](https://github.com/Samskriti-0605/Decision-Duel) | 简洁对决界面：高对比操作区，避免黑幕包裹 | 1v1 选项区提高可读性 |

## 已有参照文档中的补充项目

- [prabapro/decision-lab](https://github.com/prabapro/decision-lab)：对决/决策场景应保持内容可见，反馈区域独立。
- [Jooozen/basketball-iq-trainer](https://github.com/Jooozen/basketball-iq-trainer)：训练主页按领域分块，每个领域有进度看板，适合作为「个人训练」子模块布局参考。
- [wAImlim/zheng-he-leadership-simulation](https://github.com/wAImlim/zheng-he-leadership-simulation)：角色选择与课程入口独立成组，减少首页信息密度。
- [TTMK7777/business-simulation-game-v2](https://github.com/TTMK7777/business-simulation-game-v2)：同技术栈（TypeScript + Vite）下的模块化页面组织。

## 借鉴原则

1. 只借鉴信息架构与视觉层次，不复刻任何仓库代码、文案或美术素材。
2. 主页入口按“使用场景”分组，而不是按开发时的模块顺序平铺。
3. 对决/对战场景保留暗色质感，但必须让背景美术可见、文字可读，避免大面积接近全黑的遮罩。
4. 所有改动都要通过现有 audit / smoke / accessibility 门禁。

## 落地对照

| 问题 | 借鉴来源 | 落地方式 |
| --- | --- | --- |
| 1v1 页面过暗 | Decision-Duel、Mystic Realm Duels | 大厅/对战背景增加亮色基底，图片改为 screen 滤色混合，遮罩从 0.96 降到 0.36-0.42 |
| 主页入口平铺凌乱 | PhishGuard、UX-Scape、systemic | 拆成 个人训练 / 团体训练 / 培训师模块 / 系统设置 四组，每组独立标题与子卡片 |
| 卡片美术被黑幕压暗 | basketball-iq-trainer 进度看板 | 组内卡片封面提高透明度与亮度，遮罩底部从 0.92 降到 0.72 |
| 移动端拥挤 | TTMK7777 模块化页面 | 每组 4 列 → 平板 2 列 → 手机 1 列，保持无横向溢出 |
