/** Fisher–Yates 洗牌（回傳新陣列，不修改原陣列） */
export function shuffle<T>(source: readonly T[]): T[] {
  const result = [...source];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
