import { apiClient, getStoredToken } from "../../services/apiClient";


export interface OptimizeItineraryRequest { itinerary_id: string; preferences?: any; constraints?: any; }
export interface OptimizeBudgetRequest { trip_id: string; target_budget: number; currency?: string; }
export interface CompareRequest { items: string[]; criteria?: string[]; }
export interface ExplainRequest { topic: string; context_id?: string; }
export interface RecommendRequest { preferences: any; location?: string; }
export interface DestinationRequest { destination: string; interests?: string[]; }
export interface PackingListRequest { destination: string; duration_days: number; weather?: string; }
export interface TravelPulseRequest { location: string; categories?: string[]; }
export interface SupportRequest { query: string; booking_id?: string; }
export interface PersonalizeRequest { user_id: string; context?: any; }
export interface CreatePackageRequest { destination: string; budget: number; travelers: number; preferences?: any; }
export interface GenerateQuoteRequest { package_id: string; currency?: string; }
export interface CustomerMessageRequest { customer_id: string; intent: string; context?: any; }
export interface CopilotPackageRequest { destination: string; budget: number; travelers: number; preferences?: any; }
export interface CopilotValidateRequest { package_id: string; }
export interface CopilotQuoteRequest { package_id: string; margin?: number; }

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

export interface AIChatRequest {
  message: string;
  conversation_id?: string;
  agentPersona?: string;
  language?: string;
  conversationHistory?: any[];
  context?: any;
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
  chat: async (payload: AIChatRequest): Promise<AIResponse> => {
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

  optimizeItinerary: async (payload: OptimizeItineraryRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/optimize-itinerary", payload);
    return data;
  },

  optimizeBudget: async (payload: OptimizeBudgetRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/optimize-budget", payload);
    return data;
  },

  // Discovery & Context
  recommend: async (payload: RecommendRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/recommend", payload);
    return data;
  },

  compare: async (payload: CompareRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/compare", payload);
    return data;
  },

  explain: async (payload: ExplainRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/explain", payload);
    return data;
  },

  destination: async (payload: DestinationRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/destination", payload);
    return data;
  },

  // Utilities
  packingList: async (payload: PackingListRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/packing-list", payload);
    return data;
  },

  support: async (payload: SupportRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/support", payload);
    return data;
  },

  travelPulse: async (payload: TravelPulseRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/travel-pulse", payload);
    return data;
  },

  // Agent Portal
  personalize: async (payload: PersonalizeRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/personalize", payload);
    return data;
  },

  createPackage: async (payload: CreatePackageRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/create-package", payload);
    return data;
  },

  validatePackage: async (payload: CopilotValidateRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/validate-package", payload);
    return data;
  },

  generateQuote: async (payload: GenerateQuoteRequest): Promise<AIResponse> => {
    const { data } = await apiClient.post<AIResponse>("/api/v1/ai/generate-quote", payload);
    return data;
  },

  customerMessage: async (payload: CustomerMessageRequest): Promise<AIResponse> => {
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

