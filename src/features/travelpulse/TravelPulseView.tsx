import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, CloudRain, Plane, Car, Map, RefreshCw, Sparkles, CheckCircle2, AlertOctagon, TrendingUp, Info } from "lucide-react";
import { notificationService } from "../../services/appServices";
import { aiAPI } from "../../lib/api/ai";
import { NotificationItem } from "../../types";
import { useTripStore } from "../../stores/useTravelStore";
import { PageHeader, DataList, DataListItem, StatusBadge, AIActionButton, SaaSLoadingState, SaaSEmptyState } from "../../components/ui/SaaSCore";
import { useSEO } from "../../hooks/useSEO";

export const TravelPulseView: React.FC = () => {
  useSEO({
    title: "Travel Intelligence - TravelVerse AI",
    description: "Real-time travel alerts and intelligence.",
    path: "/intelligence"
  });

  const { activeTrip } = useTripStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<any>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const data = await notificationService.getNotifications();
      // Combine with mock live data since API might be sparse
      const dynamicAlerts: NotificationItem[] = [
        ...data,
        { id: "tp-1", title: "Heavy Traffic to Airport", message: "Accident on I-95 adds 45 mins to your route.", type: "flight_delay", time: "10 mins ago", read: false },
        { id: "tp-2", title: "Weather Alert", message: "Thunderstorms expected upon arrival.", type: "ai_recommendation", time: "1 hour ago", read: false },
        { id: "tp-3", title: "Activity Change", message: "Your guided tour has been moved to 2 PM due to rain.", type: "gate_change", time: "2 hours ago", read: false }
      ];
      setAlerts(dynamicAlerts);
    } catch (err: any) {
      setError(err.message || "Failed to load TravelPulse data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAskAI = async () => {
    setIsAskingAI(true);
    setAiAdvice(null);
    const contextStr = alerts.map(a => `[${a.title}]: ${a.message}`).join("\n");
    try {
      const res = await aiAPI.chat({
        context: { user_id: "agent", role: "agent" },
        message: `Analyze these alerts: \n${contextStr}\n\nReturn JSON exactly with keys: "whatChanged" (string), "whyItMatters" (string), "recommendedAction" (string)`,
        agentPersona: "Crisis Management Travel Concierge"
      });
      try {
         // Attempt to parse JSON response if AI cooperates
         const jsonMatch = res.message.match(/\{[\s\S]*\}/);
         if (jsonMatch) {
           setAiAdvice(JSON.parse(jsonMatch[0]));
         } else {
           setAiAdvice({ whatChanged: "Multiple alerts detected.", whyItMatters: res.message, recommendedAction: "Review alerts manually." });
         }
      } catch (e) {
         setAiAdvice({ whatChanged: "System detected anomalies.", whyItMatters: res.message, recommendedAction: "Monitor situation." });
      }
    } catch (err: any) {
      setAiAdvice({ whatChanged: "Error", whyItMatters: "Could not connect to AI Engine.", recommendedAction: "Try again later." });
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 pt-8">
      <PageHeader
        title="Travel Intelligence"
        description="Real-time tracking of disruptions, weather, and operational anomalies."
        action={
          <button onClick={fetchAlerts} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        }
      />

      {loading ? (
        <SaaSLoadingState message="Aggregating global intelligence feeds..." />
      ) : error ? (
        <SaaSEmptyState 
          icon={<AlertOctagon className="w-8 h-8" />}
          title="Intelligence Feed Offline" 
          description={error} 
          action={<button onClick={fetchAlerts} className="text-sm text-indigo-600 font-medium hover:underline">Retry Connection</button>} 
        />
      ) : alerts.length === 0 ? (
        <SaaSEmptyState 
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          title="All Clear" 
          description="No active disruptions, delays, or alerts for your upcoming journey." 
        />
      ) : (
        <div className="space-y-6">
          
          {/* Top Level Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Alerts</span>
                <Activity className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.length}</div>
              <div className="text-xs text-slate-500 mt-1">Requiring attention across your trip</div>
            </div>
            
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Risk Level</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">Elevated</div>
              <div className="text-xs text-slate-500 mt-1">Due to weather and transit delays</div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-center items-start">
              <span className="text-sm font-medium text-slate-500 mb-2">AI Analysis</span>
              <AIActionButton onClick={handleAskAI} disabled={isAskingAI} className="w-full">
                {isAskingAI ? "Analyzing Threats..." : "Analyze Impact"}
              </AIActionButton>
            </div>
          </div>

          {/* AI Insight Block */}
          {aiAdvice && (
            <div className="p-5 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-500 rounded-r-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Intelligence Briefing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-indigo-700/70 dark:text-indigo-400/70 uppercase mb-1">What Changed</span>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">{aiAdvice.whatChanged}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-indigo-700/70 dark:text-indigo-400/70 uppercase mb-1">Why It Matters</span>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200">{aiAdvice.whyItMatters}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-indigo-700/70 dark:text-indigo-400/70 uppercase mb-1">Recommended Action</span>
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{aiAdvice.recommendedAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Data List of Alerts */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Incident Log</h3>
            </div>
            <DataList className="border-y-0">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="mt-1">
                    {alert.title.toLowerCase().includes("traffic") ? <Car className="w-5 h-5 text-amber-500" /> :
                     alert.title.toLowerCase().includes("weather") ? <CloudRain className="w-5 h-5 text-blue-500" /> :
                     <AlertTriangle className="w-5 h-5 text-rose-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                      <span className="text-xs text-slate-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </DataList>
          </div>
        </div>
      )}
    </div>
  );
};
