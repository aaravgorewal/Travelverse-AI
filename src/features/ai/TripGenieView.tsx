import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowLeft,
  Share2,
  Plus,
  Loader2,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useTravelAI } from "../../hooks/useTravelAI";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { TripPlan } from "../../types";
import { aiAPI } from "../../lib/api/ai";
import { TripGenieForm, TripGenieFormValues } from "./components/TripGenieForm";
import { TripGenieDisplay } from "./components/TripGenieDisplay";
import { TripGenieShareModal } from "./components/TripGenieShareModal";

interface TripGenieViewProps {
  initialTrip?: TripPlan | null;
  onViewChange?: (view: "planner" | "workspace") => void;
}

export function TripGenieView({ initialTrip, onViewChange }: TripGenieViewProps) {
  const { planTrip, loading, error, cancel, retry, data } = useTravelAI();
  const { addTrip, trips, activeTrip } = useTripStore();
  const { setModule } = useUIStore();

  const [isRetrying, setIsRetrying] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<TripPlan | null>(
    initialTrip || activeTrip || null
  );
  const [lastParams, setLastParams] = useState<GenerateTripPlanParams | null>(null);
  const [activeActionName, setActiveActionName] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "result">(
    initialTrip || activeTrip ? "result" : "form"
  );
  const [progressStep, setProgressStep] = useState(0);

  // Sync data when planTrip finishes
  useEffect(() => {
    if (data && (data as any).trip) {
      const newTrip = (data as any).trip as TripPlan;
      setGeneratedTrip(newTrip);
      setViewMode("result");
      setIsSaved(false);
    }
  }, [data]);

  // Loading progress steps simulation
  useEffect(() => {
    let timer: any;
    if (loading) {
      setProgressStep(0);
      timer = setInterval(() => {
        setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 900);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const LOADING_MILESTONES = [
    "Analyzing destination climate & optimal transit hubs...",
    "Matching flight schedules, nonstops & cabin classes...",
    "Curating boutique & 5★ luxury accommodations...",
    "Orchestrating day-by-day timing, locations & dining...",
    "Validating budget allocation & cost efficiency...",
  ];

  // 1. Submit Form to POST /api/v1/ai/plan-trip
  const handleFormSubmit = async (params: GenerateTripPlanParams) => {
    setLastParams(params);
    setActiveActionName("Generating complete blueprint");
    try {
      const res = await planTrip(params);
      if (res && res.trip) {
        setGeneratedTrip(res.trip);
        setViewMode("result");
        setIsSaved(false);
      }
    } catch (err) {
      console.error("TripGenie Plan Error:", err);
    }
  };

  // 2. Trigger AI Actions (Optimize, Reduce Cost, Make Premium, Add Activities, Slow Down, Family Friendly)
  const handleAIAction = async (
    action:
      | "optimize"
      | "reduce_cost"
      | "make_premium"
      | "add_activities"
      | "slow_down"
      | "family_friendly"
  ) => {
    if (!generatedTrip) return;

    const actionLabels: Record<string, string> = {
      optimize: "Optimizing routes & eliminating transit bottlenecks",
      reduce_cost: "Finding smart cost reductions & budget swaps",
      make_premium: "Upgrading to 5★ suites & Business class",
      add_activities: "Adding curated hidden gems & masterclasses",
      slow_down: "Relaxing daily pacing & adding wellness downtime",
      family_friendly: "Making all venues child & stroller friendly",
    };

    setActiveActionName(actionLabels[action] || "Applying AI modification");

    const mergedParams: GenerateTripPlanParams = {
      destination: generatedTrip.destination,
      durationDays: generatedTrip.days.length,
      daysCount: generatedTrip.days.length,
      startDate: generatedTrip.startDate,
      endDate: generatedTrip.endDate,
      travelers: generatedTrip.travelersCount || 2,
      budget: generatedTrip.budgetTotal || "luxury",
      budgetLevel: String(generatedTrip.budgetTotal || "luxury"),
      aiAction: action,
      baseTrip: generatedTrip,
      specialRequirements: `Applied AI Modification: ${action}`,
    };

    setLastParams(mergedParams);

    try {
      const res = await planTrip(mergedParams);
      if (res && res.trip) {
        setGeneratedTrip(res.trip);
        setIsSaved(false);
        try {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        } catch {
          // ignore confetti fallback
        }
      }
    } catch (err) {
      console.error("AI Action Error:", err);
    }
  };

  // 3. Save Trip
  const handleSaveTrip = () => {
    if (!generatedTrip) return;
    addTrip(generatedTrip);
    setIsSaved(true);
    setShowSaveToast(true);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => setShowSaveToast(false), 4000);
  };

  // 4. Share Trip
  const handleShareTrip = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div id="tripgenie-container" className="w-full space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                TripGenie AI
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                Autonomous v3.7
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant end-to-end trip synthesis, smart pricing, and continuous itinerary intelligence.
            </p>
          </div>
        </div>

        {/* View Switcher & Quick Navigation */}
        <div className="flex items-center gap-2">
          {viewMode === "result" && (
            <button
              id="tripgenie-new-plan-btn"
              onClick={() => setViewMode("form")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Plan</span>
            </button>
          )}

          {generatedTrip && viewMode === "form" && (
            <button
              id="tripgenie-view-active-btn"
              onClick={() => setViewMode("result")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View Generated Trip ({generatedTrip.destination.split(",")[0]})</span>
            </button>
          )}

          {onViewChange && (
            <button
              onClick={() => onViewChange("workspace")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Switch to AI Concierge Chat ➔
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-4 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              <strong>AI Generation Issue:</strong>{" "}
              {typeof error === "string" ? error : (error as any)?.message || "An unexpected issue occurred while generating the plan."}
            </span>
          </div>
          <button
            onClick={async () => {
              setIsRetrying(true);
              try {
                await retry();
              } finally {
                setIsRetrying(false);
              }
            }}
            disabled={isRetrying}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Retrying..." : "Retry Request"}</span>
          </button>
        </div>
      )}

      {/* FULL-SCREEN OR INLINE LOADING STATE WITH CANCEL */}
      {loading && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-in fade-in">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900/50 animate-ping opacity-30" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              TripGenie AI is Crafting Your Journey
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold h-5">
              {LOADING_MILESTONES[progressStep] || LOADING_MILESTONES[0]}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            {LOADING_MILESTONES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === progressStep
                    ? "w-8 bg-blue-600"
                    : i < progressStep
                    ? "w-3 bg-emerald-500"
                    : "w-3 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Cancel button */}
          <div className="pt-2">
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition inline-flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Generation</span>
            </button>
          </div>
        </div>
      )}

      {/* FORM VIEW */}
      {!loading && viewMode === "form" && (
        <TripGenieForm
          onSubmit={handleFormSubmit}
          isLoading={loading}
          initialValues={{
            destination: generatedTrip?.destination || "Kyoto, Japan",
            startDate: generatedTrip?.startDate || "2026-09-12",
            endDate: generatedTrip?.endDate || "2026-09-19",
            durationDays: generatedTrip?.days?.length || 7,
            budgetTier: "luxury",
            budgetAmount: generatedTrip?.budgetTotal || 5500,
          }}
        />
      )}

      {/* RESULT DISPLAY VIEW */}
      {!loading && viewMode === "result" && generatedTrip && (
        <TripGenieDisplay
          trip={generatedTrip}
          onAIAction={handleAIAction}
          onSaveTrip={handleSaveTrip}
          onShareTrip={handleShareTrip}
          onEditInputs={() => setViewMode("form")}
          isActionLoading={loading}
          activeActionName={activeActionName}
          isSaved={isSaved}
        />
      )}

      {/* SHARE MODAL */}
      {generatedTrip && (
        <TripGenieShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          trip={generatedTrip}
        />
      )}

      {/* SAVE TOAST BANNER */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-slate-700 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Trip Saved Successfully!</h4>
              <p className="text-[11px] text-slate-300">
                Added to your active trips & itinerary storage.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModule("trips")}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex-shrink-0"
          >
            View in My Trips
          </button>
        </div>
      )}
    </div>
  );
}
