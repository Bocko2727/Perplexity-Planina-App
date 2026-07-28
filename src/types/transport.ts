export interface RiskAssessment {
  level: string;
  color: "emerald" | "amber" | "rose";
  points: string[];
  conclusion?: string;
}

export interface TransportStep {
  from: string;
  to: string;
  mode: string;
  time: string;
  note: string;
}

export interface Transport {
  summary?: string;
  car?: { available: boolean; text: string; parkingNote?: string };
  public?: { steps: TransportStep[] };
  taxis?: Array<{ name: string; phone: string; note: string }>;
}

export interface DayPlan {
  date: string;
  label: string;
  type: string;
  distance: string;
  gain: string;
  time: string;
  stay: string;
  difficulty: string;
}

export interface Accommodation {
  name: string;
  location: string;
  rating: string | null;
  price: string | null;
  note: string;
}
