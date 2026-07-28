import type { GpxPoint } from "./types";
import { cumulativeDistancesKm, elevationStats } from "./utils";

const PADDING = { top: 16, right: 14, bottom: 26, left: 46 };
const FILL = "#064e3b";
const LINE = "#10b981";
const AXIS = "#d6d3d1";
const LABEL = "#78716c";

/** Cap the polyline length so very dense tracks still produce a small SVG string. */
const MAX_SAMPLES = 600;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emptyProfile(width: number, height: number, message: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="${esc(message)}">`,
    `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="12" fill="${LABEL}">${esc(message)}</text>`,
    "</svg>",
  ].join("");
}

export function generateElevationSvg(points: GpxPoint[], width: number, height: number): string {
  const withEle = points.filter((p) => typeof p.ele === "number" && Number.isFinite(p.ele));
  if (withEle.length < 2) {
    return emptyProfile(width, height, "Няма данни за височина в този GPX файл");
  }

  const distances = cumulativeDistancesKm(withEle);
  const totalKm = distances[distances.length - 1];
  const { minM, maxM } = elevationStats(withEle);
  const minEle = minM ?? 0;
  const maxEle = maxM ?? 0;

  const plotWidth = Math.max(1, width - PADDING.left - PADDING.right);
  const plotHeight = Math.max(1, height - PADDING.top - PADDING.bottom);
  const eleRange = maxEle - minEle || 1;
  const kmRange = totalKm || 1;

  const step = Math.max(1, Math.ceil(withEle.length / MAX_SAMPLES));
  const sampled: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < withEle.length; i += step) {
    sampled.push({
      x: PADDING.left + (distances[i] / kmRange) * plotWidth,
      y: PADDING.top + (1 - (withEle[i].ele! - minEle) / eleRange) * plotHeight,
    });
  }
  const lastIndex = withEle.length - 1;
  const last = {
    x: PADDING.left + (distances[lastIndex] / kmRange) * plotWidth,
    y: PADDING.top + (1 - (withEle[lastIndex].ele! - minEle) / eleRange) * plotHeight,
  };
  if (sampled[sampled.length - 1].x !== last.x) sampled.push(last);

  const round = (n: number) => Math.round(n * 10) / 10;
  const linePath = sampled.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join(" ");
  const baseY = PADDING.top + plotHeight;
  const areaPath = `${linePath} L${round(last.x)} ${round(baseY)} L${round(sampled[0].x)} ${round(baseY)} Z`;

  const midEle = Math.round((minEle + maxEle) / 2);
  const yTicks = [
    { value: Math.round(maxEle), y: PADDING.top },
    { value: midEle, y: PADDING.top + plotHeight / 2 },
    { value: Math.round(minEle), y: baseY },
  ];
  // First/last labels anchor inward so they don't overflow the viewBox and get clipped.
  const xTicks = [
    { value: 0, x: PADDING.left, anchor: "start" },
    { value: totalKm * 0.5, x: PADDING.left + plotWidth / 2, anchor: "middle" },
    { value: totalKm, x: PADDING.left + plotWidth, anchor: "end" },
  ];

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Профил на височината">`,
    `<defs><linearGradient id="planina-ele-fill" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${FILL}" stop-opacity="0.75" />`,
    `<stop offset="100%" stop-color="${FILL}" stop-opacity="0.12" />`,
    `</linearGradient></defs>`,
    `<g font-family="system-ui, sans-serif" font-size="9" fill="${LABEL}">`,
  ];

  for (const tick of yTicks) {
    parts.push(
      `<line x1="${PADDING.left}" y1="${round(tick.y)}" x2="${round(PADDING.left + plotWidth)}" y2="${round(tick.y)}" stroke="${AXIS}" stroke-width="1" stroke-dasharray="3 3" />`,
      `<text x="${PADDING.left - 6}" y="${round(tick.y) + 3}" text-anchor="end">${tick.value} м</text>`
    );
  }
  for (const tick of xTicks) {
    parts.push(
      `<text x="${round(tick.x)}" y="${height - 8}" text-anchor="${tick.anchor}">${tick.value.toFixed(1)} км</text>`
    );
  }

  parts.push(
    "</g>",
    `<path d="${areaPath}" fill="url(#planina-ele-fill)" />`,
    `<path d="${linePath}" fill="none" stroke="${LINE}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round" />`,
    "</svg>"
  );

  return parts.join("");
}
