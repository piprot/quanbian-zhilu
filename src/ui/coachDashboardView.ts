import type { CoachStudentSummary } from "../core/coach-analytics";
import { uiString, type Language } from "../core/i18n";
import { getNode } from "../core/story";
import type { RoleId } from "../core/types";
import { abilityDisplay, roleDisplay } from "./display";
import { escapeHtml } from "./escape";

export interface CoachDashboardViewState {
  students: CoachStudentSummary[];
  selectedIndex: number;
  local: CoachStudentSummary;
  loading: boolean;
  error?: string;
}

function dateLabel(en: boolean, timestamp?: number): string {
  if (!timestamp) return en ? "Unknown date" : "日期未知";
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function coachDashboardView(
  language: Language,
  state: CoachDashboardViewState
): string {
  const en = language === "en";
  const selected =
    state.students[state.selectedIndex] ?? state.local;
  const strong = selected.strong
    .map((id) => abilityDisplay(language, id).name)
    .join(" · ");
  const weak = selected.weak
    .map((id) => abilityDisplay(language, id).name)
    .join(" · ");
  const regression = selected.regression
    ? abilityDisplay(language, selected.regression).name
    : en
      ? "None"
      : "暂无";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-map">${en ? "Back to Map" : "返回地图"}</button>
      <button class="link" data-action="open-menu">${en ? "Home" : "主页"}</button>
    </header>
    <main class="coach-dashboard-shell" aria-label="${en ? "Coach dashboard" : "教练数据看板"}">
      <section class="coach-dashboard-hero">
        <p class="eyebrow">${en ? "Coach Dashboard" : "教练数据看板"}</p>
        <h1>${en ? "Student growth at a glance" : "纵览学员成长 · 洞察能力变化"}</h1>
        <p class="muted">${en ? "XP, rank, ability radar, growth curve, and coaching insights." : "段位、经验值、能力雷达、成长曲线与教练洞察一屏可见。"}</p>
        <button data-action="coach-dashboard-refresh">${en ? "Refresh" : "刷新"}</button>
      </section>
      ${
        state.loading
          ? `<p class="muted coach-loading">${en ? "Loading students…" : "正在读取学员数据…"}</p>`
          : state.error
            ? `<p class="coach-error" role="alert">${escapeHtml(state.error)}</p>`
            : ""
      }
      <div class="coach-layout">
        <aside class="coach-student-list">
          <h2>${en ? `Students · ${state.students.length}` : `学员 · ${state.students.length} 人`}</h2>
          ${state.students
            .map(
              (student, index) => `
                <button
                  class="coach-student-row ${index === state.selectedIndex ? "selected" : ""}"
                  data-action="coach-dashboard-select"
                  data-index="${index}"
                >
                  <strong>${escapeHtml(student.name)}</strong>
                  <small>${escapeHtml(roleDisplay(language, student.role as RoleId).name)} · ${escapeHtml(en ? student.rankEn : student.rank)}</small>
                  <span>${student.xp} XP · ${student.sessions} ${en ? "sessions" : "节"}</span>
                </button>
              `
            )
            .join("")}
        </aside>
        <section class="coach-student-detail">
          <div class="coach-detail-head">
            <div>
              <p class="eyebrow">${escapeHtml(selected.name)}</p>
              <h2>${escapeHtml(roleDisplay(language, selected.role as RoleId).name)} · ${escapeHtml(en ? selected.rankEn : selected.rank)}</h2>
              <p class="muted">${selected.xp} XP · ${selected.sessions} ${en ? "sessions" : "节"} · ${dateLabel(en, selected.updatedAt)}</p>
            </div>
            <canvas id="coach-radar" class="coach-radar" aria-label="${en ? "Ability radar" : "能力雷达"}"></canvas>
          </div>
          <div class="coach-insights">
            <div class="coach-insight-card strong"><span>${en ? "Strength" : "强项"}</span><p>${escapeHtml(strong)}</p></div>
            <div class="coach-insight-card weak"><span>${en ? "To Improve" : "待精进"}</span><p>${escapeHtml(weak)}</p></div>
            <div class="coach-insight-card regression"><span>${en ? "Regression Watch" : "退步预警"}</span><p>${escapeHtml(regression)}</p></div>
            <div class="coach-insight-card balance"><span>${en ? "Balance" : "能力均衡"}</span><p>${selected.balanced ? (en ? "Well balanced" : "较为均衡") : (en ? "Spread widening" : "分差较大")}</p></div>
          </div>
          <h3>${en ? "XP Growth" : "成长曲线"}</h3>
          <canvas id="coach-curve" class="coach-curve" aria-label="${en ? "XP growth curve" : "成长曲线"}"></canvas>
          <h3>${en ? "Recent Decisions" : "选择历程 · 最近 5 节"}</h3>
          <div class="coach-recent-list">
            ${selected.recent
              .map((record) => {
                let title = record.nodeId;
                try {
                  title = getNode(record.nodeId).title;
                } catch {
                  // keep id
                }
                return `
                  <div class="coach-recent-row">
                    <span class="quality ${record.quality}">${record.quality}</span>
                    <strong>${escapeHtml(title)}</strong>
                    <small>${record.score} ${en ? "pts" : "分"}</small>
                  </div>
                `;
              })
              .join("")}
          </div>
          <h3>${en ? "Compare With Local Save" : "与本机档案对比"}</h3>
          <div class="coach-compare-row">
            <div><strong>${escapeHtml(selected.name)}</strong><span>${selected.total} ${en ? "ability" : "能力"}</span></div>
            <div><strong>${escapeHtml(state.local.name)}</strong><span>${state.local.total} ${en ? "ability" : "能力"}</span></div>
          </div>
        </section>
      </div>
    </main>
  `;
}
