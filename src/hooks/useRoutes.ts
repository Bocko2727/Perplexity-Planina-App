import { useEffect, useState } from "react";
import type { AlmanacRoute, DetailedRoute } from "../types";
import { ALMANAC, DETAILED_ROUTES } from "../data/routes";
import { fetchRoutes } from "../services/routeService";
import { fetchAlmanacRoutes } from "../services/almanacService";

const LOCAL_DETAILED = DETAILED_ROUTES as DetailedRoute[];
const LOCAL_ALMANAC = Object.values(ALMANAC).flat() as AlmanacRoute[];

export function useDetailedRoutes() {
  // Seeded with the bundled data so the app renders immediately and survives an unreachable Supabase.
  const [routes, setRoutes] = useState<DetailedRoute[]>(LOCAL_DETAILED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRoutes();
        if (cancelled) return;
        if (data.length) setRoutes(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setRoutes(LOCAL_DETAILED);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { routes, loading, error };
}

export function useAlmanacRoutes() {
  const [routes, setRoutes] = useState<AlmanacRoute[]>(LOCAL_ALMANAC);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAlmanacRoutes();
        if (cancelled) return;
        if (data.length) setRoutes(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setRoutes(LOCAL_ALMANAC);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { routes, loading, error };
}
