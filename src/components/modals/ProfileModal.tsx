import { Award, CircleCheckBig, Heart, User } from "lucide-react";

import { diffStyle } from "../../data/constants";
import { ModalShell } from "../ui/ModalShell";
import { SectionTitle } from "../ui/SectionTitle";

/* =========================================================================
   ProfileModal
   ========================================================================= */
export function ProfileModal({ onClose, completed, favorites, allRoutesById }: any) {
  const completedList = Object.entries(completed).map(([id, info]: any) => ({ id, ...(info as any), route: allRoutesById[id] })).filter((c: any) => c.route);
  const totalKm = completedList.reduce((sum, c) => sum + (c.route.distanceKm || 0), 0);
  const totalGain = completedList.reduce((sum, c) => sum + (c.route.gainM || 0), 0);
  const byDifficulty = completedList.reduce((acc, c) => {
    const d = c.route.difficulty || "Друго";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const goal = 20;
  const pct = Math.min(100, Math.round((completedList.length / goal) * 100));

  return (
    <ModalShell title="Личен профил" icon={User} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-700">{completedList.length}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Изминати преходи</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-700">{totalKm}</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Общо километри</div>
          </div>
          <div className="bg-sky-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-sky-700">{totalGain}</div>
            <div className="text-xs text-sky-600 font-semibold mt-1">Метри изкачване</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
            <span>Годишна цел: {goal} прехода</span><span>{pct}%</span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {Object.keys(byDifficulty).length > 0 && (
          <div>
            <SectionTitle icon={Award}>По трудност</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byDifficulty).map(([d, count]: any) => (
                <span key={d} className={`px-3 py-1 rounded-full text-xs font-bold ${diffStyle(d as any).bg} ${diffStyle(d as any).text}`}>{d}: {count}</span>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionTitle icon={Heart}>Любими ({favorites.length})</SectionTitle>
          {favorites.length === 0 && <p className="text-sm text-stone-400 italic">Все още нямаш добавени любими маршрути.</p>}
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {favorites.map((id) => allRoutesById[id] && (
              <div key={id} className="flex items-center gap-2 text-sm bg-stone-50 rounded-lg px-3 py-2">
                <Heart size={12} className="text-rose-400" fill="currentColor" /> {allRoutesById[id].name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle icon={CircleCheckBig}>История на изминатите</SectionTitle>
          {completedList.length === 0 && <p className="text-sm text-stone-400 italic">Все още нямаш маркирани изминати преходи.</p>}
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {completedList.sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                <span className="text-stone-700 font-medium truncate pr-2">{c.route.name}</span>
                <span className="text-stone-400 text-xs shrink-0">{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
