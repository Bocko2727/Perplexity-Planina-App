import type { DetailedRoute } from "../../types/route";
import type { GpxMetadata, GpxPoint, GpxTrack, GpxWaypoint, ParsedGpx } from "./types";
import { parseCoordString } from "./utils";

const CREATOR = "ПЛАНИНА";
const INDENT = "  ";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(name: string, value: string | number | undefined | null, depth: number): string[] {
  if (value === undefined || value === null || value === "") return [];
  return [`${INDENT.repeat(depth)}<${name}>${esc(String(value))}</${name}>`];
}

function coord(n: number): string {
  return n.toFixed(6);
}

function pointLines(tagName: string, point: GpxPoint, depth: number): string[] {
  const pad = INDENT.repeat(depth);
  const children = [
    ...tag("ele", typeof point.ele === "number" ? Math.round(point.ele * 10) / 10 : undefined, depth + 1),
    ...tag("time", point.time, depth + 1),
    ...tag("name", point.name, depth + 1),
    ...tag("desc", point.desc, depth + 1),
    ...tag("sym", (point as GpxWaypoint).sym, depth + 1),
    ...tag("type", (point as GpxWaypoint).type, depth + 1),
  ];
  const open = `${pad}<${tagName} lat="${coord(point.lat)}" lon="${coord(point.lon)}">`;
  if (children.length === 0) return [`${open}</${tagName}>`];
  return [open, ...children, `${pad}</${tagName}>`];
}

function metadataLines(metadata: GpxMetadata): string[] {
  const lines = [`${INDENT}<metadata>`];
  lines.push(...tag("name", metadata.name, 2));
  lines.push(...tag("desc", metadata.desc, 2));
  if (metadata.authorName) {
    lines.push(`${INDENT.repeat(2)}<author>`, ...tag("name", metadata.authorName, 3), `${INDENT.repeat(2)}</author>`);
  }
  lines.push(...tag("time", metadata.time || new Date().toISOString(), 2));
  if (metadata.link) lines.push(`${INDENT.repeat(2)}<link href="${esc(metadata.link)}" />`);
  lines.push(`${INDENT}</metadata>`);
  return lines;
}

function trackLines(track: GpxTrack): string[] {
  const lines = [`${INDENT}<trk>`];
  lines.push(...tag("name", track.name, 2));
  lines.push(...tag("cmt", track.cmt, 2));
  lines.push(...tag("desc", track.desc, 2));
  for (const segment of track.segments) {
    lines.push(`${INDENT.repeat(2)}<trkseg>`);
    for (const point of segment.points) lines.push(...pointLines("trkpt", point, 3));
    lines.push(`${INDENT.repeat(2)}</trkseg>`);
  }
  lines.push(`${INDENT}</trk>`);
  return lines;
}

function wrapGpx(body: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<gpx version="1.1" creator="${CREATOR}" xmlns="http://www.topografix.com/GPX/1/1"`,
    '     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
    ...body,
    "</gpx>",
    "",
  ].join("\n");
}

export function buildGpxFromParsed(gpx: ParsedGpx): string {
  const body: string[] = [...metadataLines(gpx.metadata)];
  for (const wpt of gpx.waypoints) body.push(...pointLines("wpt", wpt, 1));
  for (const track of gpx.tracks) body.push(...trackLines(track));
  for (const route of gpx.routes) {
    body.push(`${INDENT}<rte>`);
    body.push(...tag("name", route.name, 2));
    for (const point of route.points) body.push(...pointLines("rtept", point, 2));
    body.push(`${INDENT}</rte>`);
  }
  return wrapGpx(body);
}

/**
 * Waypoints derived from the app's own route data. Huts carry GPS strings like
 * "42.1930, 23.7495"; huts without coordinates are skipped rather than emitted at 0,0,
 * which navigation apps would render off the coast of Africa.
 */
function routeWaypoints(route: DetailedRoute): GpxWaypoint[] {
  const waypoints: GpxWaypoint[] = [];
  for (const hut of route.huts || []) {
    const coords = parseCoordString(hut.gps);
    if (!coords) continue;
    const contact = hut.officialPhone || hut.altPhone || hut.phone;
    const details = [
      hut.beds ? `${hut.beds} места` : null,
      contact ? `тел. ${contact}` : null,
    ].filter(Boolean);
    waypoints.push({
      lat: coords.lat,
      lon: coords.lon,
      ele: typeof hut.elevation === "number" ? hut.elevation : undefined,
      name: hut.name,
      desc: details.length > 0 ? details.join(" · ") : undefined,
      sym: "Lodging",
      type: "hut",
    });
  }
  return waypoints;
}

function routeDescription(route: DetailedRoute): string {
  const parts = [
    route.routeLine,
    route.region ? `Регион: ${route.region}` : null,
    route.difficulty ? `Трудност: ${route.difficulty}` : null,
    route.distanceKm !== null && route.distanceKm !== undefined ? `Дистанция: ${route.distanceKm} км` : null,
    route.gainM !== null && route.gainM !== undefined ? `Изкачване: +${route.gainM} м` : null,
    route.lossM !== null && route.lossM !== undefined ? `Слизане: -${route.lossM} м` : null,
    route.season ? `Сезон: ${route.season}` : null,
    route.from && route.to ? `Начало/край: ${route.from} → ${route.to}` : null,
    route.transport?.summary ? `Транспорт: ${route.transport.summary}` : null,
    (route.huts || []).length > 0 ? `Хижи: ${route.huts.map((h) => h.name).join(", ")}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

/**
 * Export an app route as GPX. When the route has hut coordinates the track connects them
 * in order, giving a usable (if coarse) line; otherwise the file is metadata-only and
 * serves as a template the user can fill in from a mapping tool.
 */
export function buildGpxFromRoute(route: DetailedRoute): string {
  const waypoints = routeWaypoints(route);
  const metadata: GpxMetadata = {
    name: route.name,
    desc: routeDescription(route),
    authorName: CREATOR,
    time: new Date().toISOString(),
    link: route.forecastLink || undefined,
  };

  const track: GpxTrack = {
    name: route.name,
    cmt: route.routeLine || undefined,
    desc: [
      route.dateStart && route.dateEnd ? `Планирани дати: ${route.dateStart} → ${route.dateEnd}` : null,
      route.verificationLevel ? `Верификация: ${route.verificationLevel}` : null,
    ]
      .filter(Boolean)
      .join("\n") || undefined,
    segments: waypoints.length >= 2 ? [{ points: waypoints.map(({ lat, lon, ele, name }) => ({ lat, lon, ele, name })) }] : [],
  };

  const body: string[] = [...metadataLines(metadata)];
  for (const wpt of waypoints) body.push(...pointLines("wpt", wpt, 1));
  body.push(...trackLines(track));
  return wrapGpx(body);
}
