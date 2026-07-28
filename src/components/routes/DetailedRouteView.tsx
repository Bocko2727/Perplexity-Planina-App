import { useState } from "react";
import {
  MapPin, Phone, TriangleAlert, CircleCheckBig, Circle, Car, Bus, TrainFront,
  Heart, Copy, Check, Trash2, Calendar, Clock, TrendingUp, TrendingDown, Ruler,
  Gauge, Cloud, Shield, Backpack, StickyNote, Home, Hotel, ExternalLink, CalendarPlus
} from "lucide-react";

import { gearListFor } from "../../data/constants";
import { fmtKm, fmtM, fmtLoss } from "../../lib/utils";
import { DifficultyBadge } from "../ui/DifficultyBadge";
import { StatCard } from "../ui/StatCard";
import { SectionTitle } from "../ui/SectionTitle";
import { GpxExportButton } from "../gpx/GpxExportButton";

/* =========================================================================
   RouteView — detailed route (DETAILED_ROUTES entries)
   ========================================================================= */
export function DetailedRouteView({
  route, transportMode, setTransportMode, hutVerification, verifyHut,
  isFavorite, toggleFavorite, isCompleted, completedInfo, onOpenComplete,
  gearState, toggleGear, resetGear, notes, setNote, onExportMarkdown, copied, onPlanTrip,
}) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Общ преглед", icon: Gauge },
    { id: "transport", label: "Транспорт", icon: Car },
    { id: "huts", label: "Хижи & Риск", icon: Shield },
    { id: "days", label: "Дни", icon: Calendar },
    { id: "gear", label: "Екипировка", icon: Backpack },
    { id: "notes", label: "Бележки", icon: StickyNote },
  ];
  const gear = gearListFor(route.difficulty);
  const gearDone = gear.filter((g) => gearState[g]).length;
  const gearPct = gear.length > 0 ? Math.round((gearDone / gear.length) * 100) : 0;
  const riskColorMap = {
    emerald: "bg-emerald-50 border-emerald-300 text-emerald-900",
    amber: "bg-amber-50 border-amber-300 text-amber-900",
    rose: "bg-rose-50 border-rose-300 text-rose-900",
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden shadow-md mb-5">
        <div className="bg-gradient-to-br from-[#1a4a2a] via-[#215c34] to-[#2e7d52] p-6 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-emerald-100/80 font-bold mb-1">
                <MapPin size={12} /> {route.region}
                <span className="opacity-50">•</span>
                {route.dateStart} → {route.dateEnd}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{route.name}</h1>
              <p className="text-sm text-emerald-50/80 mt-1">{route.routeLine}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleFavorite(route.id)}
                aria-label={isFavorite ? "Премахни от любими" : "Добави в любими"}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="Любим"
              >
                <Heart size={16} className={isFavorite ? "text-rose-300" : "text-white/80"} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <span className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-bold">{route.status}</span>
            </div>
          </div>
          {isCompleted && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
              <CircleCheckBig size={13} /> Изминат на {completedInfo?.date} {completedInfo?.note ? `— ${completedInfo.note}` : ""}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-200">
          <StatCard icon={Ruler} label="Дистанция" value={fmtKm(route.distanceKm)} />
          <StatCard icon={TrendingUp} label="Изкачване" value={fmtM(route.gainM)} accent="bg-amber-50 text-amber-700" />
          <StatCard icon={TrendingDown} label="Слизане" value={fmtLoss(route.lossM)} accent="bg-sky-50 text-sky-700" />
          <a href={route.forecastLink} target="_blank" rel="noreferrer" className="bg-white p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center"><Cloud size={20} /></div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-stone-400 font-bold">Прогноза</div>
              <div className="text-sm font-bold text-indigo-700 flex items-center gap-1">Windy <ExternalLink size={12} /></div>
            </div>
          </a>
        </div>
        <div className="bg-white px-4 py-2 flex items-center gap-2">
          <DifficultyBadge difficulty={route.difficulty} />
          <span className="text-xs text-stone-400">·</span>
          <span className="text-xs text-stone-500">Сезон: {route.season}</span>
          <div className="ml-auto flex items-center gap-3">
            {onPlanTrip && (
              <button
                onClick={() => onPlanTrip(route.id)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1"
              >
                <CalendarPlus size={13} /> Планирай
              </button>
            )}
            <GpxExportButton route={route} />
            <button
              onClick={() => onOpenComplete(route.id)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <CircleCheckBig size={13} /> {isCompleted ? "Редактирай завършване" : "Маркирай като изминат"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 border-b border-stone-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                tab === t.id ? "border-emerald-600 text-emerald-700 bg-emerald-50/60" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={MapPin}>Маршрутна линия</SectionTitle>
            <p className="text-sm text-stone-700 leading-relaxed">{route.routeLine}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
              {route.busLink && <a href={route.busLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline"><Bus size={13} /> Автобус разписание</a>}
              {route.bdzLink && <a href={route.bdzLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline"><TrainFront size={13} /> БДЖ разписание</a>}
              {route.avtogariLink && <a href={route.avtogariLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline"><ExternalLink size={13} /> Автогари.инфо</a>}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Shield}>Ниво на верификация</SectionTitle>
            <p className="text-sm text-stone-600 leading-relaxed">{route.verificationLevel}</p>
          </div>
          {route.notesDefault && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex gap-2">
              <TriangleAlert size={16} className="shrink-0 mt-0.5" /> {route.notesDefault}
            </div>
          )}
          {route.windyEmbed && (
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <SectionTitle icon={Cloud}>Прогноза на времето (Windy)</SectionTitle>
              <iframe
                src={route.windyEmbed}
                title="Windy прогноза"
                className="w-full h-[400px] rounded-lg border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      {tab === "transport" && (
        <div className="space-y-4">
          <div className="flex bg-stone-100 rounded-xl p-1 max-w-sm">
            <button
              onClick={() => setTransportMode(route.id, "car")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                transportMode === "car" ? "bg-white shadow text-emerald-700" : "text-stone-500"
              }`}
            >
              <Car size={15} /> С личен автомобил
            </button>
            <button
              onClick={() => setTransportMode(route.id, "public")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                transportMode === "public" ? "bg-white shadow text-emerald-700" : "text-stone-500"
              }`}
            >
              <Bus size={15} /> Без кола / ОГТ
            </button>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-sm text-stone-700 leading-relaxed mb-3">{route.transport.summary}</p>
            {transportMode === "car" && route.transport.car?.available && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1"><Car size={14} /> Шофиране</div>
                  {route.transport.car.text}
                </div>
                {route.transport.car.parkingNote && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 flex gap-2">
                    <TriangleAlert size={14} className="shrink-0 mt-0.5" /> {route.transport.car.parkingNote}
                  </div>
                )}
              </div>
            )}
            {transportMode === "public" && (
              <div className="space-y-2">
                {route.transport.public?.steps?.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    <div className="min-w-0 text-sm">
                      <div className="font-semibold text-stone-800">{s.from} → {s.to}</div>
                      <div className="text-stone-500">{s.mode} · {s.time}</div>
                      <div className="text-stone-400 text-xs mt-0.5">{s.note}</div>
                    </div>
                  </div>
                ))}
                {(!route.transport.public?.steps || route.transport.public.steps.length === 0) && (
                  <p className="text-sm text-stone-400 italic">Няма данни за обществен транспорт за този преход.</p>
                )}
              </div>
            )}
          </div>

          {route.taxis?.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <SectionTitle icon={Phone}>Таксиметрови фирми</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-400 text-xs uppercase">
                      <th className="pb-2 pr-3">Фирма</th><th className="pb-2 pr-3">Телефон</th><th className="pb-2">Забележка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.taxis.map((t, i) => (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="py-2 pr-3 font-semibold text-stone-700">{t.name}</td>
                        <td className="py-2 pr-3">{t.phone ? <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="text-emerald-700 hover:underline">{t.phone}</a> : <span className="text-stone-400">—</span>}</td>
                        <td className="py-2 text-stone-500">{t.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {route.accommodation?.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <SectionTitle icon={Hotel}>Настаняване</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-3">
                {route.accommodation.map((a, i) => (
                  <div key={i} className="border border-stone-100 rounded-lg p-3 bg-stone-50">
                    <div className="font-bold text-stone-800 text-sm">{a.name}</div>
                    <div className="text-xs text-stone-500 mb-1">{a.location}</div>
                    <div className="text-xs text-stone-600">⭐ {a.rating} · {a.price}</div>
                    <div className="text-xs text-stone-400 mt-1">{a.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "huts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Home}>Одит на хижите</SectionTitle>
            <div className="space-y-3">
              {route.huts.map((h) => {
                const verified = hutVerification[`${route.id}:${h.name}`] ?? h.verified;
                return (
                  <div key={h.name} className={`border rounded-lg p-4 ${h.conflict ? "border-amber-300 bg-amber-50/50" : "border-stone-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-stone-800 flex items-center gap-1.5">
                          {h.name}
                          {h.conflict && <TriangleAlert size={14} className="text-amber-600" />}
                        </div>
                        <div className="text-xs text-stone-500">{h.elevation} м н.в. · {h.beds} места</div>
                        {h.contactName && <div className="text-xs text-stone-500 mt-0.5">{h.contactName}</div>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${verified ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                        {verified ? <CircleCheckBig size={12} /> : <Circle size={12} />} {verified ? "Потвърден" : "Непотвърден"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      {h.officialPhone && <a href={`tel:${h.officialPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 text-emerald-700 hover:underline">
                        <Phone size={13} /> {h.officialPhone}
                      </a>}
                      {h.altPhone && <span className="flex items-center gap-1 text-stone-500"><Phone size={13} /> алт: {h.altPhone}</span>}
                      {h.email && <span className="text-stone-500">✉️ {h.email}</span>}
                      <span className="text-stone-400 text-xs">GPS: {h.gps}</span>
                    </div>
                    {h.conflict && <div className="mt-2 text-xs text-amber-800 bg-amber-100/70 rounded p-2">{h.conflict}</div>}
                    {h.staleNumbers && <div className="mt-1 text-xs text-stone-400">{h.staleNumbers}</div>}
                    {!verified && (
                      <button
                        onClick={() => verifyHut(route.id, h.name)}
                        className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        ✅ Верифицирай по телефон
                      </button>
                    )}
                  </div>
                );
              })}
              {route.huts.length === 0 && <p className="text-sm text-stone-400 italic">Няма въведени хижи за този маршрут.</p>}
            </div>
          </div>

          {route.risk ? (
            <div className={`rounded-xl border-2 p-5 ${riskColorMap[route.risk.color] || riskColorMap.amber}`}>
              <div className="flex items-center gap-2 font-extrabold text-base mb-3">
                <TriangleAlert size={18} /> Регистър на риска: {route.risk.level}
              </div>
              <ul className="space-y-2 text-sm">
                {(route.risk.points || []).map((p, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />{p}</li>
                ))}
              </ul>
              {route.risk.conclusion && (
                <div className="mt-3 pt-3 border-t border-current/20 text-sm font-semibold">Извод: {route.risk.conclusion}</div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-stone-200 bg-stone-50 p-5 text-sm text-stone-400 italic">
              Няма въведени данни за риска на този маршрут.
            </div>
          )}
        </div>
      )}

      {tab === "days" && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 overflow-x-auto">
          <SectionTitle icon={Calendar}>Дни по дни</SectionTitle>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-stone-400 text-xs uppercase border-b border-stone-200">
                <th className="pb-2 pr-3">Дата</th><th className="pb-2 pr-3">Маршрут</th><th className="pb-2 pr-3">Тип</th>
                <th className="pb-2 pr-3">Разстояние</th><th className="pb-2 pr-3">Денивелация</th><th className="pb-2 pr-3">Време</th>
                <th className="pb-2 pr-3">Нощувка</th><th className="pb-2">Трудност</th>
              </tr>
            </thead>
            <tbody>
              {route.days.map((d, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0">
                  <td className="py-2.5 pr-3 font-semibold text-stone-700 whitespace-nowrap">{d.date}</td>
                  <td className="py-2.5 pr-3 text-stone-700">{d.label}</td>
                  <td className="py-2.5 pr-3 text-stone-500">{d.type}</td>
                  <td className="py-2.5 pr-3 text-stone-500 whitespace-nowrap">{d.distance}</td>
                  <td className="py-2.5 pr-3 text-stone-500 whitespace-nowrap">{d.gain}</td>
                  <td className="py-2.5 pr-3 text-stone-500 whitespace-nowrap flex items-center gap-1"><Clock size={11} />{d.time}</td>
                  <td className="py-2.5 pr-3 text-stone-500">{d.stay}</td>
                  <td className="py-2.5">{d.difficulty !== "–" ? <DifficultyBadge difficulty={d.difficulty} /> : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "gear" && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle icon={Backpack}>Чеклист екипировка ({route.difficulty})</SectionTitle>
            <button onClick={() => resetGear(route.id)} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"><Trash2 size={12} /> Нулирай</button>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${gearPct}%` }} />
          </div>
          <div className="text-xs text-stone-400 mb-3">{gearDone} / {gear.length} готово</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {gear.map((g) => {
              const checked = !!gearState[g];
              return (
                <button
                  key={g}
                  onClick={() => toggleGear(route.id, g)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                    checked ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {checked ? <CircleCheckBig size={16} className="text-emerald-600 shrink-0" /> : <Circle size={16} className="text-stone-300 shrink-0" />}
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <SectionTitle icon={StickyNote}>Лични бележки</SectionTitle>
          <textarea
            value={notes[route.id] || ""}
            onChange={(e) => setNote(route.id, e.target.value)}
            placeholder="Твоите бележки за този преход (пазят се за сесията)..."
            className="w-full h-40 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
          <button
            onClick={() => onExportMarkdown(route)}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-700"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Копирано!" : "Експорт в Markdown"}
          </button>
        </div>
      )}
    </div>
  );
}
