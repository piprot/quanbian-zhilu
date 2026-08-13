import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const port = 4178;
const externalUrl = process.env.MUSIC_AUDIT_URL;
const url = externalUrl || `http://127.0.0.1:${port}`;
const profileDir = mkdtempSync(join(tmpdir(), "adaptive-music-audit-"));
const server = externalUrl
  ? null
  : spawn(
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
      // server not ready yet
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Vite server did not start");
}

try {
  if (!externalUrl) {
    await waitForServer();
  }
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem("adaptive-ascent-music", "1");
    localStorage.setItem("adaptive-ascent-music-volume", "60");
    window.__musicAudit = {
      contexts: [],
      gains: [],
      toDestination: [],
      toMusicGain: []
    };
    const Original = window.AudioContext || window.webkitAudioContext;
    if (!Original) return;
    const origCreateGain = Original.prototype.createGain;
    Original.prototype.createGain = function (...args) {
      const gain = origCreateGain.apply(this, args);
      gain.__audioId = window.__musicAudit.gains.length;
      window.__musicAudit.gains.push(gain);
      return gain;
    };
    const origConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...args) {
      const result = origConnect.apply(this, [dest, ...args]);
      try {
        if (dest && this.context && dest === this.context.destination) {
          window.__musicAudit.toDestination.push(this);
        }
        if (dest && typeof dest.__audioId === "number") {
          window.__musicAudit.toMusicGain.push({ from: this, to: dest });
        }
      } catch {
        // ignore instrumentation failures
      }
      return result;
    };
    class DebugAudioContext extends Original {
      constructor(...args) {
        super(...args);
        window.__musicAudit.contexts.push(this);
      }
    }
    window.AudioContext = DebugAudioContext;
    if ("webkitAudioContext" in window) {
      window.webkitAudioContext = DebugAudioContext;
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("body[data-app-ready='1']", { timeout: 15000 });

  const mutedAtBoot = await page.evaluate(
    () => localStorage.getItem("adaptive-ascent-music")
  );
  if (mutedAtBoot !== "1") {
    throw new Error("music audit setup failed: expected muted localStorage");
  }

  await page.locator('[data-action="start-trial-chapter"]').first().click();
  await page.waitForTimeout(900);
  const firstNode = page.locator('[data-action="open-node"]').first();
  if (await firstNode.count()) {
    await firstNode.click();
  }
  await page.waitForTimeout(900);

  await page.keyboard.press("h");
  await page.waitForTimeout(400);
  await page.locator('[data-action="open-settings"]').first().click();
  await page.locator('[data-action="toggle-music"]').first().click();
  await page.waitForTimeout(900);

  const state = await page.evaluate(() => {
    const audit = window.__musicAudit;
    const destGains = (audit?.toDestination ?? []).filter(
      (node) => typeof node?.gain?.value === "number"
    );
    const musicGains = destGains.filter(
      (node) => node.gain.value > 0.3 && node.gain.value < 0.7
    );
    const layerNodes = [
      ...new Set(
        (audit?.toMusicGain ?? [])
          .filter((entry) => musicGains.includes(entry.to))
          .map((entry) => entry.from)
      )
    ].filter((node) => typeof node?.gain?.value === "number");
    return {
      musicGainValues: musicGains.map((node) => node.gain.value),
      layerGainValues: layerNodes.map((node) => node.gain.value),
      musicStorage: localStorage.getItem("adaptive-ascent-music"),
      contextRunning: (audit?.contexts?.[0]?.state ?? "") === "running"
    };
  });

  if (state.musicStorage !== "0") {
    throw new Error(`music toggle did not persist: ${state.musicStorage}`);
  }
  if (!state.contextRunning) {
    throw new Error("audio context is not running after unmute");
  }
  if (state.musicGainValues.length === 0 || Math.max(...state.musicGainValues) <= 0.3) {
    throw new Error("music bus gain did not recover after unmute");
  }
  if (
    state.layerGainValues.length === 0 ||
    Math.max(...state.layerGainValues) <= 0.1
  ) {
    throw new Error("ambient layer gain stayed inaudible after unmute");
  }
  if (errors.length > 0) {
    throw new Error(`Page errors: ${errors.join(" | ")}`);
  }

  await browser.close();
  console.log("PASS music audit");
} finally {
  server?.kill();
  rmSync(profileDir, { recursive: true, force: true });
}
