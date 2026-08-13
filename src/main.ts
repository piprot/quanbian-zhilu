import "./styles.css";
import "./training.css";
import "./trial.css";
import "./account.css";
import "./duel.css";
import "./role.css";
import "./motion.css";
import "./unlocks.css";
import "./ui/eastern-theme.css";
import "./ui/visual-upgrade-v2.css";
import "./npc-hover.css";
import "./dashboard-stamp.css";
import "./transitions.css";
import "./texture-details.css";
import "./ui/leadership-games.css";
import "./ui/team-academy.css";
import { AdaptiveGameApp } from "./ui/App";

/**
 * 启动失败兜底。
 *
 * `index.html` 在 `#app` 内预置了 `#app-static` 静态介绍页，只有应用成功启动、
 * 执行 `show("menu")` 之后才会被真实菜单替换。因此当初始化抛出异常时，玩家看到的
 * 是一个排版完整、却点什么都没反应的介绍页——比白屏更具迷惑性：它伪装成正常状态，
 * 玩家只会以为"这游戏是个空壳"。
 *
 * 这里的做法是：保留静态介绍页（它本身是有价值的内容），只在其顶部插入一条醒目的
 * 错误横幅，明确告知降级状态、提供一键清缓存重试、并折叠展示错误详情便于截图反馈。
 */

/** 防止同步 catch 与异步兜底重复插入多条横幅。 */
let bootFailureShown = false;

/** 应用是否已完成初始化，用于避免运行期的异步错误被误报成"初始化失败"。 */
let bootSucceeded = false;

/**
 * 将任意抛出物格式化为可读的错误详情文本。
 * @param error 捕获到的异常对象，可能不是 Error 实例。
 * @returns 含名称、消息与调用栈的多行文本。
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\n${error.stack || "(无调用栈)"}`;
  }
  try {
    return String(error);
  } catch {
    return "(无法读取错误信息)";
  }
}

/**
 * 清除全部 Cache Storage 与 Service Worker 注册后重新加载页面。
 *
 * 这是被旧 Service Worker 缓存钉死的玩家的自救出口：注销 SW 后普通 reload 就会
 * 直接走网络拿最新构建。清理失败也照常刷新，避免玩家卡在按钮上无路可走。
 * @param button 触发按钮，用于展示进行中状态并防止重复点击。
 */
async function clearCachesAndReload(button: HTMLButtonElement): Promise<void> {
  button.disabled = true;
  button.textContent = "正在清除缓存…";
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    // 隐私模式下 caches / serviceWorker 可能不可用，忽略后继续刷新。
  } finally {
    window.location.reload();
  }
}

/**
 * 在 `#app` 顶部插入启动失败横幅，不清空也不替换已有的静态介绍页内容。
 *
 * 样式全部内联：CSS chunk 本身就可能是加载失败的一环，不能依赖它。
 * @param error 导致启动失败的异常。
 */
function showBootFailure(error: unknown): void {
  if (bootFailureShown) {
    return;
  }
  bootFailureShown = true;

  const host = document.querySelector<HTMLElement>("#app") || document.body;
  if (!host) {
    return;
  }

  // 全屏 loading 遮罩 z-index 9999，若仍在页面上会盖住横幅，这里先摘掉。
  document.querySelector("#app-loading")?.remove();

  const banner = document.createElement("section");
  banner.setAttribute("role", "alert");
  banner.style.cssText = [
    "max-width:1040px",
    "margin:16px auto 0",
    "padding:16px 18px",
    "border:1px solid rgba(226,90,90,0.55)",
    "border-radius:12px",
    "background:#191016",
    "color:#f3e9e9",
    'font-family:system-ui,"Microsoft YaHei",sans-serif',
    "font-size:14px",
    "line-height:1.6",
    "box-shadow:0 8px 24px rgba(0,0,0,0.35)"
  ].join(";");

  const title = document.createElement("p");
  title.textContent = "游戏初始化失败，当前显示的是静态介绍页";
  title.style.cssText =
    "margin:0 0 6px;font-size:16px;font-weight:800;color:#ff8a80;letter-spacing:0";
  banner.appendChild(title);

  const hint = document.createElement("p");
  hint.textContent =
    "下方内容仅为游戏介绍，无法进行操作。多数情况是浏览器缓存了已失效的旧版本，点击下方按钮即可修复。";
  hint.style.cssText = "margin:0 0 12px;color:#d8c9c9";
  banner.appendChild(hint);

  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "清除缓存并重试";
  retry.style.cssText = [
    "appearance:none",
    "border:none",
    "border-radius:8px",
    "padding:9px 16px",
    "background:#f2c14e",
    "color:#12181b",
    "font-size:14px",
    "font-weight:700",
    "font-family:inherit",
    "cursor:pointer"
  ].join(";");
  retry.addEventListener("click", () => {
    void clearCachesAndReload(retry);
  });
  banner.appendChild(retry);

  const details = document.createElement("details");
  details.style.cssText = "margin-top:12px";

  const summary = document.createElement("summary");
  summary.textContent = "错误详情（反馈时请截图这一段）";
  summary.style.cssText = "cursor:pointer;color:#c9b6b6;font-size:13px";
  details.appendChild(summary);

  const stack = document.createElement("pre");
  stack.textContent = formatError(error);
  stack.style.cssText = [
    "margin:10px 0 0",
    "padding:10px 12px",
    "max-height:240px",
    "overflow:auto",
    "border-radius:8px",
    "background:rgba(0,0,0,0.35)",
    "color:#d9c9c9",
    "font-size:12px",
    "line-height:1.5",
    "white-space:pre-wrap",
    "word-break:break-word"
  ].join(";");
  details.appendChild(stack);
  banner.appendChild(details);

  host.insertAdjacentElement("afterbegin", banner);
}

// 异步路径兜底：模块顶层 await、动态 import 的 chunk 加载失败等都不会被下面的
// try/catch 捕获。仅在应用尚未成功启动时提示，避免运行期的无关异步错误误报。
window.addEventListener("error", (event: ErrorEvent) => {
  // 资源（img/script 等）加载失败会以 target 指向元素的形式上报，不视为初始化异常。
  if (event.target && event.target !== window) {
    return;
  }
  if (bootSucceeded) {
    return;
  }
  showBootFailure(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  if (bootSucceeded) {
    return;
  }
  showBootFailure(event.reason);
});

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  try {
    new AdaptiveGameApp(root);
    bootSucceeded = true;
  } catch (error) {
    showBootFailure(error);
  }
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    const hadController = Boolean(navigator.serviceWorker.controller);
    let updateReloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // 仅当页面已被旧 SW 控制时自动刷新，避免首次访问多加载一次。
      if (!hadController || updateReloaded) return;
      updateReloaded = true;
      window.setTimeout(() => window.location.reload(), 250);
    });
    // 固定 sw.js 地址并绕过浏览器 HTTP 缓存：只有内容真的变化时才会更新，
    // 避免每次加载带新时间戳导致 controllerchange -> reload 无限循环。
    void navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .catch(() => {
        // 隐私模式或静态部署下注册失败不阻塞游戏。
      });
  });
}
