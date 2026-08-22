import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, AlertCircle, RefreshCw, Layers, Check, Plus, Loader2 } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useTripStore } from "../../stores/useTravelStore";
import { aiAPI } from "../../lib/api/ai";

export const AIConciergeDrawer: React.FC = () => {
  const { isAIConciergeOpen, setAIConciergeOpen, currentModule } = useUIStore();
  const { activeTrip } = useTripStore();
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; actions?: string[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate contextual greeting based on current module
  useEffect(() => {
    if (isAIConciergeOpen && messages.length === 0) {
      let greeting = "How can I assist with your workspace today?";
      let actions = ["Help me navigate"];
      
      switch(currentModule) {
        case "trips":
          greeting = "I see you're managing your trips. Need help organizing or analyzing a specific itinerary?";
          actions = ["Analyze my upcoming trip", "Suggest budget optimizations"];
          break;
        case "destinations":
          greeting = "Exploring new destinations? I can pull live intelligence, cultural data, or safety reports.";
          actions = ["Compare top 3 destinations", "Check visa requirements"];
          break;
        case "travelpulse":
          greeting = "I am monitoring live travel alerts. Would you like a breakdown of recent disruptions?";
          actions = ["Summarize active alerts", "Assess risk for my upcoming flight"];
          break;
        case "itinerary":
          if (activeTrip) {
            greeting = `I am analyzing your itinerary for ${activeTrip.destination}. I can optimize routes or fill schedule gaps.`;
            actions = ["Optimize transit routes", "Find nearby dinner spots"];
          }
          break;
      }
      setMessages([{ id: "init", role: "assistant", content: greeting, actions }]);
    }
  }, [isAIConciergeOpen, currentModule, activeTrip, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isAIConciergeOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const newMessages = [...messages, { id: Date.now().toString(), role: "user" as const, content: text }];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      // Pass contextual metadata to the AI
      const res = await aiAPI.chat({
        message: text,
        context: { user_id: "agent", role: "agent", current_page: currentModule, trip_id: activeTrip?.id }
      });
      setMessages([...newMessages, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: res.message,
        actions: res.data?.suggestedActions || []
      }]);
    } catch (error: any) {
       setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: "assistant", content: "Error connecting to intelligence feed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setAIConciergeOpen(false)} />
      
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Agent Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Context: {currentModule}
            </span>
            <button onClick={() => setAIConciergeOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white dark:bg-slate-800' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                    {msg.actions.map((act, j) => (
                      <button 
                        key={j} 
                        onClick={() => handleSend(act)}
                        className="text-left px-2 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Copilot is analyzing context...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputMessage); }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Copilot..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="absolute right-2 p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-center text-slate-400">
            Copilot has read access to your current screen.
          </div>
        </div>

      </div>
    </>
  );
};
