/* ---------- Difficulty visual config ---------- */
export const DIFFICULTY_STYLES = {
  "Лесна": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  "Лесна/Средна": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  "Лесен": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  "Средна": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", ring: "ring-amber-300" },
  "Среден": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", ring: "ring-amber-300" },
  "Средна/Висока": { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", ring: "ring-orange-300" },
  "Висока": { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500", ring: "ring-rose-300" },
  "Екстремна": { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-600", ring: "ring-purple-300" },
};
export const diffStyle = (d) => DIFFICULTY_STYLES[d] || DIFFICULTY_STYLES["Средна"];

/* ---------- Gear checklists by difficulty tier ---------- */
export const GEAR_LISTS = {
  base: ["Туристически обувки", "Раница 30-40л", "Вода (мин. 2л)", "Дъждобран/яке", "Слънцезащитен крем", "Карта/GPS трак (офлайн)", "Зарядно/powerbank", "Аптечка"],
  "Средна": ["Трекингови щеки", "Втори топъл слой", "Челник", "Гамаши"],
  "Средна/Висока": ["Трекингови щеки", "Втори топъл слой", "Челник", "Гамаши", "Каска (при камънопад)"],
  "Висока": ["Трекингови щеки", "Каска", "Челник + резервни батерии", "Термо бельо", "Авариен бивак чувал", "GPS устройство (не само телефон)"],
  "Екстремна": ["Каска", "Виа-ферата комплект/сбруя", "Термо бельо", "Авариен бивак чувал", "GPS устройство", "Втори човек в екипа задължително"],
};
export function gearListFor(difficulty) {
  const tier = GEAR_LISTS[difficulty] || [];
  return [...GEAR_LISTS.base, ...tier];
}

/* ---------- Emergency contacts (static reference) ---------- */
export const EMERGENCY = {
  national: "112",
  pss: "1470",
  pssAlt: "02 963 2000",
  pssInfo: "1471",
  pssEmail: "pss@redcross.bg",
  pssGsm: "0887 100 237",
  steps: [
    "Запази спокойствие и провери за наранявания в групата.",
    "Обади се на 112 или 1470 (ПСС) — кажи местоположение, брой хора, естество на инцидента.",
    "Ако имаш инсталирано приложението на ПСС, изпрати координати през него.",
    "Не се разделяй от групата, освен ако не е абсолютно наложително.",
    "Търси естествено или изкуствено укритие от вятър и валежи.",
    "Пести батерията на телефона — изгаси излишни приложения.",
    "Ако имаш GPS трак, сподели последна известна точка с спасителите.",
  ],
};

/* ---------- Import / storage schema (v1) ---------- */
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY_OVERRIDES = "route-overrides-v1";
export const STORAGE_KEY_IMPORTED = "imported-routes-v1";
export const STORAGE_KEY_USERDATA = "user-data-v1"; // favorites, completed, notes, gearState, customRoutes
