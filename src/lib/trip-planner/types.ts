export interface TripInput {
  routeId: string;
  startDate: string;       // ISO date (YYYY-MM-DD)
  groupSize: number;
  departureTime: string;   // HH:mm
  returnTime: string;      // HH:mm
  notes?: string;
}

export interface TripDay {
  dayNumber: number;
  date: string;            // formatted date
  title: string;
  description: string;
  distanceKm: number;
  gainM: number;
  accommodation: {
    name: string;
    phone?: string;
    type: "hut" | "shelter" | "camp" | "none";
  } | null;
}

export interface TransportLeg {
  method: string;          // "влак", "автобус", "кола", "пеша"
  from: string;
  to: string;
  duration?: string;
  notes?: string;
}

export interface TripPlan {
  routeId: string;
  routeName: string;
  region: string;
  difficulty: string;
  startDate: string;
  groupSize: number;
  totalDistanceKm: number;
  totalGainM: number;
  totalLossM: number;
  transportOutward: TransportLeg[];
  transportReturn: TransportLeg[];
  dailyPlan: TripDay[];
  gearList: string[];
  emergencyPhones: string[];
  notes: string;
  createdAt: number;
}
