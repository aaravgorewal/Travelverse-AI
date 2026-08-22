import { aiAPI } from "../../lib/api/ai";

export interface TripContextData {
  destination: string;
  dates: { start: string; end: string };
  travelers: { adults: number; children: number };
  budget: string;
  preferences: string[];
  bookings: { id: string; type: string; title: string; status: string; date: string; amount: number }[];
  currentLocation: string;
  tripStage: string;
}

export interface GenerateTripPlanParams {
  destination: string;
  durationDays?: number;
  daysCount?: number;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: string | number;
  budgetLevel?: string;
  travelStyles?: string[];
  interests?: string[];
  specialRequirements?: string;
  aiAction?: string;
  baseTrip?: any;
}

export interface AIChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  contextSnapshot?: Partial<TripContextData>;
}

export interface AIChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIChatMessageItem[];
  tripContext: TripContextData;
  isPinned?: boolean;
}

export const DEFAULT_SUGGESTED_PROMPTS = [
  "Plan my trip",
  "Find cheaper hotels",
  "Optimize my itinerary",
  "What's best for my family?",
  "What should I book first?",
  "Explain my options",
];

export const INITIAL_TRIP_CONTEXT: TripContextData = {
  destination: "Kyoto & Tokyo, Japan",
  dates: {
    start: "2026-09-12",
    end: "2026-09-19",
  },
  travelers: {
    adults: 2,
    children: 0,
  },
  budget: "$5,500",
  preferences: [
    "Michelin Dining",
    "Historic Temples",
    "Onsen Spas",
    "Bullet Trains",
    "Luxury 5★",
  ],
  bookings: [
    {
      id: "bkg-fl-101",
      type: "flight",
      title: "Japan Airlines JL005 (SFO ➔ HND)",
      status: "Confirmed",
      date: "2026-09-12",
      amount: 1450,
    },
    {
      id: "bkg-ht-202",
      type: "hotel",
      title: "Aman Kyoto Forest Villa Suite",
      status: "Reserved",
      date: "2026-09-12",
      amount: 2100,
    },
  ],
  currentLocation: "San Francisco, CA (SFO)",
  tripStage: "Planning",
};
