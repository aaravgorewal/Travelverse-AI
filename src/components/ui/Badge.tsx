import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "blue"
    | "purple"
    | "teal"
    | "luxury"
    | "ai"
    | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  dot?: boolean;
  aiSymbol?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  dot = false,
  aiSymbol = false,
  onRemove,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700",
    info: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40 font-semibold",
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40 font-semibold",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 font-semibold",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 font-semibold",
    danger:
      "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40 font-semibold",
    purple:
      "bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40 font-semibold",
    teal:
      "bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40 font-semibold",
    luxury:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider",
    ai:
      "bg-gradient-to-r from-indigo-600/10 via-purple-600/15 to-pink-600/10 text-purple-700 dark:text-purple-300 border border-purple-400/40 font-bold shadow-xs",
    outline: "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent font-medium",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    purple: "bg-indigo-500",
    teal: "bg-teal-500",
    luxury: "bg-amber-500",
    ai: "bg-purple-500 animate-pulse",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.2 rounded-md font-semibold gap-1",
    sm: "text-xs px-2.5 py-0.5 rounded-lg font-medium gap-1.5",
    md: "text-sm px-3 py-1 rounded-xl font-semibold gap-1.5",
    lg: "text-base px-4 py-1.5 rounded-2xl font-bold gap-2",
  };

  const showAI = aiSymbol || variant === "ai";

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {showAI && (
        <span className="text-amber-400 font-bold text-xs select-none">✦</span>
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-75 focus:outline-none cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
