#!/usr/bin/env node
/**
 * download-picsum-art.mjs
 * ----------------------
 * 从 Lorem Picsum (picsum.photos) 下载真实照片，替代原先的程序化 SVG 简笔画与 AI 生图管线。
 * 用于 #14「视觉/音效质感」—— 不依赖外部生图服务，直接选图填进 public/art 与 public/npc。
 *
 * 用法：
 *   node scripts/download-picsum-art.mjs           # 只下载缺失的图片
 *   node scripts/download-picsum-art.mjs --force   # 强制覆盖
 *   node scripts/download-picsum-art.mjs --dry     # 只打印清单，不下载
 *
 * 下载位置：
 *   public/art/*.jpg    角色立绘（3:4 竖图）
 *   public/npc/*.jpg    人物关系图 NPC 头像（方形）
 *
 * 命名规范与 src/ui/assets.ts 的 artAsset() 注册表、relationsView 的 ./npc/{id}.jpg 同步。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const argv = new Set(process.argv.slice(2));
const FORCE = argv.has("--force") || argv.has("-f");
const DRY = argv.has("--dry") || argv.has("-n");

// ============ 图片清单 ============================================
//   name  → 本地文件名（不含扩展名，与 artAsset()/relationsView 一致）
//   id    → picsum.photos 的照片 id（https://picsum.photos/id/{id}/{w}/{h}）
//   dir   → 相对 public/ 的子目录（art | npc），默认 art
//   w/h   → 宽×高，默认取下方全局 W/H（角色立绘 .role-portrait = 3:4）
// ==================================================================
const W = 600;
const H = 800;
const MANIFEST = [
  // 角色立绘（替代原 role-*.svg 简笔画）
  { name: "role-parachute", id: 1005, w: W, h: H }, // 空降高管
  { name: "role-founder", id: 1027, w: W, h: H }, // 创业者
  { name: "role-highPotential", id: 1011, w: W, h: H }, // 高潜人才

  // ── NPC 头像（方形 400×400，替代原 1920×1920 AI 生图）──
  // 性别仅按姓名/作者猜测；picsum 无性别元数据，进游戏后请人工核对并按需改 id。
  // 女（她）：
  { name: "npc-assistant", id: 1015, dir: "npc", w: 400, h: 400 }, // 行政主管
  { name: "npc-finance", id: 91, dir: "npc", w: 400, h: 400 }, // 财务经理
  { name: "npc-xu", id: 1022, dir: "npc", w: 400, h: 400 }, // 小许
  { name: "npc-tang", id: 823, dir: "npc", w: 400, h: 400 }, // 唐岚
  // 男（他）：
  { name: "npc-ops", id: 1009, dir: "npc", w: 400, h: 400 }, // 运营负责人
  { name: "npc-young", id: 338, dir: "npc", w: 400, h: 400 }, // 年轻骨干
  { name: "npc-veteran", id: 447, dir: "npc", w: 400, h: 400 }, // 老将
  { name: "npc-chen", id: 1012, dir: "npc", w: 400, h: 400 }, // 陈屿
  { name: "npc-shen", id: 660, dir: "npc", w: 400, h: 400 }, // 沈捷
  { name: "npc-he", id: 1006, dir: "npc", w: 400, h: 400 }, // 何川
  { name: "npc-fang", id: 1013, dir: "npc", w: 400, h: 400 }, // 方然
];

// ---------- 工具函数 ---------- //
const log = (msg) => process.stdout.write(`[picsum] ${msg}\n`);
const warn = (msg) => process.stderr.write(`[picsum][warn] ${msg}\n`);

/** 校验 buffer 是否为合法 JPEG（FF D8 FF 魔数 + 最小体积，避免拿到 HTML/占位） */
function isValidJpeg(buf) {
  if (!buf || buf.length < 5000) return false;
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return false;
  return true;
}

async function downloadOne(item, index, total) {
  const dir = item.dir || "art";
  const targetPath = path.join(PUBLIC_DIR, dir, `${item.name}.jpg`);
  if (DRY) return { status: "dry", item };
  if (fs.existsSync(targetPath) && !FORCE) {
    return { status: "skipped", item, message: "exists, use --force to overwrite" };
  }
  const w = item.w || W;
  const h = item.h || H;
  const url = `https://picsum.photos/id/${item.id}/${w}/${h}`;
  try {
    const res = await fetch(url, { redirect: "follow", headers: { Accept: "image/*" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const contentType = res.headers.get("content-type") || "";
    if (contentType && !contentType.includes("image")) {
      throw new Error(`unexpected content-type: ${contentType}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isValidJpeg(buf)) {
      throw new Error(`not a valid JPEG (${buf.length} bytes)`);
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, buf);
    return { status: "ok", item, size: buf.length };
  } catch (err) {
    return { status: "fail", item, message: String(err?.message || err) };
  }
}

async function main() {
  const total = MANIFEST.length;
  log(`manifest: ${total} images → public/{art,npc}`);
  if (DRY) log("dry-run: no files will be downloaded");
  if (FORCE) log("--force: will overwrite existing files");

  let ok = 0;
  let skipped = 0;
  let fail = 0;
  let totalKb = 0;
  const failures = [];

  for (let i = 0; i < total; i++) {
    const res = await downloadOne(MANIFEST[i], i, total);
    if (res.status === "ok") {
      ok++;
      totalKb += (res.size || 0) / 1024;
      log(`✓ ${i + 1}/${total} · ${res.item.dir || "art"}/${res.item.name}.jpg (${(res.size / 1024).toFixed(1)} KB)`);
    } else if (res.status === "skipped") {
      skipped++;
      log(`· ${i + 1}/${total} · ${res.item.name}.jpg ${res.message}`);
    } else if (res.status === "dry") {
      log(`· ${i + 1}/${total} · ${res.item.name}.jpg (dry-run)`);
    } else {
      fail++;
      failures.push({ item: res.item, message: res.message });
      warn(`✗ ${i + 1}/${total} · ${res.item.name}.jpg failed: ${res.message}`);
    }
  }

  log("——————————————————————————————————————");
  log(`complete: ok ${ok} · skipped ${skipped} · fail ${fail} · total ${total}`);
  if (totalKb > 0) log(`downloaded: ${totalKb.toFixed(1)} KB`);
  if (failures.length) {
    warn("—— failures ——");
    failures.forEach((f) => warn(`  ✗ ${f.item.name}.jpg : ${f.message}`));
    process.exitCode = 1;
  } else {
    log("success: all picsum images are ready under public/");
  }
}

main().catch((err) => {
  warn(`fatal: ${err?.stack || err}`);
  process.exitCode = 2;
});
