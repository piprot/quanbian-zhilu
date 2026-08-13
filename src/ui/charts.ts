import { ABILITIES, ABILITY_ORDER, abilityLevel } from "../core/abilities";
import type { AbilityId } from "../core/types";
import type { GroupRadarData } from "../core/coach-workshop";

export function renderAbilityRadar(
  canvas: HTMLCanvasElement,
  abilities: Record<AbilityId, number>
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 320;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const count = ABILITY_ORDER.length;

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i <= count; i += 1) {
      const angle = -Math.PI / 2 + (i % count) * ((Math.PI * 2) / count);
      const x = cx + Math.cos(angle) * radius * (ring / 5);
      const y = cy + Math.sin(angle) * radius * (ring / 5);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(159, 179, 200, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.beginPath();
  ABILITY_ORDER.forEach((id, index) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / count);
    const value = Math.min(5, abilityLevel(abilities[id])) / 5;
    const x = cx + Math.cos(angle) * radius * value;
    const y = cy + Math.sin(angle) * radius * value;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(65, 199, 192, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "#41c7c0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ABILITY_ORDER.forEach((id, index) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / count);
    const value = Math.min(5, abilityLevel(abilities[id])) / 5;
    const x = cx + Math.cos(angle) * radius * value;
    const y = cy + Math.sin(angle) * radius * value;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = ABILITIES[id].color;
    ctx.fill();

    const labelX = cx + Math.cos(angle) * (radius + 22);
    const labelY = cy + Math.sin(angle) * (radius + 16);
    ctx.font = "12px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#e7eef2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${ABILITIES[id].name} ${abilityLevel(abilities[id])}`, labelX, labelY);
  });
}

export function renderGroupRadar(
  canvas: HTMLCanvasElement,
  data: GroupRadarData[]
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 320;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.34;
  const count = ABILITY_ORDER.length;
  const point = (index: number, ratio: number) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / count);
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio
    };
  };

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i <= count; i += 1) {
      const p = point(i % count, ring / 5);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "rgba(159, 179, 200, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ABILITY_ORDER.forEach((id, index) => {
    const p = point(index, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "rgba(159, 179, 200, 0.14)";
    ctx.stroke();
    const label = point(index, 1.16);
    ctx.font = "11px 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#c6d2dc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ABILITIES[id].code, label.x, label.y);
  });

  const byAbility = (id: AbilityId) =>
    data.find((item) => item.ability === id) ?? {
      ability: id,
      min: 0,
      max: 0,
      median: 0,
      average: 0,
      distribution: []
    };

  const bandMin: Array<{ x: number; y: number }> = [];
  const bandMax: Array<{ x: number; y: number }> = [];
  ABILITY_ORDER.forEach((id, index) => {
    const row = byAbility(id);
    bandMin.push(point(index, Math.max(0, Math.min(1, row.min / 100))));
    bandMax.push(point(index, Math.max(0, Math.min(1, row.max / 100))));
  });

  ctx.beginPath();
  bandMin.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = "rgba(79, 210, 204, 0.08)";
  ctx.fill();

  ctx.beginPath();
  bandMax.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.strokeStyle = "rgba(79, 210, 204, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ABILITY_ORDER.forEach((id, index) => {
    const p = point(index, Math.max(0, Math.min(1, byAbility(id).median / 100)));
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.strokeStyle = "#4fd2cc";
  ctx.lineWidth = 2;
  ctx.stroke();

  ABILITY_ORDER.forEach((id, index) => {
    const row = byAbility(id);
    const average = Math.max(0, Math.min(1, row.average / 100));
    const p = point(index, average);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#f2c14e";
    ctx.fill();
    for (const value of row.distribution) {
      const v = Math.max(0, Math.min(1, value / 100));
      const tick = point(index, v);
      ctx.beginPath();
      ctx.arc(tick.x, tick.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(159, 179, 200, 0.55)";
      ctx.fill();
    }
  });
}
