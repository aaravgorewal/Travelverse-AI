import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, AlertOctagon, AlertTriangle, AlertCircle, Info, Sparkles, CheckCheck, 
  Mail, PhoneCall, RefreshCw, Loader2, CheckCircle2, Eye, EyeOff
} from "lucide-react";
import { Card, Badge, Button } from "../../../components/ui";

interface AgentAlert {
  id: string;
  type: "flight" | "price" | "weather" | "visa" | "inventory" | "booking" | "payment";
  priority: "Critical" | "High" | "Medium" | "Low";
  problem: string;
  customerName: string;
  tripTitle: string;
  timestamp: string;
  aiRecommendation: string;
  actionLabel: string;
  read: boolean;
  status: "active" | "resolved";
}

export const AgentAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Action Pending Map (tracks which alert's action button is loading)
  const [actionPendingMap, setActionPendingMap] = useState<Record<string, boolean>>({});

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/v1/agent/alerts");
      setAlerts(response.data);
    } catch (err) {
      console.error("Failed to fetch agent alerts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleToggleRead = async (id: string) => {
    try {
      const response = await axios.post(`/api/v1/agent/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a.id === id ? response.data : a));
    } catch (err) {
      console.error("Failed to toggle read state", err);
    }
  };

  const handleExecuteAction = async (id: string) => {
    setActionPendingMap(prev => ({ ...prev, [id]: true }));
    try {
      const response = await axios.post(`/api/v1/agent/alerts/${id}/action`);
      alert(response.data.message);
      
      // Update state to match resolved status returned by GDS backend
      setAlerts(prev => prev.map(a => a.id === id ? response.data.alert : a));
    } catch (err) {
      console.error("Failed to execute alert action", err);
    } finally {
      setActionPendingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (priorityFilter !== "All" && alert.priority !== priorityFilter) return false;
    if (typeFilter !== "All" && alert.type !== typeFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge variant="danger" className="gap-1"><AlertOctagon className="w-3.5 h-3.5" /> Critical</Badge>;
      case "High": return <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3.5 h-3.5" /> High</Badge>;
      case "Medium": return <Badge variant="purple" className="gap-1"><AlertCircle className="w-3.5 h-3.5" /> Medium</Badge>;
      default: return <Badge variant="default" className="gap-1"><Info className="w-3.5 h-3.5" /> Low</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case "flight": return "✈️";
      case "weather": return "⛈️";
      case "visa": return "🛂";
      case "price": return "🏷️";
      default: return "🔔";
    }
  };

  const unreadCriticalCount = alerts.filter(a => a.priority === "Critical" && !a.read && a.status === "active").length;

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in zoom-in-95">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple">Disruption Engine</Badge>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">Smart Disruption Desk</h2>
          <p className="text-sm text-slate-500">Monitor flights, visa holds, regional weather alerts and re-route clients instantly.</p>
        </div>

        {unreadCriticalCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            <span>{unreadCriticalCount} Unresolved Critical Disruptions Require Actions</span>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Critical", "High", "Medium", "Low"].map(pr => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                priorityFilter === pr
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200"
              }`}
            >
              {pr}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Alert Type</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="flight">Flight Cancellations</option>
            <option value="price">Price Drops</option>
            <option value="weather">Weather Alerts</option>
            <option value="visa">Visa Clearances</option>
          </select>
        </div>
      </div>

      {/* Alerts Stream */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
          <Loader2 className="w-10 h-10 animate-spin mb-2" />
          <p className="text-xs text-slate-500 font-bold">Scanning global disruption boards...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`p-5 border transition-all relative ${
                alert.status === "resolved" 
                  ? "opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" 
                  : !alert.read 
                  ? "border-l-4 border-l-red-500 border-slate-300 dark:border-slate-700 shadow-md bg-white dark:bg-slate-900" 
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left Side: Category Icon, Problem, and Affected Client info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-850">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(alert.priority)}
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {alert.status === "resolved" && <Badge variant="success" size="sm">Resolved</Badge>}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{alert.problem}</h4>
                    
                    <p className="text-xs text-slate-500">
                      Client: <span className="font-bold text-slate-700 dark:text-slate-300">{alert.customerName}</span> • Itinerary: <span className="font-semibold text-slate-700 dark:text-slate-300 italic">{alert.tripTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: Toggle Read and Action Buttons */}
                <div className="flex flex-row md:flex-col items-end gap-2 shrink-0 self-end md:self-start">
                  <button 
                    onClick={() => handleToggleRead(alert.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                    title={alert.read ? "Mark as Unread" : "Mark as Read"}
                  >
                    {alert.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* AI Recommendation Card Block (Rendered if active) */}
              {alert.status === "active" && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-350 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Advisor AI Assist Action
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">{alert.aiRecommendation}</p>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleExecuteAction(alert.id)}
                    isLoading={actionPendingMap[alert.id]}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs py-1.5 h-auto rounded-lg font-bold"
                  >
                    {alert.actionLabel}
                  </Button>
                </div>
              )}

            </Card>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold">Zero active disruptions found</p>
              <p className="text-xs">Congratulations! All transit streams are running green.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
