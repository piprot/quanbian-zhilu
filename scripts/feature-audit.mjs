import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const port = 4177;
const url = `http://127.0.0.1:${port}`;
const profileDir = mkdtempSync(join(tmpdir(), "adaptive-feature-audit-"));
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort"
  ],
  { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
);

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // wait
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Vite server did not start");
}

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.click("[data-action=open-profile]");
  await page.fill("input[name=playerName]", "功能审计");
  await page.click("button[data-role=highPotential]");
  await page.click("text=开启征程");
  await page.click("[data-action=assessment-skip]");
  await page.waitForSelector("text=能力基线报告");

  await page.evaluate(() => {
    const raw = localStorage.getItem("adaptive-ascent-save-v1");
    const save = raw ? JSON.parse(raw) : null;
    if (save) {
      save.chapterRecords = [
        {
          chapterId: 1,
          completedNodeIds: [
            "c1n1",
            "c1n2",
            "c1n3",
            "c1n4",
            "c1n5",
            "c1n6",
            "c1n7",
            "c1n8",
            "c1n9"
          ],
          stars: 900
        }
      ];
      save.unlockedChapters = [1, 2];
      localStorage.setItem("adaptive-ascent-save-v1", JSON.stringify(save));
      localStorage.setItem(
        "adaptive-ascent-save-role-v1-highPotential",
        JSON.stringify(save)
      );
      localStorage.setItem("adaptive-ascent-active-role-v1", "highPotential");
    }
  });
  await page.reload({ waitUntil: "networkidle" });

  await page.click("[data-action=open-map]");
  await page.waitForSelector(".map-shell");
  await page.click("[data-action=open-leadership-games]");
  await page.waitForSelector(".lg-grid");
  const gameCardCount = await page.locator(".lg-card").count();
  if (gameCardCount !== 5) {
    throw new Error(
      `leadership game center should expose 5 games, got ${gameCardCount}`
    );
  }
  await page
    .locator('[data-action="lg-start"][data-game="decision-chess"][data-mode="teach"]')
    .first()
    .click();
  await page.waitForSelector(".lg-tutorial");
  await page.locator('[data-action="lg-teach-next"]').first().click();
  await page.locator('[data-action="lg-teach-start"]').first().click();
  await page.waitForSelector(".lg-board");
  await page.locator(".lg-cell.move").first().click();
  await page.waitForTimeout(300);
  await page.locator('[data-action="lg-back"]').first().click();
  await page.waitForSelector(".lg-grid");
  for (const gameId of [
    "decision-chess",
    "game-theory",
    "resource-allocation",
    "team-management",
    "crisis-command"
  ]) {
    await page
      .locator(`[data-action="lg-start"][data-game="${gameId}"][data-mode="teach"]`)
      .first()
      .click();
    await page.waitForSelector(".lg-tutorial");
    await page.locator('[data-action="lg-back"]').first().click();
    await page.waitForSelector(".lg-grid");
  }
  await page.locator('[data-action="lg-home"]').first().click();
  await page.waitForSelector(".map-shell");
  await page.locator('[data-action="open-menu"]').first().click();
  await page.waitForSelector('[data-action="open-coach"]', {
    timeout: 15000
  });
  await page.locator('[data-action="open-coach"]').first().click();
  await page.waitForSelector(".coach-plan-panel", { timeout: 15000 });
  await page.locator('[data-action="coach-plan-goal"]').first().click();
  await page.waitForSelector('[data-action="coach-plan-challenge"]', {
    timeout: 15000
  });
  await page.locator('[data-action="coach-plan-challenge"]').first().click();
  await page.waitForSelector(".coach-plan-result", { timeout: 15000 });
  if ((await page.locator(".coach-plan-phase").count()) !== 3) {
    throw new Error("90-day coach plan should contain 3 phases");
  }
  await page.locator('[data-action="coach-plan-check"]').first().click();
  await page.locator('[data-action="open-menu"]').first().click();
  await page.waitForSelector('[data-action="open-map"]', {
    timeout: 15000
  });
  await page.locator('[data-action="open-map"]').first().click();
  await page.waitForSelector(".map-shell", { timeout: 15000 });
  await page.click("[data-action=select-chapter][data-chapter='1']");
  await page.click("[data-action=replay-chapter]");
  await page.waitForSelector(".story-shell");
  await page.locator(".option-card").first().click();
  await page.waitForSelector(".outcome-panel");
  if ((await page.locator("[data-action=continue-branch]").count()) > 0) {
    await page.click("[data-action=continue-branch]");
  }
  await page
    .waitForSelector(".hidden-branch-shell, .story-shell", {
      timeout: 5000
    })
    .catch(() => {});
  if ((await page.locator(".hidden-branch-shell").count()) > 0) {
    for (let i = 0; i < 3; i += 1) {
      await page.waitForSelector(".hidden-route-question, .hidden-route-feedback", {
        timeout: 5000
      });
      if ((await page.locator(".hidden-route-options button").count()) > 0) {
        await page.locator(".hidden-route-options button").first().click();
        await page.waitForSelector(".hidden-route-feedback");
      }
      if ((await page.locator(".hidden-route-feedback button").count()) > 0) {
        await page.locator(".hidden-route-feedback button").first().click();
      }
    }
  }
  if ((await page.locator("[data-action=open-map]").count()) === 0) {
    throw new Error("replay flow has no map exit");
  }
  await page.click("[data-action=open-map]");
  await page.waitForSelector(".map-shell");
  const playCountAfterReplay = await page.evaluate(() => {
    const raw = localStorage.getItem("adaptive-ascent-save-v1");
    return raw ? JSON.parse(raw).playCount : -1;
  });
  if (playCountAfterReplay !== 0) {
    throw new Error("replay should not write progress");
  }

  await page.click("[data-action=open-menu]");
  await page.click("[data-action=open-settings]");
  await page.waitForSelector(".settings-shell");

  await page.click("[data-action=open-menu]");
  await page.click("[data-action=open-trial]");
  await page.waitForSelector(".trial-shell");
  const stageCount = await page.locator(".trial-stage-card").count();
  if (stageCount !== 24) throw new Error(`expected 24 trial stages, got ${stageCount}`);
  await page.locator(".trial-stage-card.open button").first().click();
  await page.waitForSelector(".trial-phase-panel");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) throw new Error(`Horizontal overflow: ${overflow}px`);
  if (errors.length > 0) throw new Error(`Page errors: ${errors.join(" | ")}`);

  await browser.close();
  console.log("PASS feature audit");
} finally {
  server.kill();
  rmSync(profileDir, { recursive: true, force: true });
}
