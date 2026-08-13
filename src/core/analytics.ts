/** 轻量匿名事件日志：仅存 localStorage，不上传、不采集身份信息。 */

const ANALYTICS_KEY = "adaptive-ascent-analytics-v1";
const MAX_EVENTS = 500;

export interface AnalyticsEvent {
  name: string;
  ts: number;
  [key: string]: unknown;
}

export function trackEvent(
  name: string,
  data?: Record<string, unknown>
): void {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY) ?? "[]";
    const parsed = JSON.parse(raw) as unknown;
    const events = Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
    events.push({ name, ts: Date.now(), ...(data ?? {}) });
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // 事件日志失败不影响游戏运行
  }
}

export function readAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY) ?? "[]";
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}
