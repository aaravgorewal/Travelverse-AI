import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button, Badge } from "../ui";
import { useTripStore } from "../../stores/useTravelStore";

export const OfflineGuardian: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // We can just trigger a re-render/re-sync of store if we had an API.
  // The Zustand persist middleware automatically saves state changes to localStorage.
  const { trips } = useTripStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    const savedSync = localStorage.getItem("travelverse-last-synced");
    if (savedSync) setLastSynced(savedSync);
    else updateSyncTime(); // initial sync

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update sync time whenever trips change and we are online
  useEffect(() => {
    if (isOnline) {
      updateSyncTime();
    }
  }, [trips, isOnline]);

  const updateSyncTime = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSynced(now);
    localStorage.setItem("travelverse-last-synced", now);
  };

  const handleSyncNow = () => {
    if (!isOnline) return;
    setIsSyncing(true);
    // Simulate API sync for offline guardian
    setTimeout(() => {
      updateSyncTime();
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-500">
      
      {!isOnline && (
        <div className="mb-2 pointer-events-auto">
          <Badge variant="danger" className="shadow-lg shadow-red-500/20 px-3 py-1.5 flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Offline Mode Active</span>
          </Badge>
        </div>
      )}

      <div className="pointer-events-auto bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-medium">Itinerary & Docs Available</span>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-700" />

        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
          <span>Last Synced:</span>
          <span className="text-slate-200">{lastSynced || "Just now"}</span>
        </div>

        {isOnline && (
          <>
            <div className="w-px h-4 bg-slate-700" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSyncNow} 
              disabled={isSyncing}
              className="h-6 px-2 text-[10px] hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 font-bold uppercase tracking-wider"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
              Sync Now
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
