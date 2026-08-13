/** 字符串转义与数值格式化辅助：从 App.ts 抽出的模块级工具函数。 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(value: string): string {
  return escapeHtml(value);
}

export function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
