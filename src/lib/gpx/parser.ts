import type {
  GpxMetadata,
  GpxPoint,
  GpxRoute,
  GpxStats,
  GpxTrack,
  GpxWaypoint,
  ParsedGpx,
} from "./types";
import { computeBounds, elevationStats, trackDistanceKm } from "./utils";

/** Direct child by tag name — avoids picking up same-named descendants (e.g. <trkpt><name>). */
function childText(parent: Element | null, tag: string): string | undefined {
  if (!parent) return undefined;
  for (const child of Array.from(parent.children)) {
    if (child.localName === tag) {
      const text = (child.textContent || "").trim();
      return text || undefined;
    }
  }
  return undefined;
}

function childElement(parent: Element | null, tag: string): Element | null {
  if (!parent) return null;
  for (const child of Array.from(parent.children)) {
    if (child.localName === tag) return child;
  }
  return null;
}

function childrenByTag(parent: Element, tag: string): Element[] {
  return Array.from(parent.children).filter((c) => c.localName === tag);
}

/** Namespace-agnostic lookup — GPX exporters vary between default and prefixed namespaces. */
function findAll(doc: Document, tag: string): Element[] {
  return Array.from(doc.getElementsByTagNameNS("*", tag));
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function parsePoint(el: Element): GpxPoint | null {
  const lat = parseNumber(el.getAttribute("lat") ?? undefined);
  const lon = parseNumber(el.getAttribute("lon") ?? undefined);
  if (lat === undefined || lon === undefined) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return {
    lat,
    lon,
    ele: parseNumber(childText(el, "ele")),
    time: childText(el, "time"),
    name: childText(el, "name"),
    desc: childText(el, "desc"),
  };
}

function parseWaypoint(el: Element): GpxWaypoint | null {
  const point = parsePoint(el);
  if (!point) return null;
  return { ...point, sym: childText(el, "sym"), type: childText(el, "type") };
}

function parseMetadata(doc: Document, root: Element): GpxMetadata {
  const meta = childElement(root, "metadata");
  const author = childElement(meta, "author");
  const link = childElement(meta, "link") || childElement(root, "link");

  // Some exporters (older GPX 1.0) put name/desc directly on <gpx>.
  const firstTrack = findAll(doc, "trk")[0] || null;

  return {
    name: childText(meta, "name") || childText(root, "name") || childText(firstTrack, "name"),
    desc: childText(meta, "desc") || childText(root, "desc") || childText(firstTrack, "desc"),
    authorName: childText(author, "name") || childText(meta, "author") || root.getAttribute("creator") || undefined,
    time: childText(meta, "time") || childText(root, "time"),
    link: link?.getAttribute("href") || childText(meta, "url") || undefined,
  };
}

function computeStats(
  waypoints: GpxWaypoint[],
  tracks: GpxTrack[],
  routes: GpxRoute[]
): GpxStats {
  const pathGroups: GpxPoint[][] = [];
  for (const track of tracks) {
    for (const seg of track.segments) pathGroups.push(seg.points);
  }
  for (const route of routes) pathGroups.push(route.points);

  let totalDistanceKm = 0;
  let totalElevationGainM = 0;
  let totalElevationLossM = 0;
  let pointCount = 0;

  for (const points of pathGroups) {
    totalDistanceKm += trackDistanceKm(points);
    const ele = elevationStats(points);
    totalElevationGainM += ele.gainM;
    totalElevationLossM += ele.lossM;
    pointCount += points.length;
  }

  const allPoints: GpxPoint[] = [...waypoints];
  for (const points of pathGroups) allPoints.push(...points);
  const overallEle = elevationStats(allPoints);

  return {
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalElevationGainM,
    totalElevationLossM,
    minElevationM: overallEle.minM,
    maxElevationM: overallEle.maxM,
    pointCount,
    waypointCount: waypoints.length,
    trackCount: tracks.length,
    bounds: computeBounds(allPoints),
  };
}

export function parseGpx(xmlString: string): ParsedGpx {
  const trimmed = (xmlString || "").trim();
  if (!trimmed) throw new Error("Празен GPX файл — няма съдържание за обработка.");

  const doc = new DOMParser().parseFromString(trimmed, "application/xml");

  if (findAll(doc, "parsererror").length > 0) {
    throw new Error("Невалиден GPX файл — XML структурата не може да бъде прочетена.");
  }

  const root = doc.documentElement;
  if (!root || root.localName !== "gpx") {
    throw new Error("Невалиден GPX файл — липсва основен <gpx> елемент.");
  }

  const waypoints: GpxWaypoint[] = [];
  for (const el of findAll(doc, "wpt")) {
    const wpt = parseWaypoint(el);
    if (wpt) waypoints.push(wpt);
  }

  const tracks: GpxTrack[] = [];
  for (const trkEl of findAll(doc, "trk")) {
    const segments = childrenByTag(trkEl, "trkseg").map((segEl) => ({
      points: childrenByTag(segEl, "trkpt")
        .map(parsePoint)
        .filter((p): p is GpxPoint => p !== null),
    }));
    tracks.push({
      name: childText(trkEl, "name"),
      cmt: childText(trkEl, "cmt"),
      desc: childText(trkEl, "desc"),
      segments,
    });
  }

  const routes: GpxRoute[] = [];
  for (const rteEl of findAll(doc, "rte")) {
    routes.push({
      name: childText(rteEl, "name"),
      points: childrenByTag(rteEl, "rtept")
        .map(parsePoint)
        .filter((p): p is GpxPoint => p !== null),
    });
  }

  if (waypoints.length === 0 && tracks.length === 0 && routes.length === 0) {
    throw new Error("GPX файлът не съдържа точки, следи или маршрути.");
  }

  return {
    metadata: parseMetadata(doc, root),
    waypoints,
    tracks,
    routes,
    stats: computeStats(waypoints, tracks, routes),
  };
}

/** Flatten every track segment and route into a single ordered list of points. */
export function collectTrackPoints(gpx: ParsedGpx): GpxPoint[] {
  const points: GpxPoint[] = [];
  for (const track of gpx.tracks) {
    for (const seg of track.segments) points.push(...seg.points);
  }
  if (points.length === 0) {
    for (const route of gpx.routes) points.push(...route.points);
  }
  return points;
}
