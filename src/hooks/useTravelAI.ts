export type AIRequestOptions = any;
import { useState, useCallback, useRef, useEffect } from "react";
import {

  OptimizeItineraryRequest,
  OptimizeBudgetRequest,
  CompareRequest,
  ExplainRequest,
  RecommendRequest,
  DestinationRequest,
  PackingListRequest,
  TravelPulseRequest,
  SupportRequest,
  PersonalizeRequest,
  AIChatRequest,
} from "../lib/api/ai";
import { aiAPI as aiService } from "../lib/api/ai";

export type AIActionName =
  | "chat"
  | "planTrip"
  | "recommend"
  | "explain"
  | "optimize"
  | "reduceCost"
  | "personalize"
  | "packingList"
  | "support"
  | "compare";

export type AIActionStatus = 'idle' | 'loading' | 'success' | 'error' | 'unavailable' | 'confirmation_required';

export interface ActionState<T = any> {
  loading: boolean;
  success: boolean;
  error: Error | string | null;
  status?: AIActionStatus;
  rawResponse?: any;
  data: T | null;
  timestamp?: number;
}

export interface UseTravelAIOptions {
  defaultTimeoutMs?: number;
  onSuccess?: (action: AIActionName, data: any) => void;
  onError?: (action: AIActionName, error: Error) => void;
}

export interface LastActionCall {
  action: AIActionName;
  params: any;
  options?: AIRequestOptions;
}

export function useTravelAI(hookOptions: UseTravelAIOptions = {}) {
  const { defaultTimeoutMs = 35000, onSuccess, onError } = hookOptions;

  // Global aggregate state
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);
  const [lastAction, setLastAction] = useState<AIActionName | null>(null);
  const [data, setData] = useState<any>(null);

  // Per-action discrete states
  const [actionStates, setActionStates] = useState<Record<AIActionName, ActionState>>({
    chat: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    planTrip: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    recommend: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    explain: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    optimize: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    reduceCost: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    personalize: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    packingList: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    support: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
    compare: { loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null },
  });

  // Track active abort controllers & timeout timers
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionCallRef = useRef<LastActionCall | null>(null);

  // Cancel active request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("User cancelled request");
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setLoading(false);
    if (lastActionCallRef.current) {
      const act = lastActionCallRef.current.action;
      setActionStates((prev) => ({
        ...prev,
        [act]: { ...prev[act], loading: false, error: "Request cancelled" },
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  // Unified generic runner
  const executeAction = useCallback(
    async <TResult, TParams>(
      actionName: AIActionName,
      serviceFn: (params: TParams, options?: AIRequestOptions) => Promise<TResult>,
      params: TParams,
      callOptions?: AIRequestOptions
    ): Promise<TResult> => {
      // Abort any existing in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      lastActionCallRef.current = { action: actionName, params, options: callOptions };

      const timeoutMs = callOptions?.timeout || defaultTimeoutMs;

      // Update global states
      setLoading(true);
      setSuccess(false);
      setError(null);
      setLastAction(actionName);

      // Update specific action state
      setActionStates((prev) => ({
        ...prev,
        [actionName]: {
          ...prev[actionName],
          loading: true,
          success: false,
          error: null,
        },
      }));

      // Setup timeout timer
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutIdRef.current = setTimeout(() => {
          controller.abort("Timeout");
          reject(new Error(`AI action '${actionName}' timed out after ${timeoutMs / 1000}s`));
        }, timeoutMs);
      });

      try {
        const actionPromise = serviceFn(params, {
          signal: controller.signal,
          timeout: timeoutMs,
        });

        const result = await Promise.race([actionPromise, timeoutPromise]);

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        abortControllerRef.current = null;

        // Update states on success
        setLoading(false);
        setSuccess(true);
        setError(null);
        setData(result);

        setActionStates((prev) => ({
          ...prev,
          [actionName]: {
            loading: false,
            success: true,
            error: null,
            data: result,
            timestamp: Date.now(),
          },
        }));

        onSuccess?.(actionName, result);
        return result;
      } catch (err: any) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        abortControllerRef.current = null;

        const isAborted =
          err?.name === "AbortError" ||
          err?.message?.includes("aborted") ||
          err?.message?.includes("cancelled") ||
          err?.code === "ERR_CANCELED";

        const formattedError = isAborted
          ? new Error(`AI action '${actionName}' was cancelled.`)
          : err instanceof Error
          ? err
          : new Error(err?.message || "An unexpected error occurred in AI service.");

        setLoading(false);
        setSuccess(false);
        setError(formattedError);

        setActionStates((prev) => ({
          ...prev,
          [actionName]: {
            ...prev[actionName],
            loading: false,
            success: false,
            error: formattedError,
          },
        }));

        onError?.(actionName, formattedError);
        throw formattedError;
      }
    },
    [defaultTimeoutMs, onSuccess, onError]
  );

  const [streamText, setStreamText] = useState<string>("");
  const [streamStatus, setStreamStatus] = useState<string>("");

  // 1. Chat
  const chat = useCallback(
    (params: AIChatRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("chat", (p) => aiService.chat(p), params, options);
    },
    [executeAction]
  );

  // 1b. Stream Chat
  const streamChat = useCallback(
    async (params: AIChatRequest, options?: AIRequestOptions): Promise<void> => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      lastActionCallRef.current = { action: "chat", params, options };
      
      setLoading(true);
      setSuccess(false);
      setError(null);
      setStreamText("");
      setStreamStatus("");
      setLastAction("chat");
      
      setActionStates(prev => ({
        ...prev,
        chat: { ...prev.chat, loading: true, success: false, error: null }
      }));

      await aiService.streamChat(params as any, {
        onStatus: (msg) => setStreamStatus(msg),
        onToken: (t) => setStreamText(prev => prev + t),
        onWarning: (msg) => console.warn("Stream Warning:", msg),
        onError: (err) => {
          setLoading(false);
          setError(err);
          setActionStates(prev => ({
            ...prev,
            chat: { ...prev.chat, loading: false, error: err }
          }));
          options?.onError?.(new Error(err));
        },
        onDone: (finalData) => {
          setLoading(false);
          setSuccess(true);
          setData(finalData);
          setActionStates(prev => ({
            ...prev,
            chat: { ...prev.chat, loading: false, success: true, data: finalData, timestamp: Date.now() }
          }));
          options?.onSuccess?.(finalData);
        }
      }, controller.signal);
    },
    []
  );

  // 2. Plan Trip
  const planTrip = useCallback(
    (params: any, options?: AIRequestOptions): Promise<any> => {
      return executeAction("planTrip", (p) => aiService.planTrip(p), params, options);
    },
    [executeAction]
  );

  // 3. Recommend
  const recommend = useCallback(
    (params: RecommendRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("recommend", (p) => aiService.recommend(p), params, options);
    },
    [executeAction]
  );

  // 4. Explain
  const explain = useCallback(
    (params: ExplainRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("explain", (p) => aiService.explain(p), params, options);
    },
    [executeAction]
  );

  // 5. Optimize
  const optimize = useCallback(
    (params: OptimizeItineraryRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("optimize", (p) => aiService.optimizeItinerary(p), params, options);
    },
    [executeAction]
  );

  // 6. Reduce Cost
  const reduceCost = useCallback(
    (params: OptimizeBudgetRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("reduceCost", (p) => aiService.optimizeBudget(p), params, options);
    },
    [executeAction]
  );

  // 7. Personalize
  const personalize = useCallback(
    (params: PersonalizeRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("personalize", (p) => aiService.personalize(p), params, options);
    },
    [executeAction]
  );

  // 8. Packing List
  const packingList = useCallback(
    (params: PackingListRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("packingList", (p) => aiService.packingList(p), params, options);
    },
    [executeAction]
  );

  // 9. Support
  const support = useCallback(
    (params: SupportRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("support", (p) => aiService.support(p), params, options);
    },
    [executeAction]
  );

  // 10. Compare
  const compare = useCallback(
    (params: CompareRequest, options?: AIRequestOptions): Promise<any> => {
      return executeAction("compare", (p) => aiService.compare(p), params, options);
    },
    [executeAction]
  );

  // Retry the last executed action with identical parameters
  const retry = useCallback(async (): Promise<any> => {
    if (!lastActionCallRef.current) {
      throw new Error("No previous AI action available to retry.");
    }
    const { action, params, options } = lastActionCallRef.current;
    switch (action) {
      case "chat":
        return chat(params, options);
      case "planTrip":
        return planTrip(params, options);
      case "recommend":
        return recommend(params, options);
      case "explain":
        return explain(params, options);
      case "optimize":
        return optimize(params, options);
      case "reduceCost":
        return reduceCost(params, options);
      case "personalize":
        return personalize(params, options);
      case "packingList":
        return packingList(params, options);
      case "support":
        return support(params, options);
      case "compare":
        return compare(params, options);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, [chat, planTrip, recommend, explain, optimize, reduceCost, personalize, packingList, support, compare]);

  // Aliases for standard developer ergonomic convenience
  return {
    // Global state
    loading,
    isLoading: loading,
    success,
    isSuccess: success,
    error,
    isError: !!error,
    data,
    lastResult: data,
    lastAction,

    // Controls
    retry,
    cancel,
    abort: cancel,
    timeout: defaultTimeoutMs,

    // Action Methods
    chat,
    streamChat,
    streamText,
    streamStatus,
    planTrip,
    recommend,
    explain,
    optimize,
    reduceCost,
    personalize,
    packingList,
    support,
    compare,

    // Per-Action State Map
    actionStates,
    states: actionStates,
  };
}

export default useTravelAI;
