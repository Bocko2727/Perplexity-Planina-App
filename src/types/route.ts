import type { Hut } from "./hut";
import type { Accommodation, DayPlan, RiskAssessment, Transport } from "./transport";

export type Difficulty = "Лесна" | "Лесен" | "Лесна/Средна" | "Средна" | "Среден" | "Средна/Висока" | "Висока" | "Екстремна";
export type RouteKind = "detailed" | "almanac" | "custom";

export interface DetailedRoute {
  id: string;
  kind: "detailed";
  name: string;
  region: string;
  status: string;
  difficulty: string;
  distanceKm: number | null;
  gainM: number | null;
  lossM: number | null;
  dateStart: string;
  dateEnd: string;
  from: string;
  to: string;
  season: string;
  forecastLink: string;
  busLink: string;
  bdzLink: string;
  avtogariLink: string;
  routeLine: string;
  verificationLevel: string;
  transport: Transport;
  huts: Hut[];
  risk: RiskAssessment | null;
  days: DayPlan[];
  accommodation: Accommodation[];
  taxis: Array<{ name: string; phone: string; note: string }>;
  windyEmbed: string;
  notesDefault: string;
}

export interface AlmanacRoute {
  id: string;
  name: string;
  region: string;
  distanceKm: number;
  gainM: number;
  lossM: number;
  difficulty: string;
  hutName: string;
  hutPhone: string;
  day1: string;
  day2: string;
  back: string;
  verified: boolean;
  suitedFor?: string;
  fridayNight?: string;
  terrain?: string;
  kmNote?: string;
  assessment?: string;
  practicalRank?: number;
}

export interface CustomRoute {
  id: string;
  kind: "custom";
  name: string;
  region: string;
  distanceKm: number | null;
  gainM: number | null;
  difficulty: string;
  transportNote: string;
  risks: string;
  huts: Array<{ name: string; phone: string }>;
  days: Array<{ text: string }>;
}

export interface CompletedInfo {
  date: string;
  note: string;
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  overrides: Record<string, any>;
  importedRoutes: any[];
  customRoutes: CustomRoute[];
  favorites: string[];
  completed: Record<string, CompletedInfo>;
  notes: Record<string, string>;
  gearState: Record<string, Record<string, boolean>>;
  hutVerification: Record<string, boolean>;
}
