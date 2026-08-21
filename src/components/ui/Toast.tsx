import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "info" | "warning" | "ai";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? (toast.type === "ai" ? 6000 : 4000);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200",
              t.type === "success" && "bg-white dark:bg-slate-900 border-emerald-500/30 text-slate-900 dark:text-white",
              t.type === "error" && "bg-white dark:bg-slate-900 border-rose-500/30 text-slate-900 dark:text-white",
              t.type === "warning" && "bg-white dark:bg-slate-900 border-amber-500/30 text-slate-900 dark:text-white",
              t.type === "info" && "bg-white dark:bg-slate-900 border-blue-500/30 text-slate-900 dark:text-white",
              t.type === "ai" && "bg-slate-950 border-purple-500/50 text-white shadow-purple-500/15"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
              {t.type === "ai" && (
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/30">
                  ✦
                </div>
              )}
            </div>

            <div className="flex-1 text-left space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold">{t.title}</p>
                {t.type === "ai" && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                    AI Insight
                  </span>
                )}
              </div>
              {t.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.message}
                </p>
              )}
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{t.action.label}</span> →
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      toasts: [],
      showToast: (t: Omit<ToastItem, "id">) => console.log("Toast:", t),
      removeToast: () => {},
    };
  }
  return context;
};
