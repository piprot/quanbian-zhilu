import { uiString, type Language } from "../core/i18n";
import type { SaveState } from "../core/types";
import { ABILITIES, abilityLevel } from "../core/abilities";
import type {
  PersonalCoachReport,
  WorkshopReport
} from "../core/coach-workshop";
import { abilityDisplay, roleDisplay, roleMove } from "./display";
import { escapeHtml } from "./escape";

export function coachView(
  save: SaveState,
  language: Language,
  report: WorkshopReport | undefined,
  personal: PersonalCoachReport | undefined,
  participantCount: number,
  coachPlanMarkup: string,
  liveMarkup: string
): string {
  const en = language === "en";
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="coach-shell" aria-label="${en ? "Coach Workshop" : "教练工作坊"}">
      <section class="coach-hero">
        <div>
          <p class="eyebrow">${en ? "Coach Workshop" : "教练工作坊"}</p>
          <h1>${en ? "Turn team saves into a facilitated workshop" : "把学员存档变成一场可执行的工作坊"}</h1>
          <p class="muted">${en ? "Import exported saves, compare the group radar, surface decision blind spots, and follow a ready-made facilitation plan." : "导入导出的存档，对比小组能力雷达，定位决策盲区，并按照内置流程主持工作坊。"}</p>
        </div>
        <div class="coach-status">
          <strong>${participantCount}</strong>
          <span>${en ? "Participants" : "已导入学员"}</span>
        </div>
      </section>

      <section class="coach-personal-panel">
        <div class="coach-personal-head">
          <div>
            <p class="eyebrow">${en ? "My Coach Card" : "我的教练卡"}</p>
            <h2>${en ? "Based on your own save" : "基于你的真实存档生成"}</h2>
            <p class="muted">${en ? "Your abilities, decision style, and missed moves are turned into three concrete next steps." : "你的能力、决策风格和错过的关键选择，会直接变成三个可执行的下一步。"}</p>
          </div>
          ${
            personal
              ? `<div class="coach-personal-name"><strong>${escapeHtml(personal.name)}</strong><span>${roleDisplay(language, personal.role).name}</span></div>`
              : `<p class="muted">${en ? "Create a profile and make decisions first." : "先创建档案并完成决策，这里才会生成你的教练卡。"}</p>`
          }
        </div>
        ${
          personal
            ? `
              <div class="coach-personal-grid">
                <div class="coach-card">
                  <h3>${en ? "Strengths" : "优势能力"}</h3>
                  ${personal.strengths
                    .map((id) => {
                      const ability = abilityDisplay(language, id);
                      const level = abilityLevel(save.profile.abilities[id]);
                      return `<p><span style="--dot:${ABILITIES[id].color}"></span>${ability.name} <strong>Lv.${level}</strong></p>`;
                    })
                    .join("")}
                </div>
                <div class="coach-card">
                  <h3>${en ? "Focus Next" : "下一步聚焦"}</h3>
                  ${personal.focus
                    .map((id) => {
                      const ability = abilityDisplay(language, id);
                      return `<button data-action="open-training" data-ability="${id}">${ability.name} · ${ability.tagline}</button>`;
                    })
                    .join("")}
                </div>
                <div class="coach-card">
                  <h3>${en ? "Decision Style" : "决策风格"}</h3>
                  <p>${en ? "Expert" : "专家"} ${personal.decisionProfile.expert} · ${en ? "Balanced" : "稳健"} ${personal.decisionProfile.partial} · ${en ? "Risk" : "风险"} ${personal.decisionProfile.risk}</p>
                  <p class="muted">${en ? `Total ${personal.decisionProfile.total} decisions` : `共 ${personal.decisionProfile.total} 次决策`}</p>
                </div>
                <div class="coach-card">
                  <h3>${en ? "Missed Moves" : "错过的好棋"}</h3>
                  ${
                    personal.blindSpotNodes.length
                      ? personal.blindSpotNodes
                          .map(
                            (spot) =>
                              `<p><strong>${escapeHtml(spot.nodeTitle)}</strong><small>${roleMove(language, save.profile.role, spot.quality)}</small></p>`
                          )
                          .join("")
                      : `<p class="muted">${en ? "No missed moves yet." : "暂未发现明显失误。"}</p>`
                  }
                </div>
              </div>
              <div class="coach-action-plan">
                <h3>${en ? "30-Day Action Plan" : "30 天行动计划"}</h3>
                <ol>
                  ${personal.actionPlan
                    .map((action, index) => {
                      const label =
                        action.action === "train"
                          ? en
                            ? `Train ${abilityDisplay(language, action.ability ?? "insight").name}`
                            : `训练 ${abilityDisplay(language, action.ability ?? "insight").name}`
                          : action.action === "review"
                            ? en
                              ? "Review a missed scenario"
                              : "回看错过的情境"
                            : en
                              ? "Practice in a 1v1 duel"
                              : "用 1v1 对练巩固";
                      const dataAttr =
                        action.action === "train"
                          ? `data-action="open-training" data-ability="${action.ability ?? "insight"}"`
                          : action.action === "review"
                            ? `data-action="open-report"`
                            : `data-action="open-duel"`;
                      return `<li><button ${dataAttr}>${index + 1}. ${escapeHtml(label)}</button></li>`;
                    })
                    .join("")}
                </ol>
              </div>
            `
            : ""
        }
      </section>

      <section class="coach-plan-panel">
        <h2>${en ? "Solo 90-Day Action Plan" : "单人 90 天行动计划"}</h2>
        <p class="muted">${en ? "Answer two questions, and the coach will generate an adaptive plan from your role, ability gaps, leadership profile, decision trajectory, and training progress." : "回答两个问题，教练会根据你的角色、能力短板、领导力画像、决策轨迹和训练进度生成自适应计划。"}</p>
        ${coachPlanMarkup}
      </section>

      <section class="coach-import-panel">
        <h2>${en ? "Group Workshop Mode" : "小组工作坊模式（教练 / 培训师用）"}</h2>
        <p class="muted">${en ? "For trainers: import exported saves, compare group radar, and follow the facilitation plan." : "面向教练与培训师：导入学员存档，对比小组能力雷达，并按内置流程主持工作坊。"}</p>
        <textarea data-coach-import rows="4" placeholder='[{"name":"学员A","data":{}}]'></textarea>
        <div class="coach-import-actions">
          <button class="primary" data-action="coach-load-demo">${en ? "Load Demo Group" : "载入演示小组"}</button>
          <button data-action="coach-import">${en ? "Import & Generate" : "导入并生成"}</button>
        </div>
      </section>
      ${liveMarkup}

      ${
        report
          ? `
            <section class="coach-report">
              <div class="coach-report-head">
                <div>
                  <h2>${escapeHtml(report.groupName)}</h2>
                  <p class="muted">${en ? `${report.participantCount} participants · generated ${new Date(report.generatedAt).toLocaleTimeString()}` : `${report.participantCount} 名学员 · 生成于 ${new Date(report.generatedAt).toLocaleTimeString()}`}</p>
                </div>
              </div>
              <div class="coach-radar-wrap">
                <h3>${en ? "Group Radar" : "小组能力雷达"}</h3>
                <canvas class="coach-radar" id="coach-radar" aria-label="${en ? "Group ability radar chart" : "小组能力雷达图"}"></canvas>
                <p class="muted">${en ? "Band = min/max · line = median · gold dots = average" : "色带 = 最低/最高 · 折线 = 中位数 · 金点 = 平均"}</p>
              </div>
              <div class="coach-section">
                <h3>${en ? "Decision Blind Spots" : "决策盲区"}</h3>
                ${
                  report.blindSpots.length
                    ? `<div class="coach-blind-grid">${report.blindSpots
                        .map(
                          (spot) => `
                            <article class="coach-blind-card">
                              <strong>${escapeHtml(spot.nodeTitle)}</strong>
                              <small>${en ? "Expert" : "专家"} ${Math.round(spot.expertRate * 100)}% · ${en ? "Risk" : "风险"} ${Math.round(spot.riskRate * 100)}% · ${spot.totalAttempts} ${en ? "attempts" : "次尝试"}</small>
                              <p>${escapeHtml(spot.insight)}</p>
                            </article>
                          `
                        )
                        .join("")}</div>`
                    : `<p class="muted">${en ? "No blind spots found yet. Add more decisions." : "暂未发现明显盲区，继续积累决策即可。"}</p>`
                }
              </div>
              <div class="coach-section">
                <h3>${en ? "Discussion Prompts" : "讨论引导"}</h3>
                <ul class="coach-discussion">
                  ${report.discussionQuestions
                    .map(
                      (item) => `
                        <li>
                          <strong>${escapeHtml(item.question)}</strong>
                          <p class="muted">${escapeHtml(item.evidence)}</p>
                          <p>${escapeHtml(item.facilitation)}</p>
                        </li>
                      `
                    )
                    .join("")}
                </ul>
              </div>
              <div class="coach-section coach-scenario-row">
                <div>
                  <h3>${en ? "Consensus" : "高度一致"}</h3>
                  ${report.consensusScenarios.length ? `<ul>${report.consensusScenarios.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : `<p class="muted">-</p>`}
                </div>
                <div>
                  <h3>${en ? "Divergence" : "分歧最大"}</h3>
                  ${report.divergenceScenarios.length ? `<ul>${report.divergenceScenarios.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : `<p class="muted">-</p>`}
                </div>
              </div>
              <div class="coach-section">
                <h3>${en ? "Growth Trajectory" : "成长轨迹"}</h3>
                <div class="coach-trajectory">
                  ${report.growthTrajectory
                    .map(
                      (item) => `
                        <div class="coach-trajectory-row">
                          <strong>${escapeHtml(item.name)}</strong>
                          <span class="trajectory-${item.trajectory}">${en ? item.trajectory : item.trajectory === "rising" ? "上升" : item.trajectory === "plateau" ? "平稳" : "下滑"}</span>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>
              <div class="coach-section">
                <h3>${en ? "Workshop Plan" : "工作坊流程"}</h3>
                <ol class="coach-plan">
                  ${report.workshopPlan
                    .map(
                      (session) => `
                        <li>
                          <strong>${escapeHtml(session.phase)} · ${session.duration}min</strong>
                          <p>${escapeHtml(session.activity)}</p>
                          <p class="muted">${escapeHtml(session.facilitationNotes)}</p>
                        </li>
                      `
                    )
                    .join("")}
                </ol>
              </div>
            </section>
          `
          : ""
      }
    </main>
  `;
}
