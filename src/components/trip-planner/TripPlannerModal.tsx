import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Clock, MapPin, Mountain, Phone, Package, Save, ArrowLeft, Ruler, Bus, Home, Check } from "lucide-react";

import type { DetailedRoute } from "../../types/route";
import type { TransportLeg, TripInput, TripPlan } from "../../lib/trip-planner/types";
import { buildTripPlan } from "../../lib/trip-planner/planner";
import { saveTrip } from "../../services/tripService";
import { todayISO } from "../../lib/utils";
import { ModalShell } from "../ui/ModalShell";
import { DifficultyBadge } from "../ui/DifficultyBadge";
import { SectionTitle } from "../ui/SectionTitle";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: DetailedRoute[];
  initialRouteId?: string;
}

const ACCOMMODATION_LABELS: Record<string, string> = {
  hut: "Хижа",
  shelter: "Настаняване",
  camp: "Бивак",
  none: "Нощувка",
};

function defaultInput(routes: DetailedRoute[], routeId?: string): TripInput {
  const route = routes.find((r) => r.id === routeId) || routes[0];
  return {
    routeId: route?.id || "",
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(route?.dateStart || "") ? route.dateStart : todayISO(),
    groupSize: 1,
    departureTime: "07:00",
    returnTime: "18:00",
    notes: "",
  };
}

function TransportLegList({ legs }: { legs: TransportLeg[] }) {
  if (legs.length === 0) return <p className="text-sm text-stone-400 italic">Няма данни за транспорт.</p>;
  return (
    <div className="space-y-2">
      {legs.map((leg, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-lg p-3 text-sm">
          <div className="font-semibold text-stone-800">{leg.from} → {leg.to}</div>
          <div className="text-stone-500 text-xs mt-0.5">
            {leg.method}
            {leg.duration ? ` · ${leg.duration}` : ""}
          </div>
          {leg.notes && <div className="text-stone-400 text-xs mt-1">{leg.notes}</div>}
        </div>
      ))}
    </div>
  );
}

export function TripPlannerModal({ isOpen, onClose, routes, initialRouteId }: TripPlannerModalProps) {
  const [input, setInput] = useState<TripInput>(() => defaultInput(routes, initialRouteId));
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setInput(defaultInput(routes, initialRouteId));
    setPlan(null);
    setSaved(false);
  }, [isOpen, initialRouteId, routes]);

  const selectedRoute = useMemo(() => routes.find((r) => r.id === input.routeId), [routes, input.routeId]);

  if (!isOpen) return null;

  const update = <K extends keyof TripInput>(key: K, value: TripInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const generate = () => {
    if (!selectedRoute) return;
    setPlan(buildTripPlan(selectedRoute, input));
    setSaved(false);
  };

  const handleSave = () => {
    if (!plan) return;
    saveTrip(plan);
    setSaved(true);
  };

  const title = plan ? `План: ${plan.routeName}` : "Планирай преход";

  return (
    <ModalShell title={title} icon={Calendar} onClose={onClose} wide>
      {!plan && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Маршрут</label>
            <select
              value={input.routeId}
              onChange={(e) => update("routeId", e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-400"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.region})</option>
              ))}
            </select>
            {selectedRoute && (
              <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                <DifficultyBadge difficulty={selectedRoute.difficulty} />
                <span>{selectedRoute.distanceKm ? `${selectedRoute.distanceKm} км` : "км: няма данни"}</span>
                <span>·</span>
                <span>Сезон: {selectedRoute.season || "няма данни"}</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">
                <Calendar size={13} className="text-emerald-600" /> Начална дата
              </label>
              <input
                type="date"
                value={input.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">
                <Users size={13} className="text-emerald-600" /> Брой хора
              </label>
              <input
                type="number"
                min={1}
                value={input.groupSize}
                onChange={(e) => update("groupSize", Math.max(1, Number(e.target.value) || 1))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">
                <Clock size={13} className="text-emerald-600" /> Час на тръгване
              </label>
              <input
                type="time"
                value={input.departureTime}
                onChange={(e) => update("departureTime", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">
                <Clock size={13} className="text-emerald-600" /> Час на връщане
              </label>
              <input
                type="time"
                value={input.returnTime}
                onChange={(e) => update("returnTime", e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Бележки (по желание)</label>
            <textarea
              value={input.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Уговорки с групата, резервации, коли, специална екипировка..."
              className="w-full h-24 border border-stone-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            onClick={generate}
            disabled={!selectedRoute}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 disabled:bg-stone-300 transition-colors"
          >
            <Mountain size={15} /> Генерирай план
          </button>
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="bg-emerald-900 text-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold text-emerald-200/80">
              <MapPin size={12} /> {plan.region}
            </div>
            <h3 className="text-lg font-extrabold mt-0.5">{plan.routeName}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <DifficultyBadge difficulty={plan.difficulty} />
              <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 font-semibold">
                <Calendar size={12} /> {plan.dailyPlan[0]?.date || plan.startDate}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5 font-semibold">
                <Users size={12} /> {plan.groupSize} {plan.groupSize === 1 ? "човек" : "души"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white border border-stone-200 rounded-lg p-3">
              <Ruler size={15} className="mx-auto text-emerald-600" />
              <div className="text-base font-bold text-stone-800 mt-1">{plan.totalDistanceKm || "–"} км</div>
              <div className="text-[11px] uppercase text-stone-400 font-bold">Дистанция</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-lg p-3">
              <Mountain size={15} className="mx-auto text-amber-600" />
              <div className="text-base font-bold text-stone-800 mt-1">{plan.totalGainM || "–"} м</div>
              <div className="text-[11px] uppercase text-stone-400 font-bold">Изкачване</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-lg p-3">
              <Calendar size={15} className="mx-auto text-sky-600" />
              <div className="text-base font-bold text-stone-800 mt-1">{plan.dailyPlan.length || "–"}</div>
              <div className="text-[11px] uppercase text-stone-400 font-bold">Дни</div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <SectionTitle icon={Bus}>Транспорт</SectionTitle>
            {plan.transportOutward.length === 0 && plan.transportReturn.length === 0 ? (
              <p className="text-sm text-stone-400 italic">Няма данни за транспорт.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-stone-500 mb-1.5">Отиване</div>
                  <TransportLegList legs={plan.transportOutward} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-500 mb-1.5">Връщане</div>
                  <TransportLegList legs={plan.transportReturn} />
                </div>
              </div>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <SectionTitle icon={Calendar}>Дневен план</SectionTitle>
            {plan.dailyPlan.length === 0 ? (
              <p className="text-sm text-stone-400 italic">Няма разписани дни за този маршрут.</p>
            ) : (
              <div className="space-y-2">
                {plan.dailyPlan.map((day) => (
                  <div key={day.dayNumber} className="bg-white border border-stone-200 rounded-lg p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-bold text-stone-800">Ден {day.dayNumber} · {day.title}</div>
                      <div className="text-xs text-stone-400 whitespace-nowrap">{day.date}</div>
                    </div>
                    {day.description && (
                      <div className="text-xs text-stone-500 mt-1 whitespace-pre-line">{day.description}</div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-600">
                      {day.distanceKm > 0 && <span className="flex items-center gap-1"><Ruler size={12} /> {day.distanceKm} км</span>}
                      {day.gainM > 0 && <span className="flex items-center gap-1"><Mountain size={12} /> +{day.gainM} м</span>}
                    </div>
                    {day.accommodation && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs bg-emerald-50 border border-emerald-100 rounded px-2 py-1.5 text-emerald-900">
                        <span className="flex items-center gap-1 font-semibold"><Home size={12} /> {ACCOMMODATION_LABELS[day.accommodation.type]}: {day.accommodation.name}</span>
                        {day.accommodation.phone && (
                          <a href={`tel:${day.accommodation.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 text-emerald-700 hover:underline">
                            <Phone size={12} /> {day.accommodation.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <SectionTitle icon={Package}>Екипировка ({plan.difficulty})</SectionTitle>
            <ul className="grid sm:grid-cols-2 gap-1 text-sm text-stone-700">
              {plan.gearList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <SectionTitle icon={Phone}>Спешни контакти</SectionTitle>
            <ul className="space-y-1 text-sm text-stone-700">
              {plan.emergencyPhones.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {plan.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 whitespace-pre-line">
              {plan.notes}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
            >
              {saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Запазено" : "Запази"}
            </button>
            <button
              onClick={() => { setPlan(null); setSaved(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-sm font-bold hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft size={15} /> Назад
            </button>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-700 transition-colors"
            >
              Затвори
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
