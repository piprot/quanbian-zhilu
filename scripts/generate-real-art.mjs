#!/usr/bin/env node
/**
 * generate-real-art.mjs
 * ---------------------
 * 批量调用 Trae 内置 AI 画图接口，生成"升维 · 自适应领导力情境游戏"所需的 50+ 张真实美术图
 * （替代之前单调的 CSS 几何 SVG）。与 src/ui/App.ts 中的 artAsset() 注册表保持命名约定一致。
 *
 * 用法：
 *   node scripts/generate-real-art.mjs          # 只下载缺失的图片（默认）
 *   node scripts/generate-real-art.mjs --force  # 强制覆盖所有图片
 *   node scripts/generate-real-art.mjs --dry    # 只打印清单，不下载
 *
 * 下载位置：
 *   public/art/*.jpg   章节 / 角色 / 成就 / 能力 / 藏宝图 / 1v1 场景 等图片资源
 *   public/bg/*.jpg    全屏背景图
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- 基础路径 ---------- //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const ART_DIR = path.join(PUBLIC_DIR, "art");
const BG_DIR = path.join(PUBLIC_DIR, "bg");
fs.mkdirSync(ART_DIR, { recursive: true });
fs.mkdirSync(BG_DIR, { recursive: true });

// ---------- 参数解析 ---------- //
const argv = new Set(process.argv.slice(2));
const FORCE = argv.has("--force") || argv.has("-f");
const DRY = argv.has("--dry") || argv.has("-n");
const CLEAN = argv.has("--clean") || argv.has("-c");

// ---------- 占位图识别（真实 AI 图 vs text_to_image 生成中占位图） ---------- //
// 经实测：真实 AI 图（landscape_16_9 / portrait_4_3 / square_hd）全部 > 250 KB，
//         而 text_to_image "The image is generating..." 占位图稳定在约 172 KB。
// 因此简单阈值即可 100% 区分，无需复杂 magic number + 内容检测。
const MIN_REAL_JPEG_BYTES = 250 * 1024; // 250 KB

/**
 * 判断 buffer 是否为真实 AI 生成的 JPEG（不是"生成中"占位图）
 *  1. 文件必须 ≥ MIN_REAL_JPEG_BYTES（真实图全在 300KB~1.5MB，占位图稳定 172KB）
 *  2. 必须是合法 JPEG 开头（FF D8 FF），防止拿到 HTML/JSON/text
 */
function isValidJpeg(buf) {
  if (!buf || buf.length < MIN_REAL_JPEG_BYTES) return false;
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return false;
  return true;
}

/**
 * 扫描 ART_DIR / BG_DIR，把疑似占位图（< MIN_REAL_JPEG_BYTES 的 .jpg）全部删除，
 * 保证后续 --force 重下之前，本地不会再有假图被误判。
 */
function cleanPlaceholders() {
  let removed = 0;
  let freedKb = 0;
  for (const dir of [ART_DIR, BG_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.toLowerCase().endsWith(".jpg")) continue;
      const fp = path.join(dir, file);
      try {
        const size = fs.statSync(fp).size;
        if (size < MIN_REAL_JPEG_BYTES) {
          fs.unlinkSync(fp);
          removed++;
          freedKb += size / 1024;
          log(`[clean] removed placeholder: ${path.relative(ROOT, fp)} (${(size/1024).toFixed(1)} KB, < ${MIN_REAL_JPEG_BYTES/1024} KB threshold)`);
        }
      } catch {
        // ignore
      }
    }
  }
  if (removed > 0) log(`[clean] done: removed ${removed} placeholder files, freed ${freedKb.toFixed(0)} KB`);
  else log(`[clean] no placeholder files found (< ${MIN_REAL_JPEG_BYTES/1024} KB)`);
}

// ---------- 统一画图接口 ---------- //
const IMAGE_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";

// ============ 图片清单 =============================================
// 命名规范与 artAsset() 注释完全同步！
//   size ∈  square_hd (1:1 高清) | square | landscape_16_9 | portrait_4_3
// ==================================================================
// prettier-ignore
const MANIFEST = [
  // ---------- 1. 首页 10 大模块封面（+ 00 继续上次）：landscape_16_9 卡片封面 ----------
  { dir: "art", name: "menu-card-00", size: "landscape_16_9", prompt: "Cinematic dark thriller, open book with neon bookmarks glowing, last chapter page corner folded, cinematic lighting, shallow depth of field, film grain, 8k" },
  { dir: "art", name: "menu-card-01", size: "landscape_16_9", prompt: "Ancient Chinese scroll showing power map of nine chapters, ink wash painting mixed with cyberpunk neon glow, dragon silhouette at bottom, cinematic composition, dark cinematic lighting" },
  { dir: "art", name: "menu-card-02", size: "landscape_16_9", prompt: "Two silhouettes facing each other across a modern boardroom table at dusk, tension in the air, dramatic window light, dramatic side lighting, cinematic film still, dark moody office interior" },
  { dir: "art", name: "menu-card-03", size: "landscape_16_9", prompt: "Ten floating glowing ability orbs in ten distinct colors arranged in radar grid, modern leadership dashboard UI holographic projection, dark cinematic, particle effects, 8k render" },
  { dir: "art", name: "menu-card-04", size: "landscape_16_9", prompt: "Data analyst reviewing radar chart performance report with pen in hand, modern glass office, golden hour light, documents and sticky notes scattered, cinematic shallow depth of field" },
  { dir: "art", name: "menu-card-05", size: "landscape_16_9", prompt: "Golden bronze trophy wall display with rare achievement badges glowing, glass trophy cabinet, cinematic spotlight, dark background, shallow depth of field" },
  { dir: "art", name: "menu-card-06", size: "landscape_16_9", prompt: "Organization relationship network graph visualized with glowing avatar nodes, six degrees of separation, dark cinematic background, neon connecting lines, office silhouettes" },
  { dir: "art", name: "menu-card-07", size: "landscape_16_9", prompt: "Video game dungeon trial gate with MBA case file floating in air, mystical dungeon entrance with neon runes, cinematic fantasy meets corporate dark mood" },
  { dir: "art", name: "menu-card-08", size: "landscape_16_9", prompt: "Minimalist dark settings control panel with glowing sliders sound language toggles, futuristic UI, cyberpunk control console, cinematic volumetric lighting" },
  { dir: "art", name: "menu-card-09", size: "landscape_16_9", prompt: "Three leadership role dossiers with portraits: parachute executive, startup founder, and high potential young manager, file folders on mahogany desk, dramatic warm lamp light, film noir mood" },
  { dir: "art", name: "menu-card-10", size: "landscape_16_9", prompt: "Corporate training coach workshop, whiteboard with team radar chart comparison, facilitation post-its, executives in meeting room, cinematic warm lighting with depth" },

  // ---------- 2. 权力架构九章进度标记：square_hd 领导力隐喻 ----------
  { dir: "art", name: "power-stage-1", size: "square_hd", prompt: "Diagnose the power structure: executive examining a glowing organizational hierarchy map with key decision-makers highlighted, dark cinematic boardroom, professional analytical mood" },
  { dir: "art", name: "power-stage-2", size: "square_hd", prompt: "Build power before acting: strategic chess pieces on a marble conference table representing organizational influence, dark cinematic lighting, power dynamics metaphor" },
  { dir: "art", name: "power-stage-3", size: "square_hd", prompt: "Place the right people: hands placing glowing profile cards into matching organizational slots, talent matching, dark cinematic office, warm accent light" },
  { dir: "art", name: "power-stage-4", size: "square_hd", prompt: "Align a reluctant team: leader rallying diverse team members around a shared glowing objective, dark boardroom, cinematic dramatic lighting" },
  { dir: "art", name: "power-stage-5", size: "square_hd", prompt: "Decide with authority: a single decisive hand signing an executive document under a dramatic spotlight, dark office, cinematic mood" },
  { dir: "art", name: "power-stage-6", size: "square_hd", prompt: "Hold power through boundaries: translucent institutional walls forming a clear structure with glowing boundary lines, dark cinematic architectural metaphor" },
  { dir: "art", name: "power-stage-7", size: "square_hd", prompt: "Institutionalize the system: a blueprint transforming into a self-running organizational machine with gears and org chart, dark cinematic engineering mood" },
  { dir: "art", name: "power-stage-8", size: "square_hd", prompt: "Break through uncertainty: a leader steering through a storm and breaking a glass wall toward clarity, dynamic cinematic, dark moody" },
  { dir: "art", name: "power-stage-9", size: "square_hd", prompt: "Anchor and succeed: passing a glowing baton from one leader to the next in a succession handover, dark cinematic stage, warm symbolic light" },

  // ---------- 3. 角色立绘（替代原 SVG 简笔画）：portrait_4_3 人物半身像 ----------
  { dir: "art", name: "role-parachute", size: "portrait_4_3", prompt: "Portrait of parachute executive middle-aged Chinese man in tailored dark suit, confident gaze, modern office background blurred, cinematic three point lighting, mature leader look, film grain" },
  { dir: "art", name: "role-founder", size: "portrait_4_3", prompt: "Portrait of Chinese startup founder young man in casual smart outfit, energetic smile, background with glowing startup whiteboard KPIs, warm cinematic lighting, entrepreneur vibe" },
  { dir: "art", name: "role-highPotential", size: "portrait_4_3", prompt: "Portrait of high potential young Chinese woman manager, crisp blazer, intelligent gaze, modern glass office background, cinematic rim lighting, professional leadership portrait" },

  // ---------- 4. 1v1 三场景（duel-lobby / duel-match / duel-reveal） ----------
  { dir: "art", name: "duel-lobby", size: "landscape_16_9", prompt: "Modern e-sports arena duel lobby with dual player stations, empty competitive arena, dramatic neon lighting, two opposing monitors glowing, dark cinematic mood, reflections on polished floor" },
  { dir: "art", name: "duel-match", size: "landscape_16_9", prompt: "Dramatic leadership duel scenario: two executives debating in boardroom, tension, dramatic split lighting left vs right, cinematic wide shot, dark moody office, blurred documents, pressure atmosphere" },
  { dir: "art", name: "duel-reveal", size: "landscape_16_9", prompt: "Cinematic dramatic reveal moment: scoreboard light show revealing winner, golden spotlight beam with particles falling, two silhouettes one cheering one consoling, dark stage epic composition" },

  // ---------- 5. 成就六大类封面 ----------
  { dir: "art", name: "ach-cat-story", size: "square_hd", prompt: "Narrative story book open with glowing pages, main story chapters bookmarked, cinematic warm desk lamp lighting, dark background, magical realism particles" },
  { dir: "art", name: "ach-cat-training", size: "square_hd", prompt: "Leadership training gym with mental weights dumbbells made of books, coach whistle, cinematic motivational training room, dramatic dark gym lighting with spot beam" },
  { dir: "art", name: "ach-cat-trial", size: "square_hd", prompt: "RPG trial gate dungeon with MBA case scroll, glowing magical rune door with lock, cinematic dungeon lighting, mysterious fantasy corporate hybrid" },
  { dir: "art", name: "ach-cat-duel", size: "square_hd", prompt: "Crossed swords of debate with clipboards for blades, two clashing opinions, duel arena background, dark cinematic, dramatic sparks at clash point" },
  { dir: "art", name: "ach-cat-event", size: "square_hd", prompt: "Event calendar with rare golden stamps, confetti, limited edition badge, dark desk background, top down cinematic still life, dramatic warm side light" },
  { dir: "art", name: "ach-cat-rank", size: "square_hd", prompt: "Trophy cup tier ladder bronze silver gold platinum legendary, on polished pedestal, dark cinematic spotlight, studio photography, bokeh background" },

  // ---------- 6. 成就徽章通用底版 ----------
  { dir: "art", name: "ach-badge-base", size: "square_hd", prompt: "Ornate golden achievement badge medallion base, polished enamel with gear star border, metallic highlights, dark velvet background, macro studio shot, cinematic rim lighting" },

  // ---------- 7. 十项能力小插画（顺序与 ABILITY_ORDER 一一对应）：square_hd ----------
  { dir: "art", name: "ability-01", size: "square_hd", prompt: "Get on the balcony leadership metaphor: leader standing on office building observation deck, looking down at busy organization below, cinematic dusk lighting, minimalist composition" },
  { dir: "art", name: "ability-02", size: "square_hd", prompt: "Identify adaptive challenge metaphor, magnifying glass zooming into complex organizational Venn diagram with red circles marking adaptive work, cinematic dark analytic render" },
  { dir: "art", name: "ability-03", size: "square_hd", prompt: "Regulate distress leadership metaphor, temperature gauge dial staying steady in boiling pressure cooker office, cinematic dark scene, glowing thermometer, calm in chaos" },
  { dir: "art", name: "ability-04", size: "square_hd", prompt: "Hold the tension metaphor: tightrope walker between two skyscrapers with gold bar balance pole, storm below, not flinching, cinematic dramatic composition, dark clouds" },
  { dir: "art", name: "ability-05", size: "square_hd", prompt: "Give the work back leadership metaphor, hand returning origami project to team members hands sitting around table, cinematic warm office lighting, collaborative mood" },
  { dir: "art", name: "ability-06", size: "square_hd", prompt: "Shadow authority metaphor, shadow puppet theater of leader guiding conversations from behind curtain without center stage, cinematic side lighting, mysterious but caring" },
  { dir: "art", name: "ability-07", size: "square_hd", prompt: "Draw the flame metaphor, matchstick igniting passion in team candle cluster, all candles lighting up in chain reaction, cinematic dark background, warm glow, macro" },
  { dir: "art", name: "ability-08", size: "square_hd", prompt: "Diagnose system metaphor, doctor stethoscope listening to organizational chart engine, cinematic dark blue medical lab with holographic org chart, professional mood" },
  { dir: "art", name: "ability-09", size: "square_hd", prompt: "Orchestrate intervention metaphor, conductor baton leading orchestra of diverse corporate roles each playing instrument, cinematic concert hall, spotlight, elegant composition" },
  { dir: "art", name: "ability-10", size: "square_hd", prompt: "Raise purpose anchor metaphor, large ship anchor dropping into stormy leadership sea with lighthouse beam, cinematic epic seascape, dramatic waves, guiding light" },

  // ---------- 8. 1v1 大厅全屏背景 ----------
  { dir: "bg", name: "bg-duel-lobby", size: "landscape_16_9", prompt: "Dark cinematic 1v1 duel arena full screen background, moody atmospheric foggy stadium with rows of empty seats, dramatic neon light strips along floor, polished reflections, cyberpunk corporate vibe, widescreen, suitable for behind text content" },
];

// ---------- 工具函数 ---------- //
const log = (msg) => process.stdout.write(`[art] ${msg}\n`);
const warn = (msg) => process.stderr.write(`[warn] ${msg}\n`);
const pad = (n, w = 2) => n.toString().padStart(w, "0");

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * 下载单张图片到目标路径
 * @param {{dir:string,name:string,size:string,prompt:string}} item
 * @returns {Promise<{status:'skipped'|'ok'|'fail', item, message?:string, size?:number}>}
 */
async function downloadOne(item, index, total) {
  const baseDir = item.dir === "bg" ? BG_DIR : ART_DIR;
  const targetPath = path.join(baseDir, `${item.name}.jpg`);
  const exists = fs.existsSync(targetPath);

  if (DRY) {
    return { status: "skipped", item, message: "(dry-run)" };
  }
  if (exists && !FORCE) {
    // 已存在且非 force：顺便校验是否假图（假图也当作不存在，触发重下）
    const stat = fs.statSync(targetPath);
    const existingBuf = fs.readFileSync(targetPath);
    if (isValidJpeg(existingBuf)) {
      return {
        status: "skipped",
        item,
        message: `exists ✓ (${(stat.size / 1024).toFixed(1)} KB), use --force to overwrite`
      };
    } else {
      log(`[downloadOne] ${item.name}.jpg exists but looks INVALID (${(stat.size/1024).toFixed(1)} KB), will re-download`);
      try { fs.unlinkSync(targetPath); } catch {}
    }
  }

  const url =
    `${IMAGE_API}?prompt=${encodeURIComponent(item.prompt)}` +
    `&image_size=${encodeURIComponent(item.size)}`;

  // 最多 5 次重试，间隔指数退避（5s / 10s / 15s / 20s / 25s）
  // 生成真实 AI 图通常需要 20~60s，需要给足时间
  const MAX_ATTEMPT = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPT; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "image/*" }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("image")) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          `Unexpected content-type: ${contentType || "empty"} ${
            errText ? `· ${errText.slice(0, 200)}` : ""
          }`
        );
      }
      const buf = Buffer.from(await res.arrayBuffer());
      // ⭐ 核心修复：内容级校验，不接受"生成中占位图"当作成功
      if (!isValidJpeg(buf)) {
        throw new Error(
          `Not a valid real JPEG (size=${buf.length} bytes = ${(buf.length/1024).toFixed(1)} KB, ` +
          `threshold=${MIN_REAL_JPEG_BYTES/1024} KB). Likely a "still generating" placeholder. Will retry.`
        );
      }
      fs.writeFileSync(targetPath, buf);
      return {
        status: "ok",
        item,
        size: buf.length,
        message: `${pad(index + 1)}/${total} · ${item.name}.jpg (${(buf.length / 1024).toFixed(1)} KB) · ${item.size} · attempt#${attempt}`
      };
    } catch (err) {
      if (attempt < MAX_ATTEMPT) {
        const waitMs = 5000 * attempt;
        log(`  ↻ ${pad(index+1)}/${total} · ${item.name}.jpg attempt#${attempt} failed, wait ${waitMs/1000}s: ${err?.message || err}`);
        await sleep(waitMs);
        continue;
      }
      return { status: "fail", item, message: String(err?.message || err) };
    }
  }
  return { status: "fail", item, message: "max retry" };
}

// ---------- 主流程：限并发 3 ---------- //
async function main() {
  const total = MANIFEST.length;
  log(`manifest loaded: ${total} images (art ${MANIFEST.filter(i=>i.dir==='art').length} + bg ${MANIFEST.filter(i=>i.dir==='bg').length})`);
  if (CLEAN) {
    log("--clean: removing placeholder files before downloading");
    cleanPlaceholders();
  }
  if (DRY) {
    log("dry-run mode: no files will be downloaded");
  }
  if (FORCE) {
    log("--force: will overwrite existing files");
  }

  let finished = 0;
  let ok = 0;
  let skipped = 0;
  let fail = 0;
  let totalKb = 0;
  const failures = [];

  const concurrency = 3;
  let cursor = 0;

  async function worker() {
    while (cursor < total) {
      const my = cursor++;
      const item = MANIFEST[my];
      const res = await downloadOne(item, my, total);
      finished++;
      if (res.status === "ok") {
        ok++;
        totalKb += (res.size || 0) / 1024;
        log(`✓ ${res.message}`);
      } else if (res.status === "skipped") {
        skipped++;
        log(`· ${pad(my + 1)}/${total} · ${item.name}.jpg ${res.message}`);
      } else {
        fail++;
        failures.push({ item, message: res.message });
        warn(`✗ ${pad(my + 1)}/${total} · ${item.name}.jpg failed: ${res.message}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  log("——————————————————————————————————————");
  log(`complete: ok ${ok} · skipped ${skipped} · fail ${fail} · total ${finished}/${total}`);
  if (totalKb > 0) {
    log(`downloaded: ${totalKb.toFixed(1)} KB ≈ ${(totalKb / 1024).toFixed(2)} MB`);
  }
  if (failures.length) {
    warn("—— failures ——");
    failures.forEach((f) => warn(`  ✗ ${f.item.dir}/${f.item.name}.jpg : ${f.message}`));
    process.exitCode = 1;
  } else {
    log("success: every image is ready under public/art and public/bg");
  }
}

main().catch((err) => {
  warn(`fatal: ${err?.stack || err}`);
  process.exitCode = 2;
});
