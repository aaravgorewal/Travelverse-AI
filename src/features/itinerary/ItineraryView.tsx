import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CloudSun,
  Utensils,
  Camera,
  Compass,
  ArrowRight,
  Plus,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { aiAPI } from "../../lib/api/ai";
import { Button, Card, Badge } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";
import { useToast } from "../../components/ui/Toast";

export const ItineraryView: React.FC = () => {
  const { activeTrip, updateTrip } = useTripStore();
  const { setModule, toggleAIConcierge } = useUIStore();
  const { showToast } = useToast();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!activeTrip) {
    return (
      <div className="text-center py-20 space-y-4">
        <Compass className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold">No active trip selected</h2>
        <Button onClick={() => setModule("ai")}>Create Trip with AI</Button>
      </div>
    );
  }

  const currentDay = activeTrip.days.find((d) => d.dayNumber === selectedDayNumber) || activeTrip.days[0];

  const handleOptimizeItinerary = async () => {
    setIsOptimizing(true);
    try {
      const res = await aiAPI.optimizeItinerary({ trip_id: activeTrip!.id });
      if (res.data?.optimizedDays || [] && res.data?.optimizedDays.length > 0) {
        updateTrip({ ...activeTrip!, days: res.optimizedDays });
        showToast({
          title: "Itinerary Optimized",
          message: `Saved ${res.data?.timeSavedMinutes || 0} min transit time and ${res.data?.carbonSavedKg || 0}kg CO₂2.`,
          type: "success"
        });
      }
    } catch (err: any) {
      showToast({ title: "Optimization Failed", message: err.message || "Could not optimize itinerary. Please try again.", type: "error" });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Autonomous Schedule</Badge>
            <span className="text-xs font-semibold text-slate-400">Live Weather & Transit Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeTrip.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTrip.destination}, {activeTrip.country} • {activeTrip.days.length} Total Days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeItinerary}
            isLoading={isOptimizing}
            className="gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Re-Optimize Transit</span>
          </Button>

          <Button size="sm" onClick={toggleAIConcierge}>
            Ask Concierge
          </Button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeTrip.days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`flex flex-col items-start min-w-[130px] p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-102"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                Day {day.dayNumber}
              </span>
              <span className="text-xs font-bold truncate w-full mt-0.5">{day.theme}</span>
              <span className={`text-[10px] mt-1 ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                {day.activities.length} activities
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Timeline & Weather Header */}
      {currentDay && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Day {currentDay.dayNumber}: {currentDay.theme}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentDay.date}</p>
            </div>

            {currentDay.weatherForecast && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span className="font-bold">{currentDay.weatherForecast.temp || currentDay.weatherForecast.tempC || 24}°C</span>
                <span className="text-slate-400 capitalize">{currentDay.weatherForecast.condition}</span>
                {currentDay.weatherForecast.aiRecommendation && (
                  <span className="text-blue-600 dark:text-blue-400 text-[11px] font-semibold">{currentDay.weatherForecast.aiRecommendation}</span>
                )}
              </div>
            )}
          </div>

          {/* Activity Cards Timeline */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-[22px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {currentDay.activities.map((act, index) => (
              <div key={act.id} className="relative flex items-start gap-4 pl-2">
                {/* Timeline icon node */}
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-md ring-4 ring-white dark:ring-slate-900">
                  {index + 1}
                </div>

                <Card className="flex-1 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                        {act.time} {act.duration ? `• ${act.duration}` : ""}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{act.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">{act.type}</Badge>
                      {(act.estimatedCost !== undefined || act.cost !== undefined) && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {(act.estimatedCost ?? act.cost) === 0 ? "Free" : `$${act.estimatedCost ?? act.cost}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{act.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{act.location}</span>
                    </div>

                    {act.transitToNext && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        🚗 Next: {act.transitToNext}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
