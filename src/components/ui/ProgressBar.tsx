import React from "react";
import { cn } from "../../lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 - 100
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "brand" | "ai" | "success" | "warning" | "danger" | "luxury";
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  value = 0,
  max = 100,
  label,
  showValue = false,
  variant = "brand",
  size = "md",
  indeterminate = false,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const fillStyles = {
    brand: "bg-gradient-to-r from-blue-600 to-indigo-600",
    ai: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500",
    warning: "bg-gradient-to-r from-amber-500 to-yellow-500",
    danger: "bg-gradient-to-r from-rose-500 to-red-600",
    luxury: "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600",
  };

  return (
    <div className={cn("w-full space-y-1.5 text-left", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            {variant === "ai" && <span className="text-purple-500 text-xs">✦</span>}
            {label && <span>{label}</span>}
          </div>
          {showValue && (
            <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            fillStyles[variant],
            indeterminate && "w-2/5 animate-[shimmer_1.5s_infinite_linear]"
          )}
          style={{ width: indeterminate ? undefined : `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface StepProgressProps {
  steps: { id: string | number; title: string; subtitle?: string }[];
  currentStepIndex: number;
  className?: string;
  aiThemed?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStepIndex,
  className,
  aiThemed = false,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Connector Line behind steps */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        <div
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500 -z-0",
            aiThemed
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-blue-600"
          )}
          style={{
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ring-4 ring-white dark:ring-slate-900 shadow-sm",
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? aiThemed
                      ? "bg-gradient-to-tr from-purple-600 to-pink-600 text-white ring-purple-100 dark:ring-purple-950 scale-110 shadow-purple-500/30 shadow-md"
                      : "bg-blue-600 text-white ring-blue-100 dark:ring-blue-950 scale-110 shadow-blue-500/30 shadow-md"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                )}
              >
                {isCompleted ? "✓" : isCurrent && aiThemed ? "✦" : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-bold text-center whitespace-nowrap",
                  isCurrent
                    ? "text-slate-900 dark:text-white"
                    : isCompleted
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-slate-400"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface CircularProgressProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  variant?: "brand" | "ai" | "success" | "luxury";
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 72,
  strokeWidth = 6,
  variant = "brand",
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  const strokeColors = {
    brand: "stroke-blue-600",
    ai: "stroke-purple-500",
    success: "stroke-emerald-500",
    luxury: "stroke-amber-500",
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-800 fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-700 ease-out", strokeColors[variant])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
          {Math.round(value)}%
        </span>
        {label && <span className="text-[9px] text-slate-400 font-semibold">{label}</span>}
      </div>
    </div>
  );
};
