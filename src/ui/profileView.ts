import { ROLES } from "../core/abilities";
import { ACHIEVEMENTS } from "../core/achievements";
import { globalArchiveStats, roleSlotSummaries } from "../core/game";
import { uiString, type Language } from "../core/i18n";
import { ROLE_EN } from "../core/translations";
import type { RoleId, SaveState } from "../core/types";
import { roleDisplay } from "./display";
import { artAsset } from "./assets";
import { escapeAttr, escapeHtml } from "./escape";

export function profileView(
  save: SaveState,
  language: Language,
  pendingRole: RoleId,
  pendingPerspective?: "male" | "female"
): string {
  const en = language === "en";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="narrow-shell" aria-label="${language === "en" ? "Profile creation" : "创建档案"}">
      ${
        save.profileCreated
          ? `
            <section class="role-slot-panel">
              <p class="eyebrow">${en ? "Role Archives" : "角色档案"}</p>
              <h2>${en ? "Switch roles without deleting progress" : "切换角色，无需删档"}</h2>
              <p class="role-slot-totals">${(() => {
                const stats = globalArchiveStats();
                const savedRoles = stats.savedRoles;
                const totalMastery = stats.totalMastery;
                const completedRoles = stats.completedRoles;
                return en
                  ? `Saved roles ${savedRoles}/3 · Mastery ${totalMastery} · Completed ${completedRoles}/3 · Chapters ${stats.totalChapters}/27 · Duels ${stats.totalDuels} · Trials ${stats.totalTrials} · Global achievements ${stats.uniqueAchievements}/${ACHIEVEMENTS.length}`
                  : `已建档 ${savedRoles}/3 · 累计修炼 ${totalMastery} · 通关角色 ${completedRoles}/3 · 章节 ${stats.totalChapters}/27 · 对局 ${stats.totalDuels} · 试炼 ${stats.totalTrials} · 全局成就 ${stats.uniqueAchievements}/${ACHIEVEMENTS.length}`;
              })()}</p>
              ${
                (() => {
                  const stats = globalArchiveStats();
                  const allRolesDone = stats.savedRoles === 3 && stats.completedRoles === 3;
                  const masteryFull = stats.totalMastery >= 100;
                  const label = allRolesDone
                    ? en
                      ? "All-role completion achieved"
                      : "全角色通关达成"
                    : masteryFull
                      ? en
                        ? "100+ cumulative mastery achieved"
                        : "累计修炼 100+ 达成"
                      : en
                        ? "Global archive grows across roles"
                        : "跨角色全局档案持续积累";
                  return `<div class="role-global-badge">${label}</div>`;
                })()
              }
              <div class="role-slot-list">
                ${roleSlotSummaries()
                  .map((slot) => {
                    const active = slot.role === save.profile.role;
                    return `
                      <div class="role-slot-card ${active ? "active" : ""} ${slot.exists ? "" : "empty"} has-slot-art">
                        <img class="role-slot-avatar" src="${artAsset(`role-${slot.role}.jpg`)}" alt="${roleDisplay(language, slot.role).name}" onerror="this.style.opacity='0'" loading="lazy" />
                        <div class="role-slot-body">
                          <strong>${roleDisplay(language, slot.role).name}</strong>
                          <span>${slot.exists ? `${escapeHtml(slot.name)} · ${en ? "Chapters" : "章节"} ${slot.chapterCount}/9 · ${en ? "Mastery" : "修炼"} ${slot.masteryPoints}` : (en ? "No save yet" : "未建档")}</span>
                          <button data-action="${slot.exists ? "switch-role" : "new-role"}" data-role="${slot.role}">${slot.exists ? (active ? (en ? "Current" : "当前") : (en ? "Switch" : "切换")) : (en ? "Create" : "新建")}</button>
                        </div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `
          : ""
      }
      <section class="panel profile-panel">
        <p class="eyebrow">${en ? "Build Your Leadership Profile" : "建立领导力档案"}</p>
        <h1>${en ? "Choose Your Starting Identity" : "选择你的初始身份"}</h1>
        <p class="muted">${en ? "Your identity sets starting resources and abilities, not your final ceiling." : "身份决定起点资源与初始能力，不决定最终上限。"}</p>
        <form class="profile-form" data-form="profile">
          <label class="field">
            <span>${en ? "Your Name" : "你的名字"}</span>
            <input name="playerName" maxlength="12" placeholder="${en ? "e.g. Alex" : "例如：林远"}" value="${escapeAttr(save.profile.name === "你" ? "" : save.profile.name)}" />
          </label>
          <label class="field">
            <span>${en ? "Title / Alias (optional)" : "名号（可选）"}</span>
            <input name="playerTitle" maxlength="12" placeholder="${en ? "e.g. The Strategist" : "例如：运筹帷幄者"}" value="${escapeAttr(save.profile.title ?? "")}" />
          </label>
          <div class="perspective-row">
            <span>${en ? "Perspective" : "视角"}</span>
            <button type="button" class="${pendingPerspective === "male" ? "selected" : ""}" data-action="set-perspective" data-perspective="male">${en ? "Male" : "男性视角"}</button>
            <button type="button" class="${pendingPerspective === "female" ? "selected" : ""}" data-action="set-perspective" data-perspective="female">${en ? "Female" : "女性视角"}</button>
            <small>${en ? "Affects a few narrative details only." : "仅影响少量叙事细节。"}</small>
          </div>
          <div class="role-grid">
            ${(Object.values(ROLES) as Array<(typeof ROLES)[RoleId]>)
              .map(
                (role) => {
                  const roleView = roleDisplay(language, role.id);
                  return `
                  <button type="button" class="role-card ${pendingRole === role.id ? "selected" : ""}" data-action="select-role" data-role="${role.id}">
                    <img class="role-portrait" src="${artAsset(`role-${role.id}.jpg`)}" alt="${roleView.name}" onerror="this.onerror=null; this.src='./art/role-${role.id}.jpg'" loading="lazy" />
                    <span class="role-name">${roleView.name}</span>
                    <span class="role-desc">${en ? ROLE_EN[role.id].description : role.description}</span>
                    <span class="role-start">${en ? `Start: ${role.startingResources.energy} Energy / ${role.startingResources.trust} Trust` : `起点：${role.startingResources.energy} 精力 / ${role.startingResources.trust} 信任`}</span>
                  </button>
                `;
                }
              )
              .join("")}
          </div>
          <button class="primary" data-action="create-profile">${en ? "Start Your Journey" : "开启征程"}</button>
          <div class="trial-role-preview">
            <strong>${en ? `First chapter trial starts as ${roleDisplay(language, pendingRole).name}` : `首章试玩将以「${roleDisplay(language, pendingRole).name}」开局`}</strong>
            <p>${en ? ROLE_EN[pendingRole].objective : ROLES[pendingRole].objective}</p>
          </div>
          <button data-action="start-without-assessment">${en ? `Start Trial as ${roleDisplay(language, pendingRole).name}` : `以「${roleDisplay(language, pendingRole).name}」进入首章试玩`}</button>
          <small class="profile-note">${uiString(language, "assessmentLater")}</small>
        </form>
      </section>
    </main>
  `;
}
