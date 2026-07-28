import { ALMANAC, DETAILED_ROUTES } from "../../data/routes";
import { MONTH_NAMES, SEASON_MONTHS, difficultyTiers, normalizeDifficulty } from "./query-parser";
import type { ParsedQuery, RouteMatch } from "./types";

const MAX_RESULTS = 5;

/** Every route the assistant is allowed to talk about: detailed routes + the almanac. */
export function allRoutes(): any[] {
  const almanac = Object.values(ALMANAC || {}).flat().map((route: any) => ({ kind: "almanac", ...route }));
  return [...DETAILED_ROUTES, ...almanac];
}

export function findRouteById(id: string): any | undefined {
  if (!id) return undefined;
  const needle = id.toLowerCase();
  return allRoutes().find((route) => String(route.id).toLowerCase() === needle);
}

/** Hut / shelter names attached to a route, whichever shape it uses. */
export function routeHuts(route: any): string[] {
  if (Array.isArray(route.huts)) {
    return route.huts.map((hut: any) => hut?.name).filter(Boolean);
  }
  if (route.hutName && route.hutName !== "–" && route.hutName !== "—") return [route.hutName];
  return [];
}

/** Number of days the route spans, derived from whatever the route actually provides. */
export function routeDayCount(route: any): number | undefined {
  if (Array.isArray(route.days) && route.days.length > 0) {
    const dates = new Set(route.days.map((day: any) => day?.date).filter(Boolean));
    if (dates.size > 0) return dates.size;
    return route.days.length;
  }
  if (route.dateStart && route.dateEnd) {
    const start = Date.parse(route.dateStart);
    const end = Date.parse(route.dateEnd);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return Math.round((end - start) / 86400000) + 1;
    }
  }
  if (route.day1) {
    const hasDay2 = route.day2 && route.day2 !== "–" && route.day2 !== "—" && route.day2 !== "-";
    return hasDay2 ? 2 : 1;
  }
  return undefined;
}

/** Months (1-12) the route's own season string covers. */
export function routeMonths(route: any): number[] {
  const season = String(route.season || "").toLowerCase();
  if (!season) return [];

  const found: Array<{ month: number; pos: number }> = [];
  MONTH_NAMES.forEach((name, index) => {
    const pos = season.indexOf(name);
    if (pos >= 0) found.push({ month: index + 1, pos });
  });
  found.sort((a, b) => a.pos - b.pos);

  // An explicit month range is authoritative. Prose after it ("зимата — само с
  // опит", "целогодишно достъпна хижа") is a caveat, not an extra open season.
  if (found.length >= 2) {
    const months: number[] = [];
    let current = found[0].month;
    const last = found[1].month;
    for (let i = 0; i < 12; i++) {
      months.push(current);
      if (current === last) break;
      current = current === 12 ? 1 : current + 1;
    }
    return months;
  }
  if (found.length === 1) return [found[0].month];

  if (season.includes("целогодишн")) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const months = new Set<number>();
  Object.entries(SEASON_MONTHS).forEach(([word, list]) => {
    if (season.includes(word)) list.forEach((month) => months.add(month));
  });
  return [...months];
}

/** All free text on a route that says something about how you get there. */
function transportText(route: any): string {
  const parts: string[] = [];
  const transport = route.transport;
  if (transport) {
    if (transport.summary) parts.push(transport.summary);
    if (transport.car?.text) parts.push(transport.car.text);
    if (transport.car?.parkingNote) parts.push(transport.car.parkingNote);
    if (transport.car?.available) parts.push("кола");
    (transport.public?.steps || []).forEach((step: any) => {
      parts.push([step?.mode, step?.note, step?.from, step?.to].filter(Boolean).join(" "));
    });
  }
  if (route.transportNote) parts.push(route.transportNote);
  ["day1", "day2", "back", "fridayNight", "routeLine"].forEach((key) => {
    if (route[key]) parts.push(String(route[key]));
  });
  return parts.join(" ").toLowerCase();
}

const TRANSPORT_MATCHERS: Record<string, RegExp> = {
  train: /влак|бдж|теснолинейк|гара|жп/,
  bus: /автобус|рейс|\bбус\b/,
  car: /кола|автомобил|паркинг/,
};

const TRANSPORT_LABELS: Record<string, string> = {
  train: "влак",
  bus: "автобус",
  car: "кола",
};

/** Months the queried season covers; a bare month name resolves to that month. */
function querySeasonMonths(season: string): number[] {
  if (SEASON_MONTHS[season]) return SEASON_MONTHS[season];
  const index = MONTH_NAMES.indexOf(season);
  return index >= 0 ? [index + 1] : [];
}

function scoreRoute(route: any, query: ParsedQuery): RouteMatch {
  const reasons: string[] = [];
  let score = 0;

  if (query.routeId && String(route.id).toLowerCase() === query.routeId.toLowerCase()) {
    score += 5;
    reasons.push(`точно съвпадение по ID (${route.id})`);
  }

  if (query.difficulty) {
    const routeDifficulty = normalizeDifficulty(route.difficulty);
    const tiers = difficultyTiers(route.difficulty);
    if (routeDifficulty === query.difficulty && tiers.length === 1) {
      score += 3;
      reasons.push(`трудност ${route.difficulty}`);
    } else if (tiers.includes(query.difficulty)) {
      score += 2;
      reasons.push(`трудност ${route.difficulty} (близка до търсената)`);
    }
  }

  if (query.region) {
    const routeRegion = String(route.region || "").toLowerCase();
    const wanted = query.region.toLowerCase();
    if (routeRegion.includes(wanted) || wanted.includes(routeRegion)) {
      score += 3;
      reasons.push(`регион ${route.region}`);
    }
  }

  if (query.season) {
    const wantedMonths = querySeasonMonths(query.season);
    const months = routeMonths(route);
    if (wantedMonths.some((month) => months.includes(month))) {
      score += 2;
      reasons.push(`подходящ сезон (${route.season})`);
    }
  }

  if (query.days) {
    const days = routeDayCount(route);
    if (days !== undefined) {
      if (days === query.days) {
        score += 3;
        reasons.push(`${days} ${days === 1 ? "ден" : "дни"}`);
      } else if (Math.abs(days - query.days) <= 1) {
        score += 1;
        reasons.push(`${days} ${days === 1 ? "ден" : "дни"} (близо до търсеното)`);
      }
    }
  }

  if (query.transport) {
    const matcher = TRANSPORT_MATCHERS[query.transport];
    if (matcher && matcher.test(transportText(route))) {
      score += 2;
      reasons.push(`достъпен с ${TRANSPORT_LABELS[query.transport]}`);
    }
  }

  if (query.maxDistance !== undefined && typeof route.distanceKm === "number" && route.distanceKm <= query.maxDistance) {
    score += 2;
    reasons.push(`${route.distanceKm} км — в рамките на ${query.maxDistance} км`);
  }

  if (query.intent === "hut_route") {
    const huts = routeHuts(route);
    if (huts.length > 0) {
      score += 1;
      reasons.push(`нощувка: ${huts.join(", ")}`);
    }
  }

  if (query.intent === "short_route" && typeof route.distanceKm === "number" && route.distanceKm < 10) {
    score += 2;
    reasons.push(`кратък преход — ${route.distanceKm} км`);
  }

  if (query.intent === "recommend_weekend") {
    const days = routeDayCount(route);
    if (days !== undefined && days <= 2) {
      score += 2;
      reasons.push(`побира се в уикенд (${days} ${days === 1 ? "ден" : "дни"})`);
    }
  }

  return { route, score, reasons };
}

export function matchRoutes(query: ParsedQuery): RouteMatch[] {
  const routes = allRoutes();

  if (query.intent === "general_info" || query.intent === "unknown") {
    const scored = routes.map((route) => scoreRoute(route, query));
    const relevant = scored.filter((match) => match.score > 0);
    const pool = relevant.length > 0 ? relevant : scored;
    return pool
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);
  }

  return routes
    .map((route) => scoreRoute(route, query))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}
