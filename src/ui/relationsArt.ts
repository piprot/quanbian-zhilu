import { NPCS, npcRelation } from "../core/npcs";
import type { SaveState } from "../core/types";

export function renderRelationGraph(
  canvas: HTMLCanvasElement,
  save: SaveState
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 640;
  const height = canvas.clientHeight || 440;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#0d161b");
  background.addColorStop(1, "#111d23");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.36;

  ctx.save();
  ctx.shadowColor = "rgba(242, 193, 78, 0.6)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#f2c14e";
  ctx.fill();
  ctx.restore();
  ctx.font = "700 16px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0d161b";
  ctx.fillText("你", cx, cy);

  NPCS.forEach((npc, index) => {
    const angle = (index / NPCS.length) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const relation = npcRelation(save, npc);
    const established = relation.status === "已建立关系";
    const known = relation.status === "存在线索";
    const weight = established ? 5 : known ? 3 : 1.2;
    const color = established
      ? "#f2c14e"
      : known
        ? "#41c7c0"
        : "rgba(159, 179, 200, 0.38)";

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.setLineDash(relation.status === "尚未接触" ? [4, 6] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    const nodeSize = established ? 14 : known ? 11 : 9;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    if (established || known) {
      ctx.shadowColor = color;
      ctx.shadowBlur = established ? 22 : 14;
    }
    ctx.fill();
    ctx.restore();

    // NPC 名字放到节点外圈（径向偏移，沿角度方向外推，避免被线盖住）
    const labelOffset = nodeSize + 18;
    const lx = cx + Math.cos(angle) * (radius + labelOffset);
    const ly = cy + Math.sin(angle) * (radius + labelOffset);
    const alignRight = Math.cos(angle) > 0.15;
    const alignLeft = Math.cos(angle) < -0.15;
    ctx.textAlign = alignRight ? "left" : alignLeft ? "right" : "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.font = established
      ? "700 15px 'Microsoft YaHei', 'PingFang SC', sans-serif"
      : known
        ? "600 14px 'Microsoft YaHei', 'PingFang SC', sans-serif"
        : "500 13px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    // 文字描边 + 阴影，保证任何背景下清晰
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(5, 10, 14, 0.95)";
    ctx.strokeText(npc.name, lx, ly);
    ctx.shadowBlur = 0;
    ctx.fillStyle = established ? "#ffe9b2" : known ? "#caf6f3" : "#dfe7ef";
    ctx.fillText(npc.name, lx, ly);
    ctx.restore();
  });
}

export function renderPowerSandbox(
  canvas: HTMLCanvasElement,
  save: SaveState,
  seed = 7,
  title = "权力关系沙盘",
  caption = "关键人物 · 信任连接 · 资源流动"
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 640;
  const height = canvas.clientHeight || 260;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#111a2a");
  background.addColorStop(0.55, "#17243a");
  background.addColorStop(1, "#0a1013");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    10,
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.55
  );
  glow.addColorStop(0, "rgba(65, 199, 192, 0.18)");
  glow.addColorStop(1, "rgba(13, 20, 32, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const random = seededRandom(seed);
  const cx = width / 2;
  const cy = height / 2 + 14;
  const radius = Math.min(width, height) * 0.33;

  ctx.save();
  ctx.font = "700 12px 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#f2c14e";
  ctx.shadowColor = "rgba(242, 193, 78, 0.55)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0d161b";
  ctx.fillText("你", cx, cy + 4);
  ctx.restore();

  NPCS.forEach((npc, index) => {
    const angle =
      (index / NPCS.length) * Math.PI * 2 - Math.PI / 2 + random() * 0.08;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const relation = npcRelation(save, npc);
    const established = relation.status === "已建立关系";
    const known = relation.status === "存在线索";
    const color = established
      ? "#f2c14e"
      : known
        ? "#41c7c0"
        : "rgba(159, 179, 200, 0.35)";
    const size = established ? 10 : known ? 8 : 6;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = established ? 4 : known ? 2.5 : 1;
    ctx.setLineDash(relation.status === "尚未接触" ? [3, 5] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = established ? 16 : 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = established ? "#0d161b" : "#e7eef2";
    ctx.font = established
      ? "700 11px 'Microsoft YaHei', sans-serif"
      : "10px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(npc.name.slice(0, 2), x, y + 4);
  });

  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 8;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(231, 238, 242, 0.92)";
  ctx.font = "700 14px 'Microsoft YaHei', sans-serif";
  ctx.fillText(title, 16, 26);
  ctx.fillStyle = "rgba(159, 179, 200, 0.85)";
  ctx.font = "12px 'Microsoft YaHei', sans-serif";
  ctx.fillText(caption, 16, 46);
  ctx.shadowBlur = 0;
}

function seededRandom(seed: number): () => number {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 233280 + 9301) % 233280;
    return state / 233280;
  };
}
