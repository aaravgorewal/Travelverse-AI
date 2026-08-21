import React from "react";
import { Compass, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  aiAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "ai" | "compact";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  icon,
  title,
  description,
  action,
  aiAction,
  variant = "default",
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 text-center flex flex-col items-center justify-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto",
        variant === "compact" && "p-6 sm:p-8 space-y-3",
        variant === "ai" && "border-purple-300/40 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform hover:scale-105",
          variant === "ai"
            ? "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/25"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        )}
      >
        {icon || (variant === "ai" ? <Sparkles className="w-7 h-7" /> : <Compass className="w-7 h-7" />)}
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(action || aiAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {action}
          {aiAction && (
            <Button
              variant="ai"
              size="sm"
              onClick={aiAction.onClick}
              className="gap-1.5"
            >
              <span>{aiAction.label}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
