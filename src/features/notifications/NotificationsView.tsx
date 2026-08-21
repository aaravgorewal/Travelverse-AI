import React from "react";
import {
  Bell,
  CheckCircle2,
  Plane,
  AlertTriangle,
  FileText,
  DollarSign,
  Trash2,
  Check,
} from "lucide-react";
import { useNotificationStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { AppModule } from "../../types";
import { Button, Card, Badge } from "../../components/ui";

export const NotificationsView: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotificationStore();
  const { setModule } = useUIStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "gate_change":
      case "flight_delay":
        return <Plane className="w-5 h-5 text-amber-500" />;
      case "price_drop":
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "document_expiry":
        return <FileText className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
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
            Notifications & Flight Alerts
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
          <Check className="w-4 h-4" />
          <span>Mark All as Read</span>
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            hoverEffect
            onClick={() => {
              markAsRead(notif.id);
              if (notif.linkModule) setModule(notif.linkModule as AppModule);
            }}
            className={`p-5 cursor-pointer transition-all ${
              notif.read
                ? "opacity-75 bg-white dark:bg-slate-900"
                : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{notif.time}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>

                {notif.linkModule && (
                  <span className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                    View in {notif.linkModule.toUpperCase()} Module →
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
