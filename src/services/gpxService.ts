import type { ParsedGpx, StoredGpxImport } from "../lib/gpx/types";

const STORAGE_KEY = "planana-gpx-imports";

export function loadGpxImports(): StoredGpxImport[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(imports: StoredGpxImport[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
  } catch {
    /* storage unavailable (private mode / quota) — import stays in memory only */
  }
}

export function saveGpxImport(name: string, data: ParsedGpx): void {
  const imports = loadGpxImports();
  const entry: StoredGpxImport = { name, data, savedAt: Date.now() };
  const idx = imports.findIndex((i) => i.name === name);
  if (idx >= 0) imports[idx] = entry;
  else imports.push(entry);
  persist(imports);
}

export function deleteGpxImport(name: string): void {
  persist(loadGpxImports().filter((i) => i.name !== name));
}
