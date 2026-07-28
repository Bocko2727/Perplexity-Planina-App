export function almanacToCommon(route) {
  return {
    id: route.id,
    kind: "almanac",
    name: route.name,
    region: route.region,
    difficulty: route.difficulty,
    distanceKm: route.distanceKm,
    gainM: route.gainM,
    lossM: route.lossM,
    hutName: route.hutName,
    hutPhone: route.hutPhone,
    day1: route.day1,
    day2: route.day2,
    back: route.back,
    verified: route.verified,
    suitedFor: route.suitedFor,
    fridayNight: route.fridayNight,
    terrain: route.terrain,
    kmNote: route.kmNote,
    assessment: route.assessment,
    practicalRank: route.practicalRank,
  };
}

/** Decide which view/kind an externally-imported object should render as. */
export function inferKind(obj) {
  if (obj.transport || (Array.isArray(obj.huts) && obj.huts.length > 0) || Array.isArray(obj.risk?.points)) return "detailed";
  if (obj.day1 || obj.hutName || obj.hutPhone) return "almanac";
  return "custom";
}

/** Flatten the research.* sub-object (if present) onto the top level, for easy display. */
export function flattenResearch(obj) {
  if (!obj.research) return obj;
  const { research, ...rest } = obj;
  return { ...rest, ...research };
}

/** Shallow-merge an override object onto a seed object; only provided keys are overwritten. Nested objects are replaced wholesale, not deep-merged, since imported JSON is expected to be self-contained per field. */
export function mergeRouteData(seed, override) {
  if (!override) return seed;
  const merged = { ...seed };
  Object.keys(override).forEach((key) => {
    if (override[key] !== undefined) merged[key] = override[key];
  });
  return merged;
}

/** Normalize a raw imported JSON object (per the schema) into the shape our view components expect. */
export function normalizeImportedRoute(raw) {
  const flat = flattenResearch(raw);
  const kind = inferKind(flat);
  const base = {
    id: flat.id,
    kind,
    name: flat.name,
    region: flat.region || "Без регион",
    difficulty: flat.difficulty || "Средна",
    distanceKm: flat.distanceKm ?? null,
    gainM: flat.gainM ?? null,
    lossM: flat.lossM ?? null,
  };
  if (kind === "detailed") {
    return {
      ...base,
      status: flat.status || "Внесен",
      dateStart: flat.dates?.start || "",
      dateEnd: flat.dates?.end || "",
      from: flat.from || "",
      to: flat.to || "",
      season: flat.season || "–",
      forecastLink: flat.links?.forecast || "",
      busLink: flat.links?.bus || "",
      bdzLink: flat.links?.bdz || "",
      avtogariLink: flat.links?.avtogari || "",
      routeLine: flat.routeLine || flat.name,
      verificationLevel: flat.verificationLevel || "Внесени данни — нивото на верификация не е посочено.",
      transport: flat.transport || { summary: "Няма въведени данни за транспорт." },
      huts: flat.huts || [],
      risk: flat.risk || null,
      days: flat.days || [],
      accommodation: flat.accommodation || [],
      taxis: flat.transport?.taxis || [],
      windyEmbed: flat.links?.windyEmbed || "",
      notesDefault: flat.notesDefault || "",
      suitedFor: flat.suitedFor, fridayNight: flat.fridayNight, terrain: flat.terrain, kmNote: flat.kmNote, assessment: flat.assessment, practicalRank: flat.practicalRank,
      sources: flat.sources || [],
    };
  }
  if (kind === "almanac") {
    return {
      ...base,
      hutName: flat.huts?.[0]?.name || flat.hutName || "–",
      hutPhone: flat.huts?.[0]?.officialPhone || flat.hutPhone || "–",
      day1: flat.days?.[0]?.label || flat.day1 || "–",
      day2: flat.days?.[1]?.label || flat.day2 || "–",
      back: flat.back || "–",
      verified: flat.huts?.[0]?.verified ?? flat.verified ?? false,
      suitedFor: flat.suitedFor, fridayNight: flat.fridayNight, terrain: flat.terrain, kmNote: flat.kmNote, assessment: flat.assessment, practicalRank: flat.practicalRank,
    };
  }
  return {
    ...base,
    transportNote: flat.transport?.summary || flat.transportNote || "",
    huts: (flat.huts || []).map((h) => ({ name: h.name, phone: h.officialPhone || h.phone })),
    days: (flat.days || []).map((d) => ({ text: d.label || d.text })),
    risks: flat.risk?.points?.join(" ") || flat.risks || "",
  };
}
