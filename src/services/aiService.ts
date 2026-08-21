import { apiClient } from "./apiClient";
import { TripPlan } from "../types";
import { AxiosRequestConfig } from "axios";

export interface AIRequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

// 1. Chat
export interface TripContextData {
  destination: string;
  dates: { start: string; end: string } | string;
  travelers: number | { adults: number; children: number };
  budget: string | number;
  preferences: string[];
  bookings?: {
    id: string;
    type: string;
    title: string;
    status: string;
    date?: string;
    amount?: number;
  }[];
  currentLocation: string;
  tripStage: "Dreaming" | "Planning" | "Booked" | "In-Trip" | "Post-Trip";
}

export interface ChatParams {
  message: string;
  conversationHistory?: { role: "user" | "assistant"; content: string; timestamp?: string }[];
  tripContext?: TripContextData;
  agentPersona?: string;
  language?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  suggestedPrompts: string[];
  tripContextEcho?: TripContextData;
  timestamp?: string;
}

// Backwards compatibility alias
export type WorkspaceChatParams = ChatParams;
export type WorkspaceChatResponse = ChatResponse;

// 2. Plan Trip
export interface GenerateTripPlanParams {
  destination: string;
  daysCount?: number;
  durationDays?: number;
  dates?: { start: string; end: string } | string;
  startDate?: string;
  endDate?: string;
  budget?: "economy" | "moderate" | "luxury" | "ultra-luxury" | string | number;
  budgetLevel?: string;
  travelStyle?: string[] | string;
  travelers?: number | { adults: number; children?: number; infants?: number };
  travelersCount?: number;
  interests?: string | string[];
  dietary?: string;
  specialRequirements?: string;
  aiAction?:
    | "optimize"
    | "reduce_cost"
    | "make_premium"
    | "add_activities"
    | "slow_down"
    | "family_friendly"
    | string;
  baseTrip?: TripPlan;
}

export interface PlanTripResponse {
  success: boolean;
  trip: TripPlan;
  aiSummary: string;
  timestamp?: string;
}

// 3. Recommend
export interface RecommendParams {
  destination: string;
  category?: "hotels" | "flights" | "experiences" | "dining" | "all" | string;
  preferences?: string[];
  budget?: string;
  travelers?: number;
  style?: string;
  dates?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  price: string | number;
  matchScore: number;
  aiRationale: string;
  highlights: string[];
  imageUrl: string;
  badge?: string;
}

export interface RecommendResponse {
  success: boolean;
  destination: string;
  summary: string;
  matchHighlights: string[];
  recommendations: RecommendationItem[];
  timestamp?: string;
}

// 4. Explain
export interface ExplainParams {
  topic: string;
  context?: string;
  itemDetails?: any;
  comparisonTargets?: any;
  userQuestion?: string;
}

export interface ExplainResponse {
  success: boolean;
  topic: string;
  explanation: string;
  pros: string[];
  cons: string[];
  verdict: string;
  keyTakeaways: string[];
  timestamp?: string;
}

// 5. Optimize
export interface OptimizeParams {
  tripId?: string;
  destination?: string;
  currentDays?: any[];
  activities?: any[];
  travelStyle?: string;
  preferences?: string[];
  constraints?: string;
}

export interface OptimizeResponse {
  success: boolean;
  tripId?: string;
  timeSavedMinutes: number;
  carbonSavedKg: number;
  estimatedCommuteEfficiency: string;
  optimizationInsights: string[];
  optimizedDays: any[];
  timestamp?: string;
}

// 6. Reduce Cost
export interface ReduceCostParams {
  destination: string;
  currentBudget?: string | number;
  targetBudget?: string | number;
  currentBookings?: any[];
  dates?: string;
  flexibleDays?: number;
  preferences?: string[];
}

export interface SavingOpportunity {
  category: string;
  action: string;
  savingsAmount: string;
  tradeoff: string;
  confidence: string;
}

export interface ReduceCostResponse {
  success: boolean;
  destination: string;
  totalPotentialSavings: string | number;
  strategySummary: string;
  savingOpportunities: SavingOpportunity[];
  dateShiftAlternatives: {
    dateRange: string;
    priceDelta: string;
    advantage: string;
  }[];
  timestamp?: string;
}

// 7. Personalize
export interface PersonalizeParams {
  userProfile?: any;
  travelPreferences?: any;
  pastTrips?: any[];
  currentContext?: any;
  destination?: string;
}

export interface PersonalizeResponse {
  success: boolean;
  destination?: string;
  travelerArchetype: string;
  personalizedAdvice: string;
  tailoredHighlights: {
    title: string;
    reason: string;
    matchScore: number;
  }[];
  lifestyleMatches: string[];
  timestamp?: string;
}

// 8. Packing List
export interface PackingListParams {
  destination: string;
  durationDays?: number;
  season?: string;
  weatherForecast?: { temp: number; condition: string };
  activities?: string[];
  travelers?: number;
  specialNeeds?: string[];
}

export interface PackingCategory {
  category: string;
  items: {
    id: string;
    name: string;
    essential: boolean;
    tip?: string;
  }[];
}

export interface PackingListResponse {
  success: boolean;
  destination: string;
  weatherAdvisory: string;
  baggageAdvice: string;
  packingList: PackingCategory[];
  timestamp?: string;
}

// 9. Support
export interface SupportParams {
  issueType: "flight_delay" | "cancellation" | "lost_baggage" | "hotel_issue" | "emergency" | "general" | string;
  issueDescription: string;
  bookingReference?: string;
  userLocation?: string;
  urgency?: "high" | "medium" | "low" | string;
}

export interface SupportResponse {
  success: boolean;
  bookingReference?: string;
  urgencyLevel: string;
  immediateActionSteps: string[];
  passengerRightsGuide: string;
  resolutionScript: string;
  contactDirectory: {
    name: string;
    phone: string;
    channel: string;
  }[];
  timestamp?: string;
}

// 10. Compare
export interface CompareParams {
  itemType?: "hotels" | "flights" | "destinations" | "packages" | string;
  itemsToCompare: any[];
  criteria?: string[];
  userPriorities?: string[];
}

export interface ComparisonMatrixRow {
  dimension: string;
  scores: Record<string, string>;
  verdict: string;
}

export interface CompareResponse {
  success: boolean;
  itemType?: string;
  winnerId: string;
  verdictSummary: string;
  valueAnalysis: string;
  comparisonMatrix: ComparisonMatrixRow[];
  dimensionRatings: Record<string, any>;
  timestamp?: string;
}

// Concierge Compatibility Params
export interface ConciergeChatParams {
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  agentPersona?: string;
  destinationContext?: string;
  language?: string;
}

export const aiService = {
  // 1. Chat
  async chat(params: ChatParams, options?: AIRequestOptions): Promise<ChatResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/chat", params, config);
    return res as unknown as ChatResponse;
  },

  // 2. Plan Trip
  async planTrip(params: GenerateTripPlanParams, options?: AIRequestOptions): Promise<PlanTripResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/plan-trip", params, config);
    return res as unknown as PlanTripResponse;
  },

  // 3. Recommend
  async recommend(params: RecommendParams, options?: AIRequestOptions): Promise<RecommendResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/recommend", params, config);
    return res as unknown as RecommendResponse;
  },

  // 4. Explain
  async explain(params: ExplainParams, options?: AIRequestOptions): Promise<ExplainResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/explain", params, config);
    return res as unknown as ExplainResponse;
  },

  // 5. Optimize
  async optimize(params: OptimizeParams, options?: AIRequestOptions): Promise<OptimizeResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/optimize", params, config);
    return res as unknown as OptimizeResponse;
  },

  // 6. Reduce Cost
  async reduceCost(params: ReduceCostParams, options?: AIRequestOptions): Promise<ReduceCostResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/reduce-cost", params, config);
    return res as unknown as ReduceCostResponse;
  },

  // 7. Personalize
  async personalize(params: PersonalizeParams, options?: AIRequestOptions): Promise<PersonalizeResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/personalize", params, config);
    return res as unknown as PersonalizeResponse;
  },

  // 8. Packing List
  async packingList(params: PackingListParams, options?: AIRequestOptions): Promise<PackingListResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/packing-list", params, config);
    return res as unknown as PackingListResponse;
  },

  // 9. Support
  async support(params: SupportParams, options?: AIRequestOptions): Promise<SupportResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/support", params, config);
    return res as unknown as SupportResponse;
  },

  // 10. Compare
  async compare(params: CompareParams, options?: AIRequestOptions): Promise<CompareResponse> {
    const config: AxiosRequestConfig = {
      signal: options?.signal,
      timeout: options?.timeout,
    };
    const res = await apiClient.post("/v1/ai/compare", params, config);
    return res as unknown as CompareResponse;
  },

  // Backward compatibility methods
  async chatWorkspace(params: WorkspaceChatParams, options?: AIRequestOptions): Promise<WorkspaceChatResponse> {
    return this.chat(params, options);
  },

  async generateAITrip(params: GenerateTripPlanParams, options?: AIRequestOptions): Promise<TripPlan> {
    const res = await this.planTrip(params, options);
    return res.trip;
  },

  async chatWithConcierge(params: ConciergeChatParams, options?: AIRequestOptions): Promise<{ reply: string; suggestedActions?: string[] }> {
    const chatRes = await this.chat({
      message: params.message,
      conversationHistory: params.conversationHistory,
      agentPersona: params.agentPersona || "Master Concierge",
      language: params.language,
    }, options);
    return {
      reply: chatRes.reply,
      suggestedActions: chatRes.suggestedPrompts,
    };
  },

  async optimizeItinerary(tripId: string, currentDays: any[], options?: AIRequestOptions): Promise<{ optimizedDays: any[]; timeSavedMinutes: number; carbonSavedKg: number }> {
    const res = await this.optimize({ tripId, currentDays }, options);
    return {
      optimizedDays: res.optimizedDays,
      timeSavedMinutes: res.timeSavedMinutes,
      carbonSavedKg: res.carbonSavedKg,
    };
  },

  async analyzeVisaRequirements(passportCountry: string, destinationCountry: string, options?: AIRequestOptions): Promise<{
    visaRequired: boolean;
    visaType: string;
    processingTimeDays: number;
    feeUsd: number;
    requiredDocs: string[];
    advisories: string[];
  }> {
    // Stubbed because backend doesn't have /ai/visa-check
    return new Promise((resolve) => setTimeout(() => resolve({
      visaRequired: true,
      visaType: "eVisa / Tourist",
      processingTimeDays: 3,
      feeUsd: 50,
      requiredDocs: ["Valid Passport (6 months)", "Return Ticket", "Proof of Accommodation"],
      advisories: ["Apply at least 1 week before departure.", "Ensure no previous visa violations."]
    }), 1500));
  },

  async generateVRNarration(sceneId: string, sceneTitle: string, destination: string, options?: AIRequestOptions): Promise<{ audioScript: string; voiceActor: string }> {
    // Stubbed because backend doesn't have /ai/vr-narration
    return new Promise((resolve) => setTimeout(() => resolve({
      audioScript: `Welcome to ${sceneTitle}. You are currently gazing across pristine views of ${destination}. Notice the extraordinary light reflections and natural architectural harmony. Enjoy this immersive preview of your next great journey.`,
      voiceActor: "en-US-Journey-F"
    }), 2000));
  },
};

export default aiService;
