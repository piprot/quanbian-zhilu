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

## 状态

- axe 桌面/手机 8 视图：0 违规（已自动回归）。
- 真机 VoiceOver / TalkBack：待真机执行。
