import React, { useEffect } from "react";
import {
  Bell, CheckCircle2, Plane, AlertTriangle, FileText, DollarSign, 
  Trash2, Check, Shield, Info, Building2, CreditCard, Sparkles, Sliders
} from "lucide-react";
import { useNotificationStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { AppModule } from "../../types";
import { Button, Card, Badge } from "../../components/ui";

export const NotificationsView: React.FC = () => {
  const { 
    notifications, unreadCount, markAsRead, markAllRead, deleteNotification, subscribe 
  } = useNotificationStore();
  const { setModule } = useUIStore();

  useEffect(() => {
    // Subscription layer for future WebSocket/push support:
    // Simply registers a clean log callback. In production, this would open
    // a WS connection and dispatch addNotification() upon payload arrival.
    console.log("Initializing DocuSwift WebSocket/Push Subscription Channel...");
    const unsubscribe = subscribe((updatedNotifs) => {
      console.log("WebSocket Broadcaster updated notifications database:", updatedNotifs.length);
    });
    
    return () => {
      console.log("Terminating WebSocket channels.");
      unsubscribe();
    };
  }, [subscribe]);

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "ai":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "flight":
        return <Plane className="w-5 h-5 text-blue-500" />;
      case "hotel":
        return <Building2 className="w-5 h-5 text-indigo-500" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-teal-500" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "system":
        return <Sliders className="w-5 h-5 text-slate-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Real-Time Travel Radar</Badge>
            {unreadCount > 0 && <Badge variant="danger">{unreadCount} Unread</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Notifications & Alerts
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            hoverEffect
            className={`p-5 relative group transition-all ${
              notif.read
                ? "opacity-75 bg-white dark:bg-slate-900"
                : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
            }`}
          >
            <div className="flex items-start gap-4 pr-12">
              <div 
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.linkModule) setModule(notif.linkModule as AppModule);
                }}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div 
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.linkModule) setModule(notif.linkModule as AppModule);
                  }}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{notif.time}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>

                {notif.linkModule && (
                  <button 
                    onClick={() => {
                      markAsRead(notif.id);
                      setModule(notif.linkModule as AppModule);
                    }}
                    className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 hover:underline text-left"
                  >
                    View in {notif.linkModule.toUpperCase()} Module →
                  </button>
                )}
              </div>
            </div>

            {/* Delete button positioned absolute on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notif.id);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-bold">No notifications</p>
            <p className="text-xs">Your radar is clear. We'll alert you here when changes occur.</p>
          </div>
        )}
      </div>
    </div>
  );
};
