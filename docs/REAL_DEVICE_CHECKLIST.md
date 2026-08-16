# 真机与跨设备验收清单

## 真机无障碍（VoiceOver / TalkBack）

- iOS Safari：全文朗读建档 → 能力图 → 主线 → 训练 → 1v1。
- Android Chrome：TalkBack 聚焦顺序完整，无未命名按钮。
- 大字体 200%：菜单、地图、剧情、报告无横向溢出。
- 横屏与深色模式切换后无元素重叠。

## 跨浏览器 / 跨设备存档恢复

- 自动回归：`npm run save-roundtrip`（导出 → 导入往返，含进度哈希校验），已纳入 CI。
- 手工矩阵：Chrome / Edge / Safari 之间互导存档 JSON 与复制链接。
- PWA 离线安装后：清除缓存再打开，确认 Service Worker 版本戳更新且旧缓存被清理。

## 远程对局恢复

- 自动回归：远程 WebRTC 断线会自动保存 `adaptive-ascent-duel-snapshot-v1`，大厅显示“Resume Duel / 继续上次对局”，可转 AI 续战。
- 手工矩阵：远程对局进行到第 2 回合后断网，确认快照存在、恢复后轮次与分数连续，且旧快照在完成或重开时清理。
- 事件周期：完成一轮 36 个随机事件后旋转，确认 `randomEventCycle` 增加、角色/难度变体文案出现、二周目事件不重复。

## 跨网络 NAT 穿透真机验收（远程对战）

> 目标：验证真机在真实公网环境下的 P2P / relay 能力，这是「远程对战」能否跨网络使用的关键前提。

前提：
- 两台物理设备（iPhone Safari + Android Chrome，或任意两台真机）。
- 两台设备处于**不同**网络（如一台连家庭宽带 Wi-Fi、一台连手机蜂窝热点），避免同 NAT 兜底掩盖问题。

步骤：
1. A 机进入 1v1 → 手动远程，创建房间得到邀请码。
2. B 机切换到另一网络，输入邀请码加入。
3. 抓 ICE 候选判断连接路径（Chrome 用 `chrome://webrtc-internals`，Safari 用「开发 → 显示 Web Inspector」后看 RTCPeerConnection）：
   - 出现主机候选（`host`）即 P2P 直连；
   - 仅 srflx / relay 候选则走了 STUN/TURN，需确认是否可完成对局。
4. 完成至少 6 回合对局，记录是否流畅、有无中途断连。
5. 第 2 回合后断网一次，验证快照恢复后轮次与分数连续。

通过标准：跨网络对局成功率 ≥ 90%；若无法直连，明确记录 NAT 类型与是否需部署 TURN。

记录表：

| 设备 | 网络 | NAT 类型 | 候选路径 | 对局完整 | 断线恢复 |
|---|---|---|---|---|---|
| A 机（iOS） | 家庭 Wi-Fi | | | | |
| B 机（Android） | 蜂窝热点 | | | | |

## 状态

- axe 桌面/手机 8 视图：0 违规（已自动回归）。
- 真机 VoiceOver / TalkBack：待真机执行。
- 跨网络 NAT 穿透：待真机执行。
