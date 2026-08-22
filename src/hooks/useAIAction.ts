import { useState, useCallback } from "react";
import { aiAPI, AIResponse } from "../lib/api/ai";
import { useUIStore } from "../stores/useUIStore";

export type AIActionStatus = "idle" | "loading" | "success" | "error" | "unavailable" | "confirmation_required";

interface AIActionState<T> {
  status: AIActionStatus;
  data: T | null;
  error: string | null;
  rawResponse: AIResponse | null;
}

export function useAIAction<T = any>() {
  const showToast = (msg: { title: string; message: string; type: string }) => {
    console.error(`[${msg.type.toUpperCase()}] ${msg.title}: ${msg.message}`);
  };
  const [state, setState] = useState<AIActionState<T>>({
    status: "idle",
    data: null,
    error: null,
    rawResponse: null,
  });

  const reset = useCallback(() => {
    setState({ status: "idle", data: null, error: null, rawResponse: null });
  }, []);

  const execute = useCallback(async (
    apiMethod: (...args: any[]) => Promise<AIResponse>,
    args: any[],
    options?: {
      onSuccess?: (data: T, response: AIResponse) => void;
      onError?: (error: string) => void;
      showToastOnError?: boolean;
    }
  ) => {
    setState(prev => ({ ...prev, status: "loading", error: null }));
    
    try {
      const response = await apiMethod(...args);
      
      // Handle ActionGateway confirmation requests
      if (response.data && response.data.status === "failed" && response.data.error?.includes("Reconfirmation")) {
        setState({
          status: "confirmation_required",
          data: response.data as T,
          error: response.data.error,
          rawResponse: response
        });
        return;
      }
      
      setState({
        status: "success",
        data: response.data as T,
        error: null,
        rawResponse: response
      });
      
      if (options?.onSuccess) {
        options.onSuccess(response.data as T, response);
      }
      
    } catch (err: any) {
      console.error("AI Action Error:", err);
      
      // Determine if it's a provider unavailability (503 / network error)
      const isUnavailable = err.message?.includes("503") || err.message?.includes("Network Error") || err.message?.includes("timeout");
      
      const errorMsg = err.response?.data?.error || err.message || "Failed to complete AI action.";
      
      setState({
        status: isUnavailable ? "unavailable" : "error",
        data: null,
        error: errorMsg,
        rawResponse: null
      });
      
      if (options?.onError) {
        options.onError(errorMsg);
      }
      
      if (options?.showToastOnError !== false) {
        showToast({
          title: isUnavailable ? "Service Unavailable" : "Action Failed",
          message: errorMsg,
          type: "error"
        });
      }
    }
  }, []);

  return { ...state, execute, reset };
}
