import type { GpxBounds, GpxPoint } from "./types";

const EARTH_RADIUS_KM = 6371;

/** Ignore sub-metre elevation jitter that GPS devices produce while standing still. */
const ELEVATION_NOISE_M = 1;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function trackDistanceKm(points: GpxPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
  }
  return total;
}

/** Cumulative distance in km at every point — index-aligned with `points`. */
export function cumulativeDistancesKm(points: GpxPoint[]): number[] {
  const out: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      total += haversineKm(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    }
    out.push(total);
  }
  return out;
}

export function elevationStats(points: GpxPoint[]): {
  gainM: number;
  lossM: number;
  minM: number | null;
  maxM: number | null;
} {
  let gainM = 0;
  let lossM = 0;
  let minM: number | null = null;
  let maxM: number | null = null;
  let prev: number | null = null;

  for (const p of points) {
    if (typeof p.ele !== "number" || !Number.isFinite(p.ele)) continue;
    if (minM === null || p.ele < minM) minM = p.ele;
    if (maxM === null || p.ele > maxM) maxM = p.ele;
    if (prev !== null) {
      const delta = p.ele - prev;
      if (delta > ELEVATION_NOISE_M) gainM += delta;
      else if (delta < -ELEVATION_NOISE_M) lossM += -delta;
    }
    prev = p.ele;
  }

  return { gainM: Math.round(gainM), lossM: Math.round(lossM), minM, maxM };
}

export function computeBounds(points: GpxPoint[]): GpxBounds | null {
  if (points.length === 0) return null;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  return { minLat, maxLat, minLon, maxLon };
}

export function formatCoord(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${ns}, ${Math.abs(lon).toFixed(5)}° ${ew}`;
}

/** Parse a "42.1930, 23.7495" style coordinate string as used in the route/hut data. */
export function parseCoordString(value: string | null | undefined): { lat: number; lon: number } | null {
  if (!value) return null;
  const nums = value.match(/-?\d+(?:[.,]\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const lat = parseFloat(nums[0].replace(",", "."));
  const lon = parseFloat(nums[1].replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Bulgarian "Streamlined System" transliteration, used for download filenames. */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht",
  ъ: "a", ь: "y", ю: "yu", я: "ya",
};

/**
 * Build an ASCII file slug. Chromium silently discards a non-ASCII `download`
 * attribute and saves the file as "download" with no extension, so Cyrillic
 * route names must be transliterated rather than passed through.
 */
export function toFileSlug(name: string): string {
  const transliterated = Array.from((name || "").trim())
    .map((char) => {
      const lower = char.toLowerCase();
      const latin = CYRILLIC_TO_LATIN[lower];
      if (!latin) return char;
      return char === lower ? latin : latin.charAt(0).toUpperCase() + latin.slice(1);
    })
    .join("");

  return (
    transliterated
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 80) || "marshrut"
  );
}
