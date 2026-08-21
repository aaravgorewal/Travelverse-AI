import React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger" | "ai" | "luxury";
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  description,
  icon,
  action,
  onClose,
  children,
  ...props
}) => {
  const variantStyles = {
    info: "bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/60 dark:text-blue-200",
    success:
      "bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-200",
    warning:
      "bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200",
    danger:
      "bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-200",
    ai: "bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border-purple-500/40 text-white shadow-lg shadow-purple-500/5",
    luxury:
      "bg-amber-950/40 border-amber-500/40 text-amber-100 dark:bg-amber-950/60 dark:border-amber-500/30",
  };

  const defaultIcons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    ai: (
      <div className="h-5 w-5 rounded-md bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
        ✦
      </div>
    ),
    luxury: <span className="text-amber-400 font-bold text-sm">★</span>,
  };

  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-2xl border flex items-start justify-between gap-3 text-left transition-all duration-150 relative",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        {icon || defaultIcons[variant]}

        <div className="space-y-1 flex-1">
          {title && (
            <h5 className="text-xs font-bold leading-none tracking-tight flex items-center gap-1.5">
              <span>{title}</span>
              {variant === "ai" && (
                <span className="text-[9px] font-mono uppercase bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded font-bold">
                  Autonomous Alert
                </span>
              )}
            </h5>
          )}
          {description && (
            <div className="text-xs opacity-90 leading-relaxed">{description}</div>
          )}
          {children && <div className="text-xs opacity-90 leading-relaxed">{children}</div>}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
