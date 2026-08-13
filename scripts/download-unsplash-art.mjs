#!/usr/bin/env node
/**
 * Download curated Unsplash photos for the Shengwei game.
 * All photos are free to use under the Unsplash License (no attribution required).
 * https://unsplash.com/license
 *
 * Usage: node scripts/download-unsplash-art.mjs
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ART_DIR = join(ROOT, "public", "art");
const BG_DIR = join(ROOT, "public", "bg");

// Ensure directories exist
for (const d of [ART_DIR, BG_DIR]) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

/**
 * Build Unsplash image URL with size/quality params.
 * @param {string} photoId  - e.g. "photo-1573166364839-1bfe9196c23e"
 * @param {number} w        - width in pixels
 * @param {string} size     - "landscape" | "portrait" | "square"
 */
function unsplashUrl(photoId, w = 800) {
  return `https://images.unsplash.com/${photoId}?w=${w}&q=80&auto=format&fit=crop`;
}

/**
 * Image manifest: each entry maps a local filename to an Unsplash photo ID.
 * Themes are carefully matched to each chapter/scene's content.
 */
const MANIFEST = [
  // ── Chapter backgrounds (landscape 800×500) ──
  // Ch1 识局 Diagnose — boardroom analysis, strategic assessment
  { file: "art/chapter-1.jpg", photo: "photo-1573166364839-1bfe9196c23e", w: 800 },
  // Ch2 谋权 Power Strategy — chess, strategic positioning
  { file: "art/chapter-2.jpg", photo: "photo-1528819622765-d6bcf132f793", w: 800 },
  // Ch3 用人 Talent — team collaboration, people management
  { file: "art/chapter-3.jpg", photo: "photo-1599529108753-5fcaac8e9512", w: 800 },
  // Ch4 驭势 Momentum — leadership direction, team moving forward
  { file: "art/chapter-4.jpg", photo: "photo-1632045927895-d336d181e5d7", w: 800 },
  // Ch5 执权 Execute — business action, signing, execution
  { file: "art/chapter-5.jpg", photo: "photo-1503423571797-2d2bb372094a", w: 800 },
  // Ch6 掌权 Govern — corporate building, institutional power
  { file: "art/chapter-6.jpg", photo: "photo-1526289034009-0240ddb68ce3", w: 800 },
  // Ch7 固权 Secure — building structure, foundation, stability
  { file: "art/chapter-7.jpg", photo: "photo-1510507024924-fc3847d49ae2", w: 800 },
  // Ch8 破局 Breakthrough — light, tunnel, innovation
  { file: "art/chapter-8.jpg", photo: "photo-1523225580870-1780b3b506fd", w: 800 },
  // Ch9 成业 Legacy — sunrise, success, achievement
  { file: "art/chapter-9.jpg", photo: "photo-1490668219599-a79d4d90cf66", w: 800 },

  // ── Menu card covers (landscape 600×400) ──
  // 00 继续上次决策 — open meeting room, resume
  { file: "art/menu-card-00.jpg", photo: "photo-1769740333462-9a63bfa914bc", w: 600 },
  // 01 主线征途 — business strategy, power map
  { file: "art/menu-card-01.jpg", photo: "photo-1769771744699-7b73a101b318", w: 600 },
  // 02 1v1 对决 — chess confrontation
  { file: "art/menu-card-02.jpg", photo: "photo-1604948501466-4e9c339b9c24", w: 600 },
  // 03 能力图谱 — data dashboard, analytics
  { file: "art/menu-card-03.jpg", photo: "photo-1669158196511-0ed84160c4e6", w: 600 },
  // 04 复盘报告 — data analysis, charts
  { file: "art/menu-card-04.jpg", photo: "photo-1669158196350-9db8492f3735", w: 600 },
  // 05 成就墙 — trophy, achievement
  { file: "art/menu-card-05.jpg", photo: "photo-1560174038-da43ac74f01b", w: 600 },
  // 06 人物关系图 — network, people connection
  { file: "art/menu-card-06.jpg", photo: "photo-1771270759486-1f7703945072", w: 600 },
  // 07 成长试炼 — trial, challenge, growth
  { file: "art/menu-card-07.jpg", photo: "photo-1758520144667-3041caeff3c1", w: 600 },
  // 08 设置 — control panel, desk
  { file: "art/menu-card-08.jpg", photo: "photo-1685208277248-47739daf1089", w: 600 },
  // 09 角色档案 — dossiers, profiles
  { file: "art/menu-card-09.jpg", photo: "photo-1758520145147-c30bc656f314", w: 600 },
  // 10 教练工作坊 — training, workshop
  { file: "art/menu-card-10.jpg", photo: "photo-1776492909032-56f5c2fdd05b", w: 600 },

  // ── Backgrounds (landscape 1200×800) ──
  { file: "bg/bg-main-menu.jpg", photo: "photo-1582653291997-079a1c04e5a1", w: 1200 },
  { file: "bg/bg-victory.jpg", photo: "photo-1610238115932-44c5c930fd3a", w: 1200 },
  { file: "bg/bg-duel-lobby.jpg", photo: "photo-1586165368502-1bad197a6461", w: 1200 },

  // ── Power stages (square 400×400) ──
  { file: "art/power-stage-1.jpg", photo: "photo-1536743939714-23ec5ac2dbae", w: 400 },
  { file: "art/power-stage-2.jpg", photo: "photo-1523875194681-bedd468c58bf", w: 400 },
  { file: "art/power-stage-3.jpg", photo: "photo-1547022145-dfc3f3e1bc03", w: 400 },
  { file: "art/power-stage-4.jpg", photo: "photo-1529699211952-734e80c4d42b", w: 400 },
  { file: "art/power-stage-5.jpg", photo: "photo-1587888191477-e74ac6bc9c4b", w: 400 },
  { file: "art/power-stage-6.jpg", photo: "photo-1547022145-dfc3f3e1bc03", w: 400 },
  { file: "art/power-stage-7.jpg", photo: "photo-1536743939714-23ec5ac2dbae", w: 400 },
  { file: "art/power-stage-8.jpg", photo: "photo-1571236207041-5fb70cec466e", w: 400 },
  { file: "art/power-stage-9.jpg", photo: "photo-1606594914778-09d99f53ecf7", w: 400 },

  // ── Duel scenes (landscape 800×500) ──
  { file: "art/duel-lobby.jpg", photo: "photo-1528819622765-d6bcf132f793", w: 800 },
  { file: "art/duel-match.jpg", photo: "photo-1587888191477-e74ac6bc9c4b", w: 800 },
  { file: "art/duel-reveal.jpg", photo: "photo-1541348292705-fb0101e1446e", w: 800 },

  // ── Achievement categories (square 400×400) ──
  { file: "art/ach-cat-story.jpg", photo: "photo-1573167507387-6b4b98cb7c13", w: 400 },
  { file: "art/ach-cat-training.jpg", photo: "photo-1615803697515-3cb782c2a65a", w: 400 },
  { file: "art/ach-cat-trial.jpg", photo: "photo-1571236207041-5fb70cec466e", w: 400 },
  { file: "art/ach-cat-duel.jpg", photo: "photo-1604948501466-4e9c339b9c24", w: 400 },
  { file: "art/ach-cat-event.jpg", photo: "photo-1497366858526-0766cadbe8fa", w: 400 },
  { file: "art/ach-cat-rank.jpg", photo: "photo-1604026289299-bbd612390089", w: 400 },
  { file: "art/ach-badge-base.jpg", photo: "photo-1586165368502-1bad197a6461", w: 400 },

  // ── Ability illustrations (square 400×400) ──
  { file: "art/ability-01.jpg", photo: "photo-1497366811353-6870744d04b2", w: 400 },
  { file: "art/ability-02.jpg", photo: "photo-1694688393315-bf67df1e9903", w: 400 },
  { file: "art/ability-03.jpg", photo: "photo-1599529108753-5fcaac8e9512", w: 400 },
  { file: "art/ability-04.jpg", photo: "photo-1528819622765-d6bcf132f793", w: 400 },
  { file: "art/ability-05.jpg", photo: "photo-1503423571797-2d2bb372094a", w: 400 },
  { file: "art/ability-06.jpg", photo: "photo-1510507024924-fc3847d49ae2", w: 400 },
  { file: "art/ability-07.jpg", photo: "photo-1666548061538-4a4a94350a45", w: 400 },
  { file: "art/ability-08.jpg", photo: "photo-1543261782-0c311973bb8e", w: 400 },
  { file: "art/ability-09.jpg", photo: "photo-1630107753878-866b364cdbd9", w: 400 },
  { file: "art/ability-10.jpg", photo: "photo-1546846195-825303d86f02", w: 400 },
];

const MIN_BYTES = 5 * 1024; // 5 KB minimum

async function downloadOne(entry) {
  const outPath = join(ROOT, "public", entry.file);
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Skip if file already exists and is large enough
  if (existsSync(outPath)) {
    const sz = statSync(outPath).size;
    if (sz >= MIN_BYTES) {
      console.log(`  ✓ skip (exists, ${(sz / 1024).toFixed(0)}KB)  ${entry.file}`);
      return;
    }
  }

  const url = unsplashUrl(entry.photo, entry.w || 800);
  console.log(`  ↓ downloading  ${entry.file}  ←  ${entry.photo}`);

  try {
    const resp = await fetch(url, {
      headers: {
        "Accept": "image/jpeg,image/*,*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length < MIN_BYTES) {
      throw new Error(`Too small: ${buf.length} bytes`);
    }
    // Check JPEG magic number
    if (buf[0] !== 0xff || buf[1] !== 0xd8) {
      throw new Error(`Not JPEG: 0x${buf[0].toString(16)}${buf[1].toString(16)}`);
    }

    const { writeFileSync } = await import("node:fs");
    writeFileSync(outPath, buf);
    console.log(`  ✓ saved  ${entry.file}  (${(buf.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`  ✗ FAILED  ${entry.file}: ${err.message}`);
  }
}

async function main() {
  console.log(`\n📦 Downloading ${MANIFEST.length} Unsplash photos...\n`);

  // Download sequentially to avoid rate limiting
  for (const entry of MANIFEST) {
    await downloadOne(entry);
  }

  console.log(`\n✅ Done! Downloaded to public/art/ and public/bg/\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
