import { Shield, Siren } from "lucide-react";

import { EMERGENCY } from "../../data/constants";
import { ModalShell } from "../ui/ModalShell";
import { SectionTitle } from "../ui/SectionTitle";

/* =========================================================================
   EmergencyModal
   ========================================================================= */
export function EmergencyModal({ onClose }) {
  return (
    <ModalShell title="Спешни контакти в планината" icon={Siren} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`tel:${EMERGENCY.national}`} className="flex-1 flex items-center justify-between bg-white rounded-lg border border-rose-100 p-3">
              <span className="font-bold text-rose-700 text-sm">Национален номер за спешни случаи</span>
              <span className="bg-rose-600 text-white px-3 py-1 rounded text-sm font-bold">{EMERGENCY.national}</span>
            </a>
            <a href={`tel:${EMERGENCY.pss}`} className="flex-1 flex items-center justify-between bg-white rounded-lg border border-rose-100 p-3">
              <span className="font-bold text-rose-700 text-sm">Планинска спасителна служба (ПСС)</span>
              <span className="bg-rose-600 text-white px-3 py-1 rounded text-sm font-bold">{EMERGENCY.pss}</span>
            </a>
          </div>
          <div className="text-xs text-rose-700/70 mt-2">Резервен номер на ПСС: {EMERGENCY.pssAlt}</div>
        </div>
        <div>
          <SectionTitle icon={Shield}>Процедура при инцидент</SectionTitle>
          <ol className="space-y-2">
            {EMERGENCY.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-stone-700">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ModalShell>
  );
}
