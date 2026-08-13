import { chromium } from "playwright";
import { DEFAULT_SAVE } from "../src/core/game.ts";

// Local network proxies may terminate TLS for test endpoints.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const appUrl =
  process.env.PUBLIC_APP_URL ||
  "https://piprot.github.io/shengwei-game-starter/";

function makeSave(name) {
  const save = structuredClone(DEFAULT_SAVE);
  save.profileCreated = true;
  save.profile.role = "highPotential";
  save.profile.name = name;
  save.playCount = 1;
  save.unlockedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return save;
}

async function loadApp(context, save, viewport) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(appUrl, { waitUntil: "networkidle", timeout: 30000 });
  await page.evaluate(
    ({ saveJson }) => {
      localStorage.setItem("adaptive-ascent-save-v1", saveJson);
      localStorage.setItem("adaptive-ascent-lang", "en");
    },
    { saveJson: JSON.stringify(save) }
  );
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector("text=Ascend", { timeout: 30000 });
  return { page, errors };
}

try {
  const response = await fetch(appUrl);
  if (!response.ok) {
    throw new Error(`Public app returned ${response.status}. GitHub Pages is not deployed yet.`);
  }

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
  });

  const host = await loadApp(desktop, makeSave("Public Host"), {
    width: 1280,
    height: 900
  });
  const joiner = await loadApp(mobile, makeSave("Public Joiner"), {
    width: 390,
    height: 844
  });

  await host.page.click("text=Enter 1v1");
  await host.page.click("[data-action=set-duel-mode][data-mode=remote]");
  await host.page.click("[data-action=create-remote]");
  await host.page.waitForSelector("textarea[data-copy-target]");
  const invite = await host.page.locator("textarea[data-copy-target]").inputValue();

  await joiner.page.click("text=Enter 1v1");
  await joiner.page.click("[data-action=set-duel-mode][data-mode=remote]");
  await joiner.page.fill("textarea[data-remote-input]", invite);
  await joiner.page.click("[data-action=join-remote]");
  await joiner.page.waitForSelector("textarea[readonly]");
  const answer = await joiner.page.locator("textarea[readonly]").last().inputValue();

  await host.page.fill("textarea[data-answer-input]", answer);
  await host.page.click("[data-action=finish-remote]");

  await Promise.all([
    host.page.waitForSelector(".duel-options", { timeout: 20000 }),
    joiner.page.waitForSelector(".duel-options", { timeout: 20000 })
  ]);

  const allErrors = [...host.errors, ...joiner.errors];
  if (allErrors.length > 0) {
    throw new Error(`Page errors: ${allErrors.join(" | ")}`);
  }

  await browser.close();
  console.log(`PASS public dual-context WebRTC audit (${appUrl})`);
} catch (error) {
  console.error(`FAIL public dual-context WebRTC audit: ${error.message}`);
  process.exit(1);
}
