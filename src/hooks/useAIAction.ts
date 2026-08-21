import { useState, useCallback } from 'react';

export interface UseAIActionState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  requiresConfirmation: boolean;
  warnings: string[];
}

export function useAIAction<TArgs extends any[], TResult>(
  actionFn: (...args: TArgs) => Promise<TResult>
) {
  const [state, setState] = useState<UseAIActionState<TResult>>({
    data: null,
    isLoading: false,
    error: null,
    isEmpty: true,
    requiresConfirmation: false,
    warnings: [],
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await actionFn(...args);
        
        // Handle standardized AIResponse if returned
        const isAIResponse = result && typeof result === 'object' && 'request_id' in result;
        
        let warnings: string[] = [];
        let requiresConfirmation = false;
        
        if (isAIResponse) {
           const aiRes = result as any;
           warnings = aiRes.warnings || [];
           requiresConfirmation = warnings.some(w => w.toLowerCase().includes('confirmation'));
        }

        setState({
          data: result,
          isLoading: false,
          error: null,
          isEmpty: false, // Could check if data is functionally empty
          requiresConfirmation,
          warnings,
        });

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
        return null;
      }
    },
    [actionFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isEmpty: true,
      requiresConfirmation: false,
      warnings: [],
    });
  }, []);

  return { ...state, execute, reset };
}
