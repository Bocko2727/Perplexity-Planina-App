import { useState } from "react";
import { CircleCheckBig } from "lucide-react";

import { todayISO } from "../../lib/utils";
import { ModalShell } from "../ui/ModalShell";

/* =========================================================================
   CompleteModal — mark a route as hiked, with date + note
   ========================================================================= */
export function CompleteModal({ routeId, existing, onClose, onSave, onRemove }) {
  const [date, setDate] = useState(existing?.date || todayISO());
  const [note, setNote] = useState(existing?.note || "");
  const today = todayISO();

  return (
    <ModalShell title="Маркирай като изминат" icon={CircleCheckBig} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-stone-600 mb-1 block">Дата на похода</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-stone-600 mb-1 block">Бележка (по избор)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Как мина преходът? Условия, впечатления..."
            className="w-full h-24 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { onSave(routeId, { date, note }); onClose(); }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm"
          >
            Запази
          </button>
          {existing && (
            <button
              onClick={() => { onRemove(routeId); onClose(); }}
              className="px-4 py-2.5 rounded-lg text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50"
            >
              Премахни
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
