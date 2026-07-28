export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  routeRefs?: string[];
  timestamp: number;
}

export type Intent =
  | "recommend_beginner"
  | "recommend_weekend"
  | "gear_advice"
  | "season_match"
  | "plan_days"
  | "region_filter"
  | "difficulty_filter"
  | "transport_filter"
  | "short_route"
  | "hut_route"
  | "general_info"
  | "unknown";

export interface ParsedQuery {
  intent: Intent;
  difficulty?: string;
  region?: string;
  days?: number;
  season?: string;
  transport?: string;
  maxDistance?: number;
  routeId?: string;
}

export interface RouteMatch {
  route: any;
  score: number;
  reasons: string[];
}
