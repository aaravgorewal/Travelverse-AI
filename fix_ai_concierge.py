with open("src/components/shared/AIConciergeDrawer.tsx", "r") as f:
    content = f.read()

# Replace hook usage and standard chat logic.
if "useAIAction" not in content:
    content = content.replace(
        "import { aiAPI } from \"../../lib/api/ai\";",
        "import { aiAPI } from \"../../lib/api/ai\";\nimport { useAIAction } from \"../../hooks/useAIAction\";"
    )
    
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(false);",
        "const { execute, status, error, rawResponse } = useAIAction();\n  const isLoading = status === 'loading';"
    )
    
    old_handle_send = """    try {
      if (activePersona === "flight_scout") {
        const response = await aiAPI.chat({
          message: text,
          context: {
            user_id: "demo",
            role: "traveler",
            location_context: "New York",
          }
        });
        
        const aiMsg = {
          id: response.request_id,
          role: "assistant" as const,
          content: response.message,
          suggestedActions: response.actions?.map(a => a.action) || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prev => [...prev, aiMsg]);
        if (isSpeechSupported && shouldSpeak) {
          speak(response.message);
        }
      } else {
        // ... streaming logic ...
        // We will keep streaming separate for now or refactor it? 
        // Streaming doesn't use the standard execute easily without custom callbacks.
"""

# AIConciergeDrawer handles both stream and non-stream. It's complex. Let's do it via replace_file_content safely.
