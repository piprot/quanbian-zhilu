import { spawn } from "node:child_process";
import { chromium } from "playwright";

const root = process.cwd();
const port = 4180;
const url = `http://127.0.0.1:${port}`;
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
  {
    cwd: root,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"]
  }
);

let serverLog = "";
server.stdout.on("data", (chunk) => (serverLog += String(chunk)));
server.stderr.on("data", (chunk) => (serverLog += String(chunk)));

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not ready
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Vite server did not start");
}

const roles = [
  { id: "parachute", zh: "空降管理者", label: "QA-空降" },
  { id: "founder", zh: "创业者", label: "QA-创业" },
  { id: "highPotential", zh: "高潜人才", label: "QA-高潜" }
].filter((role) => !process.env.ROLE || process.env.ROLE === role.id);

async function clickByText(page, text, timeout = 10000) {
  const locator = page.getByRole("button", { name: new RegExp(text) }).first();
  await locator.waitFor({ state: "visible", timeout });
  await locator.click();
}

async function chooseBestEnabled(page) {
  const options = page.locator(
    'button[data-action="choose-option"]:not([disabled])'
  );
  try {
    await options.first().waitFor({ state: "visible", timeout: 3000 });
  } catch {
    const explore = page
      .locator('[data-action="expedition-explore"]:not([disabled])')
      .first();
    if (await explore.isVisible().catch(() => false)) {
      await explore.click();
      await page.waitForTimeout(300);
    }
    if ((await options.first().isVisible().catch(() => false)) === false) {
      const restore = page
        .locator('button[data-action="energy-restore"]')
        .first();
      await restore.waitFor({ state: "visible", timeout: 10000 });
      await restore.click();
      await page.waitForTimeout(300);
    }
  }
  const count = await options.count();
  let best = null;
  for (let i = 0; i < count; i += 1) {
    const quality = await options.nth(i).getAttribute("data-quality");
    const priority = quality === "expert" ? 0 : quality === "partial" ? 1 : 2;
    if (!best || priority < best.priority) {
      best = { index: i, quality, priority };
    }
  }
  if (!best) {
    throw new Error("no enabled story option found");
  }
  await options.nth(best.index).click();
  return best.quality;
}

async function clickNextOutcome(page) {
  const candidates = [
    "完成分叉",
    "查看章节过渡",
    "进入高阶复盘",
    "进入路线分叉",
    "进入角色分岔",
    "返回地图",
    "继续主线",
    "返回主线地图",
    "返回主线"
  ];
  for (const text of candidates) {
    const button = page.getByRole("button", { name: new RegExp(text) }).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      return text;
    }
  }
  throw new Error(`no outcome navigation button found on ${await page.locator("body").innerText()}`);
}

async function solveHiddenBranch(page) {
  for (let step = 0; step < 30; step += 1) {
    const question = page.locator(".hidden-route-question");
    if ((await question.count()) === 0) break;
    const options = question.locator('button[data-action="hidden-option"]');
    const count = await options.count();
    let solved = false;
    for (let i = 0; i < count; i += 1) {
      await options.nth(i).click();
      const feedback = page.locator(".hidden-route-feedback");
      const done = page.locator(".hidden-branch-grid");
      await Promise.race([
        feedback.waitFor({ state: "visible", timeout: 5000 }),
        done.waitFor({ state: "visible", timeout: 5000 })
      ]);
      if ((await done.count()) > 0) {
        solved = true;
        break;
      }
      const nextButton = page
        .locator('button[data-action="hidden-next"]')
        .first();
      const label = (await nextButton.innerText()) || "";
      await nextButton.click();
      if (label.includes("下一节点") || label.includes("Next Step")) {
        solved = true;
        break;
      }
    }
    if (!solved) {
      throw new Error("hidden route could not be solved");
    }
  }
  const exitButton = page
    .locator('button[data-action="continue-hidden-exit"]')
    .first();
  await exitButton.waitFor({ state: "visible", timeout: 10000 });
  await exitButton.click();
}

async function continueAfterSubOutcome(page, branchVisited) {
  let nav = await clickNextOutcome(page);
  if (nav === "进入高阶复盘") {
    await page
      .locator(".hidden-branch-shell")
      .waitFor({ state: "visible", timeout: 10000 });
    const title = await page
      .locator(".hidden-branch-shell h1")
      .first()
      .innerText();
    branchVisited.push(`hidden:${title}`);
    await solveHiddenBranch(page);
    nav = await clickNextOutcome(page);
  }
  return nav;
}

async function runRole(browser, role) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const issues = [];
  const visited = [];
  const branchVisited = [];
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(`console: ${message.text()}`);
  });

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await clickByText(page, "创建档案");
    await page.fill("input[name=playerName]", role.label);
    await page
      .locator("main[aria-label='创建档案'] button")
      .filter({ hasText: role.zh })
      .first()
      .click();
    await clickByText(page, "开启征程");
    await page
      .locator('button[data-action="assessment-skip"]')
      .waitFor({ timeout: 10000 });
    await page.locator('button[data-action="assessment-skip"]').click();
    await clickByText(page, "进入主线");

    let campaignPassed = false;
    for (let chapter = 1; chapter <= 9; chapter += 1) {
      let attempts = 0;
      let passed = false;
      while (attempts < 3 && !passed) {
        attempts += 1;
        await page
          .locator('main[aria-label="主线地图"]')
          .waitFor({ timeout: 10000 });
        await page
          .locator(`[data-action="select-chapter"][data-chapter="${chapter}"]`)
          .first()
          .click();
        if (attempts > 1) {
          const replayButton = page
            .locator('button[data-action="retry-chapter"]')
            .first();
          if (await replayButton.isVisible().catch(() => false)) {
            await replayButton.click();
            await page
              .locator('main[aria-label="主线地图"]')
              .waitFor({ timeout: 10000 });
          }
        }
        for (let nodeIndex = 0; nodeIndex < 9; nodeIndex += 1) {
          const nodeButton = page
            .locator('main[aria-label="主线地图"] .node-row:not([disabled])')
            .filter({
              has: page.locator("em", { hasText: /主线/ })
            })
            .first();
          if ((await nodeButton.count()) === 0) {
            issues.push(
              `debug: no enabled main node at index ${nodeIndex}; nodeRows=${await page
                .locator('main[aria-label="主线地图"] .node-row')
                .count()
                .catch(() => -1)} enabled=${await page
                .locator('main[aria-label="主线地图"] .node-row:not([disabled])')
                .count()
                .catch(() => -1)} list=${(await page
                .locator(".node-list")
                .innerText()
                .catch(() => ""))
                .replace(/\n+/g, " | ")
                .slice(0, 400)}`
            );
            break;
          }
          await nodeButton.click();
          await page
            .locator('main[aria-label="剧情情境"]')
            .waitFor({ timeout: 10000 });
          const title = await page
            .locator('main[aria-label="剧情情境"] h1')
            .first()
            .innerText();
          const optionCount = await page
            .locator('button[data-action="choose-option"]')
            .count();
          const roleLens = await page
            .locator(".role-lens p")
            .first()
            .innerText()
            .catch(() => "");
          const expertCount = await page
            .locator('button[data-action="choose-option"][data-quality="expert"]')
            .count();
          const expertEnabled =
            (await page
              .locator(
                'button[data-action="choose-option"][data-quality="expert"]:not([disabled])'
              )
              .count()) > 0;
          const chosen = await chooseBestEnabled(page);
          if ((await page.locator(".integrity-gate").count()) > 0) {
            const costCorrect = page.locator('[data-cost="correct"]').first();
            if (await costCorrect.isVisible().catch(() => false)) {
              await costCorrect.click();
            } else {
              await page
                .locator(".integrity-gate [data-ability]")
                .first()
                .click();
            }
          }
          await page.locator(".outcome-panel").waitFor({ timeout: 10000 });
          const feedback = await page
            .locator(".outcome-panel p")
            .first()
            .innerText()
            .catch(() => "");
          const theory = await page
            .locator(".outcome-panel blockquote")
            .count()
            .catch(() => 0);
          const outcomeButtons = await page
            .locator(".outcome-panel button")
            .allInnerTexts()
            .catch(() => []);
          visited.push({
            chapter,
            node: title,
            options: optionCount,
            roleLens: roleLens.length > 0,
            chosen,
            expertLocked: expertCount > 0 && !expertEnabled,
            feedback: feedback.length > 0,
            theory: theory > 0,
            outcomeButtons
          });
          const outcomeNav = await continueAfterSubOutcome(page, branchVisited);
          visited[visited.length - 1].nav = outcomeNav;
          if (outcomeNav === "进入角色分岔") {
            await page
              .locator('main[aria-label="剧情情境"]')
              .waitFor({ timeout: 10000 });
            const branchTitle = await page
              .locator('main[aria-label="剧情情境"] h1')
              .first()
              .innerText();
            branchVisited.push(branchTitle);
            await chooseBestEnabled(page);
            if ((await page.locator(".integrity-gate").count()) > 0) {
              const costCorrect = page.locator('[data-cost="correct"]').first();
              if (await costCorrect.isVisible().catch(() => false)) {
                await costCorrect.click();
              } else {
                await page
                  .locator(".integrity-gate [data-ability]")
                  .first()
                  .click();
              }
            }
            await page.locator(".outcome-panel").waitFor({ timeout: 10000 });
            await continueAfterSubOutcome(page, branchVisited);
          }
        }
        if ((await page.locator('main[aria-label="章节过渡"]').count()) > 0) {
          await clickByText(page, "精准路线");
          const forkButton = page
            .locator("button", { hasText: "进入路线分叉" })
            .first();
          if (await forkButton.isVisible().catch(() => false)) {
            await forkButton.click();
            await page
              .locator('main[aria-label="剧情情境"]')
              .waitFor({ timeout: 10000 });
            const forkTitle = await page
              .locator('main[aria-label="剧情情境"] h1')
              .first()
              .innerText();
            branchVisited.push(`fork:${forkTitle}`);
            await chooseBestEnabled(page);
            await page.locator(".outcome-panel").waitFor({ timeout: 10000 });
            await continueAfterSubOutcome(page, branchVisited);
          }
          const continueButton = page
            .locator("button", { hasText: "继续主线" })
            .first();
          if (await continueButton.isVisible().catch(() => false)) {
            await continueButton.click();
          }
          passed = true;
        } else {
          issues.push(`chapter ${chapter} attempt ${attempts} not passed`);
          issues.push(
            `debug: transition=${await page
              .locator('main[aria-label="章节过渡"]')
              .count()
              .catch(() => -1)} main=${(await page
              .locator("main")
              .first()
              .innerText()
              .catch(() => ""))
              .split("\n")
              .filter((line) => line.trim())
              .slice(0, 8)
              .join(" | ")}`
          );
          issues.push(
            `debug: nodeRows=${await page
              .locator('main[aria-label="主线地图"] .node-row')
              .count()
              .catch(() => -1)} enabled=${await page
              .locator('main[aria-label="主线地图"] .node-row:not([disabled])')
              .count()
              .catch(() => -1)} list=${(await page
              .locator(".node-list")
              .innerText()
              .catch(() => ""))
              .replace(/\n+/g, " | ")
              .slice(0, 300)}`
          );
          issues.push(
            `save=${JSON.stringify(
              await page
                .evaluate(() => {
                  const raw = localStorage.getItem("adaptive-ascent-save-v1");
                  if (!raw) return null;
                  const parsed = JSON.parse(raw);
                  return {
                    chapterRecords: parsed.chapterRecords,
                    unlockedChapters: parsed.unlockedChapters,
                    decisionHistory: parsed.decisionHistory
                  };
                })
                .catch(() => null)
            )}`
          );
          if (attempts < 3) {
            await page
              .locator('main[aria-label="主线地图"]')
              .waitFor({ timeout: 10000 });
          }
        }
      }
      if (!passed) {
        issues.push(`chapter ${chapter} failed after retries`);
        break;
      }
      campaignPassed = chapter === 9;
    }

    if (campaignPassed) {
      // 章节全部通关后，从报告中心打开角色结局。
      await page
        .locator('[data-action="open-report"]')
        .first()
        .waitFor({ timeout: 10000 });
      await page.locator('[data-action="open-report"]').first().click();
      await page
        .locator('[data-action="open-ending"]')
        .first()
        .waitFor({ timeout: 10000 });
      await page.locator('[data-action="open-ending"]').first().click();
      await page
        .locator("text=结局时间线")
        .waitFor({ timeout: 10000 });
    }

    const ending = await page.locator("body").innerText();
    const endingText = ending.includes("结局")
      ? ending.split("\n").filter((line) => line.trim()).slice(0, 8).join(" | ")
      : "ENDING NOT FOUND";
    return { role: role.id, visited, branchVisited, ending: endingText, issues };
  } catch (error) {
    issues.push(`fatal: ${error.message}`);
    issues.push(
      `page: ${(await page.locator("body").innerText().catch(() => ""))
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 12)
        .join(" | ")}`
    );
    issues.push(
      `decisionPanel: ${await page
        .locator(".decision-panel")
        .innerText()
        .catch(() => "none")}`
    );
    issues.push(
      `optionListCount: ${await page
        .locator(".option-list")
        .count()
        .catch(() => -1)} · optionButtons: ${await page
        .locator('button[data-action="choose-option"]')
        .count()
        .catch(() => -1)}`
    );
    return {
      role: role.id,
      visited,
      branchVisited,
      ending: "FAILED",
      issues
    };
  } finally {
    await context.close();
  }
}

try {
  await waitForServer();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = [];
  for (const role of roles) {
    results.push(await runRole(browser, role));
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const bad = results.filter(
    (result) =>
      result.issues.length > 0 ||
      result.ending.includes("FAILED") ||
      result.ending.includes("NOT FOUND") ||
      result.visited.length !== 81
  );
  if (bad.length > 0) {
    console.error("ROLE CAMPAIGN AUDIT FAILED");
    process.exit(1);
  }
  console.log("PASS role campaign audit");
} finally {
  server.kill();
}
