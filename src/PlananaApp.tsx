import { useState, useMemo, useCallback, useEffect } from "react";
import { Mountain, Menu } from "lucide-react";

/* =========================================================================
   ПЛАНИНА (PLANINA) — Планировчик на планински преходи в България
   Production build — single-file React SPA
   ========================================================================= */

import type { AlmanacRoute, BackupPayload } from "./types";
import {
  SCHEMA_VERSION, STORAGE_KEY_OVERRIDES, STORAGE_KEY_IMPORTED, STORAGE_KEY_USERDATA
} from "./data/constants";
import { todayISO } from "./lib/utils";
import { storageAdapter } from "./lib/storage";
import { almanacToCommon, flattenResearch, mergeRouteData, normalizeImportedRoute } from "./lib/route-helpers";
import { buildMarkdownForDetailed, buildMarkdownForAlmanac, buildMarkdownForCustom } from "./lib/markdown";
import { Sidebar } from "./components/layout/Sidebar";
import { EmergencyModal } from "./components/modals/EmergencyModal";
import { ProfileModal } from "./components/modals/ProfileModal";
import { AddForm } from "./components/modals/AddForm";
import { ImportModal } from "./components/modals/ImportModal";
import { CompleteModal } from "./components/modals/CompleteModal";
import { DetailedRouteView } from "./components/routes/DetailedRouteView";
import { AlmanacRouteView } from "./components/routes/AlmanacRouteView";
import { CustomRouteView } from "./components/routes/CustomRouteView";

import { useDetailedRoutes, useAlmanacRoutes } from "./hooks/useRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";

/* =========================================================================
   Main App component
   ========================================================================= */
function PlananaApp() {
  const { routes: DETAILED_ROUTES, loading: routesLoading } = useDetailedRoutes();
  const { routes: almanacRoutes, loading: almanacLoading } = useAlmanacRoutes();

  const ALMANAC = useMemo(() => {
    const obj: Record<string, AlmanacRoute[]> = {};
    for (const r of almanacRoutes) {
      if (!obj[r.region]) obj[r.region] = [];
      obj[r.region].push(r);
    }
    return obj;
  }, [almanacRoutes]);

  const [selectedId, setSelectedId] = useState(DETAILED_ROUTES[0].id);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortMode, setSortMode] = useState("default");
  const [collapsedRegions, setCollapsedRegions] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const [transportModes, setTransportModes] = useState({});
  const [hutVerification, setHutVerification] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [completed, setCompleted] = useState({});
  const [gearState, setGearState] = useState({});
  const [notes, setNotes] = useState({});
  const [customRoutes, setCustomRoutes] = useState([]);

  const [overrides, setOverrides] = useState({});
  const [importedRoutes, setImportedRoutes] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [completeModalRouteId, setCompleteModalRouteId] = useState(null);
  const [copied, setCopied] = useState(false);

  const seedIds = useMemo(() => {
    const s = new Set();
    DETAILED_ROUTES.forEach((r) => s.add(r.id));
    Object.values(ALMANAC).forEach((list) => list.forEach((r) => s.add(r.id)));
    return s;
  }, [DETAILED_ROUTES, ALMANAC]);

  const mergedDetailed = useMemo(
    () => DETAILED_ROUTES.map((r) => mergeRouteData(r, flattenResearch(overrides[r.id] || {}))),
    [DETAILED_ROUTES, overrides]
  );

  const mergedAlmanac = useMemo(() => {
    const out = {};
    Object.entries(ALMANAC).forEach(([region, list]) => {
      out[region] = list.map((r) => mergeRouteData(r, flattenResearch(overrides[r.id] || {})));
    });
    return out;
  }, [ALMANAC, overrides]);

  /* ---- load persisted data from storage on first mount ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await storageAdapter.get(STORAGE_KEY_OVERRIDES, false);
        if (r?.value && !cancelled) setOverrides(JSON.parse(r.value));
      } catch (e) { /* key not set yet */ }
      try {
        const r = await storageAdapter.get(STORAGE_KEY_IMPORTED, false);
        if (r?.value && !cancelled) setImportedRoutes(JSON.parse(r.value));
      } catch (e) { /* key not set yet */ }
      try {
        const r = await storageAdapter.get(STORAGE_KEY_USERDATA, false);
        if (r?.value && !cancelled) {
          const d = JSON.parse(r.value);
          if (d.favorites) setFavorites(d.favorites);
          if (d.completed) setCompleted(d.completed);
          if (d.notes) setNotes(d.notes);
          if (d.gearState) setGearState(d.gearState);
          if (d.customRoutes) setCustomRoutes(d.customRoutes);
          if (d.hutVerification) setHutVerification(d.hutVerification);
        }
      } catch (e) { /* key not set yet */ }
      if (!cancelled) setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---- persist personal progress/state after the initial load ---- */
  useEffect(() => {
    if (!dataLoaded) return;
    const payload = JSON.stringify({ favorites, completed, notes, gearState, customRoutes, hutVerification });
    storageAdapter.set(STORAGE_KEY_USERDATA, payload, false).catch(() => {});
  }, [dataLoaded, favorites, completed, notes, gearState, customRoutes, hutVerification]);

  const toggleRegion = (region) => setCollapsedRegions((c) => ({ ...c, [region]: !c[region] }));

  const setTransportMode = useCallback((routeId, mode) => {
    setTransportModes((m) => ({ ...m, [routeId]: mode }));
  }, []);

  const verifyHut = useCallback((routeId, hutName) => {
    setHutVerification((v) => ({ ...v, [`${routeId}:${hutName}`]: true }));
  }, []);

  const toggleFavorite = useCallback((routeId) => {
    setFavorites((f) => (f.includes(routeId) ? f.filter((id) => id !== routeId) : [...f, routeId]));
  }, []);

  const saveCompleted = useCallback((routeId, info) => {
    setCompleted((c) => ({ ...c, [routeId]: info }));
  }, []);
  const removeCompleted = useCallback((routeId) => {
    setCompleted((c) => {
      const next = { ...c };
      delete next[routeId];
      return next;
    });
  }, []);

  const toggleGear = useCallback((routeId, item) => {
    setGearState((g) => {
      const routeGear = { ...(g[routeId] || {}) };
      routeGear[item] = !routeGear[item];
      return { ...g, [routeId]: routeGear };
    });
  }, []);
  const resetGear = useCallback((routeId) => {
    setGearState((g) => ({ ...g, [routeId]: {} }));
  }, []);

  const setNote = useCallback((routeId, text) => {
    setNotes((n) => ({ ...n, [routeId]: text }));
  }, []);

  const addCustomRoute = useCallback((route) => {
    setCustomRoutes((c) => [...c, route]);
    setSelectedId(route.id);
  }, []);
  const deleteCustomRoute = useCallback((routeId) => {
    setCustomRoutes((c) => c.filter((r) => r.id !== routeId));
    setImportedRoutes((imp) => imp.filter((r) => r.id !== routeId));
    setSelectedId(DETAILED_ROUTES[0].id);
  }, [DETAILED_ROUTES]);

  const handleImport = useCallback((arr: any[], backup?: any) => {
    // Full backup restore mode
    if (backup && backup.schemaVersion !== undefined) {
      if (backup.overrides) setOverrides(backup.overrides);
      if (backup.importedRoutes) setImportedRoutes(backup.importedRoutes);
      if (backup.customRoutes) setCustomRoutes(backup.customRoutes);
      if (backup.favorites) setFavorites(backup.favorites);
      if (backup.completed) setCompleted(backup.completed);
      if (backup.notes) setNotes(backup.notes);
      if (backup.gearState) setGearState(backup.gearState);
      if (backup.hutVerification) setHutVerification(backup.hutVerification);
      if (backup.overrides) storageAdapter.set(STORAGE_KEY_OVERRIDES, JSON.stringify(backup.overrides), false).catch(() => {});
      if (backup.importedRoutes) storageAdapter.set(STORAGE_KEY_IMPORTED, JSON.stringify(backup.importedRoutes), false).catch(() => {});
      return;
    }
    // Route-array import mode (existing behavior)
    const newOverrides = { ...overrides };
    const newImported = [...importedRoutes];
    arr.forEach((raw) => {
      if (seedIds.has(raw.id)) {
        newOverrides[raw.id] = { ...(newOverrides[raw.id] || {}), ...raw };
      } else {
        const normalized = normalizeImportedRoute(raw);
        const idx = newImported.findIndex((r) => r.id === raw.id);
        if (idx >= 0) newImported[idx] = normalized; else newImported.push(normalized);
      }
    });
    setOverrides(newOverrides);
    setImportedRoutes(newImported);
    storageAdapter.set(STORAGE_KEY_IMPORTED, JSON.stringify(newImported), false).catch(() => {});
    storageAdapter.set(STORAGE_KEY_OVERRIDES, JSON.stringify(newOverrides), false).catch(() => {});
  }, [overrides, importedRoutes, seedIds]);

  const handleExportBackup = useCallback(() => {
    const payload: BackupPayload = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      overrides, importedRoutes, customRoutes, favorites, completed, notes, gearState, hutVerification,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planina-backup-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    }
  }, [overrides, importedRoutes, customRoutes, favorites, completed, notes, gearState, hutVerification]);

  const handleExportMarkdown = useCallback((route) => {
    let md;
    if (route.kind === "detailed") md = buildMarkdownForDetailed(route);
    else if (route.kind === "custom") md = buildMarkdownForCustom(route);
    else md = buildMarkdownForAlmanac(route);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }, []);

  const allRoutesById = useMemo(() => {
    const map: any = {};
    mergedDetailed.forEach((r: any) => { map[r.id] = r; });
    Object.values(mergedAlmanac).forEach((list: any) => (list as any[]).forEach((r: any) => { map[r.id] = almanacToCommon(r); }));
    customRoutes.forEach((r: any) => { map[r.id] = r; });
    importedRoutes.forEach((r: any) => { map[r.id] = r; });
    return map;
  }, [mergedDetailed, mergedAlmanac, customRoutes, importedRoutes]);

  const selectedRoute = allRoutesById[selectedId] || mergedDetailed[0];
  const selectedRawAlmanac = useMemo(() => {
    if ((selectedRoute as any).kind !== "almanac") return null;
    for (const list of Object.values(mergedAlmanac)) {
      const found = (list as any[]).find((r: any) => r.id === (selectedRoute as any).id);
      if (found) return found;
    }
    return selectedRoute; // imported almanac-kind route already matches this shape
  }, [selectedRoute, mergedAlmanac]);
  const selectedCustom =
    customRoutes.find((r) => r.id === selectedId) ||
    (selectedRoute.kind === "custom" ? selectedRoute : null);

  const completeModalRoute = completeModalRouteId ? allRoutesById[completeModalRouteId] : null;

  if (routesLoading || almanacLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-3 text-stone-700">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-emerald-700 animate-spin" />
        <div className="text-sm">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex text-stone-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar
        detailedRoutes={mergedDetailed}
        almanac={mergedAlmanac}
        customRoutes={customRoutes}
        importedRoutes={importedRoutes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        search={search}
        setSearch={setSearch}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        completed={completed}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        sortMode={sortMode}
        setSortMode={setSortMode}
        collapsedRegions={collapsedRegions}
        toggleRegion={toggleRegion}
        onOpenAddForm={() => setShowAddForm(true)}
        onOpenEmergency={() => setShowEmergency(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenImport={() => setShowImportModal(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-[#0d2818] text-white flex items-center gap-2 px-4 py-3">
          <button onClick={() => setMobileOpen(true)} className="text-emerald-200"><Menu size={22} /></button>
          <Mountain size={18} className="text-emerald-300" />
          <span className="font-bold">ПЛАНИНА</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {selectedRoute.kind === "detailed" && (
            <DetailedRouteView
              route={selectedRoute}
              transportMode={transportModes[selectedRoute.id] || "car"}
              setTransportMode={setTransportMode}
              hutVerification={hutVerification}
              verifyHut={verifyHut}
              isFavorite={favorites.includes(selectedRoute.id)}
              toggleFavorite={toggleFavorite}
              isCompleted={!!completed[selectedRoute.id]}
              completedInfo={completed[selectedRoute.id]}
              onOpenComplete={setCompleteModalRouteId}
              gearState={gearState[selectedRoute.id] || {}}
              toggleGear={toggleGear}
              resetGear={resetGear}
              notes={notes}
              setNote={setNote}
              onExportMarkdown={handleExportMarkdown}
              copied={copied}
            />
          )}
          {selectedRoute.kind === "almanac" && selectedRawAlmanac && (
            <AlmanacRouteView
              route={selectedRawAlmanac}
              isFavorite={favorites.includes(selectedRoute.id)}
              toggleFavorite={toggleFavorite}
              isCompleted={!!completed[selectedRoute.id]}
              completedInfo={completed[selectedRoute.id]}
              onOpenComplete={setCompleteModalRouteId}
              gearState={gearState[selectedRoute.id] || {}}
              toggleGear={toggleGear}
              resetGear={resetGear}
              notes={notes}
              setNote={setNote}
              onExportMarkdown={handleExportMarkdown}
              copied={copied}
              hutVerification={hutVerification}
              verifyHut={verifyHut}
            />
          )}
          {selectedRoute.kind === "custom" && selectedCustom && (
            <CustomRouteView
              route={selectedCustom}
              onDelete={deleteCustomRoute}
              onExportMarkdown={handleExportMarkdown}
              copied={copied}
              notes={notes}
              setNote={setNote}
            />
          )}
        </main>

        <footer className="text-center text-[11px] text-stone-400 py-3 border-t border-stone-200/70">
          🏔️ ПЛАНИНА — планировчик на планински преходи в България · {Object.values(ALMANAC).reduce((a, b) => a + b.length, 0) + DETAILED_ROUTES.length + customRoutes.length} маршрута
        </footer>
      </div>

      {showAddForm && <AddForm onClose={() => setShowAddForm(false)} onSave={addCustomRoute} />}
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          seedIds={seedIds}
          onExportBackup={handleExportBackup}
        />
      )}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          completed={completed}
          favorites={favorites}
          allRoutesById={allRoutesById}
        />
      )}
      {completeModalRouteId && (
        <CompleteModal
          routeId={completeModalRouteId}
          existing={completed[completeModalRouteId]}
          onClose={() => setCompleteModalRouteId(null)}
          onSave={saveCompleted}
          onRemove={removeCompleted}
        />
      )}
    </div>
  );
}

export default function PlananaAppWithBoundary() {
  return (
    <ErrorBoundary>
      <PlananaApp />
    </ErrorBoundary>
  );
}
