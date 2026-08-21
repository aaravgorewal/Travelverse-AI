import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Mic,
  Plus,
  RefreshCw,
  Sliders,
  Compass,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Layers,
  ChevronDown,
  Loader2,
  Trash2,
  Share2,
  Download,
  Info,
  Zap,
  DollarSign,
  UserCheck,
  Luggage,
  LifeBuoy,
  Scale,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useTripStore, useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { useTravelAI } from "../../hooks/useTravelAI";
import { aiAPI } from "../../lib/api/ai";
import {
  AIChatSession,
  AIChatMessageItem,
  INITIAL_TRIP_CONTEXT,
  DEFAULT_SUGGESTED_PROMPTS,
} from "./types";
import { AIConversationHistory } from "./components/AIConversationHistory";
import { AITripContextPanel } from "./components/AITripContextPanel";
import { AIChatMessage } from "./components/AIChatMessage";
import { AISuggestedPrompts } from "./components/AISuggestedPrompts";
import { AIVoiceInputModal } from "./components/AIVoiceInputModal";
import { TripGenieView } from "./TripGenieView";

const SEED_SESSIONS: AIChatSession[] = [
  {
    id: "session-kyoto-1",
    title: "Kyoto & Tokyo Autumn Food Crawl",
    createdAt: "Today, 10:30 AM",
    updatedAt: "Just now",
    isPinned: true,
    tripContext: { ...INITIAL_TRIP_CONTEXT },
    messages: [
      {
        id: "msg-init-1",
        role: "assistant",
        content: `### 🌟 Welcome to the TRAVELVERSE AI Operating System
I am your dedicated autonomous travel intelligence concierge. 

I have initialized your workspace with active context for **Kyoto & Tokyo, Japan** (Sep 12 – Sep 19, 2026, 2 Guests, $5,500 Budget).

How would you like to proceed? You can ask me anything about flights, hotel upgrades, pacing, Michelin reservations, or select a suggested prompt below!`,
        timestamp: "10:30 AM",
        suggestedPrompts: [
          "Plan my trip",
          "Find cheaper hotels",
          "Optimize my itinerary",
          "What's best for my family?",
        ],
      },
    ],
  },
  {
    id: "session-amalfi-2",
    title: "Amalfi Coast Yacht & Villa Escape",
    createdAt: "Yesterday",
    updatedAt: "Yesterday",
    isPinned: false,
    tripContext: {
      destination: "Amalfi Coast & Positano, Italy",
      dates: { start: "2026-07-10", end: "2026-07-17" },
      travelers: { adults: 2, children: 0 },
      budget: "$7,200",
      preferences: ["Private Yacht", "Cliffside Villas", "Wine Tasting", "Luxury 5★"],
      bookings: [],
      currentLocation: "New York, NY (JFK)",
      tripStage: "Planning",
    },
    messages: [
      {
        id: "msg-amalfi-1",
        role: "assistant",
        content: `### 🚤 Amalfi Coast Yacht & Villa Blueprint
I've drafted a scenic route covering Capri, Positano, and Ravello. We can arrange private boat transfers directly from Naples port to skip traffic congestion.`,
        timestamp: "Yesterday",
      },
    ],
  },
];

import { useSEO } from "../../hooks/useSEO";

export const AIPlannerView: React.FC = () => {
  useSEO({
    title: "Autonomous AI Trip Planner - TravelVerse AI",
    description: "Build complete multi-day itineraries and get route suggestions calibrated by Gemini AI graph.",
    path: "/ai"
  });

  const { aiInitialPrompt, clearAIInitialPrompt } = useUIStore();
  const { activeTrip } = useTripStore();
  const { bookings: storeBookings } = useTravelStore();

  // Sessions state (with LocalStorage fallback)
  const [sessions, setSessions] = useState<AIChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("travelverse_ai_sessions");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(
    sessions[0]?.id || "session-kyoto-1"
  );

  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeAgentPersona, setActiveAgentPersona] = useState("Master Concierge");

  // Global AI Action Hook
  const travelAI = useTravelAI();

  // Top-level AI Feature Mode: TripGenie Autonomous Planner vs AI Concierge Multi-Turn Chat
  const [activeAIMode, setActiveAIMode] = useState<"tripgenie" | "chat">("tripgenie");

  // Responsive sidebar toggles
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [showContextSidebar, setShowContextSidebar] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "context" | "history">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active session helper
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("travelverse_ai_sessions", JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Handle incoming initial prompt from store if triggered elsewhere
  useEffect(() => {
    if (aiInitialPrompt) {
      handleSendMessage(aiInitialPrompt);
      clearAIInitialPrompt();
    }
  }, [aiInitialPrompt]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, travelAI.isLoading]);

  // Create New Chat
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: AIChatSession = {
      id: newSessionId,
      title: `Trip to ${activeSession?.tripContext?.destination || "New Destination"}`,
      createdAt: "Just now",
      updatedAt: "Just now",
      tripContext: activeSession?.tripContext
        ? { ...activeSession.tripContext }
        : { ...INITIAL_TRIP_CONTEXT },
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `### 🌟 TRAVELVERSE AI Workspace Initialized
I am ready to help you plan, optimize, and orchestrate your next journey. What would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
        },
      ],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
    setMobileActiveTab("chat");
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Toggle Pin
  const handleTogglePinSession = (id: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === id ? { ...s, isPinned: !s.isPinned } : s
      )
    );
  };

  // Update Trip Context for active session
  const handleContextChange = (updated: TripContextData) => {
    setSessions(
      sessions.map((s) =>
        s.id === activeSessionId ? { ...s, tripContext: updated } : s
      )
    );
  };

  // Send Message to API via travelAI.chat
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || travelAI.isLoading) return;

    setInputMessage("");

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: AIChatMessageItem = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content,
      timestamp: nowTime,
    };

    // Update active session immediately with user message
    const updatedMessages = [...(activeSession?.messages || []), userMsg];

    // Update session title if first user message
    const updatedTitle =
      activeSession?.messages.length <= 1
        ? content.slice(0, 32) + (content.length > 32 ? "..." : "")
        : activeSession?.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: updatedTitle || s.title,
              updatedAt: "Just now",
              messages: updatedMessages,
            }
          : s
      )
    );

    try {
      const response = await travelAI.chat({
        message: content,
        conversationHistory: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        tripContext: activeSession?.tripContext || INITIAL_TRIP_CONTEXT,
        agentPersona: activeAgentPersona,
      });

      const aiMsg: AIChatMessageItem = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPrompts: response.suggestedPrompts || DEFAULT_SUGGESTED_PROMPTS,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                updatedAt: "Just now",
                messages: [...s.messages, aiMsg],
              }
            : s
        )
      );
    } catch (err: any) {
      console.error("Chat error:", err);
      const isCancelled = err?.message?.includes("cancelled");
      const fallbackMsg: AIChatMessageItem = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: isCancelled
          ? `*AI Request was cancelled by user.*`
          : `### 🧭 AI Concierge Status\nWe encountered a transient network connection issue (${err?.message || "Timeout"}). Click **Retry Action** below to resend your query to the AI engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, fallbackMsg] }
            : s
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscriptComplete = (transcript: string, autoSend: boolean = false) => {
    if (autoSend) {
      handleSendMessage(transcript);
    } else {
      setInputMessage((prev) => (prev ? prev + " " + transcript : transcript));
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClearCurrentChat = () => {
    if (confirm("Clear all messages in this conversation?")) {
      setSessions(
        sessions.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [
                  {
                    id: `msg-reinit-${Date.now()}`,
                    role: "assistant",
                    content: `### Chat Cleared\nHow can I help you with **${s.tripContext.destination}**?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
                  },
                ],
              }
            : s
        )
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top AI Navigation / View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="ai-mode-tripgenie-tab"
            type="button"
            onClick={() => setActiveAIMode("tripgenie")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeAIMode === "tripgenie"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>TripGenie AI Planner</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] uppercase font-bold tracking-wider">
              Autonomous
            </span>
          </button>

          <button
            id="ai-mode-workspace-tab"
            type="button"
            onClick={() => setActiveAIMode("chat")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeAIMode === "chat"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Concierge Workspace</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] uppercase font-bold tracking-wider">
              Multi-Turn
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 3.7 Flash Engine Online</span>
        </div>
      </div>

      {/* RENDER TRIPGENIE VIEW */}
      {activeAIMode === "tripgenie" ? (
        <TripGenieView
          initialTrip={activeTrip}
          onViewChange={(v) => setActiveAIMode(v === "workspace" ? "chat" : "tripgenie")}
        />
      ) : (
        /* RENDER 3-COLUMN AI CONCIERGE WORKSPACE */
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] min-h-[600px] max-h-[920px] w-full rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden font-sans">
          {/* Top Workspace Header */}
          <div className="h-14 shrink-0 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            {/* Left branding & session title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={showHistorySidebar ? "Hide History" : "Show History"}
              >
                {showHistorySidebar ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                      {activeSession?.title || "TRAVELVERSE AI Workspace"}
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Gemini 3.7 Flash</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden md:block">
                    Context: {activeSession?.tripContext?.destination} • {activeSession?.tripContext?.budget}
                  </p>
                </div>
              </div>
            </div>

            {/* Center/Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Persona selector */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 text-[11px]">Mode:</span>
                <select
                  value={activeAgentPersona}
                  onChange={(e) => setActiveAgentPersona(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Master Concierge">Master Concierge</option>
                  <option value="Flight & Hotel Scout">Flight & Hotel Scout</option>
                  <option value="Culinary & Experience Host">Culinary & Experience Host</option>
                  <option value="Family Travel Specialist">Family Travel Specialist</option>
                  <option value="Itinerary Optimizer">Itinerary Optimizer</option>
                </select>
              </div>

              {/* Clear chat */}
              <button
                type="button"
                onClick={handleClearCurrentChat}
                title="Clear current conversation"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Toggle Trip Context panel button (desktop) */}
              <button
                type="button"
                onClick={() => setShowContextSidebar(!showContextSidebar)}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={showContextSidebar ? "Hide Trip Context" : "Show Trip Context"}
              >
                {showContextSidebar ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

      {/* Mobile Tab Switcher (<lg screens) */}
      <div className="flex lg:hidden items-center justify-around bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-1.5 px-2">
        <button
          type="button"
          onClick={() => setMobileActiveTab("chat")}
          className={`px-4 py-1 rounded-xl text-xs font-bold transition-all ${
            mobileActiveTab === "chat"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          💬 AI Chat
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab("context")}
          className={`px-4 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            mobileActiveTab === "context"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Trip Context</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab("history")}
          className={`px-4 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            mobileActiveTab === "history"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>History ({sessions.length})</span>
        </button>
      </div>

      {/* 3-Column Workspace Main Body */}
      <div className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 relative">
        {/* COLUMN 1: Conversation History */}
        <div
          className={`h-full transition-all duration-300 ${
            showHistorySidebar ? "w-64 xl:w-72 block shrink-0" : "hidden"
          } ${mobileActiveTab === "history" ? "!block fixed inset-0 z-[60] p-4 bg-slate-950/90 backdrop-blur-md lg:relative lg:inset-auto lg:p-0" : "hidden lg:block"}`}
        >
          <div className="h-full relative">
            {mobileActiveTab === "history" && (
              <button
                type="button"
                onClick={() => setMobileActiveTab("chat")}
                className="lg:hidden absolute top-2 right-2 z-50 p-2 rounded-full bg-slate-800 text-white"
              >
                ✕
              </button>
            )}
            <AIConversationHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => {
                setActiveSessionId(id);
                setMobileActiveTab("chat");
              }}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onTogglePinSession={handleTogglePinSession}
            />
          </div>
        </div>

        {/* COLUMN 2: AI Conversation Stream & Input (Center) */}
        <div
          className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden ${
            mobileActiveTab !== "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">
            {activeSession?.messages.map((msg) => (
              <AIChatMessage
                key={msg.id}
                message={msg}
                onFollowUpClick={(prompt) => handleSendMessage(prompt)}
              />
            ))}

            {/* Thinking / Streaming Indicator with Cancel Option */}
            {travelAI.isLoading && (
              <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400 text-xs font-semibold p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-md animate-pulse">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      TRAVELVERSE AI is reasoning ({travelAI.lastAction || "chat"})...
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Real-time Gemini 3.7 Flash analysis
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={travelAI.cancel}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}

            {/* Retry banner if last action errored */}
            {travelAI.isError && !travelAI.isLoading && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                <span className="truncate">Action encountered an issue. Would you like to retry?</span>
                <button
                  type="button"
                  onClick={() => travelAI.retry()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Dock: Suggested Prompts + Quick Actions + Input Bar */}
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
            {/* Quick Action Shortcuts Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                AI Actions:
              </span>
              <button
                type="button"
                onClick={() => handleSendMessage("Optimize my itinerary for peak efficiency, travel time reduction, and carbon savings.")}
                disabled={travelAI.isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Optimize Route
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Analyze my trip budget and suggest 3 high-impact cost reduction opportunities with minimal trade-offs.")}
                disabled={travelAI.isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Reduce Cost
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Generate a hyper-customized packing checklist tailored to our destination weather and scheduled activities.")}
                disabled={travelAI.isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Luggage className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Packing List
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Compare my top hotel/flight options side-by-side with a detailed verdict matrix.")}
                disabled={travelAI.isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Scale className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Compare
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("I need 24/7 passenger rights guidance and emergency support for my flight booking.")}
                disabled={travelAI.isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <LifeBuoy className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                24/7 Support
              </button>
            </div>

            {/* Suggested Prompts Carousel */}
            <AISuggestedPrompts
              prompts={DEFAULT_SUGGESTED_PROMPTS}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              disabled={travelAI.isLoading}
            />

            {/* Active context pill tag */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-slate-700 dark:text-slate-300">Context:</span>
                <span className="truncate">
                  📍 {activeSession?.tripContext?.destination} • 💰 {activeSession?.tripContext?.budget} • 👥 {typeof activeSession?.tripContext?.travelers === "object" ? activeSession?.tripContext?.travelers?.adults : activeSession?.tripContext?.travelers} Travelers
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowContextSidebar(true);
                  setMobileActiveTab("context");
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0"
              >
                Edit Context
              </button>
            </div>

            {/* AI Input Form */}
            <div className="relative flex items-end gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              {/* Voice Input Trigger Button */}
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                title="Voice Input (Speech-to-Text)"
                className="p-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer shrink-0"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Expanding Textarea */}
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TRAVELVERSE AI to plan, compare hotel rates, optimize schedule, or explain options..."
                rows={1}
                className="flex-1 max-h-32 min-h-[40px] py-2 px-1 bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || travelAI.isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              >
                {travelAI.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Trip Context Panel (Right) */}
        <div
          className={`h-full transition-all duration-300 ${
            showContextSidebar ? "w-80 xl:w-88 block shrink-0" : "hidden"
          } ${mobileActiveTab === "context" ? "!block fixed inset-0 z-40 p-4 bg-slate-950/80 backdrop-blur-sm lg:relative lg:inset-auto lg:p-0" : "hidden lg:block"}`}
        >
          <div className="h-full relative">
            {mobileActiveTab === "context" && (
              <button
                type="button"
                onClick={() => setMobileActiveTab("chat")}
                className="lg:hidden absolute top-2 right-2 z-50 p-2 rounded-full bg-slate-800 text-white"
              >
                ✕
              </button>
            )}
            <AITripContextPanel
              tripContext={activeSession?.tripContext || INITIAL_TRIP_CONTEXT}
              onChange={handleContextChange}
              onAskAIToOptimize={() => handleSendMessage("Optimize my itinerary and budget based on my updated context")}
            />
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Voice Input Modal */}
      <AIVoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptComplete={handleVoiceTranscriptComplete}
      />
    </div>
  );
};
