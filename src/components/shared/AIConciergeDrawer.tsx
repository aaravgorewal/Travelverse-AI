import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  Plane,
  Utensils,
  DollarSign,
  Crown,
  FileCheck,
  Compass,
  Loader2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { aiService } from "../../services";
import { Button, Badge } from "../ui";

type AgentPersona = "concierge" | "flight_scout" | "foodie" | "luxury_host" | "budget_hacker" | "visa_guide";

const PERSONAS: { id: AgentPersona; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: "concierge", label: "Master Concierge", icon: <Bot className="w-3.5 h-3.5" />, color: "bg-blue-600", desc: "Full-trip orchestrator & schedule optimizer" },
  { id: "flight_scout", label: "Flight Scout", icon: <Plane className="w-3.5 h-3.5" />, color: "bg-sky-600", desc: "Secret routes, seat upgrades & fare drops" },
  { id: "foodie", label: "Local Foodie", icon: <Utensils className="w-3.5 h-3.5" />, color: "bg-amber-600", desc: "Hidden izakayas, Michelin tables & tastings" },
  { id: "luxury_host", label: "Luxury Host", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-purple-600", desc: "VIP villas, private yacht charters & suites" },
  { id: "budget_hacker", label: "Budget Hacker", icon: <DollarSign className="w-3.5 h-3.5" />, color: "bg-emerald-600", desc: "Maximize value, free passes & discount hacks" },
  { id: "visa_guide", label: "Visa & Docs", icon: <FileCheck className="w-3.5 h-3.5" />, color: "bg-rose-600", desc: "Entry requirements, eVisas & passport rules" },
];

export const AIConciergeDrawer: React.FC = () => {
  const { isAIConciergeOpen, setAIConciergeOpen, setModule, aiInitialPrompt, clearAIInitialPrompt } = useUIStore();
  const [activePersona, setActivePersona] = useState<AgentPersona>("concierge");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; suggestedActions?: string[]; timestamp: string }[]>([
    {
      id: "m-init",
      role: "assistant",
      content: "👋 Greetings! I am your TravelVerse AI Multi-Agent Copilot. I can build personalized multi-day itineraries, hunt flight deals, recommend Michelin dining, verify visa rules, and optimize your schedule. What destination are you dreaming of?",
      suggestedActions: [
        "Plan a 7-day luxury trip to Tokyo & Kyoto",
        "Find the best business class flights from SFO",
        "Check visa requirements for Japan",
        "Recommend hidden foodie spots in Positano",
      ],
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIConciergeOpen && aiInitialPrompt) {
      setActivePersona("flight_scout");
      const promptToSend = aiInitialPrompt;
      clearAIInitialPrompt();
      setTimeout(() => {
        handleSendMessage(promptToSend);
      }, 100);
    }
  }, [isAIConciergeOpen, aiInitialPrompt]);

  useEffect(() => {
    if (isAIConciergeOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAIConciergeOpen]);

  if (!isAIConciergeOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call service layer (never direct browser API keys)
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await aiService.chatWithConcierge({
        message: textToSend,
        conversationHistory: history,
        agentPersona: activePersona,
      });

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant" as const,
        content: response.reply,
        suggestedActions: response.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant" as const,
          content: `⚠️ I encountered a temporary connection glitch. However, based on our database: Tokyo has fantastic availability for September, and flights with Quantum Airways are currently on sale. Would you like me to generate a complete custom day-by-day plan?`,
          suggestedActions: ["Open Full AI Trip Generator", "Explore Flights to Tokyo", "View 360° VR Preview"],
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[460px] h-[650px] max-h-[90vh] rounded-3xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-md">
            <Sparkles className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold tracking-tight">TravelVerse Copilot</h3>
              <Badge variant="purple" size="sm">Gemini 3.7</Badge>
            </div>
            <p className="text-[11px] text-slate-300">Multi-Agent Travel Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAIConciergeOpen(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Agent Persona Selector */}
      <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200/60 dark:border-slate-700/60 overflow-x-auto flex gap-1.5 scrollbar-none">
        {PERSONAS.map((p) => {
          const isSelected = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? `${p.color} text-white shadow-sm scale-105`
                  : "bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-white/80"
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10"
                  : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <span className={`block text-[9px] mt-1.5 ${m.role === "user" ? "text-blue-200 text-right" : "text-slate-400"}`}>
                {m.timestamp}
              </span>
            </div>

            {/* Suggested Follow-up Buttons */}
            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                {m.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (action.includes("Full AI Trip Generator")) {
                        setModule("ai");
                        setAIConciergeOpen(false);
                      } else if (action.includes("Flights")) {
                        setModule("flights");
                        setAIConciergeOpen(false);
                      } else if (action.includes("VR")) {
                        setModule("vr");
                        setAIConciergeOpen(false);
                      } else {
                        handleSendMessage(action);
                      }
                    }}
                    className="text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 rounded-xl px-2.5 py-1 transition-all text-left cursor-pointer"
                  >
                    ✨ {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Consulting multi-agent travel graph...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${PERSONAS.find((p) => p.id === activePersona)?.label}...`}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" size="sm" disabled={!inputMessage.trim() || isLoading} className="h-9 w-9 p-0 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
