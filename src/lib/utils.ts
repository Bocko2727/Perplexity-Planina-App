export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtKm(n) {
  if (n === null || n === undefined) return "–";
  return `${n} км`;
}

export function fmtM(n: number | null | undefined) {
  if (n === null || n === undefined) return "–";
  return `${n > 0 ? "+" : ""}${n} м`;
}

/** Format descent (always negative prefix). */
export function fmtLoss(lossM: number | null | undefined) {
  if (lossM === null || lossM === undefined) return "–";
  return `-${lossM} м`;
}
