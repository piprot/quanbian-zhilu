import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import { escapeHtml } from "./escape";

// 设置页需要从 App 读到的少量 UI 态（不属于存档或语言）。
export interface SettingsState {
  muted: boolean;
  musicMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  version: string;
}

// 难度选择器：菜单页与设置页共用，故单独导出。
export function difficultySelector(save: SaveState, language: Language): string {
  const options: Array<{ id: "normal" | "pressure" | "extreme"; label: string }> = [
    { id: "normal", label: uiString(language, "difficultyNormal") },
    { id: "pressure", label: uiString(language, "difficultyPressure") },
    { id: "extreme", label: uiString(language, "difficultyExtreme") }
  ];
  const buttons = options
    .map(
      (option) => `
        <button
          class="diff-btn ${save.difficulty === option.id ? "active" : ""}"
          data-action="set-difficulty"
          data-difficulty="${option.id}"
        >${escapeHtml(option.label)}</button>`
    )
    .join("");
  const note =
    save.difficulty === "normal"
      ? language === "en"
        ? "Active: no resource scaling, no story timer, standard trial energy, untimed duels"
        : "已生效：资源不缩放、剧情无时限、试炼精力标准、对决不强制计时"
      : save.difficulty === "pressure"
        ? language === "en"
          ? "Active: 1.4x resource losses, story/duel rounds from 22s (scaled by text length), 1.15x trial energy, more disruptions"
          : "已生效：资源损耗 1.4 倍、剧情/对决 22 秒起（随文本长度增加）、试炼精力 1.15 倍、干扰更多"
        : language === "en"
          ? "Active: 1.8x resource losses, story/duel rounds from 14s (scaled by text length), 1.3x trial energy, frequent disruptions"
          : "已生效：资源损耗 1.8 倍、剧情/对决 14 秒起（随文本长度增加）、试炼精力 1.3 倍、干扰频繁";
  return `
    <div class="mini-panel difficulty-panel">
      <h3>${uiString(language, "difficultyLabel")} <span class="diff-active">${language === "en" ? "Active" : "已生效"}</span></h3>
      <div class="diff-row">${buttons}</div>
      <p class="muted">${escapeHtml(note)}</p>
    </div>`;
}

export function settingsView(
  save: SaveState,
  language: Language,
  state: SettingsState
): string {
  const en = language === "en";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="settings-shell" aria-label="${uiString(language, "settingsTitle")}">
      <section class="settings-hero">
        <p class="eyebrow">${uiString(language, "settingsTitle")}</p>
        <h1>${en ? "One place to tune the experience" : "一个地方，管理你的体验"}</h1>
      </section>
      <section class="settings-grid">
        <div class="settings-panel">
          <h2>${en ? "Audio & Language" : "声音与语言"}</h2>
          <button data-action="toggle-sound">${state.muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
          <button data-action="toggle-music">${state.musicMuted ? uiString(language, "musicOff") : uiString(language, "musicOn")}</button>
          <label class="field">
            <span>${uiString(language, "musicVolume")}</span>
            <select data-select="music-volume">
              <option value="0" ${state.musicVolume === 0 ? "selected" : ""}>0</option>
              <option value="25" ${state.musicVolume === 25 ? "selected" : ""}>25</option>
              <option value="50" ${state.musicVolume === 50 ? "selected" : ""}>50</option>
              <option value="75" ${state.musicVolume === 75 ? "selected" : ""}>75</option>
              <option value="100" ${state.musicVolume === 100 ? "selected" : ""}>100</option>
            </select>
          </label>
          <label class="field">
            <span>${en ? "SFX Volume" : "音效音量"}</span>
            <select data-select="sfx-volume">
              <option value="0" ${state.sfxVolume === 0 ? "selected" : ""}>0</option>
              <option value="25" ${state.sfxVolume === 25 ? "selected" : ""}>25</option>
              <option value="50" ${state.sfxVolume === 50 ? "selected" : ""}>50</option>
              <option value="75" ${state.sfxVolume === 75 ? "selected" : ""}>75</option>
              <option value="100" ${state.sfxVolume === 100 ? "selected" : ""}>100</option>
            </select>
          </label>
          <button data-action="preview-sfx">${en ? "Preview SFX" : "试听音效"}</button>
          <button data-action="toggle-language">${uiString(language, "language")}</button>
          ${
            state.musicVolume === 0 || state.sfxVolume === 0
              ? `<p class="muted volume-zero-note">${en ? "Volume is 0: audio stays silent while toggles are on." : "音量为 0：开关虽为开，当前仍无声。"}</p>`
              : ""
          }
        </div>
        <div class="settings-panel">
          <h2>${uiString(language, "difficultyLabel")}</h2>
          ${difficultySelector(save, language)}
        </div>
        <div class="settings-panel">
          <h2>${uiString(language, "settingsHelp")}</h2>
          <p>${uiString(language, "settingsHelpText")}</p>
        </div>
        <div class="settings-panel">
          <h2>${uiString(language, "settingsData")}</h2>
          <button data-action="open-assessment">${uiString(language, "assessmentReopen")}</button>
          <button data-action="export-save">${uiString(language, "exportSave")}</button>
          <button data-action="export-analytics">${language === "en" ? "Export Event Log" : "导出事件日志"}</button>
          <button data-action="export-return-package">${language === "en" ? "Export Return Package" : "生成回传包"}</button>
          <button data-action="import-save">${uiString(language, "importSave")}</button>
          <label class="file-button">
            ${uiString(language, "importSave")}
            <input type="file" data-import-save accept="application/json" hidden />
          </label>
          <button data-action="reset-profile">${uiString(language, "resetProfile")}</button>
          <p class="muted">${language === "en" ? `Version ${state.version} · Static build` : `版本 ${state.version} · 静态版`}</p>
        </div>
        <div class="settings-panel">
          <h2>${uiString(language, "settingsAccessibility")}</h2>
          <p>${uiString(language, "shortcutsTitle")}</p>
          <p class="muted">${uiString(language, "shortcutsText")}</p>
          <p>${uiString(language, "fontSize")}</p>
          <div class="settings-actions">
            <button data-action="settings-font-size" data-size="0.9">90%</button>
            <button data-action="settings-font-size" data-size="1">100%</button>
            <button data-action="settings-font-size" data-size="1.15">115%</button>
          </div>
          <p class="muted">${en ? "Reduced-motion preferences are respected by the UI." : "界面已支持系统减少动态效果偏好。"}</p>
        </div>
        <div class="settings-panel">
          <h2>${language === "en" ? "About Ascend" : "关于升维"}</h2>
          <p>${language === "en" ? "Ascend is an offline-first leadership scenario game based on The Book of Power, Heifetz adaptive leadership, and scenario-golf scoring." : "升维是一款基于《权经》九章架构、Heifetz 自适应领导力与情境高尔夫计分法的可离线领导力情境游戏。"}</p>
          <p class="muted">${language === "en" ? "v1.1 · standard mode has no decision timer; failed chapters can be retried; duels can be resumed after refresh." : "v1.1 · 标准档不计时；未达一星的章节可重打；对局刷新后可续战。"}</p>
          <p class="muted">${language === "en" ? "Static content includes the full campaign, role branches, 9 side quests, training formulas, trials, local duels, save export/import and manual WebRTC. Account, cloud save, leaderboard and auto-match are bundled and become active in the online build." : "静态版包含完整主线、角色分岔、9 个支线、训练公式、试炼、本地对战、存档导出/导入与手动远程对战；账号、云存档、排行榜与自动匹配已内置，在线版构建后启用。"}</p>
        </div>
        <div class="settings-panel">
          <h2>${language === "en" ? "Feedback for Coaches" : "体验反馈"}</h2>
          <label>${language === "en" ? "Rating" : "评分"}<select data-feedback-rating>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value} / 5</option>`).join("")}</select></label>
          <label>${language === "en" ? "Feedback" : "反馈内容"}<textarea data-feedback-text rows="3" maxlength="800" placeholder="${language === "en" ? "What worked, what confused you, and what you would change." : "哪些有效、哪里困惑、最想改什么。"}"></textarea></label>
          <button data-action="generate-feedback">${language === "en" ? "Copy Feedback Package" : "生成并复制反馈"}</button>
        </div>
      </section>
    </main>
  `;
}
