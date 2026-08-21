import { uiString, type Language } from "../core/i18n";
import type { StoryNode } from "../core/types";
import { escapeHtml } from "./escape";

export interface GroupHallViewState {
  connected: boolean;
  roomId?: string;
  players: Array<{ name: string; picked?: boolean }>;
  capacity: number;
  round?: number;
  rounds: number;
  node?: StoryNode;
  picked?: number;
  distribution?: number[];
  revealPlayers?: Array<{ name: string; pick: number }>;
  ended: boolean;
  error?: string;
}

export function groupHallView(
  language: Language,
  state: GroupHallViewState
): string {
  const en = language === "en";
  const node = state.node;
  return `
    <header class="topbar">
      <div class="brand">${uiString(language, "brand")}</div>
      <button class="link" data-action="open-map">${en ? "Back to Map" : "返回地图"}</button>
      <button class="link" data-action="open-menu">${en ? "Home" : "主页"}</button>
    </header>
    <main class="group-hall-shell" aria-label="${en ? "Group decision hall" : "群策堂"}">
      <section class="group-hall-hero">
        <p class="eyebrow">${en ? "Group Decision Hall" : "群策之堂"}</p>
        <h1>${en ? "Three heads are better than one" : "三人成虎，众智成道"}</h1>
        <p class="muted">${en ? "2-8 players answer the same dilemma, then compare the distribution and review together." : "2-8 位玩家同答一个职场两难，揭示分布后再共同复盘。"}</p>
        ${
          state.error
            ? `<p class="group-error" role="alert">${escapeHtml(state.error)}</p>`
            : ""
        }
      </section>
      ${
        state.roomId
          ? ""
          : `
          <section class="group-setup-panel">
            <label>
              <span>${en ? "Your Name" : "你的名号"}</span>
              <input name="group-name" maxlength="20" placeholder="${en ? "Enter name" : "输入名号"}" />
            </label>
            <label>
              <span>${en ? "Capacity" : "人数上限"}</span>
              <div class="group-capacity-row">
                ${[2, 4, 6, 8]
                  .map(
                    (capacity) => `
                      <button class="${state.capacity === capacity ? "selected" : ""}" data-action="group-capacity" data-capacity="${capacity}">${capacity}</button>
                    `
                  )
                  .join("")}
              </div>
            </label>
            <div class="group-setup-actions">
              <button class="primary" data-action="group-create" ${state.connected ? "" : "disabled"}>${en ? "Create Room" : "创建房间"}</button>
              <span>${en ? "or" : "或"}</span>
              <input name="group-room-id" maxlength="4" placeholder="${en ? "Room code" : "4 位房间号"}" />
              <button data-action="group-join" ${state.connected ? "" : "disabled"}>${en ? "Join Room" : "加入房间"}</button>
            </div>
            <p class="muted">${state.connected ? (en ? "Connected to group service" : "群策服务已连接") : (en ? "Connecting to group service…" : "连接协作服务中…")}</p>
          </section>
        `
      }
      ${
        state.roomId
          ? `
          <section class="group-room-panel">
            <div class="group-room-head">
              <h2>${en ? `Room ${state.roomId}` : `房间 ${state.roomId}`}</h2>
              <span>${en ? `Round ${state.round ?? 1} / ${state.rounds}` : `第 ${state.round ?? 1} / ${state.rounds} 局`}</span>
            </div>
            <div class="group-players">
              ${state.players
                .map(
                  (player) => `
                    <span class="group-player ${player.picked ? "picked" : ""}">
                      ${escapeHtml(player.name)}${player.picked ? (en ? " · picked" : " · 已选") : ""}
                    </span>
                  `
                )
                .join("")}
            </div>
            ${
              state.ended
                ? `<p class="group-ended">${en ? "Session complete. Review the distribution above, then start a new room." : "本局结束，请结合上方分布复盘，再开新局。"}</p>`
                : node
                  ? `
                    <h3>${escapeHtml(node.title)}</h3>
                    <p class="muted">${escapeHtml(node.context)}</p>
                    <p class="group-stake">${escapeHtml(node.stake)}</p>
                    <div class="group-options">
                      ${node.options
                        .map(
                          (option, index) => `
                            <button
                              class="group-option ${state.picked === index ? "selected" : ""}"
                              data-action="group-pick"
                              data-option="${index}"
                              ${state.picked !== undefined ? "disabled" : ""}
                            >
                              <strong>${escapeHtml(option.label)}</strong>
                              <small>${escapeHtml(option.summary)}</small>
                            </button>
                          `
                        )
                        .join("")}
                    </div>
                  `
                  : `<p class="muted">${en ? "Waiting for the room to start…" : "等待开局…"}</p>`
            }
            ${
              state.distribution
                ? `
                  <div class="group-distribution">
                    <h4>${en ? "Group Distribution" : "小组分布"}</h4>
                    <div class="distribution-bars">
                      ${state.distribution
                        .map((count, index) => {
                          const max = Math.max(...state.distribution!, 1);
                          const label = node?.options[index]?.label ?? `${index + 1}`;
                          return `
                            <div class="distribution-row">
                              <span>${escapeHtml(label)}</span>
                              <i><em style="width:${Math.round((count / max) * 100)}%"></em></i>
                              <b>${count}</b>
                            </div>
                          `;
                        })
                        .join("")}
                    </div>
                  </div>
                `
                : ""
            }
          </section>
        `
          : ""
      }
    </main>
  `;
}
