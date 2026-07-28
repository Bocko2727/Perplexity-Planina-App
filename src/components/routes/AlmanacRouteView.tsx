import { useState } from "react";
import {
  Search, MapPin, Phone, CircleCheckBig, Circle, Heart, Copy, Check, Trash2,
  Calendar, TrendingUp, Ruler, Gauge, Backpack, StickyNote, Home, ExternalLink,
  Star, Award, Sunrise
} from "lucide-react";

import { gearListFor } from "../../data/constants";
import { fmtKm, fmtM } from "../../lib/utils";
import { StatCard } from "../ui/StatCard";
import { SectionTitle } from "../ui/SectionTitle";

/* =========================================================================
   AlmanacRouteView — simplified view for the 50 compact almanac routes
   ========================================================================= */
export function AlmanacRouteView({
  route, isFavorite, toggleFavorite, isCompleted, completedInfo, onOpenComplete,
  gearState, toggleGear, resetGear, notes, setNote, onExportMarkdown, copied,
  hutVerification, verifyHut,
}) {
  const [tab, setTab] = useState("overview");
  const gear = gearListFor(route.difficulty);
  const gearDone = gear.filter((g) => gearState[g]).length;
  const gearPct = gear.length > 0 ? Math.round((gearDone / gear.length) * 100) : 0;
  const verified = hutVerification[`${route.id}:${route.hutName}`] ?? route.verified;
  const bgLink = `https://www.google.com/search?q=${encodeURIComponent(route.name + " " + route.region + " bgmountains.org GPS трак")}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-md mb-5">
        <div className="bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-stone-200/80 font-bold mb-1">
                <MapPin size={12} /> {route.region} · Алманах
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">{route.name}</h1>
            </div>
            <button
              onClick={() => toggleFavorite(route.id)}
              aria-label={isFavorite ? "Премахни от любими" : "Добави в любими"}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0"
            >
              <Heart size={16} className={isFavorite ? "text-rose-300" : "text-white/80"} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          {isCompleted && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold">
              <CircleCheckBig size={13} /> Изминат на {completedInfo?.date} {completedInfo?.note ? `— ${completedInfo.note}` : ""}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-px bg-stone-200">
          <StatCard icon={Ruler} label="Дистанция" value={fmtKm(route.distanceKm)} />
          <StatCard icon={TrendingUp} label="Изкачване" value={fmtM(route.gainM)} accent="bg-amber-50 text-amber-700" />
          <StatCard icon={Gauge} label="Трудност" value={route.difficulty} accent="bg-rose-50 text-rose-700" />
        </div>
        <div className="bg-white px-4 py-2 flex items-center gap-2">
          <a href={bgLink} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline">
            <ExternalLink size={12} /> GPS трак в bgmountains.org
          </a>
          <button onClick={() => onOpenComplete(route.id)} className="ml-auto text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
            <CircleCheckBig size={13} /> {isCompleted ? "Редактирай" : "Маркирай като изминат"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b border-stone-200">
        {[
          { id: "overview", label: "Преглед", icon: Gauge },
          { id: "gear", label: "Екипировка", icon: Backpack },
          { id: "notes", label: "Бележки", icon: StickyNote },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                tab === t.id ? "border-emerald-600 text-emerald-700 bg-emerald-50/60" : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Calendar}>Дни по дни</SectionTitle>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 p-3 bg-stone-50 rounded-lg"><span className="font-bold text-stone-700 w-16 shrink-0">Ден 1</span><span className="text-stone-600">{route.day1}</span></div>
              <div className="flex gap-3 p-3 bg-stone-50 rounded-lg"><span className="font-bold text-stone-700 w-16 shrink-0">Ден 2</span><span className="text-stone-600">{route.day2}</span></div>
              <div className="flex gap-3 p-3 bg-emerald-50 rounded-lg"><span className="font-bold text-emerald-700 w-16 shrink-0">Прибиране</span><span className="text-emerald-800">{route.back}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Home}>Хижа</SectionTitle>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-bold text-stone-800">{route.hutName}</div>
                {route.hutPhone && <a href={`tel:${route.hutPhone.replace(/[^\d+]/g, "")}`} className="text-sm text-emerald-700 hover:underline flex items-center gap-1 mt-1">
                  <Phone size={13} /> {route.hutPhone}
                </a>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${verified ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                  {verified ? <CircleCheckBig size={12} /> : <Circle size={12} />} {verified ? "Потвърден" : "Непотвърден"}
                </span>
                {!verified && (
                  <button onClick={() => verifyHut(route.id, route.hutName)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">
                    Верифицирай
                  </button>
                )}
              </div>
            </div>
          </div>

          {(route.suitedFor || route.terrain || route.kmNote || route.assessment) && (
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={Search}>Изследване &amp; анализ</SectionTitle>
                {typeof route.practicalRank === "number" && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                    <Award size={12} /> #{route.practicalRank} по практичност
                  </span>
                )}
              </div>
              <div className="space-y-3 text-sm">
                {route.suitedFor && (
                  <div className="flex gap-3">
                    <span className="font-bold text-stone-500 w-28 shrink-0">Подходящ за</span>
                    <span className="text-stone-700">{route.suitedFor}</span>
                  </div>
                )}
                {route.fridayNight && (
                  <div className="flex gap-3">
                    <span className="font-bold text-stone-500 w-28 shrink-0 flex items-center gap-1"><Sunrise size={13} />Петък вечер</span>
                    <span className="text-stone-700">{route.fridayNight}</span>
                  </div>
                )}
                {route.terrain && (
                  <div className="flex gap-3">
                    <span className="font-bold text-stone-500 w-28 shrink-0">Терен</span>
                    <span className="text-stone-700">{route.terrain}</span>
                  </div>
                )}
                {route.kmNote && (
                  <div className="bg-stone-50 rounded-lg p-3 text-stone-600 text-xs leading-relaxed flex gap-2">
                    <Ruler size={13} className="shrink-0 mt-0.5 text-stone-400" /> {route.kmNote}
                  </div>
                )}
                {route.assessment && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-800 text-sm font-medium flex gap-2">
                    <Star size={14} className="shrink-0 mt-0.5 text-emerald-500" /> {route.assessment}
                  </div>
                )}
              </div>
            </div>
          )}
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
            placeholder="Твоите бележки за този преход..."
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
