import React, { useState } from "react";
import {
  Send, Sparkles, MapPin, Calendar, Users, DollarSign,
  Check, Plus, RefreshCw, Layers, Sliders
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useTravelAI } from "../../hooks/useTravelAI";
import {
  PageHeader, ContextPanel, DataList, DataListItem,
  AIActionButton, SaaSLoadingState, StatusBadge
} from "../../components/ui/SaaSCore";

export const AIPlannerView: React.FC = () => {
  const { setModule } = useUIStore();
  const { chat, loading } = useTravelAI();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const submitMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    try {
      const res = await chat({ message: msg });
      setMessages(prev => [...prev, { role: "assistant", content: res?.message || res?.data?.message || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to get a response." }]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMsg = input;
    setInput("");
    await submitMessage(userMsg);
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Main Workspace (Left/Center) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <PageHeader 
            title="AI Trip Planner"
            description="Collaborate with TravelVerse Copilot to build and optimize your itinerary."
          />
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Start Planning</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  Ask the Copilot to suggest destinations, optimize routes, or build a complete itinerary.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => submitMessage("Plan a 5-day trip to Dubai")} className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200">
                  Dubai in 5 Days
                </button>
                <button onClick={() => submitMessage("Find cheap flights to Tokyo")} className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200">
                  Flights to Tokyo
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white dark:bg-slate-800' 
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed prose dark:prose-invert max-w-none">
                    {msg.content}
                  </div>
                  
                  {msg.role === 'assistant' && i === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50">
                        <Plus className="w-3 h-3" /> Add to Itinerary
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50">
                        <RefreshCw className="w-3 h-3" /> Regenerate Section
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <SaaSLoadingState message="Analyzing parameters..." className="py-2" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Instruct the Copilot..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Context Area */}
      <ContextPanel title="Active Parameters" className="w-80 hidden lg:flex flex-shrink-0">
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Trip State</h4>
            <DataList>
              <DataListItem 
                label="Destination" 
                value={<div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-400"/> Tokyo, JP</div>} 
              />
              <DataListItem 
                label="Dates" 
                value={<div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-slate-400"/> Oct 12 - Oct 19</div>} 
              />
              <DataListItem 
                label="Travelers" 
                value={<div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-slate-400"/> 2 Adults</div>} 
              />
              <DataListItem 
                label="Budget" 
                value={<div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-slate-400"/> ,000</div>} 
              />
            </DataList>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Constraints</h4>
              <button className="text-indigo-600 text-xs hover:underline">Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="neutral">Non-stop Flights</StatusBadge>
              <StatusBadge status="neutral">5-Star Hotels</StatusBadge>
              <StatusBadge status="warning">Vegan Dining</StatusBadge>
            </div>
          </div>
        </div>
      </ContextPanel>
    </div>
  );
};
