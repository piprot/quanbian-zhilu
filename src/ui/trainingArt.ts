import { ABILITIES, abilityLevel } from "../core/abilities";
import type { AbilityId } from "../core/types";

export function renderTrainingBoard(
  canvas: HTMLCanvasElement,
  abilityId: AbilityId,
  exp: number,
  title: string
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 640;
  const height = canvas.clientHeight || 220;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const color = ABILITIES[abilityId].color;
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#0d161b");
  background.addColorStop(0.5, "#14242b");
  background.addColorStop(1, "#0a1013");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    10,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.55
  );
  glow.addColorStop(0, `${color}22`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const steps = ["问题", "故事", "模型", "应用", "测验"];
  const nodeCount = steps.length;
  const nodeWidth = Math.min(130, width / nodeCount - 16);
  const left = 24;
  const right = width - 24;
  const usable = right - left;
  const centerY = height * 0.52;

  ctx.strokeStyle = "rgba(159, 179, 200, 0.22)";
  ctx.lineWidth = 1;
  const gridStep = 24;
  for (let x = 0; x <= width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = 0; i < nodeCount; i += 1) {
    const x = left + (usable / (nodeCount - 1)) * i;
    const y = centerY + Math.sin(i * 1.7) * 10;
    if (i < nodeCount - 1) {
      const nextX = left + (usable / (nodeCount - 1)) * (i + 1);
      const nextY = centerY + Math.sin((i + 1) * 1.7) * 10;
      ctx.beginPath();
      ctx.moveTo(x + nodeWidth / 2, y);
      ctx.lineTo(nextX - nodeWidth / 2, nextY);
      ctx.strokeStyle = `${color}55`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (let i = 0; i < nodeCount; i += 1) {
    const x = left + (usable / (nodeCount - 1)) * i - nodeWidth / 2;
    const y = centerY + Math.sin(i * 1.7) * 10 - 18;
    ctx.fillStyle = "rgba(13, 22, 27, 0.92)";
    ctx.strokeStyle = i === 2 ? color : "rgba(159, 179, 200, 0.34)";
    ctx.lineWidth = i === 2 ? 2 : 1;
    roundRect(ctx, x, y, nodeWidth, 42, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = i === 2 ? color : "#e7eef2";
    ctx.font = "600 12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(steps[i], x + nodeWidth / 2, y + 21);
  }

  ctx.fillStyle = "rgba(231, 238, 242, 0.9)";
  ctx.font = "700 13px 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(title, 16, 22);
  ctx.fillStyle = "rgba(159, 179, 200, 0.82)";
  ctx.font = "12px 'Microsoft YaHei', sans-serif";
  ctx.fillText(`Lv.${abilityLevel(exp)} · ${ABILITIES[abilityId].code}`, 16, 42);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
