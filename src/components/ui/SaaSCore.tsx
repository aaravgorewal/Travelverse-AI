import React from "react";
import { cn } from "../../lib/utils";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

/** 
 * SaaS UI Design System Components
 * Built for dense, data-heavy B2B/B2C travel intelligence workflows.
 */

/* ==========================================================================
   Typography & Layout Hierarchy
   ========================================================================== */

export const PageHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode; className?: string }> = ({ title, description, action, className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h1>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const SectionHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode; className?: string }> = ({ title, description, action, className }) => (
  <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
    <div>
      <h2 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ==========================================================================
   Data Display
   ========================================================================== */

export const DataList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800", className)}>
    {children}
  </div>
);

export const DataListItem: React.FC<{ label: React.ReactNode; value: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ label, value, action, className }) => (
  <div className={cn("flex items-center justify-between py-3", className)}>
    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</span>
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-900 dark:text-slate-100">{value}</span>
      {action && <div>{action}</div>}
    </div>
  </div>
);

export const Metric: React.FC<{ label: string; value: string | number; trend?: { value: string; positive?: boolean }; className?: string }> = ({ label, value, trend, className }) => (
  <div className={cn("flex flex-col p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm", className)}>
    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</span>
      {trend && (
        <span className={cn("text-xs font-medium", trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
          {trend.value}
        </span>
      )}
    </div>
  </div>
);

/* ==========================================================================
   Status & Feedback
   ========================================================================== */

export const StatusBadge: React.FC<{ status: "success" | "warning" | "error" | "info" | "neutral"; children: React.ReactNode; className?: string }> = ({ status, children, className }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", styles[status], className)}>
      {children}
    </span>
  );
};

export const SaaSEmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({ title, description, action, icon, className }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50", className)}>
    {icon && <div className="mb-4 text-slate-400 dark:text-slate-500">{icon}</div>}
    <h3 className="text-sm font-medium text-slate-900 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const SaaSLoadingState: React.FC<{ message?: string; className?: string }> = ({ message = "Loading data...", className }) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
    <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

/* ==========================================================================
   Interactive Elements
   ========================================================================== */

export const AIActionButton: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
      "dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 dark:hover:bg-indigo-500/20",
      "disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
  >
    <Sparkles className="w-4 h-4" />
    {children}
  </button>
);

export const ContextPanel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("flex flex-col bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto", className)}>
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{title}</h3>
    </div>
    <div className="p-4 flex-1">
      {children}
    </div>
  </div>
);
