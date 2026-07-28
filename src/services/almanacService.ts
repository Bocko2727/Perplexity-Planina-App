import { supabase } from "../lib/supabase";
import type { AlmanacRoute } from "../types";

function toAlmanacRoute(row: any): AlmanacRoute {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    distanceKm: row.distance_km,
    gainM: row.gain_m,
    lossM: row.loss_m,
    difficulty: row.difficulty,
    hutName: row.hut_name,
    hutPhone: row.hut_phone,
    day1: row.day1,
    day2: row.day2,
    back: row.back,
    verified: row.verified,
    suitedFor: row.suited_for,
    fridayNight: row.friday_night,
    terrain: row.terrain,
    kmNote: row.km_note,
    assessment: row.assessment,
    practicalRank: row.practical_rank,
  };
}

export async function fetchAlmanacRoutes(): Promise<AlmanacRoute[]> {
  const { data, error } = await supabase
    .from("almanac_routes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(toAlmanacRoute);
}
