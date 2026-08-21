import { apiClient, getStoredToken } from "../../services/apiClient";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface AIResponse<T = any> {
  request_id: string;
  conversation_id: string;
  feature: string;
  message: string;
  data: T;
  actions: Record<string, any>[];
  sources: string[];
  warnings: string[];
  confidence: ConfidenceLevel;
  mock: boolean;
}

export interface TravelContext {
  user_id: string;
  role: string;
  session_id?: string;
  active_trip_id?: string;
  location_context?: string;
  preferred_language?: string;
  preferences?: Record<string, any>;
  recent_searches?: string[];
}

export interface ActionConfirmationRequest {
  request_id: string;
  action_id: string;
  user_id: string;
  explicit_consent: boolean;
}

export interface ChatRequest {
  message: string;
  context: TravelContext;
  conversation_id?: string;
}

export interface CopilotChatRequest {
  message: string;
  agent_id: string;
  conversation_id?: string;
}

// Map the functions directly to the endpoints in ai_actions.py and copilot_actions.py

export const aiAPI = {
  // Core Orchestrator
  chat: async (payload: ChatRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/chat", payload);
    return data;
  },

  streamChat: async (payload: ChatRequest, callbacks: {
    onStatus?: (msg: string) => void;
    onToken?: (token: string) => void;
    onWarning?: (msg: string) => void;
    onError?: (err: string) => void;
    onDone?: (data: AIResponse) => void;
  }, signal?: AbortSignal): Promise<void> => {
    // Note: To pass JWT we must use fetch manually, as standard EventSource doesn't support POST + Auth
    const token = getStoredToken();
    try {
      const response = await fetch("/api/v1/ai/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        throw new Error(`Stream connection failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported by browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE lines end with \n\n
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          
          if (chunk.startsWith("data: ")) {
            const dataStr = chunk.slice(6);
            if (dataStr === "[DONE]") {
               break;
            }
            try {
              const event = JSON.parse(dataStr);
              switch(event.event) {
                case "status":
                  callbacks.onStatus?.(event.content);
                  break;
                case "token":
                  callbacks.onToken?.(event.content);
                  break;
                case "warning":
                  callbacks.onWarning?.(event.content);
                  break;
                case "error":
                  callbacks.onError?.(event.content);
                  break;
                case "done":
                  callbacks.onDone?.(event.data as AIResponse);
                  break;
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e, dataStr);
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.log("Stream aborted by user.");
      } else {
        callbacks.onError?.(e.message || "Stream failed");
      }
    }
  },

  confirmAction: async (payload: ActionConfirmationRequest): Promise<Record<string, any>> => {
    const { data } = await apiClient.post("/api/v1/ai/confirm-action", payload);
    return data;
  },

  // Planning & Optimization
  planTrip: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/plan-trip", payload);
    return data;
  },

  optimizeItinerary: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/optimize-itinerary", payload);
    return data;
  },

  optimizeBudget: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/optimize-budget", payload);
    return data;
  },

  // Discovery & Context
  recommend: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/recommend", payload);
    return data;
  },

  compare: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/compare", payload);
    return data;
  },

  explain: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/explain", payload);
    return data;
  },

  destination: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/destination", payload);
    return data;
  },

  // Utilities
  packingList: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/packing-list", payload);
    return data;
  },

  support: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/support", payload);
    return data;
  },

  travelPulse: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/travel-pulse", payload);
    return data;
  },

  // Agent Portal
  personalize: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/personalize", payload);
    return data;
  },

  createPackage: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/create-package", payload);
    return data;
  },

  validatePackage: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/validate-package", payload);
    return data;
  },

  generateQuote: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/generate-quote", payload);
    return data;
  },

  customerMessage: async (payload: any): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/customer-message", payload);
    return data;
  },

  // Copilot API
  copilotChat: async (payload: CopilotChatRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/copilot/chat", payload);
    return data;
  },

  getCopilotAlerts: async (agentId: string): Promise<AIResponse> => {
    const { data } = await apiClient.get<AIResponse>(`/api/v1/copilot/alerts?agent_id=${agentId}`);
    return data;
  }
};

// Backward compatibility types for the frontend components
export interface GenerateTripPlanParams {
  destination: string;
  daysCount?: number;
  dates?: any;
  budget?: string | number;
  travelers?: any;
  interests?: any;
  aiAction?: string;
  baseTrip?: any;
}

export type TripContextData = any;
export type ChatParams = any;
export type RecommendParams = any;
export type ExplainParams = any;
export type OptimizeParams = any;
export type ReduceCostParams = any;
export type PersonalizeParams = any;
export type PackingListParams = any;
export type SupportParams = any;
export type CompareParams = any;
export type AIRequestOptions = any;

export type ChatResponse = AIResponse;
export type PlanTripResponse = AIResponse;
export type RecommendResponse = AIResponse;
export type ExplainResponse = AIResponse;
export type OptimizeResponse = AIResponse;
export type ReduceCostResponse = AIResponse;
export type PersonalizeResponse = AIResponse;
export type PackingListResponse = AIResponse;
export type SupportResponse = AIResponse;
export type CompareResponse = AIResponse;

// Aliases for useTravelAI.ts compatibility
(aiAPI as any).optimize = aiAPI.optimizeItinerary;
(aiAPI as any).reduceCost = aiAPI.optimizeBudget;

// Fallback types for TS errors
export type TripContextData = any;
export type ChatResponse = any;
export type PlanTripResponse = any;
export type RecommendResponse = any;
export type ExplainResponse = any;
export type OptimizeResponse = any;
export type ReduceCostResponse = any;
export type PersonalizeResponse = any;
export type PackingListResponse = any;
export type SupportResponse = any;
export type CompareResponse = any;
export type GenerateTripPlanParams = any;

