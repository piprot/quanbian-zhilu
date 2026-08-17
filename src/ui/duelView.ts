import { aiArchetype, type DuelEngine } from "../core/duel";
import { profileSummary } from "../core/game";
import { uiString, type Language } from "../core/i18n";
import type { SaveState, StoryNode } from "../core/types";
import { aiArchetypeLabel, rankName } from "./display";
import { artAsset } from "./assets";
import { storyNodeDisplay } from "./nodeView";
import { escapeHtml } from "./escape";

export type DuelMode = "ai" | "local" | "remote";
export type DuelQuality = "expert" | "partial" | "risk";

const ONLINE_ENABLED = import.meta.env.VITE_ENABLE_ONLINE === "true";

export interface DuelLobbyState {
  duelMode: DuelMode;
  duelRounds: number;
  duelBonusReady: boolean;
  hasDuelSnapshot: boolean;
  remoteInviteCode: string;
  remoteAnswerCode: string;
  remoteStatus: string;
  cloudStatus: string;
  lastRoomId: string;
}

export interface DuelMainState {
  duelMode: DuelMode;
  lastResult: DuelEngine["roundResults"][number] | undefined;
  roundKey: string;
  duelTimedOutThisRound: boolean;
  hotSeatTurn: 0 | 1;
  localPassed: boolean;
  remotePlayerIndex: 0 | 1;
}

export interface DuelResultState {
  playerIndex: 0 | 1;
  predictionHistory: boolean[];
  predictionBonusTotal: number;
  rematchAction: "ai" | "local" | undefined;
}

function remoteLobbyMarkup(language: Language, state: DuelLobbyState): string {
  const en = language === "en";
  return `
      <div class="remote-lobby">
        ${
          !ONLINE_ENABLED
            ? `<p class="online-disabled-note" role="status">${en ? "Static build: cloud matchmaking, cloud saves, and leaderboards are unavailable. Manual invite-code remote duels still work." : "当前为静态版：云端匹配、云存档与排行榜不可用；手动邀请码远程对战仍可使用。"}</p>`
            : ""
        }
        ${
          !import.meta.env.VITE_TURN_URL
            ? `<p class="experimental-note">${en ? "Experimental: without a TURN server, strict NAT networks may not connect." : "实验性功能：未配置 TURN，严格 NAT 下可能无法建立连接。"}</p>`
            : ""
        }
        <div class="remote-create">
          <h2>${en ? "Create Room" : "创建房间"}</h2>
          <p>${en ? "Generate an invite code, send it to your opponent, and wait for their answer code." : "生成邀请码后发给对手，对手会返回一个应答码。"}</p>
          <button class="primary" data-action="create-remote">${en ? "Generate Invite" : "生成邀请码"}</button>
          ${
            state.remoteInviteCode
              ? `
                <textarea readonly rows="4" data-copy-target>${escapeHtml(state.remoteInviteCode)}</textarea>
                <button data-action="copy-invite">${en ? "Copy Invite" : "复制邀请码"}</button>
              `
              : ""
          }
        </div>
        <div class="remote-join">
          <h2>${en ? "Join Room" : "加入房间"}</h2>
          <p>${en ? "Paste the invite code, generate an answer code, and send it back to the creator." : "粘贴对方邀请码，生成应答码后发回给创建方。"}</p>
          <textarea rows="4" placeholder="${en ? "Paste opponent invite code" : "粘贴对方邀请码"}" data-remote-input></textarea>
          <button data-action="join-remote">${en ? "Generate Answer" : "生成应答码"}</button>
          ${
            state.remoteAnswerCode
              ? `
                <textarea readonly rows="4">${escapeHtml(state.remoteAnswerCode)}</textarea>
                <button data-action="copy-answer">${en ? "Copy Answer" : "复制应答码"}</button>
              `
              : ""
          }
        </div>
        <div class="remote-finish">
          <h2>${en ? "Complete Connection" : "完成连接"}</h2>
          <p>${en ? "The creator pastes the opponent's answer code and completes the connection." : "创建方粘贴对手应答码，然后点击完成连接。"}</p>
          <textarea rows="4" placeholder="${en ? "Paste opponent answer code" : "粘贴对方应答码"}" data-answer-input></textarea>
          <button class="primary" data-action="finish-remote">${en ? "Complete Connection" : "完成连接"}</button>
          <p class="status-text" role="status" aria-live="polite">${state.remoteStatus}</p>
        </div>
        ${
          ONLINE_ENABLED
            ? ""
            : `<p class="static-lock-note">${en ? "Cloud auto-match is bundled but needs the online build and room server. Manual remote via invite code works without a server." : "云端自动匹配代码已内置，但需在线版与房间服务器；手动邀请码远程对战无需服务器即可使用。"}</p>`
        }
        <div class="remote-match online-only">
          <h2>${en ? "Cloud Auto-Match" : "云端自动匹配"}</h2>
          <p>${en ? "Connect to the room server and match automatically without exchanging invite codes. The server must be deployed or running locally first." : "连接服务端后自动匹配对手，不需要手动交换邀请码。需先部署或本地运行房间服务器。"}</p>
          <button class="primary" data-action="cloud-match" ${ONLINE_ENABLED ? "" : "disabled"} title="${ONLINE_ENABLED ? "" : (en ? "Static build: online service not enabled" : "静态版未启用在线服务")}">${en ? "Start Matching" : "开始匹配"}${ONLINE_ENABLED ? "" : (en ? " (static locked)" : "（静态版锁定）")}</button>
          ${
            state.lastRoomId
              ? `<button data-action="cloud-reconnect">${uiString(language, "reconnectRoom")} · ${state.lastRoomId}</button>`
              : ""
          }
          <p class="status-text">${state.cloudStatus}</p>
        </div>
      </div>
    `;
}

export function duelLobbyMarkup(
  language: Language,
  save: SaveState,
  state: DuelLobbyState
): string {
  const summary = profileSummary(save);
  const en = language === "en";
  return `
      <header class="topbar">
        <div class="brand">${uiString(language, "brand")}</div>
        <button class="link" data-action="open-menu">${uiString(language, "returnHome")}</button>
      </header>
      <main class="duel-lobby has-lobby-art" aria-label="${en ? "Duel lobby" : "1v1 大厅"}">
        <img class="duel-lobby-bg" src="${artAsset("bg-duel-lobby")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
        <section class="duel-hero has-hero-art">
          <img class="duel-hero-art" src="${artAsset("duel-lobby")}" alt="" loading="lazy" onerror="this.style.display='none'" />
          <p class="eyebrow">${uiString(language, "duelTitle")}</p>
          <h1>${en ? "Who can make the better call in a complex situation?" : "谁能在复杂局势中做出更好的判断？"}</h1>
          <p class="muted">${en ? "Every round uses a real workplace slice, and choices are scored against an expert baseline. Remote mode connects peer to peer through WebRTC without a server." : "每一回合都使用真实职场切片，选择会被专家基准评分。远程模式通过 WebRTC 点对点连接，无需服务器。"}</p>
          <div class="mode-switch">
            <button class="${state.duelMode === "ai" ? "active" : ""}" data-action="set-duel-mode" data-mode="ai">${en ? "AI Practice" : "AI 陪练"}</button>
            <button class="${state.duelMode === "local" ? "active" : ""}" data-action="set-duel-mode" data-mode="local">${en ? "Local Duo" : "本地双人"}</button>
            <button class="${state.duelMode === "remote" ? "active" : ""}" data-action="set-duel-mode" data-mode="remote">${en ? "Remote" : "远程对战"}</button>
          </div>
          ${
            state.hasDuelSnapshot
              ? `<button class="primary resume-duel-button" data-action="resume-duel">${en ? "Resume Duel" : "继续上次对局"}</button>`
              : ""
          }
        </section>
        <section class="duel-bonus-panel">
          <div>
            <p class="eyebrow">${en ? "Daily Duel Goal" : "今日对练目标"}</p>
            <h2>${en ? "Play 3 duels today" : "今天完成 3 场 1v1"}</h2>
            <p class="muted">${en ? "Claim the Duel Pioneer title and rewards." : "领取「对练先锋」称号与奖励。"}</p>
          </div>
          <div class="duel-bonus-status">
            <strong>${save.duelsToday ?? 0} / 3</strong>
            <button data-action="claim-duel-bonus" ${state.duelBonusReady ? "" : "disabled"}>${en ? "Claim" : "领取"}</button>
          </div>
        </section>
        <section class="lobby-panel">
          <div class="lobby-row">
            <label class="field">
              <span>${en ? "Rounds" : "回合数"}</span>
              <select data-select="rounds">
                <option value="3" ${state.duelRounds === 3 ? "selected" : ""}>${en ? "3 rounds" : "3 回合"}</option>
                <option value="5" ${state.duelRounds === 5 ? "selected" : ""}>${en ? "5 rounds" : "5 回合"}</option>
                <option value="7" ${state.duelRounds === 7 ? "selected" : ""}>${en ? "7 rounds" : "7 回合"}</option>
              </select>
            </label>
            <span class="muted">${en ? `Profile: ${save.profile.name} · ${rankName(language, summary.rank)}` : `当前档案：${save.profile.name} · ${rankName(language, summary.rank)}`}</span>
          </div>
          ${
            state.duelMode === "ai"
              ? `
                <div class="mode-note">
                  <h2>${en ? "AI Practice" : "AI 陪练"}</h2>
                  <p>${en ? "The system builds an opponent from each scenario's expert baseline and your ability level, then adjusts difficulty based on your expert-decision rate. Best for sustained decision training." : "系统会根据每道情境的专家基准和你的能力水平生成对手，并基于你的专家判断率动态调整难度。适合持续训练决策质量。"}</p>
                  <p class="muted">${en ? `Next opponent style: ${aiArchetypeLabel(language, aiArchetype(save))}` : `下一场对手风格：${aiArchetypeLabel(language, aiArchetype(save))}`}</p>
                  <button class="primary" data-action="start-ai-duel">${en ? "Start Duel" : "开始对战"}</button>
                  <button data-action="start-challenge-duel">${en ? "7-Round Challenge" : "7 回合挑战赛"}</button>
                  <button data-action="start-endless-duel">${en ? "Endless Challenge" : "无尽挑战"}</button>
                </div>
              `
              : state.duelMode === "local"
                ? `
                  <div class="mode-note">
                    <h2>${en ? "Local Duo" : "本地双人"}</h2>
                    <p>${en ? "Players take turns on one device; player one hands it over after finishing. Built for classrooms, coaching workshops, and paired reviews." : "同一台设备轮流选择，玩家一完成后把设备交给玩家二。适合课堂、教练工作坊与双人复盘。"}</p>
                    <button class="primary" data-action="start-local-duel">${en ? "Start Duel" : "开始对战"}</button>
                  </div>
                `
                : remoteLobbyMarkup(language, state)
          }
        </section>
      </main>
    `;
}

export function duelRoundResultMarkup(
  language: Language,
  engine: DuelEngine,
  round: DuelEngine["roundResults"][number]
): string {
  const en = language === "en";
  return `
      <main class="duel-round-result" aria-label="${en ? "Round result" : "本回合揭晓"}">
        <p class="eyebrow">${en ? `Round ${engine.currentRound}` : `第 ${engine.currentRound} 回合`}</p>
        <h1>${en ? "Round settled" : "本回合揭晓"}</h1>
        <div class="round-result-grid">
          ${engine.players
            .map((player, index) => {
              const option = round.node.options[round.picks[index]];
              return `
                <article>
                  <strong>${escapeHtml(player.name)}</strong>
                  <p>${escapeHtml(option.label)}</p>
                  <span class="round-points">+${round.points[index]}</span>
                </article>
              `;
            })
            .join("")}
        </div>
        <p class="round-total">${en ? "Running total" : "当前总分"}：${escapeHtml(engine.players[0].name)} ${engine.scores[0]} · ${escapeHtml(engine.players[1].name)} ${engine.scores[1]}</p>
        <p class="muted">${en ? "Next round starts shortly..." : "即将进入下一回合…"}</p>
      </main>
    `;
}

export function duelResultMarkup(
  language: Language,
  save: SaveState,
  engine: DuelEngine,
  result: ReturnType<DuelEngine["toResult"]>,
  state: DuelResultState
): string {
  const en = language === "en";
  const playerIndex = state.playerIndex;
  const analysis = engine.roundResults.map((round, index) => {
    const node = round.node;
    const nodeView = storyNodeDisplay(language, save, node);
    const best =
      node.options.find((option) => option.quality === "expert") ??
      node.options[0];
    const playerPick = round.picks[playerIndex];
    const playerOption = node.options[playerPick] ?? node.options[0];
    const gap =
      playerOption.quality === "expert"
        ? en
          ? "This move matched the expert baseline. Keep applying this logic under pressure."
          : "本次应对符合专家基准，保持这种在压力下先诊断再行动的逻辑。"
        : playerOption.quality === "partial"
          ? en
            ? "Direction is right, but the execution is incomplete. Add evidence, ownership, and a check node."
            : "方向对但执行不完整，需要补充证据、负责人和检查节点。"
          : en
            ? "High-risk move. Stabilize the situation first, then turn the resistance into shared responsibility."
            : "高风险应对。先稳住局势，再把阻力变成共同责任。";
    return `
        <article class="duel-analysis-card">
          <div class="duel-analysis-head">
            <span>${index + 1}</span>
            <strong>${escapeHtml(nodeView.title)}</strong>
          </div>
          <p class="duel-analysis-context">${escapeHtml(nodeView.context)}</p>
          <div class="duel-analysis-grid">
            <div>
              <h3>${uiString(language, "duelBestMove")}</h3>
              <p>${escapeHtml(best.label)}</p>
              <small>${escapeHtml(best.theory)}</small>
            </div>
            <div>
              <h3>${uiString(language, "duelWhy")}</h3>
              <p>${escapeHtml(best.feedback)}</p>
            </div>
            <div>
              <h3>${uiString(language, "duelPlayerMove")}</h3>
              <p>${escapeHtml(playerOption.label)}</p>
            </div>
            <div>
              <h3>${uiString(language, "duelGap")}</h3>
              <p>${gap}</p>
            </div>
          </div>
          <div class="duel-round-score">
            <span>${engine.players[0].name} ${round.points[0]}</span>
            <span>${engine.players[1].name} ${round.points[1]}</span>
          </div>
        </article>
      `;
  }).join("");

  return `
      <main class="duel-result" aria-label="${en ? "Duel result" : "对决结果"}">
        <section class="result-hero">
          <p class="eyebrow">${en ? "Duel Complete" : "对决结束"}</p>
          <h1>${escapeHtml(result.winnerName)} ${en ? "wins" : "获胜"}</h1>
          <div class="result-scores">
            <span>${engine.players[0].name} <strong>${result.scores[0]}</strong></span>
            <span>${engine.players[1].name} <strong>${result.scores[1]}</strong></span>
          </div>
          ${
            state.predictionHistory.length
              ? `<p class="duel-prediction-summary">${uiString(language, "duelPredictionSummary")}：${state.predictionHistory.filter(Boolean).length} / ${state.predictionHistory.length}</p>`
              : ""
          }
          ${
            state.predictionBonusTotal
              ? `<p class="duel-prediction-bonus">${en ? "Prediction bonus" : "预判加成"} +${state.predictionBonusTotal}</p>`
              : ""
          }
          <button class="primary" data-action="open-duel-lobby">${en ? "Back to Lobby" : "返回大厅"}</button>
          ${state.rematchAction ? `<button class="primary" data-action="duel-rematch">${uiString(language, "duelRematch")}</button>` : ""}
          <button data-action="open-map">${uiString(language, "menuContinue")}</button>
        </section>
        <section class="duel-review-discussion" aria-label="${en ? "Debrief discussion" : "复盘讨论"}">
          <h2>${en ? "Debrief Discussion" : "复盘讨论"}</h2>
          <p class="muted">${en ? `Opponent style: ${aiArchetypeLabel(language, engine.players[1].archetype ?? "builder")}` : `对手风格：${aiArchetypeLabel(language, engine.players[1].archetype ?? "builder")}`}</p>
          <ul>
            <li>${en ? `Where did ${engine.players[1].name} push you outside your usual pattern?` : `${engine.players[1].name}在哪些回合把你逼出了平时的判断习惯？`}</li>
            <li>${en ? "Which decision would you defend in front of your team, and which would you revisit?" : "哪一次选择你敢在团队面前辩护，哪一次你会重新考虑？"}</li>
            <li>${en ? "What would this opponent say about your leadership style after the match?" : "这局之后，对手会怎样描述你的领导风格？"}</li>
          </ul>
        </section>
        <section class="duel-analysis">
          <h2>${uiString(language, "duelAnalysisTitle")}</h2>
          ${analysis}
        </section>
      </main>
    `;
}

export function duelPredictMarkup(
  language: Language,
  nodeView: StoryNode,
  duelMode: DuelMode
): string {
  const en = language === "en";
  return `
      <main class="duel-predict has-predict-art" aria-label="${uiString(language, "duelPredict")}">
        <img class="duel-predict-bg" src="${artAsset("duel-match")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
        <p class="eyebrow">${uiString(language, "duelPredict")}</p>
        <h1>${en ? "Bet on the opponent's style before the reveal" : "揭晓前，先押注对手风格"}</h1>
        <p class="muted">${en ? "Hit the opponent's actual style this round for a +20% score bonus (minimum +2). Style is not random: AI opponents follow their shown archetype, while local opponents behave like real players. Use hints, not luck." : "押中对方本回合的实际风格，获得本回合 20% 分数加成（至少 +2 分）。风格不是随机数：AI 陪练遵循其显示的画像，本地双人则反映真人倾向。依据线索判断，而不是碰运气。"}<br />${escapeHtml(nodeView.stake)}</p>
        ${duelMode === "local" ? `<p class="muted duel-local-note">${uiString(language, "duelLocalBetNote")}</p>` : ""}
        <div class="duel-predict-options">
          ${
            (
              [
                {
                  quality: "expert" as DuelQuality,
                  zh: "专家式",
                  en: "Expert",
                  hintZh: "对方最可能选择专家级应对",
                  hintEn: "The opponent's most likely expert move"
                },
                {
                  quality: "partial" as DuelQuality,
                  zh: "稳健式",
                  en: "Balanced",
                  hintZh: "对方可能选择稳妥推进",
                  hintEn: "The opponent may play it safe"
                },
                {
                  quality: "risk" as DuelQuality,
                  zh: "冒险式",
                  en: "Risk-taking",
                  hintZh: "对方可能冒险破局",
                  hintEn: "The opponent may take a risk"
                }
              ] as const
            )
              .map(
                (item) => `
                  <button data-action="duel-predict" data-quality="${item.quality}">
                    <strong>${en ? item.en : item.zh}</strong>
                    <span>${en ? item.hintEn : item.hintZh}</span>
                  </button>
                `
              )
              .join("")
          }
        </div>
      </main>
    `;
}

export function duelRevealMarkup(language: Language): string {
  return (
    '<main class="duel-reveal has-reveal-art" aria-label="' +
    uiString(language, "duelReveal") +
    '">' +
    '<img class="duel-reveal-bg" src="' +
    artAsset("duel-reveal") +
    '" alt="" aria-hidden="true" onerror="this.style.display=\'none\'" />' +
    "<h1>" +
    uiString(language, "duelReveal") +
    "</h1>" +
    '<div class="reveal-spinner"></div>' +
    "</main>"
  );
}

function playerPanel(
  language: Language,
  engine: DuelEngine,
  index: 0 | 1
): string {
  const player = engine.players[index];
  const picked = engine.picks[index] !== null;
  return `
      <div class="player-panel">
        <span class="player-color" style="--dot:${player.color}"></span>
        <strong>${escapeHtml(player.name)}</strong>
        ${player.isHuman ? "" : `<small class="ai-style-tag">${aiArchetypeLabel(language, player.archetype ?? "builder")}</small>`}
        <small>${picked ? (language === "en" ? "Choice made" : "已作出选择") : (language === "en" ? "Thinking" : "正在思考")}</small>
      </div>
    `;
}

function optionState(engine: DuelEngine, optionIndex: number): string {
  if (engine.picks[0] === optionIndex) return "picked p1";
  if (engine.picks[1] === optionIndex) return "picked p2";
  return "";
}

function duelPickEnabled(
  duelMode: DuelMode,
  engine: DuelEngine,
  hotSeatTurn: 0 | 1,
  localPassed: boolean,
  remotePlayerIndex: 0 | 1
): boolean {
  if (duelMode === "ai") {
    return engine.picks[0] === null;
  }
  if (duelMode === "local") {
    if (hotSeatTurn === 0) return engine.picks[0] === null;
    return localPassed && engine.picks[1] === null;
  }
  if (duelMode === "remote") {
    return engine.picks[remotePlayerIndex] === null;
  }
  return false;
}

export function duelMainMarkup(
  language: Language,
  save: SaveState,
  engine: DuelEngine,
  nodeView: StoryNode,
  state: DuelMainState
): string {
  const en = language === "en";
  const duelMode = state.duelMode;
  return `
      <header class="topbar duel-top">
        <div class="brand">${uiString(language, "duelTitle")}</div>
        <div class="duel-score">
          <span style="--dot:${engine.players[0].color}"><strong>${engine.players[0].name}</strong> ${engine.scores[0]}</span>
          <span>${en ? `Round ${Math.min(engine.currentRound + 1, engine.roundCount)} / ${engine.roundCount}` : `第 ${Math.min(engine.currentRound + 1, engine.roundCount)} / ${engine.roundCount} 回合`}</span>
          <span id="duel-timer" class="duel-timer" role="timer" style="display:none"></span>
          <span style="--dot:${engine.players[1].color}"><strong>${engine.players[1].name}</strong> ${engine.scores[1]}</span>
        </div>
      </header>
      <main class="duel-shell has-duel-art" data-round-key="${state.roundKey}" aria-label="${en ? "Duel round" : "对决回合"}">
        <img class="duel-stage-bg" src="${artAsset("duel-match")}" alt="" aria-hidden="true" onerror="this.style.display='none'" />
        ${
          state.duelTimedOutThisRound
            ? `<div class="duel-timeout-note" role="status">${en ? "This round timed out. The system chose the safest option for you." : "本回合超时，系统已自动选择最稳妥选项。"}</div>`
            : ""
        }
        ${
          state.lastResult
            ? `
              <section class="round-result">
                <span>${en ? "Previous Round" : "上一回合"}</span>
                <strong>${escapeHtml(storyNodeDisplay(language, save, state.lastResult.node).title)}</strong>
                <p>${engine.players[0].name} ${state.lastResult.points[0]} ${en ? "pts" : "分"} · ${engine.players[1].name} ${state.lastResult.points[1]} ${en ? "pts" : "分"}</p>
              </section>
            `
            : ""
        }
        <section class="duel-scenario">
          <div class="scenario-meta">
            <span>${en ? `Round ${engine.currentRound + 1}` : `回合 ${engine.currentRound + 1}`}</span>
            <span>${nodeView.title}</span>
          </div>
          <h1>${escapeHtml(nodeView.context)}</h1>
          <div class="stake"><strong>${uiString(language, "currentTest")}</strong><p>${escapeHtml(nodeView.stake)}</p></div>
        </section>
        <section class="duel-players">
          ${playerPanel(language, engine, 0)}
          <div class="versus">VS</div>
          ${playerPanel(language, engine, 1)}
        </section>
        <section class="duel-options">
          ${nodeView.options
            .map(
              (option, index) => `
                <button class="option-card ${optionState(engine, index)}" data-action="duel-pick" data-option="${index}" ${duelPickEnabled(duelMode, engine, state.hotSeatTurn, state.localPassed, state.remotePlayerIndex) ? "" : "disabled"}>
                  <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                  <span class="option-body">
                    <strong>${escapeHtml(option.label)}</strong>
                    <em>${escapeHtml(option.summary)}</em>
                  </span>
                </button>
              `
            )
            .join("")}
        </section>
        ${
          duelMode === "local" && state.localPassed && state.hotSeatTurn === 1
            ? `<div class="pass-note">${uiString(language, "playerTwoTurn")}</div>`
            : duelMode === "local" &&
                !state.localPassed &&
                state.hotSeatTurn === 0 &&
                engine.picks[0] === null &&
                !engine.finished &&
                engine.currentRound > 0
              ? `<div class="pass-note">${uiString(language, "playerOneTurn")}</div>`
              : ""
        }
        ${
          duelMode === "local" &&
          state.hotSeatTurn === 1 &&
          !state.localPassed &&
          engine.picks[0] !== null
            ? `<button class="primary pass-button" data-action="pass-local">${en ? "Pass to Player Two" : "传递给玩家二"}</button>`
            : ""
        }
      </main>
    `;
}
