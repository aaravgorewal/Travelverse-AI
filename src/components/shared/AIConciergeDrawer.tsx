import React, { useState, useRef, useEffect } from "react";
import {
  X, Send, Bot, Sparkles, Plane, Utensils, DollarSign, Crown, FileCheck, 
  Loader2, Mic, MicOff, Volume2, VolumeX
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useI18nStore } from "../../stores/useI18nStore";
import { aiAPI, AIChatRequest } from "../../lib/api/ai";
import { useAIAction } from "../../hooks/useAIAction";
import { analyticsService } from "../../services/analyticsService";
import { Button, Badge, AISkeletonLoader } from "../ui";

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
  const { execute, status, error, reset } = useAIAction();
  const isLoading = status === "loading";
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

  // Voice AI States
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceState("listening");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setVoiceState("processing");
        // Automatically submit the transcript
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 300);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setVoiceState("idle");
      };

      rec.onend = () => {
        setVoiceState(prev => prev === "listening" ? "idle" : prev);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Sync initial prompt from store
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

  // Speech synthesis shutdown on unmount/close
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAIConciergeOpen]);

  if (!isAIConciergeOpen) return null;

  const startVoiceListening = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop talking if we start listening
    }
    if (recognitionRef.current && voiceState === "idle") {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  const stopVoiceListening = () => {
    if (recognitionRef.current && voiceState === "listening") {
      recognitionRef.current.stop();
      setVoiceState("idle");
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis || !shouldSpeak) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    // Clean markdown characters for a cleaner spoken output
    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Simplify links
      .replace(/:\w+:/g, "") // Clean emojis/colons
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    
    utterance.onstart = () => {
      setVoiceState("speaking");
    };

    utterance.onend = () => {
      setVoiceState("idle");
    };

    utterance.onerror = () => {
      setVoiceState("idle");
    };

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Mute assistant if sending new message
    }

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setVoiceState("processing");
    try {
      analyticsService.trackEvent("ai_prompt_sent", { messageLength: textToSend.length, activePersona });
    } catch (err) {
      console.warn("AI prompt analytics failed:", err);
    }

    try {
      const payload: AIChatRequest = {
        message: textToSend,
        conversation_id: "concierge-session"
      };

      execute(aiAPI.chat, [payload], {
        onSuccess: (data, response) => {
          const assistantMsg = {
            id: response.request_id || `a-${Date.now()}`,
            role: "assistant" as const,
            content: response.message,
            suggestedActions: response.actions?.map(a => a.action) || [],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setMessages((prev) => [...prev, assistantMsg]);
          setVoiceState("idle");

          if (isSpeechSupported && shouldSpeak) {
            setTimeout(() => speakText(response.message), 200);
          }
        },
        onError: (errStr) => {
          setVoiceState("idle");
          // The error state is handled by the hook and will pop a toast.
          // We can push a generic error to the chat thread too.
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant" as const,
              content: `⚠️ Error: ${errStr}. Please try again.`,
              timestamp: "Just now",
            },
          ]);
        }
      });

    } catch (err: any) {
      console.error(err);
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
              <Badge variant="purple" size="sm">Voice AI Active</Badge>
            </div>
            <p className="text-[11px] text-slate-300">Multi-Agent Travel Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TTS Speaker Toggle */}
          <button
            onClick={() => {
              setShouldSpeak(!shouldSpeak);
              if (shouldSpeak) stopSpeaking();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={shouldSpeak ? "Mute Voice AI" : "Unmute Voice AI"}
          >
            {shouldSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

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
          <AISkeletonLoader className="w-full max-w-[90%]" />
        )}

        {/* Voice AI Status bar overlay */}
        {voiceState === "speaking" && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300 w-fit text-xs max-w-[85%] animate-in fade-in">
            <span className="flex gap-1 h-3 items-center">
              <span className="w-0.5 h-3 bg-indigo-500 rounded-full animate-bounce duration-150" />
              <span className="w-0.5 h-2 bg-indigo-500 rounded-full animate-bounce duration-300" />
              <span className="w-0.5 h-3 bg-indigo-500 rounded-full animate-bounce duration-200" />
            </span>
            <span className="font-semibold">Assistant is speaking...</span>
            <button onClick={stopSpeaking} className="text-[10px] underline ml-2 cursor-pointer font-bold">Stop</button>
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
          {/* Voice AI Mic Trigger Button */}
          {isSpeechSupported ? (
            <button
              type="button"
              onClick={voiceState === "listening" ? stopVoiceListening : startVoiceListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                voiceState === "listening"
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
              title={voiceState === "listening" ? "Listening..." : "Tap to Speak"}
            >
              {voiceState === "listening" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400" title="Voice AI not supported in this browser">
              <MicOff className="w-4 h-4 opacity-55" />
            </div>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={voiceState === "listening"}
            placeholder={
              voiceState === "listening"
                ? "Listening... Speak clearly now."
                : `Ask ${PERSONAS.find((p) => p.id === activePersona)?.label}...`
            }
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
          />
          <Button type="submit" size="sm" disabled={!inputMessage.trim() || isLoading || voiceState === "listening"} className="h-9 w-9 p-0 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
