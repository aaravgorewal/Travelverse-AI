with open("src/hooks/useTravelAI.ts", "r") as f:
    content = f.read()

# Add new states
content = content.replace(
    "export interface ActionState<T = any> {",
    "export type AIActionStatus = 'idle' | 'loading' | 'success' | 'error' | 'unavailable' | 'confirmation_required';\n\nexport interface ActionState<T = any> {"
)
content = content.replace(
    "error: Error | string | null;",
    "error: Error | string | null;\n  status?: AIActionStatus;\n  rawResponse?: any;"
)

# Initialize new states
content = content.replace(
    "loading: false, success: false, error: null, data: null",
    "loading: false, success: false, error: null, data: null, status: 'idle', rawResponse: null"
)

# Add handling in execute logic
old_execute = """      const response = await apiCall(params);
      
      clearTimeout(timeoutIdRef.current!);
      timeoutIdRef.current = null;
      
      setData(response);"""

new_execute = """      const response = await apiCall(params);
      
      clearTimeout(timeoutIdRef.current!);
      timeoutIdRef.current = null;
      
      // Handle ActionGateway confirmation requests
      if (response && response.status === "failed" && response.error?.includes("Reconfirmation")) {
        setActionStates((prev) => ({
          ...prev,
          [action]: { ...prev[action], loading: false, status: 'confirmation_required', rawResponse: response, data: response },
        }));
        setLoading(false);
        return response;
      }
      
      setData(response);
      setActionStates((prev) => ({
        ...prev,
        [action]: { ...prev[action], loading: false, success: true, status: 'success', rawResponse: response, data: response },
      }));"""

if old_execute in content:
    content = content.replace(old_execute, new_execute)

old_error = """      setError(err);
      
      setActionStates((prev) => ({
        ...prev,
        [action]: { ...prev[action], loading: false, error: err, data: null },
      }));"""

new_error = """      const isUnavailable = err.message?.includes("503") || err.message?.includes("Network Error") || err.message?.includes("timeout");
      
      setError(err);
      
      setActionStates((prev) => ({
        ...prev,
        [action]: { 
            ...prev[action], 
            loading: false, 
            error: err, 
            data: null, 
            status: isUnavailable ? 'unavailable' : 'error' 
        },
      }));"""

if old_error in content:
    content = content.replace(old_error, new_error)

with open("src/hooks/useTravelAI.ts", "w") as f:
    f.write(content)

print("Done")
