import type { DetailedRoute } from "../../types/route";
import type { DayPlan, TransportStep } from "../../types/transport";
import type { Hut } from "../../types/hut";
import { EMERGENCY, gearListFor } from "../../data/constants";
import type { TripInput, TripPlan, TripDay, TransportLeg } from "./types";

const EMPTY_MARKS = ["", "–", "-", "—", "няма", "не е дадено", "неизвестно/непотвърдено"];

function normalize(value?: string | null): string {
  return (value || "").toLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
}

function isBlank(value?: string | null): boolean {
  return EMPTY_MARKS.includes(normalize(value));
}

/** Loose place comparison — data mixes "София" with "София/Пловдив", "Смолян/Езерово" etc. */
function placesMatch(a?: string | null, b?: string | null): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const xs = x.split(/[\s/]+/).filter((t) => t.length > 2);
  const ys = y.split(/[\s/]+/).filter((t) => t.length > 2);
  return xs.some((t) => ys.includes(t));
}

function formatDate(startDate: string, offsetDays: number): string {
  const parsed = new Date(`${startDate}T12:00:00`);
  const d = isNaN(parsed.getTime()) ? new Date() : parsed;
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\s*г\.?\s*$/, "");
}

function parseKm(text?: string): number {
  const m = (text || "").match(/(\d+(?:[.,]\d+)?)\s*км/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}

/** Matches "+850 м" / "1000-1450м" but not "15-20 мин". */
function parseGain(text?: string): number {
  const m = (text || "").match(/(\d+(?:[.,]\d+)?)\s*м(?!ин)/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function methodOf(mode?: string): string {
  const m = normalize(mode);
  if (!m) return "транспорт";
  if (m.includes("влак") || m.includes("теснолин") || m.includes("жп")) return "влак";
  if (m.includes("автобус") || m.includes("маршрутк")) return "автобус";
  if (m.includes("кола") || m.includes("автомобил") || m.includes("такси")) return "кола";
  if (m.includes("пеш")) return "пеша";
  return (mode || "").trim();
}

function toLeg(step: TransportStep): TransportLeg {
  return {
    method: methodOf(step.mode),
    from: isBlank(step.from) ? "—" : step.from,
    to: isBlank(step.to) ? "—" : step.to,
    duration: isBlank(step.time) ? undefined : step.time,
    notes: isBlank(step.note) ? undefined : step.note,
  };
}

function buildTransport(route: DetailedRoute): { outward: TransportLeg[]; back: TransportLeg[] } {
  const steps = route.transport?.public?.steps || [];
  const home = steps[0]?.from;
  const outward: TransportLeg[] = [];
  const back: TransportLeg[] = [];

  steps.forEach((step, i) => {
    const returnsHome = placesMatch(step.to, home);
    const startsFromFinish = !placesMatch(step.from, home) && placesMatch(step.to, route.to) && !placesMatch(route.to, home);
    if (i > 0 && (returnsHome || startsFromFinish)) back.push(toLeg(step));
    else outward.push(toLeg(step));
  });

  const car = route.transport?.car;
  if (outward.length === 0 && car?.available) {
    const from = isBlank(route.from) ? "Изходна точка" : route.from;
    const to = isBlank(route.to) ? route.name : route.to;
    const note = isBlank(car.text) ? undefined : car.text;
    outward.push({ method: "кола", from, to, notes: note });
    if (back.length === 0) back.push({ method: "кола", from: to, to: from, notes: isBlank(car.parkingNote) ? undefined : car.parkingNote });
  }

  if (back.length === 0 && outward.length > 0) {
    const last = outward[outward.length - 1];
    back.push({
      method: last.method,
      from: last.to,
      to: outward[0].from,
      duration: last.duration,
      notes: "Обратен път по същия маршрут — провери разписанието за деня на връщане.",
    });
  }

  return { outward, back };
}

function hutPhone(hut: Hut): string | undefined {
  return hut.officialPhone || hut.phone || hut.altPhone || undefined;
}

function resolveAccommodation(stay: string | undefined, route: DetailedRoute): TripDay["accommodation"] {
  if (isBlank(stay)) return null;
  const name = (stay || "").trim();

  const hut = (route.huts || []).find((h) => placesMatch(h.name, name));
  if (hut) return { name: hut.name, phone: hutPhone(hut), type: "hut" };

  const stayOver = (route.accommodation || []).find((a) => placesMatch(a.name, name));
  if (stayOver) return { name: stayOver.name, type: "shelter" };

  const n = normalize(name);
  if (n.includes("бивак") || n.includes("палатк") || n.includes("къмп")) return { name, type: "camp" };
  if (n.includes("хижа") || n.startsWith("х ") || n.includes("заслон")) return { name, type: "hut" };
  if (n.includes("хотел") || n.includes("къща") || n.includes("стая")) return { name, type: "shelter" };
  return { name, type: "none" };
}

/** route.days holds legs, several of which may share one calendar date — group them per date. */
function groupLegsByDate(days: DayPlan[]): DayPlan[][] {
  const groups: DayPlan[][] = [];
  let currentKey: string | null = null;
  for (const day of days) {
    const key = (day?.date || "").trim();
    if (!key || key !== currentKey) {
      groups.push([day]);
      currentKey = key || null;
    } else {
      groups[groups.length - 1].push(day);
    }
  }
  return groups;
}

/** Transport legs carry travel km ("70 км с влак") which must not inflate the hiking totals. */
function isTravelLeg(leg: DayPlan): boolean {
  return normalize(leg?.type).includes("транспорт");
}

function buildDailyPlan(route: DetailedRoute, input: TripInput): TripDay[] {
  return groupLegsByDate(route.days || []).map((legs, i) => {
    const hikingLegs = legs.filter((l) => !isTravelLeg(l));
    const title = legs.map((l) => l.label).filter((l) => !isBlank(l)).join(" · ") || `Ден ${i + 1}`;
    const description = legs
      .map((l) => [l.type, l.distance, l.gain, l.time].filter((part) => !isBlank(part)).join(" · "))
      .filter(Boolean)
      .join("\n");
    const stay = [...legs].reverse().find((l) => !isBlank(l.stay))?.stay;
    return {
      dayNumber: i + 1,
      date: formatDate(input.startDate, i),
      title,
      description,
      distanceKm: round1(hikingLegs.reduce((sum, l) => sum + parseKm(l.distance), 0)),
      gainM: Math.round(hikingLegs.reduce((sum, l) => sum + parseGain(l.gain), 0)),
      accommodation: resolveAccommodation(stay, route),
    };
  });
}

function emergencyPhones(): string[] {
  return [
    `${EMERGENCY.national} — Единен спешен номер`,
    `${EMERGENCY.pss} — ПСС (Планинска спасителна служба)`,
    `${EMERGENCY.pssAlt} — ПСС София`,
    `${EMERGENCY.pssGsm} — ПСС мобилен`,
    `${EMERGENCY.pssInfo} — ПСС информация`,
  ].filter((line) => !line.startsWith("undefined"));
}

export function buildTripPlan(route: DetailedRoute, input: TripInput): TripPlan {
  const dailyPlan = buildDailyPlan(route, input);
  const { outward, back } = buildTransport(route);

  if (!isBlank(input.departureTime) && outward.length > 0) {
    outward[0] = { ...outward[0], notes: [`Тръгване ${input.departureTime}`, outward[0].notes].filter(Boolean).join(" · ") };
  }
  if (!isBlank(input.returnTime) && back.length > 0) {
    const last = back.length - 1;
    back[last] = { ...back[last], notes: [`Връщане ${input.returnTime}`, back[last].notes].filter(Boolean).join(" · ") };
  }

  const daysDistance = round1(dailyPlan.reduce((sum, d) => sum + d.distanceKm, 0));
  const daysGain = dailyPlan.reduce((sum, d) => sum + d.gainM, 0);

  return {
    routeId: route.id,
    routeName: route.name,
    region: route.region || "Без регион",
    difficulty: route.difficulty || "Средна",
    startDate: input.startDate,
    groupSize: Math.max(1, Number(input.groupSize) || 1),
    totalDistanceKm: route.distanceKm ?? daysDistance,
    totalGainM: route.gainM ?? daysGain,
    totalLossM: route.lossM ?? 0,
    transportOutward: outward,
    transportReturn: back,
    dailyPlan,
    gearList: gearListFor(route.difficulty),
    emergencyPhones: emergencyPhones(),
    notes: (input.notes || "").trim() || (isBlank(route.notesDefault) ? "" : route.notesDefault),
    createdAt: Date.now(),
  };
}
