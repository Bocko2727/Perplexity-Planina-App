import type { Intent, ParsedQuery } from "./types";

/* ---------- Canonical vocabularies (mirror the values used in data/routes.ts) ---------- */

export const MONTH_NAMES = [
  "януари",
  "февруари",
  "март",
  "април",
  "май",
  "юни",
  "юли",
  "август",
  "септември",
  "октомври",
  "ноември",
  "декември",
];

/** Month numbers (1-12) covered by each season keyword. */
export const SEASON_MONTHS: Record<string, number[]> = {
  зима: [12, 1, 2, 3],
  пролет: [3, 4, 5, 6],
  лято: [6, 7, 8, 9],
  есен: [9, 10, 11],
};

const REGION_PATTERNS: Array<[RegExp, string]> = [
  [/рил(а|ски|ските)/, "Рила"],
  [/пирин/, "Пирин"],
  [/родоп/, "Родопи"],
  [/стара\s*планина|старопланин|балкана/, "Стара планина"],
  [/осогово/, "Осогово и Средна гора"],
  [/средна\s*гора/, "Осогово и Средна гора"],
  [/вискяр/, "Вискяр планина"],
  [/завалск|завала/, "Завалска планина"],
  // Mountains a user may plausibly ask about; matching them lets the matcher
  // answer honestly with "no data" instead of falling back to unrelated routes.
  [/витоша/, "Витоша"],
  [/беласиц/, "Беласица"],
  [/славянк/, "Славянка"],
  [/странджа/, "Странджа"],
];

const DIFFICULTY_PATTERNS: Array<[RegExp, string]> = [
  [/екстрем/, "Екстремна"],
  [/висок|труден|трудна|трудно|тежък|тежка|тежко/, "Висока"],
  [/среден|средна|средно|средни/, "Средна"],
  [/лесен|лесна|лесно|лесни|спокоен|спокойна/, "Лесна"],
];

const TRANSPORT_PATTERNS: Array<[RegExp, string]> = [
  [/влак|бдж|теснолинейк|гара|train/, "train"],
  [/автобус|рейс|\bбус\b|public\s*transport/, "bus"],
  [bgWord("кола", "автомобил", "шофир", "car"), "car"],
];

const BG_NUMBERS: Record<string, number> = {
  един: 1,
  една: 1,
  едно: 1,
  два: 2,
  две: 2,
  три: 3,
  четири: 4,
  пет: 5,
};

const DAY_WORD_COUNTS: Array<[RegExp, number]> = [
  [/еднодневен|еднодневна|еднодневно|за\s*един\s*ден/, 1],
  [/двудневен|двудневна|двудневно/, 2],
  [/тридневен|тридневна|тридневно/, 3],
  [/четиридневен|четиридневна/, 4],
];

/* ---------- Intent keyword table, ordered by priority ---------- */

const INTENT_PATTERNS: Array<[Intent, RegExp]> = [
  ["gear_advice", /оборудван|екипировк|какво\s*да\s*(взема|нося|сложа)|\bgear\b|ръкзак|раниц|обувки|дрехи|багаж|списък\s*с\s*неща/],
  ["recommend_beginner", /начинаещ|първи\s*път|не\s*съм\s*опитен|нямам\s*опит|новак|за\s*деца/],
  ["recommend_weekend", /уикенд|събот|недел|почивни\s*дни|свободните\s*дни/],
  ["plan_days", /план\s*за|направи\s*ми\s*план|планира|еднодневен|двудневен|тридневен|четиридневен|\d+\s*дн(и|я|евен)|дни(?![а-яa-z])|дневен(?![а-яa-z])/],
  ["short_route", /кратък|кратка|кратко|къс\s*преход|малко\s*километри|до\s*\d+\s*км|бърз\s*преход/],
  ["hut_route", /хижа|хижи|нощувк|заслон|спане|преспив/],
  ["transport_filter", /влак|бдж|теснолинейк|автобус|рейс|бус(?![а-яa-z])|без\s*кола|с\s*кола|обществен\s*транспорт|public\s*transport/],
  ["season_match", bgWord("сезон", "лято", "зима", "пролет", "есен", "кой\\s*месец", "кога\\s*(да|е|мога)", "през\\s*(зимата|лятото|пролетта|есента)")],
  ["difficulty_filter", /екстрем|висок|труден|трудна|среден|средна|лесен|лесна|лесни|трудност/],
  ["region_filter", /рил|пирин|родоп|стара\s*планина|осогово|средна\s*гора|вискяр|завалск|витоша|беласиц|славянк|странджа/],
  ["general_info", /маршрут|преход|поход|какво\s*има|покажи|препоръч|идеи|списък/],
];

/* ---------- Helpers ---------- */

function normalize(text: string): string {
  return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Word-start matcher for Cyrillic. `\b` in JavaScript only knows Latin word
 * characters, so without this "лесен" would match the season "есен" and
 * "около" would match the transport keyword "кола".
 */
function bgWord(...alternatives: string[]): RegExp {
  return new RegExp(`(?:^|[^а-яa-z])(?:${alternatives.join("|")})`);
}

/** Map any difficulty spelling (masculine/feminine, compound) onto a canonical label. */
export function normalizeDifficulty(raw: string): string | undefined {
  const t = normalize(raw);
  if (!t) return undefined;
  if (/екстрем/.test(t)) return "Екстремна";
  if (/висок/.test(t)) return "Висока";
  if (/сред/.test(t)) return "Средна";
  if (/лес/.test(t)) return "Лесна";
  return undefined;
}

/** Difficulty labels a compound value such as "Лесна/Средна" should count as a near match. */
export function difficultyTiers(raw: string): string[] {
  const t = normalize(raw);
  const tiers: string[] = [];
  if (/лес/.test(t)) tiers.push("Лесна");
  if (/сред/.test(t)) tiers.push("Средна");
  if (/висок/.test(t)) tiers.push("Висока");
  if (/екстрем/.test(t)) tiers.push("Екстремна");
  return tiers;
}

function detectRegion(text: string): string | undefined {
  for (const [pattern, region] of REGION_PATTERNS) {
    if (pattern.test(text)) return region;
  }
  return undefined;
}

/** Remove matched region names so "Средна гора" is not read as difficulty "Средна". */
function stripRegions(text: string): string {
  let out = text;
  for (const [pattern] of REGION_PATTERNS) {
    out = out.replace(new RegExp(pattern.source, "g"), " ");
  }
  return out.replace(/средна\s*гора/g, " ");
}

function detectDifficulty(text: string): string | undefined {
  const cleaned = stripRegions(text);
  for (const [pattern, difficulty] of DIFFICULTY_PATTERNS) {
    if (pattern.test(cleaned)) return difficulty;
  }
  return undefined;
}

function detectDays(text: string): number | undefined {
  for (const [pattern, count] of DAY_WORD_COUNTS) {
    if (pattern.test(text)) return count;
  }
  const digits = text.match(/(\d+)\s*(?:дн(?:и|я|евен|евна)|ден)(?![а-яa-z])/);
  if (digits) {
    const n = parseInt(digits[1], 10);
    if (n > 0 && n <= 14) return n;
  }
  const words = text.match(/(?:^|[^а-яa-z])(един|една|едно|два|две|три|четири|пет)\s*дн(?:и|я|евен)/);
  if (words) return BG_NUMBERS[words[1]];
  return undefined;
}

const SEASON_DETECTORS: Array<[RegExp, string]> = [
  [bgWord("зима", "зимата", "зимен", "зимно", "сняг", "снежн"), "зима"],
  [bgWord("лято", "лятото", "летен", "летни"), "лято"],
  [bgWord("пролет"), "пролет"],
  [bgWord("есен"), "есен"],
];

function detectSeason(text: string): string | undefined {
  for (const [pattern, season] of SEASON_DETECTORS) {
    if (pattern.test(text)) return season;
  }
  return MONTH_NAMES.find((name) => bgWord(name).test(text));
}

function detectTransport(text: string): string | undefined {
  for (const [pattern, mode] of TRANSPORT_PATTERNS) {
    if (pattern.test(text)) return mode;
  }
  return undefined;
}

function detectMaxDistance(text: string): number | undefined {
  const explicit = text.match(/до\s*(\d+(?:[.,]\d+)?)\s*(?:км|km|километра)/);
  if (explicit) return parseFloat(explicit[1].replace(",", "."));
  const under = text.match(/(?:под|максимум|макс\.?)\s*(\d+(?:[.,]\d+)?)\s*(?:км|km)/);
  if (under) return parseFloat(under[1].replace(",", "."));
  if (/кратък|кратка|кратко|къс\s*преход|малко\s*километри/.test(text)) return 10;
  return undefined;
}

const CYRILLIC_ID_PREFIX: Record<string, string> = { р: "R", п: "P", с: "S", д: "D", о: "O" };

/** Recognise almanac-style route codes such as "R01", "д05", "P 10". */
function detectRouteId(text: string): string | undefined {
  const match = text.match(/(?:^|[^а-яa-z0-9])([rpsdoрпсдо])\s?(\d{1,2})(?![\dа-яa-z])/);
  if (!match) return undefined;
  const letter = match[1];
  const prefix = CYRILLIC_ID_PREFIX[letter] || letter.toUpperCase();
  return `${prefix}${match[2].padStart(2, "0")}`;
}

function detectIntent(text: string, params: Omit<ParsedQuery, "intent">): Intent {
  for (const [intent, pattern] of INTENT_PATTERNS) {
    if (pattern.test(text)) return intent;
  }
  // No keyword hit, but a parameter was still extracted (e.g. a bare "Пирин").
  if (params.region) return "region_filter";
  if (params.difficulty) return "difficulty_filter";
  if (params.season) return "season_match";
  if (params.transport) return "transport_filter";
  if (params.days) return "plan_days";
  if (params.routeId) return "general_info";
  return "unknown";
}

/* ---------- Public API ---------- */

export function parseQuery(text: string): ParsedQuery {
  const t = normalize(text);

  const params: Omit<ParsedQuery, "intent"> = {
    difficulty: detectDifficulty(t),
    region: detectRegion(t),
    days: detectDays(t),
    season: detectSeason(t),
    transport: detectTransport(t),
    maxDistance: detectMaxDistance(t),
    routeId: detectRouteId(t),
  };

  const intent = detectIntent(t, params);

  // A beginner request implies easy terrain even when the word "лесен" is absent.
  if (intent === "recommend_beginner" && !params.difficulty) params.difficulty = "Лесна";

  const query: ParsedQuery = { intent };
  if (params.difficulty) query.difficulty = params.difficulty;
  if (params.region) query.region = params.region;
  if (params.days) query.days = params.days;
  if (params.season) query.season = params.season;
  if (params.transport) query.transport = params.transport;
  if (params.maxDistance !== undefined) query.maxDistance = params.maxDistance;
  if (params.routeId) query.routeId = params.routeId;
  return query;
}
