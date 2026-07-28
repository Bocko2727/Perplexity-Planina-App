import { supabase } from "../lib/supabase";
import type { DetailedRoute } from "../types";

function toDetailedRoute(row: any): DetailedRoute {
  return {
    id: row.id,
    kind: "detailed",
    name: row.name,
    region: row.region,
    status: row.status,
    difficulty: row.difficulty,
    distanceKm: row.distance_km,
    gainM: row.gain_m,
    lossM: row.loss_m,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    from: row.from_point,
    to: row.to_point,
    season: row.season,
    forecastLink: row.forecast_link,
    busLink: row.bus_link,
    bdzLink: row.bdz_link,
    avtogariLink: row.avtogari_link,
    routeLine: row.route_line,
    verificationLevel: row.verification_level,
    transport: row.transport,
    huts: row.huts,
    risk: row.risk,
    days: row.days,
    accommodation: row.accommodation,
    taxis: row.taxis,
    windyEmbed: row.windy_embed,
    notesDefault: row.notes_default,
  };
}

export async function fetchRoutes(): Promise<DetailedRoute[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(toDetailedRoute);
}
