/**
 * 确定性打乱工具：用稳定字符串种子生成固定置换，把「正确项」从固定首位打散，
 * 消除玩家“无脑选 A”的漏洞。同一 seed 永远得到同一结果，因此渲染与判分天然一致，
 * 也不会随刷新/重开而漂移（避免存档答案错位）。
 */

/** FNV-1a 32 位字符串哈希：把稳定 id 变成数值种子。 */
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 伪随机数生成器：返回 [0,1) 的确定性浮点序列。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 打乱选项并重新定位正确项。
 * @param options 原始选项数组（返回新数组，不改动入参）
 * @param answerIndex 原始正确项下标
 * @param seed 稳定种子（如题目 id / 事件 id）
 */
export function shuffleOptions<T>(
  options: readonly T[],
  answerIndex: number,
  seed: string
): { options: T[]; answerIndex: number } {
  const indices = options.map((_, index) => index);
  const rand = mulberry32(hashSeed(seed));
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return {
    options: indices.map((index) => options[index]),
    answerIndex: indices.indexOf(answerIndex)
  };
}
