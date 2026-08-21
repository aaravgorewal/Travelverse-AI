import React, { useEffect, useState } from "react";
import { 
  Activity, AlertTriangle, CloudRain, Plane, Car, Map, RefreshCw, Sparkles, X, 
  Calendar, Info, AlertOctagon, CheckCircle2 
} from "lucide-react";
import { notificationService } from "../../services/appServices";
import { aiService } from "../../services/aiService";
import { NotificationItem } from "../../types";
import { useTripStore } from "../../stores/useTravelStore";
import { Card, Button, Badge } from "../../components/ui";

type TripStage = "Before Trip" | "Travel Day" | "At Destination" | "Return";

export const TravelPulseView: React.FC = () => {
  const { activeTrip } = useTripStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  
  // AI Advice state
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiContextAlerts, setAiContextAlerts] = useState<NotificationItem[]>([]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay for loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = await notificationService.getNotifications();
      // Inject some mock traffic/weather/disruptions since backend might only have flight/payment
      const dynamicAlerts: NotificationItem[] = [
        ...data,
        {
          id: "tp-1", title: "Heavy Traffic to Airport", message: "Accident on I-95 adds 45 mins to your route.", type: "flight_delay", time: "10 mins ago", read: false
        },
        {
          id: "tp-2", title: "Weather Alert", message: "Thunderstorms expected upon arrival.", type: "ai_recommendation", time: "1 hour ago", read: false
        },
        {
          id: "tp-3", title: "Activity Change", message: "Your guided tour has been moved to 2 PM due to rain.", type: "gate_change", time: "2 hours ago", read: false
        }
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

  const categorizeAlert = (alert: NotificationItem): TripStage => {
    const text = (alert.title + " " + alert.message).toLowerCase();
    
    // Return
    if (text.includes("return") || text.includes("end of trip") || text.includes("checkout")) return "Return";
    // At Destination
    if (text.includes("weather") || text.includes("activity") || text.includes("tour") || alert.type === "ai_recommendation" || text.includes("disruption")) return "At Destination";
    // Travel Day
    if (alert.type.includes("flight") || alert.type === "gate_change" || text.includes("traffic") || text.includes("airport")) return "Travel Day";
    // Before Trip (Default/fallback for docs, payments)
    return "Before Trip";
  };

  const getStageIcon = (stage: TripStage) => {
    switch(stage) {
      case "Before Trip": return <Calendar className="w-5 h-5 text-indigo-500" />;
      case "Travel Day": return <Plane className="w-5 h-5 text-blue-500" />;
      case "At Destination": return <Map className="w-5 h-5 text-emerald-500" />;
      case "Return": return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
    }
  };

  const groupedAlerts = alerts.reduce((acc, alert) => {
    const stage = categorizeAlert(alert);
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(alert);
    return acc;
  }, {} as Record<TripStage, NotificationItem[]>);

  const stages: TripStage[] = ["Before Trip", "Travel Day", "At Destination", "Return"];

  const handleAskAI = async (stageAlerts: NotificationItem[]) => {
    setIsAskingAI(true);
    setAiAdvice(null);
    setAiContextAlerts(stageAlerts);
    
    const contextStr = stageAlerts.map(a => `[${a.title}]: ${a.message}`).join("\n");
    const tripContextStr = activeTrip ? `Trip to ${activeTrip.destination} from ${activeTrip.startDate} to ${activeTrip.endDate}.` : "Unknown Trip.";
    
    try {
      const res = await aiService.chat({
        message: `I have the following travel alerts and updates:\n${contextStr}\n\nTrip Context: ${tripContextStr}\n\nWhat should I do? Provide concise, actionable advice.`,
        agentPersona: "Crisis Management Travel Concierge"
      });
      setAiAdvice(res.reply);
    } catch (err: any) {
      setAiAdvice("Failed to get AI advice: " + err.message);
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-900 via-orange-900 to-amber-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <Badge variant="warning" className="bg-amber-500/20 text-amber-200 border-amber-400/30">Live Intelligence</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 animate-pulse" /> TravelPulse
          </h1>
          <p className="text-rose-100 max-w-2xl text-sm sm:text-base">
            Real-time tracking of flight updates, weather, traffic, and disruptions across your entire journey.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Activity className="w-12 h-12 animate-pulse text-amber-500 mb-4" />
          <h3 className="text-xl font-bold">Scanning Global Data...</h3>
          <p className="text-sm">Fetching flights, weather, and local traffic conditions.</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30">
          <AlertOctagon className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Intelligence Feed Offline</h3>
          <p className="text-sm mb-6">{error}</p>
          <Button onClick={fetchAlerts} variant="outline" className="border-red-200 hover:bg-red-100 dark:hover:bg-red-900/50">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">All Clear!</h3>
          <p className="text-sm text-center max-w-md">No active disruptions, delays, or alerts for your upcoming journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {stages.map(stage => {
              const stageAlerts = groupedAlerts[stage] || [];
              if (stageAlerts.length === 0) return null;

              return (
                <div key={stage} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {getStageIcon(stage)}
                      {stage}
                    </h2>
                    <Button size="sm" variant="outline" onClick={() => handleAskAI(stageAlerts)} className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> What Should I Do?
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    {stageAlerts.map(alert => (
                      <Card key={alert.id} className="p-4 border-l-4 border-l-amber-500 bg-white dark:bg-slate-950 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
                          {alert.type.includes("flight") ? <Plane className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                           alert.type.includes("weather") ? <CloudRain className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                           alert.type.includes("traffic") ? <Car className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                           <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{alert.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{alert.time}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* AI Advice Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-6 border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xl overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-300">AI Concierge Advice</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!isAskingAI && !aiAdvice ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-indigo-400/70 p-6">
                    <Info className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-medium">Click "What Should I Do?" on any stage to get AI-powered resolution steps and alternatives.</p>
                  </div>
                ) : isAskingAI ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-500">
                    <Activity className="w-10 h-10 animate-pulse mb-3" />
                    <p className="text-sm font-bold animate-pulse">Analyzing disruptions and finding solutions...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Context Analyzed:</div>
                    <ul className="list-disc pl-4 text-xs text-indigo-800/70 dark:text-indigo-300/70 space-y-1 mb-4">
                      {aiContextAlerts.map(a => <li key={a.id}>{a.title}</li>)}
                    </ul>
                    <div className="prose prose-sm dark:prose-invert prose-indigo max-w-none">
                      {aiAdvice}
                    </div>
                  </div>
                )}
              </div>
              
              {aiAdvice && (
                <div className="pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50 mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setAiAdvice(null)} className="text-indigo-600">
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
