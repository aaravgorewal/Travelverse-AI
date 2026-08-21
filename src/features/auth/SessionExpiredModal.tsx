import React from "react";
import { AlertTriangle, LogIn, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card } from "../../components/ui";

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpired, clearSessionExpired } = useAuthStore();
  const { setModule } = useUIStore();

  if (!isSessionExpired) return null;

  const handleReLogin = () => {
    clearSessionExpired();
    setModule("auth");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <Card className="w-full max-w-md p-6 space-y-5 shadow-2xl border border-amber-500/30 dark:border-amber-500/20 animate-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-4 ring-amber-500/20 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Security Session Expired
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographic session lifetime threshold reached
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          Your active workstation authentication session has expired to protect your flight itineraries, payments, and private biometric travel data. Please sign in again to resume.
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            size="lg"
            className="w-full shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-500 text-white font-bold"
            onClick={handleReLogin}
            icon={<LogIn className="w-4 h-4" />}
          >
            Re-Authenticate Now
          </Button>
        </div>
      </Card>
    </div>
  );
};
