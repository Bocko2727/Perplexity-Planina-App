export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
  name?: string;
  desc?: string;
}

export interface GpxWaypoint extends GpxPoint {
  sym?: string;
  type?: string;
}

export interface GpxTrackSegment {
  points: GpxPoint[];
}

export interface GpxTrack {
  name?: string;
  cmt?: string;
  desc?: string;
  segments: GpxTrackSegment[];
}

export interface GpxRoute {
  name?: string;
  points: GpxPoint[];
}

export interface GpxMetadata {
  name?: string;
  desc?: string;
  authorName?: string;
  time?: string;
  link?: string;
}

export interface GpxBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface GpxStats {
  totalDistanceKm: number;
  totalElevationGainM: number;
  totalElevationLossM: number;
  minElevationM: number | null;
  maxElevationM: number | null;
  pointCount: number;
  waypointCount: number;
  trackCount: number;
  bounds: GpxBounds | null;
}

export interface ParsedGpx {
  metadata: GpxMetadata;
  waypoints: GpxWaypoint[];
  tracks: GpxTrack[];
  routes: GpxRoute[];
  stats: GpxStats;
}

export interface StoredGpxImport {
  name: string;
  data: ParsedGpx;
  savedAt: number;
}
