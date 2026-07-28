import { useState } from "react";
import { Plus, X } from "lucide-react";

import { ModalShell } from "../ui/ModalShell";

/* =========================================================================
   AddForm — Blueprint Generator за нови маршрути
   ========================================================================= */
export function AddForm({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [gainM, setGainM] = useState("");
  const [difficulty, setDifficulty] = useState("Средна");
  const [transportNote, setTransportNote] = useState("");
  const [risks, setRisks] = useState("");
  const [huts, setHuts] = useState([{ name: "", phone: "" }]);
  const [days, setDays] = useState([{ text: "" }]);

  const addHut = () => setHuts((h) => [...h, { name: "", phone: "" }]);
  const removeHut = (i) => setHuts((h) => h.filter((_, idx) => idx !== i));
  const updateHut = (i, field, val) => setHuts((h) => h.map((hh, idx) => (idx === i ? { ...hh, [field]: val } : hh)));

  const addDay = () => setDays((d) => [...d, { text: "" }]);
  const removeDay = (i) => setDays((d) => d.filter((_, idx) => idx !== i));
  const updateDay = (i, val) => setDays((d) => d.map((dd, idx) => (idx === i ? { text: val } : dd)));

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const id = `custom-${Date.now()}`;
    onSave({
      id,
      kind: "custom",
      name: name.trim(),
      region: region.trim(),
      distanceKm: distanceKm ? Number(distanceKm) : null,
      gainM: gainM ? Number(gainM) : null,
      difficulty,
      transportNote: transportNote.trim(),
      risks: risks.trim(),
      huts: huts.filter((h) => h.name.trim()),
      days: days.filter((d) => d.text.trim()),
    });
    onClose();
  };

  return (
    <ModalShell title="Добави нов маршрут" icon={Plus} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-stone-600 mb-1 block">Име на маршрута *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="напр. вр. Черни връх - панорама" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1 block">Регион / планина</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="напр. Витоша" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1 block">Трудност</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 bg-white">
              {["Лесна", "Средна", "Средна/Висока", "Висока", "Екстремна"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1 block">Дистанция (км)</label>
            <input type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="напр. 14" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1 block">Изкачване (м)</label>
            <input type="number" value={gainM} onChange={(e) => setGainM(e.target.value)} placeholder="напр. 800" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 mb-1 block">Транспорт</label>
          <textarea value={transportNote} onChange={(e) => setTransportNote(e.target.value)} placeholder="Как се стига до началото на маршрута..." className="w-full h-20 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-600">Хижи / контакти</label>
            <button onClick={addHut} className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Plus size={12} /> Добави</button>
          </div>
          <div className="space-y-2">
            {huts.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input value={h.name} onChange={(e) => updateHut(i, "name", e.target.value)} placeholder="Име на хижа" className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                <input value={h.phone} onChange={(e) => updateHut(i, "phone", e.target.value)} placeholder="Телефон" className="w-36 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                {huts.length > 1 && <button onClick={() => removeHut(i)} className="text-stone-400 hover:text-rose-500"><X size={16} /></button>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-600">Дни</label>
            <button onClick={addDay} className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Plus size={12} /> Добави ден</button>
          </div>
          <div className="space-y-2">
            {days.map((d, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-14 shrink-0 text-xs font-bold text-stone-400 pt-2">Ден {i + 1}</span>
                <input value={d.text} onChange={(e) => updateDay(i, e.target.value)} placeholder="Описание на деня..." className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                {days.length > 1 && <button onClick={() => removeDay(i)} className="text-stone-400 hover:text-rose-500"><X size={16} /></button>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 mb-1 block">Рискове / особености</label>
          <textarea value={risks} onChange={(e) => setRisks(e.target.value)} placeholder="Опасни участъци, сезонни условия..." className="w-full h-20 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            Запази маршрута
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-bold text-stone-500 border border-stone-200 hover:bg-stone-50">
            Отказ
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
