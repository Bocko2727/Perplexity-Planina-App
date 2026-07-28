import { useState } from "react";
import { Copy, ExternalLink, TriangleAlert } from "lucide-react";

import { ModalShell } from "../ui/ModalShell";

/* =========================================================================
   ImportModal — paste external JSON (per PLANINA schema v1) and merge it in
   ========================================================================= */
export function ImportModal({ onClose, onImport, seedIds, onExportBackup }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleValidate = () => {
    setError("");
    setPreview(null);
    if (!text.trim()) {
      setError("Постави JSON текст първо.");
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      setError(`Невалиден JSON: ${e.message}`);
      return null;
    }
    // Support both backup objects and raw route arrays
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.schemaVersion !== undefined) {
      // Backup object — extract routes + user data
      const routes: any[] = [];
      if (Array.isArray(parsed.importedRoutes)) routes.push(...parsed.importedRoutes);
      if (Array.isArray(parsed.customRoutes)) routes.push(...parsed.customRoutes);
      if (parsed.overrides && typeof parsed.overrides === "object") {
        routes.push(...Object.values(parsed.overrides));
      }
      if (routes.length === 0) {
        setError("Backup файлът не съдържа маршрути за импортиране.");
        return null;
      }
      const invalid = routes.filter((o) => !o || typeof o !== "object" || !o.id || !o.name);
      if (invalid.length > 0) {
        setError(`${invalid.length} обект(а) нямат задължителните полета "id" и "name".`);
        return null;
      }
      setPreview({ total: routes.length, updates: routes.filter((o) => seedIds.has(o.id)).length, additions: 0, arr: routes, isBackup: true, backupData: parsed });
      return routes;
    }
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    const invalid = arr.filter((o) => !o || typeof o !== "object" || !o.id || !o.name);
    if (invalid.length > 0) {
      setError(`${invalid.length} обект(а) нямат задължителните полета "id" и "name".`);
      return null;
    }
    const updates = arr.filter((o) => seedIds.has(o.id)).length;
    const additions = arr.length - updates;
    setPreview({ total: arr.length, updates, additions, arr });
    return arr;
  };

  const handleImportClick = () => {
    const arr = preview?.arr || handleValidate();
    if (!arr) return;
    onImport(arr, (preview as any)?.backupData);
    onClose();
  };

  return (
    <ModalShell title="Импортирай данни (JSON)" icon={Copy} onClose={onClose} wide>
      <div className="space-y-4">
        <p className="text-sm text-stone-500 leading-relaxed">
          Постави JSON масив от маршрути по схемата на ПЛАНИНА (виж <code className="bg-stone-100 px-1 rounded text-xs">planina-schema.md</code>). Маршрути с познато <code className="bg-stone-100 px-1 rounded text-xs">id</code> ще се обновят; нови ще се добавят в раздел „Внесени“.
        </p>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPreview(null); setError(""); }}
          placeholder='[{"id":"vrah-vihren","name":"вр. Вихрен", "distanceKm": 13, ...}]'
          className="w-full h-56 border border-stone-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-emerald-400 resize-none"
        />
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700 flex gap-2">
            <TriangleAlert size={15} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {preview && !error && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
            Открити <strong>{preview.total}</strong> маршрут(а): <strong>{preview.updates}</strong> ще обновят съществуващи, <strong>{preview.additions}</strong> ще се добавят като нови.
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={handleValidate} className="px-4 py-2.5 rounded-lg text-sm font-bold text-stone-600 border border-stone-200 hover:bg-stone-50">
            Провери
          </button>
          <button onClick={handleImportClick} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm">
            Импортирай
          </button>
        </div>
        <div className="border-t border-stone-100 pt-3">
          <button onClick={onExportBackup} className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1.5">
            <ExternalLink size={12} /> Изтегли резервно копие (.json) на всички твои внесени данни и настройки
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
