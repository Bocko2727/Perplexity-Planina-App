import type { TripPlan } from "../lib/trip-planner/types";

const STORAGE_KEY = "planana-trips";

export function loadTrips(): TripPlan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(trips: TripPlan[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    /* storage unavailable (private mode / quota) — plan stays in memory only */
  }
}

export function saveTrip(plan: TripPlan): void {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.routeId === plan.routeId && t.startDate === plan.startDate);
  if (idx >= 0) trips[idx] = plan;
  else trips.push(plan);
  persist(trips);
}

export function deleteTrip(routeId: string, startDate: string): void {
  persist(loadTrips().filter((t) => !(t.routeId === routeId && t.startDate === startDate)));
}
