import { GEAR_LISTS, gearListFor } from "../../data/constants";
import { normalizeDifficulty } from "./query-parser";
import { routeHuts } from "./route-matcher";
import type { ParsedQuery, RouteMatch } from "./types";

const NO_DATA =
  "Нямам данни за маршрути, отговарящи на този критерий. Можеш да опиташ с друг регион или трудност.";

const EMPTY_VALUES = ["–", "—", "-", ""];

/** Masculine form of the difficulty, to agree with "преход" in Bulgarian. */
const DIFFICULTY_ADJECTIVE: Record<string, string> = {
  "Лесна": "лесен",
  "Средна": "среден",
  "Висока": "висок",
  "Екстремна": "екстремен",
};

function plural(count: number): string {
  return count === 1 ? "Намерих 1 подходящ маршрут:" : `Намерих ${count} подходящи маршрута:`;
}

/** One line describing the actual walking line, using only fields present on the route. */
function routeLineOf(route: any): string {
  if (route.routeLine) return String(route.routeLine);
  const legs = [route.day1, route.day2].filter((leg) => leg && !EMPTY_VALUES.includes(String(leg).trim()));
  if (legs.length > 0) return legs.join(" → ");
  if (route.from && route.to) return `${route.from} → ${route.to}`;
  return "";
}

function metricsOf(route: any): string {
  const parts: string[] = [];
  if (route.difficulty) parts.push(`Трудност: ${route.difficulty}`);
  if (typeof route.distanceKm === "number") parts.push(`${route.distanceKm} км`);
  if (typeof route.gainM === "number") parts.push(`+${route.gainM}м`);
  return parts.join(" | ");
}

function formatRoute(match: RouteMatch): string {
  const { route, reasons } = match;
  const lines = [`🏔️ ${route.name} (${route.id})`];

  const metrics = metricsOf(route);
  if (metrics) lines.push(`   ${metrics}`);

  if (route.region) lines.push(`   Регион: ${route.region}`);

  const routeLine = routeLineOf(route);
  if (routeLine) lines.push(`   ${routeLine}`);

  if (reasons.length > 0) lines.push(`   Причина: ${reasons.join("; ")}`);

  return lines.join("\n");
}

/* ---------- Intent-specific extras, built only from route data ---------- */

function gearResponse(matches: RouteMatch[], query: ParsedQuery): string {
  const referenced = query.routeId ? matches.find((m) => String(m.route.id).toLowerCase() === query.routeId?.toLowerCase()) : undefined;
  const route = referenced?.route;
  const rawDifficulty = route?.difficulty || query.difficulty;
  const difficulty = normalizeDifficulty(rawDifficulty || "");

  if (!difficulty) {
    const lines = [
      "📋 Основно оборудване за преход:",
      "",
      ...GEAR_LISTS.base.map((item: string) => `• ${item}`),
      "",
      "Кажи ми трудността (лесен / среден / висок / екстремен) или конкретен маршрут и ще добавя специфичното снаряжение.",
    ];
    return lines.join("\n");
  }

  const items: string[] = route ? gearListFor(route.difficulty) : gearListFor(difficulty);
  const header = route
    ? `📋 Оборудване за ${route.name} (${route.id}) — трудност ${route.difficulty}:`
    : `📋 Оборудване за ${DIFFICULTY_ADJECTIVE[difficulty] || difficulty} преход:`;

  return [header, "", ...items.map((item) => `• ${item}`)].join("\n");
}

function hutFooter(matches: RouteMatch[]): string {
  const withPhones = matches
    .map((match) => {
      const route = match.route;
      const huts = routeHuts(route);
      if (huts.length === 0) return null;
      const phone = route.hutPhone || route.huts?.[0]?.officialPhone || route.huts?.[0]?.phone;
      return phone && !EMPTY_VALUES.includes(String(phone).trim()) ? `${huts[0]} — ${phone}` : huts[0];
    })
    .filter(Boolean) as string[];

  if (withPhones.length === 0) return "";
  return `\n\n☎️ Контакти за нощувка:\n${withPhones.map((line) => `• ${line}`).join("\n")}\n\nОбади се предварително — местата в хижите не са гарантирани.`;
}

/* ---------- Public API ---------- */

export function buildResponse(matches: RouteMatch[], query: ParsedQuery): string {
  if (query.intent === "gear_advice") return gearResponse(matches, query);

  if (matches.length === 0) return NO_DATA;

  // Nothing in the question actually narrowed the list — say so instead of
  // presenting the default routes as if they matched a criterion.
  const narrowed = matches.some((match) => match.score > 0);
  const intro = narrowed
    ? plural(matches.length)
    : "Не съм сигурен какво точно търсиш. Ето няколко маршрута от моите данни — можеш да попиташ за регион, трудност, сезон, транспорт или оборудване:";

  const body = [intro, "", matches.map(formatRoute).join("\n\n")].join("\n");

  if (query.intent === "hut_route") return body + hutFooter(matches);
  return body;
}
