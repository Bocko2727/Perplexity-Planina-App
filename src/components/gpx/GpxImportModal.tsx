import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download, Upload, TriangleAlert, Ruler, TrendingUp, TrendingDown, MapPin,
  Mountain, Save, Check, RotateCcw, Trash2, Route as RouteIcon,
} from "lucide-react";

import type { ParsedGpx, StoredGpxImport } from "../../lib/gpx/types";
import { collectTrackPoints, parseGpx } from "../../lib/gpx/parser";
import { buildGpxFromParsed } from "../../lib/gpx/builder";
import { generateElevationSvg } from "../../lib/gpx/elevation-profile";
import { downloadFile, elevationStats, formatCoord, toFileSlug } from "../../lib/gpx/utils";
import { fmtKm, fmtLoss, fmtM } from "../../lib/utils";
import { deleteGpxImport, loadGpxImports, saveGpxImport } from "../../services/gpxService";
import { ModalShell } from "../ui/ModalShell";
import { StatCard } from "../ui/StatCard";
import { SectionTitle } from "../ui/SectionTitle";

interface GpxImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFILE_WIDTH = 640;
const PROFILE_HEIGHT = 180;

function defaultName(gpx: ParsedGpx, fileName: string): string {
  return (
    gpx.metadata.name ||
    gpx.tracks.find((t) => t.name)?.name ||
    fileName.replace(/\.gpx$/i, "") ||
    "Внесен GPX"
  );
}

export function GpxImportModal({ isOpen, onClose }: GpxImportModalProps) {
  const [parsed, setParsed] = useState<ParsedGpx | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [xmlText, setXmlText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stored, setStored] = useState<StoredGpxImport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setParsed(null);
    setName("");
    setError(null);
    setXmlText("");
    setDragActive(false);
    setSaved(false);
    setStored(loadGpxImports());
  }, [isOpen]);

  const handleXml = useCallback((xml: string, sourceName: string) => {
    try {
      const result = parseGpx(xml);
      setParsed(result);
      setName(defaultName(result, sourceName));
      setError(null);
      setSaved(false);
    } catch (e: any) {
      setParsed(null);
      setError(e?.message || "Файлът не може да бъде обработен.");
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => handleXml(String(reader.result || ""), file.name);
    reader.onerror = () => setError("Файлът не може да бъде прочетен.");
    reader.readAsText(file);
  }, [handleXml]);

  const trackPoints = useMemo(() => (parsed ? collectTrackPoints(parsed) : []), [parsed]);
  const profileSvg = useMemo(
    () => (trackPoints.length > 0 ? generateElevationSvg(trackPoints, PROFILE_WIDTH, PROFILE_HEIGHT) : null),
    [trackPoints]
  );
  // Scoped to the plotted track — standalone waypoints can sit far above the drawn curve.
  const trackElevation = useMemo(() => elevationStats(trackPoints), [trackPoints]);

  const reset = () => {
    setParsed(null);
    setError(null);
    setXmlText("");
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!parsed) return;
    const finalName = name.trim() || "Внесен GPX";
    saveGpxImport(finalName, parsed);
    setStored(loadGpxImports());
    setSaved(true);
  };

  const handleDelete = (importName: string) => {
    deleteGpxImport(importName);
    setStored(loadGpxImports());
  };

  const handleReExport = () => {
    if (!parsed) return;
    const finalName = name.trim() || "planina-gpx";
    downloadFile(`${toFileSlug(finalName)}.gpx`, buildGpxFromParsed(parsed), "application/gpx+xml");
  };

  if (!isOpen) return null;

  const title = parsed ? `GPX преглед: ${name}` : "GPX Импорт";

  return (
    <ModalShell title={title} icon={Download} onClose={onClose} wide>
      {error && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-900 flex gap-2">
            <TriangleAlert size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">Грешка при обработка</div>
              {error}
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800"
          >
            <RotateCcw size={15} /> Опитай отново
          </button>
        </div>
      )}

      {!error && !parsed && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-emerald-500 bg-emerald-50" : "border-emerald-300 bg-stone-50"
            }`}
          >
            <Upload size={28} className="mx-auto text-emerald-600 mb-2" />
            <div className="text-sm font-bold text-stone-700">Пусни GPX файл тук</div>
            <div className="text-xs text-stone-500 mt-1 mb-3">поддържат се следи (trk), маршрути (rte) и точки (wpt)</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800"
            >
              Избери файл
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">
              или постави GPX XML тук
            </label>
            <textarea
              value={xmlText}
              onChange={(e) => setXmlText(e.target.value)}
              placeholder="&lt;?xml version=&quot;1.0&quot;?&gt;&lt;gpx ...&gt;"
              className="w-full h-32 border border-stone-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-emerald-400 resize-none"
            />
            <button
              onClick={() => handleXml(xmlText, "GPX от текст")}
              disabled={!xmlText.trim()}
              className="mt-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              Обработи GPX
            </button>
          </div>

          {stored.length > 0 && (
            <div className="border-t border-stone-200 pt-4">
              <SectionTitle icon={RouteIcon}>Запазени импорти ({stored.length})</SectionTitle>
              <div className="space-y-2">
                {stored.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-stone-800 truncate">{item.name}</div>
                      <div className="text-xs text-stone-500">
                        {fmtKm(item.data.stats.totalDistanceKm)} · {fmtM(item.data.stats.totalElevationGainM)} ·{" "}
                        {new Date(item.savedAt).toLocaleDateString("bg-BG")}
                      </div>
                    </div>
                    <button
                      onClick={() => { setParsed(item.data); setName(item.name); setSaved(true); }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1"
                    >
                      Отвори
                    </button>
                    <button
                      onClick={() => handleDelete(item.name)}
                      aria-label={`Изтрий ${item.name}`}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!error && parsed && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1">Име на маршрута</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
            />
            {parsed.metadata.desc && (
              <p className="text-xs text-stone-500 mt-2 whitespace-pre-line">{parsed.metadata.desc}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Ruler} label="Дистанция" value={fmtKm(parsed.stats.totalDistanceKm)} />
            <StatCard icon={TrendingUp} label="Изкачване" value={fmtM(parsed.stats.totalElevationGainM)} accent="bg-amber-50 text-amber-700" />
            <StatCard icon={TrendingDown} label="Слизане" value={parsed.stats.totalElevationLossM === 0 ? "0 м" : fmtLoss(parsed.stats.totalElevationLossM)} accent="bg-sky-50 text-sky-700" />
            <StatCard icon={MapPin} label="Точки" value={`${parsed.stats.pointCount}`} accent="bg-stone-100 text-stone-600" />
          </div>

          <div className="bg-stone-50 rounded-lg p-4">
            <SectionTitle icon={Mountain}>Профил на височината</SectionTitle>
            {profileSvg ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: profileSvg }} />
            ) : (
              <p className="text-sm text-stone-400 italic">Няма точки от следа — GPX файлът съдържа само отделни точки.</p>
            )}
            <div className="text-xs text-stone-500 mt-2">
              {trackElevation.minM !== null && trackElevation.maxM !== null
                ? `Мин. ${Math.round(trackElevation.minM)} м · Макс. ${Math.round(trackElevation.maxM)} м`
                : "Няма данни за височина."}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <SectionTitle icon={RouteIcon}>Следи и маршрути</SectionTitle>
            {parsed.tracks.length === 0 && parsed.routes.length === 0 && (
              <p className="text-sm text-stone-400 italic">Няма следи или маршрути.</p>
            )}
            <div className="space-y-2">
              {parsed.tracks.map((track, i) => {
                const points = track.segments.reduce((sum, s) => sum + s.points.length, 0);
                return (
                  <div key={`trk-${i}`} className="text-sm text-stone-700">
                    <span className="font-semibold">{track.name || `Следа ${i + 1}`}</span>
                    <span className="text-stone-500"> · {track.segments.length} сегм. · {points} точки</span>
                  </div>
                );
              })}
              {parsed.routes.map((route, i) => (
                <div key={`rte-${i}`} className="text-sm text-stone-700">
                  <span className="font-semibold">{route.name || `Маршрут ${i + 1}`}</span>
                  <span className="text-stone-500"> · {route.points.length} точки</span>
                </div>
              ))}
            </div>
            {parsed.stats.bounds && (
              <div className="text-xs text-stone-400 mt-3">
                Обхват: {parsed.stats.bounds.minLat.toFixed(4)}–{parsed.stats.bounds.maxLat.toFixed(4)}° с.ш.,{" "}
                {parsed.stats.bounds.minLon.toFixed(4)}–{parsed.stats.bounds.maxLon.toFixed(4)}° и.д.
              </div>
            )}
          </div>

          {parsed.waypoints.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <SectionTitle icon={MapPin}>Точки ({parsed.waypoints.length})</SectionTitle>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {parsed.waypoints.map((wpt, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm border-b border-stone-100 last:border-0 pb-1.5">
                    <MapPin size={13} className="text-emerald-600 shrink-0 mt-1" />
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-800 truncate">{wpt.name || `Точка ${i + 1}`}</div>
                      <div className="text-xs text-stone-500">
                        {formatCoord(wpt.lat, wpt.lon)}
                        {typeof wpt.ele === "number" ? ` · ${Math.round(wpt.ele)} м н.в.` : ""}
                      </div>
                      {wpt.desc && <div className="text-xs text-stone-400">{wpt.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800"
            >
              {saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Запазено" : "Запази"}
            </button>
            <button
              onClick={handleReExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-700"
            >
              <Download size={15} /> Изтегли GPX
            </button>
            <button onClick={reset} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700">
              <RotateCcw size={14} /> Друг файл
            </button>
            <button onClick={onClose} className="ml-auto px-4 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700">
              Затвори
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
