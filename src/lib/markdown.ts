export function buildMarkdownForDetailed(route) {
  const lines = [];
  lines.push(`# ${route.name}`);
  lines.push("");
  lines.push(`- **Регион:** ${route.region}`);
  lines.push(`- **Статус:** ${route.status}`);
  lines.push(`- **Дистанция:** ${route.distanceKm} км | **Изкачване:** +${route.gainM} м | **Слизане:** -${route.lossM} м`);
  lines.push(`- **Трудност:** ${route.difficulty}`);
  lines.push(`- **Дати:** ${route.dateStart} → ${route.dateEnd}`);
  lines.push(`- **Маршрут:** ${route.routeLine}`);
  lines.push(`- **Прогноза:** ${route.forecastLink}`);
  lines.push("");
  lines.push(`## Транспорт`);
  lines.push(route.transport?.summary || "–");
  if (route.transport?.car?.available) {
    lines.push("");
    lines.push(`**С кола:** ${route.transport.car.text}`);
    if (route.transport.car.parkingNote) lines.push(`⚠️ ${route.transport.car.parkingNote}`);
  }
  if (route.transport?.public?.steps?.length) {
    lines.push("");
    lines.push(`**Обществен транспорт:**`);
    route.transport.public.steps.forEach((s) => lines.push(`- ${s.from} → ${s.to}: ${s.mode} (${s.time}) — ${s.note}`));
  }
  if (route.taxis?.length) {
    lines.push("");
    lines.push(`**Таксита:**`);
    route.taxis.forEach((t) => lines.push(`- ${t.name}: ${t.phone} — ${t.note}`));
  }
  lines.push("");
  lines.push(`## Хижи`);
  (route.huts || []).forEach((h) => {
    lines.push(`- **${h.name}** (${h.elevation}м, ${h.beds} места) — тел: ${h.officialPhone}${h.altPhone ? ` / алт: ${h.altPhone}` : ""} — ${h.verified ? "✅ Потвърден" : "⚠️ Нужна верификация"}`);
    if (h.conflict) lines.push(`  ${h.conflict}`);
  });
  lines.push("");
  if (route.risk) {
    lines.push(`## Риск: ${route.risk.level}`);
    (route.risk.points || []).forEach((p) => lines.push(`- ${p}`));
    if (route.risk.conclusion) lines.push(`\n**Извод:** ${route.risk.conclusion}`);
  } else {
    lines.push(`## Риск`);
    lines.push(`Няма въведени данни.`);
  }
  lines.push("");
  lines.push(`## Дни по дни`);
  lines.push(`| Дата | Маршрут | Тип | Разстояние | Денивелация | Време | Нощувка | Трудност |`);
  lines.push(`| --- | --- | --- | --- | --- | --- | --- | --- |`);
  (route.days || []).forEach((d) => lines.push(`| ${d.date} | ${d.label} | ${d.type} | ${d.distance} | ${d.gain} | ${d.time} | ${d.stay} | ${d.difficulty} |`));
  if (route.accommodation?.length) {
    lines.push("");
    lines.push(`## Настаняване`);
    route.accommodation.forEach((a) => lines.push(`- **${a.name}** (${a.location}) — ${a.rating}, ${a.price}. ${a.note}`));
  }
  return lines.join("\n");
}

export function buildMarkdownForAlmanac(route) {
  const lines = [];
  lines.push(`# ${route.name}`);
  lines.push("");
  lines.push(`- **Регион:** ${route.region}`);
  lines.push(`- **Дистанция:** ${route.distanceKm} км | **Изкачване:** +${route.gainM} м${route.lossM ? ` | **Слизане:** -${route.lossM} м` : ""}`);
  lines.push(`- **Трудност:** ${route.difficulty}`);
  lines.push(`- **Хижа:** ${route.hutName} — тел: ${route.hutPhone}`);
  lines.push("");
  lines.push(`## Дни по дни`);
  lines.push(`- **Ден 1:** ${route.day1}`);
  lines.push(`- **Ден 2:** ${route.day2}`);
  lines.push(`- **Прибиране:** ${route.back}`);
  return lines.join("\n");
}

export function buildMarkdownForCustom(route) {
  const lines = [];
  lines.push(`# ${route.name}`);
  lines.push("");
  lines.push(`- **Регион:** ${route.region || "–"}`);
  lines.push(`- **Дистанция:** ${route.distanceKm || "–"} км | **Изкачване:** +${route.gainM || "–"} м`);
  lines.push(`- **Трудност:** ${route.difficulty || "–"}`);
  lines.push(`- **Транспорт:** ${route.transportNote || "–"}`);
  lines.push("");
  lines.push(`## Хижи`);
  (route.huts || []).forEach((h) => lines.push(`- ${h.name}: ${h.phone || "–"}`));
  lines.push("");
  lines.push(`## Дни`);
  (route.days || []).forEach((d, i) => lines.push(`- **Ден ${i + 1}:** ${d.text || "–"}`));
  if (route.risks) {
    lines.push("");
    lines.push(`## Рискове`);
    lines.push(route.risks);
  }
  return lines.join("\n");
}
