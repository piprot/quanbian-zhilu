/** 美术资源 URL 辅助：把 key 解析为 public/art 或 public/bg 下的静态图地址。 */

export function chapterArtStyle(chapterId: number): string {
  const url = new URL(`./art/chapter-${chapterId}.jpg`, window.location.href).href;
  return `--chapter-art:url('${url}')`;
}

/**
 * 统一的美术资源 URL 注册表。
 *
 * 所有非章节、非 NPC 的补充美术图都通过这里解析路径：
 * - 放入 public/art 或 public/bg 目录下的图片会被 Vite 原样拷贝到 dist 根
 * - 若图片尚未生成（文件缺失），浏览器会走 onerror fallback 展示纯色块，不会白屏
 *
 * 命名规范（与 scripts/generate-real-art.mjs 同步）：
 *   menu-card-00 ~ menu-card-10      首页十大模块卡片封面
 *   power-stage-1 ~ power-stage-9  权力架构九章进度标记
 *   role-parachute / role-founder / role-highPotential  三张角色立绘（jpg，替代原有 svg 简笔画）
 *   duel-lobby / duel-match / duel-reveal  1v1 三场景
 *   ach-cat-story/training/trial/duel/event/rank  成就六大类封面
 *   ach-badge-base    通用成就徽章底版
 *   ability-01 ~ ability-10   十项能力小插画
 *   bg-duel-lobby    1v1 大厅全屏背景（放 bg 目录）
 */
export function artAsset(key: string, _opts: { directApi?: boolean } = {}): string {
  if (!key) return "";
  // All images now use local Unsplash photos in public/art/ and public/bg/
  const useBgDir = key.startsWith("bg-");
  const dir = useBgDir ? "bg" : "art";
  const ext = key.endsWith(".svg") ? "svg" : "jpg";
  const filename = key.endsWith(".jpg") || key.endsWith(".svg") ? key : `${key}.${ext}`;
  return new URL(`./${dir}/${filename}`, window.location.href).href;
}
