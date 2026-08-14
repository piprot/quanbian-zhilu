import {
  ABILITIES,
  ABILITY_ORDER,
  ROLES,
  abilityLevel
} from "../core/abilities";
import {
  chapterStarCount,
  decisionProfile,
  isChapterComplete,
  profileSummary
} from "../core/game";
import { CHAPTERS, SIDE_QUEST_ARCS, getChapter, getNode } from "../core/story";
import { recommendedTraining } from "../core/duel";
import { certificationLevel } from "../core/assessment";
import { uiString } from "../core/i18n";
import { ROLE_ROADMAPS } from "../core/roleTraining";
import { EXPANDED_TRAINING } from "../core/trainingExtras";
import { EXPANDED_TRAINING_EN } from "../core/trainingExtrasEn";
import { TRIAL_STAGES } from "../core/trials";
import {
  dueReviewCards,
  reviewBoard,
  reviewStats
} from "../core/review-schedule";
import { NPCS, npcRelation } from "../core/npcs";
import type {
  AbilityId,
  RoleId,
  SaveState,
  StoryNode
} from "../core/types";
import {
  abilityDetailDisplay,
  abilityDisplay,
  chapterDisplay,
  dimensionMarkup,
  npcDisplay,
  qualityLabel,
  rankName,
  roleDisplay
} from "./display";
import { artAsset } from "./assets";
import { escapeAttr, escapeHtml } from "./escape";

const ONLINE_ENABLED = import.meta.env.VITE_ENABLE_ONLINE === "true";

// 报告页 / 能力页 / 结局页共用的云端与开关状态（不属于存档或语言的少量 UI 态）。
export interface ReportCloudState {
  muted: boolean;
  accountName?: string;
  token: string;
  recoveryCode: string;
  status: string;
  conflict: boolean;
  entries: Array<{
    name: string;
    role: string;
    score: number;
    percentile?: number;
  }>;
}

function nextRankNeed(total: number): number {
  const ranks = [
    { min: 16 },
    { min: 26 },
    { min: 38 },
    { min: 48 }
  ];
  const next = ranks.find((rank) => total < rank.min);
  return next ? next.min - total : 0;
}

function abilityCard(save: SaveState, language: "zh" | "en", id: AbilityId): string {
  const exp = save.profile.abilities[id];
  const level = abilityLevel(exp);
  const ability = ABILITIES[id];
  const detail = abilityDetailDisplay(language, id);
  // ABILITY_ORDER 是固定 10 项顺序，对应 ability-01.jpg ~ ability-10.jpg
  const abilityIndex = (ABILITY_ORDER.indexOf(id) + 1).toString().padStart(2, "0");
  return `
    <div class="ability-card has-ability-art">
      <img class="ability-illust" src="${artAsset(`ability-${abilityIndex}`)}" alt="${abilityDisplay(language, id).name}" loading="lazy" onerror="this.style.display='none'" />
      <div class="ability-head">
        <span style="--dot:${ability.color}"></span>
        <div>
          <h3>${abilityDisplay(language, id).name}</h3>
          <small>${ability.code}</small>
        </div>
        <strong>Lv.${level}</strong>
      </div>
      <p>${abilityDisplay(language, id).tagline}</p>
      <div class="ability-bar"><i style="width:${Math.min(100, (level / 6) * 100)}%"></i></div>
      <div class="subskill-list">${detail.subSkills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}</div>
      <p class="training-path">${escapeHtml(detail.trainingPath)}</p>
      ${
        (() => {
          const training =
            language === "en" ? EXPANDED_TRAINING_EN[id] : EXPANDED_TRAINING[id];
          return [
            training?.formula?.expression
              ? `<p class="ability-formula">${escapeHtml(training.formula.expression)}</p>`
              : "",
            training?.workedExamples?.[0]?.scenario
              ? `<p class="ability-example">${escapeHtml(training.workedExamples[0].scenario)}</p>`
              : ""
          ].join("");
        })()
      }
      ${
        (() => {
          const next = TRIAL_STAGES.find((stage) =>
            stage.gates.some(
              (gate) =>
                gate.abilityId === id && gate.level > abilityLevel(exp)
            )
          );
          if (!next) return "";
          const nextLevel = next.gates.find((gate) => gate.abilityId === id)
            ?.level;
          return `<p class="ability-next-gate">${language === "en" ? "Next gate" : "下一门"}：Lv.${nextLevel} · ${escapeHtml(next.name)}</p>`;
        })()
      }
      <div class="ability-sources">${detail.sources.slice(0, 2).map((source) => `<span>${escapeHtml(source)}</span>`).join("")}</div>
      <button class="ability-practice-button" data-action="open-training" data-ability="${id}">${language === "en" ? "Enter Practice" : "进入修炼"}</button>
    </div>
  `;
}

export function abilityView(save: SaveState, language: "zh" | "en"): string {
  const summary = profileSummary(save);
  const training = recommendedTraining(
    save.profile.abilities,
    save.profile.role,
    save.decisionHistory
  );
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
    </header>
    <main class="ability-shell" aria-label="${language === "en" ? "Ability map" : "能力图谱"}">
      ${dimensionMarkup(language, save)}
      <section class="ability-head">
        <div>
          <p class="eyebrow">${uiString(language, "abilityTitle")}</p>
          <h1>${rankName(language, summary.rank)}</h1>
          <p class="muted">${language === "en" ? `Total Ability ${summary.total}, next rank needs ${nextRankNeed(summary.total)} points.` : `综合能力值 ${summary.total}，下一段位需要 ${nextRankNeed(summary.total)} 点。`}</p>
          <div class="role-focus">
            <strong>${roleDisplay(language, save.profile.role).name}${language === "en" ? " Focus" : "重点"}</strong>
            <div>
              ${ROLES[save.profile.role].focusAbilities
                .map(
                  (id) => `
                    <span style="--dot:${ABILITIES[id].color}">${abilityDisplay(language, id).name}</span>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
        <canvas class="radar" id="ability-radar"></canvas>
        <button class="primary" data-action="open-report">${uiString(language, "viewReport")}</button>
      </section>
      ${
        (() => {
          const roadmap = ROLE_ROADMAPS[save.profile.role];
          const role = save.profile.role;
          const lang = language;
          return `
            <section class="role-roadmap">
              <div class="role-roadmap-head">
                <p class="eyebrow">${lang === "en" ? "Role Training Roadmap" : "角色训练路线"}</p>
                <h2>${escapeHtml(roadmap.theme[lang])}</h2>
                <p>${escapeHtml(roadmap.themeDetail[lang])}</p>
                <ul class="role-pitfalls">
                  ${roadmap.pitfalls
                    .map((pitfall) => `<li>${escapeHtml(pitfall[lang])}</li>`)
                    .join("")}
                </ul>
              </div>
              <div class="role-stages">
                ${roadmap.stages
                  .map(
                    (stage, index) => `
                      <div class="role-stage">
                        <span>${index + 1}</span>
                        <div>
                          <strong>${escapeHtml(stage.title[lang])}</strong>
                          <p>${escapeHtml(stage.goal[lang])}</p>
                          <div class="role-stage-abilities">
                            ${stage.abilities
                              .map((id) => {
                                const done = save.completedTraining.includes(id);
                                return `<span class="${done ? "done" : ""}">${abilityDisplay(language, id).name} Lv.${abilityLevel(save.profile.abilities[id])}${done ? " ✓" : ""}</span>`;
                              })
                              .join("")}
                          </div>
                        </div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="role-focus-applications">
                <h3>${lang === "en" ? "Role Applications" : "角色落地动作"}</h3>
                <div class="role-application-grid">
                  ${ROLES[role].focusAbilities
                    .map((id) => {
                      const extra =
                        lang === "en"
                          ? EXPANDED_TRAINING_EN[id]
                          : EXPANDED_TRAINING[id];
                      return `
                        <div>
                          <strong>${abilityDisplay(language, id).name}</strong>
                          <p>${escapeHtml(extra.roleApplications[role])}</p>
                          <code>${escapeHtml(extra.formula.expression)}</code>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            </section>
          `;
        })()
      }
      <section class="ability-grid">
        ${ABILITY_ORDER.map((id) => abilityCard(save, language, id)).join("")}
      </section>
      <section class="training-panel">
        <h2>${language === "en" ? "Recommended Training" : "建议训练方向"}</h2>
        <div class="training-list">
          ${training
            .map(
              (id) => `
                <div class="training-item">
                  <span style="--dot:${ABILITIES[id].color}"></span>
                  <strong>${abilityDisplay(language, id).name}</strong>
                  <p>${abilityDisplay(language, id).tagline}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    </main>
  `;
}

function reviewAbilityFor(nodeId: string): string {
  try {
    return getChapter(getNode(nodeId).chapterId).focus[0];
  } catch {
    return "insight";
  }
}

function reviewBoardMarkup(save: SaveState, language: "zh" | "en"): string {
  const entries = reviewBoard(save.reviewCards ?? [], (nodeId) =>
    reviewAbilityFor(nodeId)
  );
  if (entries.length === 0) return "";
  const en = language === "en";
  return `
    <section class="review-board">
      <h3>${en ? "Review by Ability" : "按能力复习看板"}</h3>
      <div class="review-board-grid">
        ${entries
          .map((entry) => {
            const display = abilityDisplay(language, entry.ability as AbilityId);
            const pct = entry.total
              ? Math.round((entry.mastered / entry.total) * 100)
              : 0;
            return `
              <article class="review-board-card" style="--bar:${pct}%">
                <strong>${escapeHtml(display.name)}</strong>
                <span>${escapeHtml(display.tagline)}</span>
                <div class="review-board-bar"><i></i></div>
                <p>${en ? `${entry.due} due · ${entry.mastered} mastered / ${entry.total}` : `到期 ${entry.due} · 已掌握 ${entry.mastered} / ${entry.total}`}</p>
                <div class="review-board-actions">
                  <button data-action="open-due-review" data-ability="${escapeAttr(entry.ability)}" ${entry.due ? "" : "disabled aria-disabled=\"true\""}>${en ? "Review" : "回练"}</button>
                  <button data-action="open-dual-review" data-ability="${escapeAttr(entry.ability)}" ${entry.due ? "" : "disabled aria-disabled=\"true\""}>${en ? "Best/Worst" : "双轴"}</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function dueReviewMarkup(save: SaveState, language: "zh" | "en"): string {
  const cards = save.reviewCards ?? [];
  const due = dueReviewCards(cards);
  const stats = reviewStats(cards);
  if (stats.total === 0) return "";
  const en = language === "en";
  return `
    <section class="due-review-panel">
      <h3>${en ? "Spaced Review" : "间隔复习"}</h3>
      <p>${en
        ? `${stats.due} due now · ${stats.total} tracked · ${stats.mastered} mastered. Missed expert moves return after 1 / 6 / 15+ day intervals.`
        : `当前到期 ${stats.due} 题 · 累计 ${stats.total} 题 · 已掌握 ${stats.mastered} 题。未选专家项会按 1 / 6 / 15+ 天间隔安排回练。`}</p>
      ${
        due.length
          ? `<div class="due-review-actions"><button class="wrong-review-cta" data-action="open-due-review">${en ? `Start Due Review (${due.length})` : `开始到期回练（${due.length}）`}</button><button class="wrong-review-cta" data-action="open-dual-review">${en ? `Best/Worst Review (${due.length})` : `双轴回练（${due.length}）`}</button></div>`
          : `<p class="muted">${en ? "No cards due right now." : "当前没有到期的复习卡。"}</p>`
      }
    </section>
  `;
}

function wrongAnswerMarkup(save: SaveState, language: "zh" | "en"): string {
  const wrong = save.decisionHistory
    .filter((record) => record.quality !== "expert")
    .slice(-8)
    .reverse();
  return wrong
    .map((record) => {
      let node: StoryNode | null = null;
      try {
        node = getNode(record.nodeId);
      } catch {
        node = null;
      }
      if (!node) {
        return "";
      }
      const expert = node.options.find(
        (option) => option.quality === "expert"
      );
      const chosen = node.options[record.optionIndex];
      const focus = getChapter(node.chapterId).focus[0];
      return `
        <div class="wrong-answer-card">
          <strong>${escapeHtml(node.title)}</strong>
          <p><b>${qualityLabel(language, record.quality)}</b> · ${escapeHtml(chosen?.label ?? "")}</p>
          ${
            expert
              ? `<p class="expert-ref">${language === "en" ? "Expert baseline" : "专家基准"}：${escapeHtml(expert.label)} · ${escapeHtml(expert.theory)}</p>`
              : ""
          }
          <button data-action="open-training" data-ability="${focus}">${language === "en" ? "Train This Ability" : "训练该能力"}</button>
        </div>
      `;
    })
    .join("");
}

function coachPromptMarkup(
  save: SaveState,
  language: "zh" | "en",
  decision: ReturnType<typeof decisionProfile>
): string {
  const en = language === "en";
  const prompts: string[] = [];
  if (decision.counts.risk >= 2) {
    prompts.push(
      en
        ? "You leaned on authority or avoidance several times. Is your real team holding back honest information?"
        : "你多次使用权威/回避动作。现实团队是否正在因此少说真话？"
    );
  }
  if (decision.counts.partial >= 2) {
    prompts.push(
      en
        ? "Several moves were technical fixes. Which problems are you still carrying alone?"
        : "多次选择偏向技术性解决。哪些问题其实还压在你一个人身上？"
    );
  }
  if (decision.counts.expert >= 3) {
    prompts.push(
      en
        ? "You diagnosed before acting repeatedly. Can the next diagnosis become a verifiable meeting agenda?"
        : "你连续先诊断再行动。下一次能否把诊断变成可验收的会议议题？"
    );
  }
  if (save.profile.resources.trust < 45) {
    prompts.push(
      en
        ? "Trust is low in your run. When did you last choose efficiency over a relationship?"
        : "本局信任值偏低。你上一次为了效率牺牲关系是什么时候？"
    );
  }
  if (save.profile.resources.energy < 25) {
    prompts.push(
      en
        ? "Energy nearly ran out. What would a sustainable week look like for you?"
        : "精力接近枯竭。对你来说，可持续的一周应该长什么样？"
    );
  }
  if (prompts.length === 0) {
    prompts.push(
      en
        ? "Your decisions are balanced. Which scenario challenged your usual style the most?"
        : "你的决策风格比较均衡。哪个情境最挑战你平时的做法？"
    );
  }
  return prompts
    .slice(0, 3)
    .map((prompt) => `<li>${escapeHtml(prompt)}</li>`)
    .join("");
}

function endingMarkup(save: SaveState, language: "zh" | "en"): string {
  if (!isChapterComplete(save, 9)) {
    return `
      <section class="ending-panel locked">
        <h2>${roleDisplay(language, save.profile.role).name}${language === "en" ? " Ending" : "结局"}</h2>
        <p class="muted">${language === "en" ? "Complete chapter 9 to unlock your role ending." : "完成第九章后解锁专属结局。"}</p>
      </section>
    `;
  }
  const role = save.profile.role;
  const decision = decisionProfile(save);
  const en = language === "en";
  const endings: Record<RoleId, string> = {
    parachute:
      en
        ? "You proved you can not only parachute in but also turn an unfamiliar organization into a stable system. When you left, power had returned to systems, succession, and shared judgment rather than staying in one person."
        : "你证明了自己不仅能空降，还能把陌生组织变成稳定系统。你离开时，权力已经回到制度、梯队与共识里，而不是停留在你个人身上。",
    founder:
      en
        ? "You turned founder instinct into replicable organizational method. The company no longer depends on one person for every decision, while you kept your sensitivity to direction and built a team that can absorb growth."
        : "你把创业直觉变成了可复制的组织方法，公司开始不依赖你一个人做所有决定。你保留了对方向的敏感，也建立了能接住增长的团队。",
    highPotential:
      en
        ? "Without positional power, you built an influence network across departments. The organization needs you not because of your title but because you made it clearer where everyone should go."
        : "你没有职位权力，却建立了横跨部门的影响力网络。你最终被组织需要，不是因为头衔，而是因为你让所有人更清楚该往哪里走。"
  };
  let style: "expert" | "risk" | "partial" | "balanced" = "balanced";
  if (decision.counts.expert >= 8) {
    style = "expert";
  } else if (decision.counts.risk >= 5) {
    style = "risk";
  } else if (decision.counts.partial >= 8) {
    style = "partial";
  }
  const finalRoute = save.routePath[9];
  if (finalRoute === "expert" || finalRoute === "risk" || finalRoute === "partial") {
    style = finalRoute;
  }
  const styleLabels = {
    expert: en ? "Precise" : "精准决策",
    risk: en ? "High-Pressure" : "高压破局",
    partial: en ? "Incremental" : "渐进推进",
    balanced: en ? "Balanced" : "平衡演进"
  };
  const styleEndings = {
    expert:
      en
        ? "You became known for precise judgment. The team began using the checklists you created, and the organization gained replicable judgment."
        : "你以精准判断著称，团队开始使用你沉淀的检查清单做决策，组织获得了可复制的判断力。",
    risk:
      en
        ? "You were willing to place high-pressure bets. The organization learned to act fast in uncertainty, but it also inherited risks that still need repair."
        : "你敢于在压力下押注，组织因此学会在不确定中快速行动，但也留下了需要持续修复的风险。",
    partial:
      en
        ? "You chose incremental progress. The organization changed with low disruption, though slower than expected and with more room for adjustment."
        : "你选择渐进推进，组织在低震荡中完成了变革，只是节奏比想象中更慢，留下了更多调整空间。",
    balanced:
      en
        ? "You balanced boldness and caution. The organization gained explainable stability while retaining the flexibility to keep evolving."
        : "你在激进与保守之间保持了平衡，组织最终获得了一种可解释的稳定，也保留了继续进化的弹性。"
  };
  const arcLegacy: Record<string, string> = {
    trust_rebuild:
      en
        ? "The person you protected later became one of the most honest voices in the organization, and that trust became the deepest foundation of change."
        : "你救下的个体后来成了组织中最敢表达真实问题的人，这份信任成为变革最深的根基。",
    resilience:
      en
        ? "The review mechanism you built in crisis allowed the team to repair mistakes after you left, freeing execution from personal dependence."
        : "你在危机中建立的复盘机制，让团队在离开你之后仍能自己修复错误，执行系统真正脱离了个人依赖。"
  };
  const legacy = SIDE_QUEST_ARCS.filter((arc) =>
    arc.nodes.every((nodeId) =>
      save.completedSideQuests.includes(nodeId)
    )
  )
    .map((arc) => arcLegacy[arc.id])
    .filter(Boolean)
    .join(" ");
  const randomLegacy =
    save.completedRandomEvents.length >= 5
      ? en
        ? "The unexpected situations you handled became invisible training for the team's judgment."
        : "你处理过的那些临时情境，最终成为了团队判断力的隐性训练。"
      : "";
  return `
    <section class="ending-panel">
      <h2>${roleDisplay(language, role).name} · ${styleLabels[style]}${en ? " Ending" : "结局"}</h2>
      <p>${endings[role]} ${styleEndings[style]} ${legacy} ${randomLegacy}</p>
      <button data-action="open-ending">${uiString(language, "endingTitle")}</button>
    </section>
  `;
}

// 认证荣誉凭证：把「认证通过」从数字证明升级为可分享的叙事凭证。
function certificationCredentialMarkup(
  save: SaveState,
  language: "zh" | "en"
): string {
  const cert = certificationLevel(save);
  if (!cert.passed) return "";
  const en = language === "en";
  const role = save.profile.role;
  const roleName = roleDisplay(language, role).shortName;
  const focusNames = ROLES[role].focusAbilities
    .map((id) => abilityDisplay(language, id).name)
    .join(en ? " · " : "、");
  const title: Record<RoleId, string> = {
    parachute: en ? "Turnaround Leader" : "空降变革者",
    founder: en ? "Organization Builder" : "组织建造者",
    highPotential: en ? "Influence Connector" : "影响力连接者"
  };
  const narrative = en
    ? `This credential rests on the ten-ability spectrum — specifically ${focusNames}, the abilities a ${roleName} repeatedly verified in real situations.`
    : `这份凭证以十项能力谱系为根基，聚焦 ${focusNames}——这是「${roleName}」在真实情境中反复验证过的能力。`;
  return `
    <div class="credential-card">
      <span class="credential-seal">${en ? "Honor Credential" : "荣誉凭证"}</span>
      <h2>${escapeHtml(title[role])} · ${escapeHtml(cert.level)}</h2>
      <p>${escapeHtml(narrative)}</p>
      <small>${en ? "Share it via the report card below." : "可通过下方报告卡片分享。"}</small>
    </div>
  `;
}

export function reportView(
  save: SaveState,
  language: "zh" | "en",
  cloud: ReportCloudState
): string {
  const summary = profileSummary(save);
  const decision = decisionProfile(save);
  const cert = certificationLevel(save);
  const strengths = ABILITY_ORDER.filter(
    (id) => abilityLevel(save.profile.abilities[id]) >= 4
  );
  const gaps = recommendedTraining(
    save.profile.abilities,
    save.profile.role,
    save.decisionHistory
  );
  const chapterReports = CHAPTERS.map((chapter) => {
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapter.id
    );
    return {
      chapter,
      stars: record ? chapterStarCount(record.stars) : 0,
      done: Boolean(record && record.completedNodeIds.length >= 2)
    };
  });
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
      <button class="link sound-toggle" data-action="toggle-sound" aria-label="${language === "en" ? "Toggle sound" : "切换声音"}">${cloud.muted ? uiString(language, "soundOff") : uiString(language, "soundOn")}</button>
    </header>
    <main class="report-shell" aria-label="${language === "en" ? "Review report" : "复盘报告"}">
      ${dimensionMarkup(language, save)}
      <section class="report-hero">
        <div>
          <p class="eyebrow">${uiString(language, "reportTitle")}</p>
          <h1>${save.profile.name} · ${uiString(language, "leadershipTrajectory")}</h1>
          <p class="muted">${language === "en" ? `Rank: ${rankName(language, summary.rank)} · Total Ability: ${summary.total} · Campaign ${summary.chapterCount}/9` : `段位：${rankName(language, summary.rank)} · 综合能力值：${summary.total} · 主线 ${summary.chapterCount}/9`}</p>
        </div>
        <div class="duel-stats">
          <span><strong>${save.duelWins}</strong> ${language === "en" ? "Wins" : "胜"}</span>
          <span><strong>${save.duelLosses}</strong> ${language === "en" ? "Losses" : "负"}</span>
          <span><strong>${save.masteryPoints}</strong> ${language === "en" ? "Mastery" : "修炼点"}</span>
        </div>
        <div class="best-score-badge">
          <span>${uiString(language, "bestScore")}</span>
          <strong>${save.bestScore ?? 0}</strong>
        </div>
        <div class="identity-badge">
          <span>${language === "en" ? "Decision Profile" : "决策画像"}</span>
          <strong>${roleDisplay(language, save.profile.role).shortName} · ${decision.identity}</strong>
        </div>
        <p class="adaptive-note">${language === "en" ? `Adaptive ${decision.counts.expert} · Technical ${decision.counts.partial} · Authority ${decision.counts.risk}. Adaptive leadership grows when you diagnose from the balcony, hold the tension, and give the work back; partial moves are technical fixes, and high-risk moves lean on authority or avoidance.` : `自适应 ${decision.counts.expert} · 技术性 ${decision.counts.partial} · 权威/回避 ${decision.counts.risk}。自适应领导力来自登台观察、稳住张力、把工作还给团队；部分有效是技术性解决，高风险回应依赖权威或回避。`}</p>
        <p class="decision-insight" role="note">${
          decision.counts.risk >= decision.counts.expert
            ? language === "en"
              ? "Insight: under pressure you reach for authority first. The next move is to make that pressure visible instead of absorbing it alone."
              : "洞察：压力之下你习惯先动用权威。下一步是把这份压力摆到台面，而不是独自吸收。"
            : decision.counts.partial >= decision.counts.expert
              ? language === "en"
                ? "Insight: you solve the symptom fast and carry the responsibility yourself. Try handing the problem back with a check node."
                : "洞察：你擅长快速解决症状，但责任往往留在自己手里。试试把问题还回去，并带上检查节点。"
              : language === "en"
                ? "Insight: you diagnose before acting. The next upgrade is turning diagnosis into a shared, verifiable agenda."
                : "洞察：你习惯先诊断再行动。下一步是把诊断变成大家共同可验收的议程。"
        }</p>
        <section class="coach-prompts" aria-label="${language === "en" ? "Coach follow-up questions" : "教练追问"}" role="region">
          <h2>${language === "en" ? "Coach Follow-Ups & Group Discussion" : "教练追问 · 小组讨论引导"}</h2>
          <p class="muted">${language === "en" ? "Project these questions in a workshop to invite peer reflection." : "工作坊可直接投影这些问题，引导学员互评。"}</p>
          <ul>
            ${coachPromptMarkup(save, language, decision)}
          </ul>
        </section>
        <div class="certification-badge ${cert.passed ? "passed" : ""}">
          <span>${language === "en" ? "Certification" : "能力认证"}</span>
          <strong>${cert.passed ? (language === "en" ? `Certified · ${cert.level}` : `认证通过 · ${cert.level}`) : (language === "en" ? `Not Certified · ${cert.next}` : `未认证 · ${cert.next}`)}</strong>
        </div>
        <div class="cert-details">
          <p>${language === "en" ? "Requirements: assessment score and role focus abilities." : "认证条件：测评总分与角色重点能力合计。"}</p>
          <p><strong>${language === "en" ? "Assessment" : "测评总分"}</strong> ${cert.score}/42 · <strong>${language === "en" ? "Focus abilities" : "重点能力"}</strong> ${ROLES[save.profile.role].focusAbilities.reduce((sum, id) => sum + abilityLevel(save.profile.abilities[id]), 0)}/30</p>
          <ul>
            ${ROLES[save.profile.role].focusAbilities
              .map(
                (id) =>
                  `<li>${abilityDisplay(language, id).name} Lv.${abilityLevel(save.profile.abilities[id])}</li>`
              )
              .join("")}
          </ul>
          <button data-action="apply-certification">${language === "en" ? "Apply for Certification" : "申请认证"}</button>
          <button data-action="certification-help">${language === "en" ? "How Certification Points Work" : "认证点如何获得"}</button>
        </div>
        ${certificationCredentialMarkup(save, language)}
        <button data-action="reset-profile">${uiString(language, "resetProfile")}</button>
        <button data-action="export-save">${uiString(language, "exportSave")}</button>
        <button data-action="export-report">${uiString(language, "exportReport")}</button>
        <button data-action="copy-save-link">${uiString(language, "copySaveLink")}</button>
        <p class="save-reminder">${language === "en" ? "This save lives only in this browser. Export or copy the link regularly." : "本存档仅保存在当前浏览器，请定期导出或复制链接。"}</p>
        <button data-action="export-report-card">${language === "en" ? "Generate Report Card" : "生成报告卡片"}</button>
        <canvas id="report-card-canvas" width="900" height="520" hidden></canvas>
        ${
          ONLINE_ENABLED
            ? ""
            : `<p class="static-lock-note">${language === "en" ? "Static build keeps this content: account, cloud save, leaderboard and auto-match are bundled but need the online build plus backend. Local alternatives stay available: export save, copy link, local duo, manual WebRTC." : "静态版已保留这部分内容：账号、云存档、排行榜、云端自动匹配代码均已内置，但需在线版与后端才可启用。本地仍可用：导出存档、复制存档链接、本地双人、手动远程对战。"}</p>`
        }
        <button class="online-only" data-action="cloud-sync" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${uiString(language, "cloudSync")}${ONLINE_ENABLED ? "" : (language === "en" ? " (Demo)" : "（演示）")}</button>
        <button class="online-only" data-action="cloud-load" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${uiString(language, "cloudLoad")}${ONLINE_ENABLED ? "" : (language === "en" ? " (Demo)" : "（演示）")}</button>
        <button class="online-only" data-action="cloud-leaderboard" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (language === "en" ? "Demo locked in static build" : "静态版演示锁定")}">${uiString(language, "cloudLeaderboard")}${ONLINE_ENABLED ? "" : (language === "en" ? " (Demo)" : "（演示）")}</button>
        <div class="account-panel online-only">
          <h2>${uiString(language, "accountTitle")}</h2>
          ${
            cloud.accountName
              ? `<p class="account-name">${uiString(language, "accountName")}：${escapeHtml(cloud.accountName)}</p>`
              : ""
          }
          <input data-login-token placeholder="${uiString(language, "accountToken")}" value="${escapeAttr(cloud.token)}" ${ONLINE_ENABLED ? "" : "disabled"} />
          <input data-recovery-code placeholder="${uiString(language, "accountRecovery")}" value="${escapeAttr(cloud.recoveryCode)}" ${ONLINE_ENABLED ? "" : "disabled"} />
          <small class="account-recovery-note">${uiString(language, "accountRecoveryNote")}</small>
          <input data-account-username placeholder="${uiString(language, "accountUsername")}" ${ONLINE_ENABLED ? "" : "disabled"} />
          <input data-account-password type="password" placeholder="${uiString(language, "accountPassword")}" ${ONLINE_ENABLED ? "" : "disabled"} />
          <div class="account-actions">
            <button data-action="cloud-login-password" ${ONLINE_ENABLED ? "" : "disabled"}>${uiString(language, "accountPasswordLogin")}</button>
            <button data-action="cloud-login-token" ${ONLINE_ENABLED ? "" : "disabled"}>${uiString(language, "accountLogin")}</button>
            <button data-action="cloud-login-recovery" ${ONLINE_ENABLED ? "" : "disabled"}>${uiString(language, "accountRecoveryLogin")}</button>
            <button data-action="cloud-register" ${ONLINE_ENABLED ? "" : "disabled"}>${uiString(language, "cloudSync")}</button>
            <button data-action="cloud-logout" ${ONLINE_ENABLED ? "" : "disabled"}>${uiString(language, "accountLogout")}</button>
          </div>
        </div>
        <span class="cloud-status online-only" role="status" aria-live="polite">${cloud.status}</span>
        ${
          cloud.conflict
            ? `
              <div class="cloud-conflict">
                <p>${language === "en" ? "Local and cloud progress differ. Choose which version to keep." : "检测到本地与云端进度不一致，请选择保留哪一份。"}</p>
                <button data-action="cloud-use-remote">${language === "en" ? "Use Cloud Save" : "使用云端存档"}</button>
                <button data-action="cloud-force-local">${language === "en" ? "Upload Local Anyway" : "仍要上传本地"}</button>
              </div>
            `
            : ""
        }
        <label class="file-button">
          ${uiString(language, "importSave")}
          <input type="file" data-import-save accept="application/json" hidden />
        </label>
      </section>
      <section class="local-leaderboard">
        <h3>${language === "en" ? "Local Leaderboard" : "本地排行榜"}</h3>
        <p>${language === "en" ? `Best Duel Score: ${save.bestScore ?? 0} · Wins ${save.duelWins} · Losses ${save.duelLosses}` : `最佳对局分：${save.bestScore ?? 0} · 胜 ${save.duelWins} · 负 ${save.duelLosses}`}</p>
        ${
          save.duelHistory.length
            ? `<ul>${save.duelHistory
                .slice(-5)
                .reverse()
                .map(
                  (entry) =>
                    `<li>${escapeHtml(entry.opponentName)} · ${entry.playerScore}:${entry.opponentScore} · ${entry.won ? (language === "en" ? "Win" : "胜") : (language === "en" ? "Loss" : "负")}</li>`
                )
                .join("")}</ul>`
            : `<p class="muted">${language === "en" ? "Finish a duel to see local records." : "完成一局对战后会显示本地记录。"}</p><button data-action="open-duel">${language === "en" ? "Play a Duel" : "去打一局"}</button>`
        }
      </section>
      ${dueReviewMarkup(save, language)}
      ${reviewBoardMarkup(save, language)}
      <section class="wrong-answer-review">
        <h3>${language === "en" ? "Judgment Review (Missed Expert Moves)" : "判断错题集（未选专家项）"}</h3>
        ${
          wrongAnswerMarkup(save, language)
            ? `<div class="wrong-answer-list">${wrongAnswerMarkup(save, language)}</div><button class="wrong-review-cta" data-action="open-wrong-review">${language === "en" ? "Review All Missed Moves" : "一键回练错题"}</button>`
            : `<p class="muted">${language === "en" ? "No missed expert moves yet. Keep choosing deliberately." : "暂无错选，继续保持有意识判断。"}</p>`
        }
      </section>
      <section class="stat-tiles">
        <div class="stat-tile">
          <strong>${decision.counts.expert}</strong>
          <span>${language === "en" ? "Expert Decisions" : "专家级决策"}</span>
        </div>
        <div class="stat-tile">
          <strong>${decision.counts.partial}</strong>
          <span>${language === "en" ? "Partially Effective" : "部分有效"}</span>
        </div>
        <div class="stat-tile">
          <strong>${decision.counts.risk}</strong>
          <span>${language === "en" ? "High-Risk Responses" : "高风险应对"}</span>
        </div>
        <div class="stat-tile">
          <strong>${decision.totalScore}</strong>
          <span>${language === "en" ? "Decision Score" : "决策总分"}</span>
        </div>
        <div class="stat-tile">
          <strong>${save.completedRandomEvents.length}</strong>
          <span>${language === "en" ? "Random Events" : "随机事件"}</span>
        </div>
      </section>
      ${
        cloud.entries.length
          ? `
            <section class="cloud-leaderboard online-only">
              <h2>${language === "en" ? "Cloud Leaderboard" : "云端排行榜"}</h2>
              <div class="cloud-leaderboard-list">
                ${cloud.entries
                  .slice(0, 10)
                  .map(
                    (entry, index) => `
                      <div class="cloud-rank-row">
                        <span>${index + 1}</span>
                        <strong>${escapeHtml(entry.name)}</strong>
                        <em>${ROLES[entry.role as RoleId]?.shortName ?? entry.role}</em>
                        <small>${entry.score}${entry.percentile !== undefined ? ` · P${entry.percentile}` : ""}</small>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </section>
          `
          : ""
      }
      <section class="duel-history">
        <h2>${language === "en" ? "Recent Duels" : "近期对决"}</h2>
        ${
          save.duelHistory.length === 0
            ? `<p class="muted">${language === "en" ? "No duels yet. Results are saved automatically after a match." : "还没有对决记录，进入 1v1 后会自动保存。"}</p>`
            : `
              <div class="duel-history-list">
                ${save.duelHistory
                  .slice(-5)
                  .reverse()
                  .map(
                    (entry) => `
                      <div class="duel-history-row ${entry.won ? "won" : "lost"}">
                        <span>${entry.won ? (language === "en" ? "Win" : "胜") : (language === "en" ? "Loss" : "负")}</span>
                        <strong>${escapeHtml(entry.opponentName)}</strong>
                        <em>${entry.playerScore} : ${entry.opponentScore}</em>
                        <small>${new Date(entry.timestamp).toLocaleDateString()}</small>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            `
        }
      </section>
      <section class="report-grid">
        <div class="report-panel">
          <h2>${language === "en" ? "Strengths" : "优势能力"}</h2>
          ${
            strengths.length
              ? strengths
                  .map(
                    (id) => `
                      <div class="strength-row">
                        <span style="--dot:${ABILITIES[id].color}"></span>
                        <strong>${abilityDisplay(language, id).name}</strong>
                        <small>${abilityDisplay(language, id).tagline}</small>
                      </div>
                    `
                  )
                  .join("")
              : `<p class="muted">${language === "en" ? "Continue the campaign to bring an ability into the fourth rank." : "继续推进主线，先让能力进入第四段位。"}</p>`
          }
        </div>
        <div class="report-panel">
          <h2>${language === "en" ? "Recommended Training" : "建议训练"}</h2>
          ${gaps
            .map(
              (id) => `
                <div class="training-item compact">
                  <span style="--dot:${ABILITIES[id].color}"></span>
                  <strong>${abilityDisplay(language, id).name}</strong>
                  <p>${abilityDisplay(language, id).tagline}</p>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="chapter-report">
        <h2>${language === "en" ? "Chapter Performance" : "章节表现"}</h2>
        <div class="chapter-report-list">
          ${chapterReports
            .map(
              (item) => `
                <div class="chapter-report-row">
                  <span>${item.chapter.code}</span>
                  <strong>${chapterDisplay(language, item.chapter).title}</strong>
                  <div class="stars">${"★".repeat(item.stars)}${"☆".repeat(3 - item.stars)}</div>
                  <small>${item.done ? (language === "en" ? "Complete" : "已完成") : (language === "en" ? "Incomplete" : "未完成")}</small>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
      ${endingMarkup(save, language)}
    </main>
  `;
}

// 结局回顾蒙太奇：路线可视化 + 关键转折点（选择后果的叙事化呈现）。
function endingMontageMarkup(save: SaveState, language: "zh" | "en"): string {
  const en = language === "en";
  const history = save.decisionHistory;
  if (history.length === 0) return "";

  const routeClass: Record<string, string> = {
    expert: "expert",
    risk: "risk",
    partial: "partial"
  };
  const routeStrip = CHAPTERS.map((chapter) => {
    const route = save.routePath[chapter.id];
    const record = save.chapterRecords.find(
      (item) => item.chapterId === chapter.id
    );
    const reached = Boolean(record && record.completedNodeIds.length >= 1);
    return `
      <div class="route-dot ${route ? routeClass[route] : "none"} ${reached ? "reached" : ""}" title="${escapeAttr(chapterDisplay(language, chapter).title)}">
        <span>${chapter.code}</span>
      </div>
    `;
  }).join("");

  const titleOf = (nodeId: string): string => {
    try {
      return getNode(nodeId).title;
    } catch {
      return nodeId;
    }
  };

  const milestones: Array<{
    label: string;
    record: (typeof history)[number] | undefined;
  }> = [
    { label: en ? "Where you began" : "起点", record: history[0] },
    {
      label: en ? "First precise read" : "第一次精准判断",
      record: history.find((item) => item.quality === "expert")
    },
    {
      label: en ? "First bold bet" : "第一次冒险",
      record: history.find((item) => item.quality === "risk")
    },
    {
      label: en ? "Your best call" : "最佳一着",
      record: history.reduce<(typeof history)[number] | undefined>(
        (acc, item) =>
          (item.qualityScore ?? 0) > (acc?.qualityScore ?? -1) ? item : acc,
        undefined
      )
    }
  ];

  const seen = new Set<string>();
  const milestoneRows = milestones
    .filter((m) => m.record)
    .filter((m) => {
      if (!m.record) return false;
      const key = `${m.record.nodeId}-${m.record.optionIndex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((m) => {
      const record = m.record!;
      return `
        <div class="milestone-row">
          <span class="milestone-label">${m.label}</span>
          <strong>${escapeHtml(titleOf(record.nodeId))}</strong>
          <em>${qualityLabel(language, record.quality)}</em>
          <small>${record.qualityScore ?? 0}</small>
        </div>
      `;
    })
    .join("");

  return `
    <section class="ending-montage">
      <h2>${en ? "Your Journey" : "你的旅程"}</h2>
      <div class="route-strip" aria-label="${en ? "Route through chapters" : "章节路线"}">${routeStrip}</div>
      <div class="route-legend">
        <span class="expert">${en ? "Precise" : "精准"}</span>
        <span class="partial">${en ? "Steady" : "稳健"}</span>
        <span class="risk">${en ? "Bold" : "激进"}</span>
        <span class="none">${en ? "Unreached" : "未达"}</span>
      </div>
      <div class="milestone-list">${milestoneRows}</div>
    </section>
  `;
}

export function endingView(
  save: SaveState,
  language: "zh" | "en",
  endingChoice: string | undefined
): string {
  const en = language === "en";
  const decisions = save.decisionHistory.slice(-10).reverse();
  const topAbility = ABILITY_ORDER.slice().sort(
    (a, b) =>
      abilityLevel(save.profile.abilities[b]) -
        abilityLevel(save.profile.abilities[a]) ||
      (save.profile.abilities[b] ?? 0) -
        (save.profile.abilities[a] ?? 0)
  )[0];
  const relationsCount = NPCS.filter(
    (npc) => npcRelation(save, npc).status !== "尚未接触"
  ).length;
  const routeSummary = Object.entries(save.routePath)
    .map(([chapter, route]) => `${chapter}:${route}`)
    .join(" · ");
  const npcRows = NPCS.filter(
    (npc) => npcRelation(save, npc).status !== "尚未接触"
  )
    .map((npc) => {
      const view = npcDisplay(language, npc);
      return `<li>${escapeHtml(view.name)} · ${escapeHtml(view.title)}</li>`;
    })
    .join("");
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="ending-back">${uiString(language, "endingBack")}</button>
    </header>
    <main class="ending-shell" aria-label="${uiString(language, "endingTitle")}">
      <img class="ending-bg" src="./bg/bg-victory.jpg" alt="" aria-hidden="true">
      <section class="ending-hero">
        <p class="eyebrow">${uiString(language, "endingTitle")}</p>
        <h1>${save.profile.name} · ${roleDisplay(language, save.profile.role).name}</h1>
        <button data-action="ending-share">${uiString(language, "endingShare")}</button>
        <button data-action="ending-card">${uiString(language, "endingCard")}</button>
        <button data-action="open-duel">${en ? "Play Again in a Duel" : "再来一轮 1v1"}</button>
        <textarea id="ending-share-target" readonly hidden></textarea>
        <canvas id="ending-card-canvas" width="900" height="520" hidden></canvas>
      </section>
      <section class="ending-summary">
        <div>
          <span>${en ? "Signature Ability" : "招牌能力"}</span>
          <strong>${topAbility ? abilityDisplay(language, topAbility).name : "-"}</strong>
        </div>
        <div>
          <span>${en ? "Relationships" : "关系网络"}</span>
          <strong>${relationsCount} / ${NPCS.length}</strong>
        </div>
        <div>
          <span>${en ? "Decisions" : "决策总数"}</span>
          <strong>${save.decisionHistory.length}</strong>
        </div>
        <div>
          <span>${en ? "Best Score" : "最高分"}</span>
          <strong>${save.bestScore ?? 0}</strong>
        </div>
        <div class="ending-route-summary">
          <span>${en ? "Route Choices" : "路线选择"}</span>
          <strong>${routeSummary || (en ? "Not recorded" : "暂无记录")}</strong>
        </div>
      </section>
      <section class="ending-choice-panel">
        <h2>${uiString(language, "endingChoiceTitle")}</h2>
        <p>${uiString(language, "endingChoicePrompt")}</p>
        <div class="ending-choice-actions">
          <button data-action="ending-choice" data-ending="stabilize">${uiString(language, "endingChoiceStabilize")}</button>
          <button data-action="ending-choice" data-ending="expand">${uiString(language, "endingChoiceExpand")}</button>
          <button data-action="ending-choice" data-ending="legacy">${uiString(language, "endingChoiceLegacy")}</button>
        </div>
        ${
          endingChoice
            ? `<p class="ending-choice-result">${en ? `Final move: ${endingChoice}` : `最终选择：${endingChoice}`}</p>`
            : ""
        }
      </section>
      ${endingMontageMarkup(save, language)}
      <section class="ending-timeline">
        <h2>${uiString(language, "endingTimeline")}</h2>
        <div class="ending-decision-list">
          ${
            decisions.length
              ? decisions
                  .map((record) => {
                    let title = record.nodeId;
                    try {
                      title = getNode(record.nodeId).title;
                    } catch {
                      // keep id
                    }
                    return `
                      <div class="ending-decision-row">
                        <span>${qualityLabel(language, record.quality)}</span>
                        <strong>${escapeHtml(title)}</strong>
                        <small>${record.qualityScore} pts</small>
                      </div>
                    `;
                  })
                  .join("")
              : `<p class="muted">${en ? "No decisions recorded yet." : "暂无决策记录。"}</p>`
          }
        </div>
      </section>
      <section class="ending-relations">
        <h2>${uiString(language, "relationsTitle")}</h2>
        <ul>${npcRows || `<li class="muted">${en ? "No relationships established." : "尚未建立人物关系。"}</li>`}</ul>
      </section>
      <section class="ending-progress">
        <h2>${en ? "Collections" : "收集进度"}</h2>
        <p>${en ? `Hidden routes ${save.hiddenRoutes.length} · Alternate endings ${save.alternateEndings.length}` : `高阶路线 ${save.hiddenRoutes.length} · 备选结局 ${save.alternateEndings.length}`}</p>
      </section>
    </main>
  `;
}
