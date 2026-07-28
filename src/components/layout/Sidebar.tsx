import { useCallback } from "react";
import {
  Mountain, Search, ChevronDown, ChevronRight, CircleCheckBig, Heart, Plus, X,
  Copy, ArrowUpDown, User, Siren, Star, CalendarPlus
} from "lucide-react";

import { REGION_ORDER } from "../../data/regions";

/* =========================================================================
   Sidebar
   ========================================================================= */
export function Sidebar({
  detailedRoutes, almanac, customRoutes, importedRoutes, selectedId, onSelect,
  search, setSearch, favorites, toggleFavorite, completed,
  difficultyFilter, setDifficultyFilter, sortMode, setSortMode,
  collapsedRegions, toggleRegion, onOpenAddForm, onOpenEmergency, onOpenProfile, onOpenImport,
  onOpenTripPlanner, mobileOpen, setMobileOpen,
}) {
  const q = search.trim().toLowerCase();

  const matchesQuery = useCallback((name, region) => {
    if (!q) return true;
    return name.toLowerCase().includes(q) || (region || "").toLowerCase().includes(q);
  }, [q]);

  const matchesDifficulty = useCallback((difficulty) => {
    if (difficultyFilter === "all") return true;
    return difficulty === difficultyFilter;
  }, [difficultyFilter]);

  const sortRoutes = useCallback((list) => {
    const arr = [...list];
    if (sortMode === "km") arr.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    else if (sortMode === "km-desc") arr.sort((a, b) => (b.distanceKm || 0) - (a.distanceKm || 0));
    else if (sortMode === "difficulty") {
      const order = ["Лесна", "Лесен", "Лесна/Средна", "Средна", "Среден", "Средна/Висока", "Висока", "Екстремна"];
      arr.sort((a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty));
    }
    return arr;
  }, [sortMode]);

  const filteredDetailed = detailedRoutes.filter((r) => matchesQuery(r.name, r.region) && matchesDifficulty(r.difficulty));
  const filteredCustom = customRoutes.filter((r) => matchesQuery(r.name, r.region) && matchesDifficulty(r.difficulty));
  const filteredImported = (importedRoutes || []).filter((r) => matchesQuery(r.name, r.region) && matchesDifficulty(r.difficulty));

  const favoriteIds = new Set(favorites);
  const completedIds = new Set(Object.keys(completed));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[300px] shrink-0 bg-[#0d2818] text-emerald-50 flex flex-col transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-emerald-900/60 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-300">
            <Mountain size={20} />
          </div>
          <div>
            <div className="font-extrabold text-lg leading-tight tracking-tight">ПЛАНИНА</div>
            <div className="text-[11px] text-emerald-300/70 leading-none">Планировчик на преходи</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-emerald-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-3 space-y-2 border-b border-emerald-900/60">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2.5 text-emerald-400/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси маршрут или регион..."
              className="w-full bg-emerald-950/50 border border-emerald-800/60 rounded-lg pl-8 pr-2 py-2 text-sm placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {["all", "Лесна", "Средна", "Висока", "Екстремна"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  difficultyFilter === d
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-transparent border-emerald-800/70 text-emerald-300/80 hover:border-emerald-600"
                }`}
              >
                {d === "all" ? "Всички" : d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/70">
            <ArrowUpDown size={12} />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="bg-emerald-950/50 border border-emerald-800/60 rounded px-1.5 py-1 text-emerald-200 focus:outline-none"
            >
              <option value="default">По подразбиране</option>
              <option value="km">Км (възх.)</option>
              <option value="km-desc">Км (низх.)</option>
              <option value="difficulty">Трудност</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filteredDetailed.length > 0 && (
            <div className="px-3 mb-3">
              <div className="text-[11px] font-bold uppercase text-emerald-400/60 mb-1.5 px-1">📌 Планирани</div>
              <div className="space-y-1">
                {sortRoutes(filteredDetailed).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { onSelect(r.id); setMobileOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                      selectedId === r.id ? "bg-emerald-700/50 ring-1 ring-emerald-500" : "hover:bg-emerald-900/40"
                    }`}
                  >
                    <span className="mt-0.5 text-amber-400"><Star size={13} fill="currentColor" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">{r.name}</span>
                      <span className="block text-[11px] text-emerald-300/60">{r.distanceKm} км · {r.difficulty}</span>
                    </span>
                    {completedIds.has(r.id) && <CircleCheckBig size={14} className="text-emerald-400 mt-0.5" />}
                    {favoriteIds.has(r.id) && <Heart size={12} className="text-rose-400 mt-1" fill="currentColor" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCustom.length > 0 && (
            <div className="px-3 mb-3">
              <div className="text-[11px] font-bold uppercase text-emerald-400/60 mb-1.5 px-1">✍️ Добавени от теб</div>
              <div className="space-y-1">
                {sortRoutes(filteredCustom).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { onSelect(r.id); setMobileOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                      selectedId === r.id ? "bg-emerald-700/50 ring-1 ring-emerald-500" : "hover:bg-emerald-900/40"
                    }`}
                  >
                    <span className="block text-sm font-semibold truncate">{r.name}</span>
                    <span className="block text-[11px] text-emerald-300/60">{r.region || "Без регион"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredImported.length > 0 && (
            <div className="px-3 mb-3">
              <div className="text-[11px] font-bold uppercase text-emerald-400/60 mb-1.5 px-1">📥 Внесени (JSON)</div>
              <div className="space-y-1">
                {sortRoutes(filteredImported).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { onSelect(r.id); setMobileOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                      selectedId === r.id ? "bg-emerald-700/50 ring-1 ring-emerald-500" : "hover:bg-emerald-900/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1 block">
                      <span className="block text-sm font-semibold truncate">{r.name}</span>
                      <span className="block text-[11px] text-emerald-300/60">{r.region || "Без регион"}{r.distanceKm ? ` · ${r.distanceKm} км` : ""}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {REGION_ORDER.map((region) => {
            const routes = (almanac[region] || []).filter((r) => matchesQuery(r.name, region) && matchesDifficulty(r.difficulty));
            if (routes.length === 0) return null;
            const isCollapsed = collapsedRegions[region];
            return (
              <div key={region} className="px-3 mb-1">
                <button
                  onClick={() => toggleRegion(region)}
                  className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[11px] font-bold uppercase text-emerald-400/70 hover:text-emerald-200"
                >
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  {region}
                  <span className="ml-auto font-normal normal-case text-emerald-500/50">{routes.length}</span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {sortRoutes(routes).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { onSelect(r.id); setMobileOpen(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedId === r.id ? "bg-emerald-700/50 ring-1 ring-emerald-500" : "hover:bg-emerald-900/40"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium truncate">{r.name}</span>
                          <span className="block text-[10.5px] text-emerald-300/50">{r.distanceKm} км · {r.difficulty}</span>
                        </span>
                        {completedIds.has(r.id) && <CircleCheckBig size={13} className="text-emerald-400 shrink-0" />}
                        {favoriteIds.has(r.id) && <Heart size={11} className="text-rose-400 shrink-0" fill="currentColor" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-emerald-900/60 space-y-1.5">
          <button onClick={onOpenTripPlanner} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 text-sm font-semibold transition-colors text-amber-100">
            <CalendarPlus size={15} /> Планирай преход
          </button>
          <button onClick={onOpenProfile} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-900/70 text-sm font-semibold transition-colors">
            <User size={15} /> Личен профил
          </button>
          <button onClick={onOpenEmergency} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-sm font-semibold transition-colors text-rose-100">
            <Siren size={15} /> Спешни контакти
          </button>
          <button onClick={onOpenImport} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-900/40 hover:bg-sky-900/70 text-sm font-semibold transition-colors text-sky-100">
            <Copy size={15} /> Импортирай данни
          </button>
          <button onClick={onOpenAddForm} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-bold transition-colors">
            <Plus size={15} /> Добави нов маршрут
          </button>
        </div>
      </aside>
    </>
  );
}
