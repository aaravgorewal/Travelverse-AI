import React, { useState } from "react";
import {
  Calendar, Clock, MapPin, Sparkles, CloudSun, Utensils,
  Camera, Compass, ArrowRight, Plus, RefreshCw, MoreVertical,
  CheckCircle, Circle
} from "lucide-react";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { aiAPI } from "../../lib/api/ai";
import { formatCurrency } from "../../lib/utils";
import { useToast } from "../../components/ui/Toast";
import { PageHeader, ContextPanel, DataList, DataListItem, AIActionButton, StatusBadge } from "../../components/ui/SaaSCore";

export const ItineraryView: React.FC = () => {
  const { activeTrip, updateTrip } = useTripStore();
  const { setModule, toggleAIConcierge } = useUIStore();
  const { showToast } = useToast();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isOptimizing, setIsOptimizing] = useState(false);

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg max-w-4xl mx-auto mt-8">
        <Compass className="w-8 h-8 text-slate-400 mb-4" />
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">No active workspace</h3>
        <p className="text-sm text-slate-500 mb-6">Select a trip from your management dashboard to view its itinerary.</p>
        <button onClick={() => setModule("trips")} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm">Return to Trips</button>
      </div>
    );
  }

  const currentDay = activeTrip.days.find((d) => d.dayNumber === selectedDayNumber) || activeTrip.days[0];

  const handleOptimizeItinerary = async () => {
    setIsOptimizing(true);
    try {
      const res = await aiAPI.optimizeItinerary({ itinerary_id: activeTrip.id });
      if (res.data?.optimizedDays?.length > 0) {
        updateTrip({ ...activeTrip, days: res.data.optimizedDays });
        showToast({
          title: "Optimization Complete",
          message: `Saved transit time and optimized routes.`,
          type: "success"
        });
      }
    } catch (err: any) {
      showToast({ title: "Optimization Failed", message: "Could not optimize itinerary.", type: "error" });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <PageHeader
            title={activeTrip.title}
            description={`${activeTrip.destination}, ${activeTrip.country} • ${activeTrip.days.length} Days`}
            action={
              <div className="flex gap-2">
                <button
                  onClick={handleOptimizeItinerary}
                  disabled={isOptimizing}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                >
                  {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Optimize Route
                </button>
                <button onClick={toggleAIConcierge} className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  Ask Concierge
                </button>
              </div>
            }
          />

          {/* Day Tabs */}
          <div className="flex gap-1 overflow-x-auto mt-4">
            {activeTrip.days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedDayNumber === day.dayNumber
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300"
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentDay && (
            <div className="max-w-3xl mx-auto">
              
              {/* Day Header */}
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{currentDay.theme}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{currentDay.date}</p>
                </div>
                {currentDay.weatherForecast && (
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <CloudSun className="w-4 h-4 text-slate-400" />
                      {currentDay.weatherForecast.temp || currentDay.weatherForecast.tempC || 24}°C
                    </div>
                    {currentDay.weatherForecast.aiRecommendation && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 block mt-0.5">
                        {currentDay.weatherForecast.aiRecommendation}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline Items */}
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8 pb-8">
                {currentDay.activities.map((act, index) => (
                  <div key={act.id} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 transition-colors" />
                    
                    {/* Activity Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      
                      {/* Time Block */}
                      <div className="w-24 flex-shrink-0 pt-0.5">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{act.time}</span>
                        {act.duration && <span className="block text-xs text-slate-500">{act.duration}</span>}
                      </div>

                      {/* Content Panel */}
                      <div className="flex-1 min-w-0 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-4 shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{act.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              <span>{act.location}</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="w-4 h-4"/></button>
                          </div>
                        </div>

                        {act.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{act.description}</p>
                        )}

                        {act.costEstimate && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                            Est. {formatCurrency(act.costEstimate, activeTrip.currency)}
                          </div>
                        )}
                        
                        {act.aiInsight && (
                          <div className="mt-3 p-2 rounded-md bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 text-xs text-indigo-700 dark:text-indigo-300 flex gap-2">
                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{act.aiInsight}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Activity Button */}
              <div className="pl-11 mt-4">
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                  <Plus className="w-4 h-4" /> Add Activity
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Right Context Panel */}
      <ContextPanel title="Workspace Details" className="w-80 hidden lg:flex flex-shrink-0">
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Overview</h4>
            <DataList>
              <DataListItem label="Status" value={<StatusBadge status="success">Upcoming</StatusBadge>} />
              <DataListItem label="Budget" value={formatCurrency(activeTrip.budgetTotal || 0, activeTrip.currency)} />
              <DataListItem label="Travelers" value={`${activeTrip.travelersCount} Guests`} />
            </DataList>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Smart Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <span>Sync to Calendar</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <span>View Bookings</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </ContextPanel>
    </div>
  );
};
