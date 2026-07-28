import {
  MapPin, Phone, TriangleAlert, Car, Copy, Check, Trash2, Calendar,
  TrendingUp, Ruler, Gauge, StickyNote, Home
} from "lucide-react";

import { StatCard } from "../ui/StatCard";
import { SectionTitle } from "../ui/SectionTitle";

/* =========================================================================
   CustomRouteView — for user-added blueprint routes
   ========================================================================= */
export function CustomRouteView({ route, onDelete, onExportMarkdown, copied, notes, setNote }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-md mb-5">
        <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-amber-100/80 font-bold mb-1 flex items-center gap-1"><MapPin size={12}/>{route.region || "Без регион"} · Твой маршрут</div>
              <h1 className="text-2xl font-extrabold tracking-tight">{route.name}</h1>
            </div>
            <button onClick={() => onDelete(route.id)} aria-label="Изтрий маршрут" className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-stone-200">
          <StatCard icon={Ruler} label="Дистанция" value={route.distanceKm ? `${route.distanceKm} км` : "–"} />
          <StatCard icon={TrendingUp} label="Изкачване" value={route.gainM ? `+${route.gainM} м` : "–"} accent="bg-amber-50 text-amber-700" />
          <StatCard icon={Gauge} label="Трудност" value={route.difficulty || "–"} accent="bg-rose-50 text-rose-700" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <SectionTitle icon={Car}>Транспорт</SectionTitle>
          <p className="text-sm text-stone-600 whitespace-pre-line">{route.transportNote || "Няма въведени данни."}</p>
        </div>
        {route.huts?.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Home}>Хижи</SectionTitle>
            <div className="space-y-2">
              {route.huts.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm">
                  <span className="font-semibold text-stone-700">{h.name}</span>
                  {h.phone && <a href={`tel:${h.phone.replace(/[^\d+]/g, "")}`} className="text-emerald-700 hover:underline flex items-center gap-1"><Phone size={12}/>{h.phone}</a>}
                </div>
              ))}
            </div>
          </div>
        )}
        {route.days?.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <SectionTitle icon={Calendar}>Дни</SectionTitle>
            <div className="space-y-2">
              {route.days.map((d, i) => (
                <div key={i} className="flex gap-3 p-3 bg-stone-50 rounded-lg text-sm">
                  <span className="font-bold text-stone-700 shrink-0">Ден {i + 1}</span>
                  <span className="text-stone-600">{d.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {route.risks && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex gap-2">
            <TriangleAlert size={16} className="shrink-0 mt-0.5" /> {route.risks}
          </div>
        )}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <SectionTitle icon={StickyNote}>Бележки</SectionTitle>
          <textarea
            value={notes[route.id] || ""}
            onChange={(e) => setNote(route.id, e.target.value)}
            placeholder="Бележки..."
            className="w-full h-32 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
          <button onClick={() => onExportMarkdown(route)} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-700">
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Копирано!" : "Експорт в Markdown"}
          </button>
        </div>
      </div>
    </div>
  );
}
