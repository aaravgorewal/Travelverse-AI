import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "accent"
    | "luxury"
    | "ai"
    | "ai-outline"
    | "ai-ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
  aiSymbol?: boolean;
  rounded?: "default" | "pill" | "full" | "none";
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      aiSymbol = false,
      rounded = "default",
      icon,
      iconLeft,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

    const roundedStyles = {
      default: "rounded-xl",
      pill: "rounded-full",
      full: "rounded-full",
      none: "rounded-none",
    };

    const variantStyles = {
      default:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus:ring-blue-500 border border-blue-500/30",
      primary:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus:ring-blue-500 border border-blue-500/30",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-400 border border-slate-200/80 dark:border-slate-700",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 focus:ring-slate-400",
      ghost:
        "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/20 focus:ring-rose-500 border border-rose-500/30",
      accent:
        "bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 shadow-md shadow-teal-500/20 focus:ring-teal-500 border border-teal-400/30",
      luxury:
        "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700 shadow-md shadow-amber-500/25 focus:ring-amber-400 border border-amber-400/40 font-semibold tracking-wide",
      // AI Starlight & Neural Visual Language
      ai: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 focus:ring-purple-500 border border-purple-400/40 relative overflow-hidden font-semibold group",
      "ai-outline":
        "border border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 focus:ring-purple-400 shadow-sm",
      "ai-ghost":
        "bg-transparent text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 focus:ring-purple-400",
    };

    const sizeStyles = {
      xs: "text-xs px-3 py-1.5 gap-1.5 h-8 font-semibold",
      sm: "text-xs sm:text-sm px-3.5 py-2 gap-2 h-9 font-semibold",
      md: "text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11 font-semibold",
      lg: "text-base sm:text-lg px-6 py-3.5 gap-3 h-13 font-bold",
      xl: "text-lg sm:text-xl px-8 py-4 gap-3.5 h-15 font-bold tracking-tight",
      icon: "h-11 w-11 p-0",
    };

    const isAIVariant = variant.startsWith("ai");
    const showSymbol = aiSymbol || isAIVariant;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          roundedStyles[rounded],
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          <>
            {showSymbol && (
              <span className="text-amber-300 dark:text-amber-200 font-bold select-none text-xs transition-transform group-hover:rotate-45 duration-300">
                ✦
              </span>
            )}
            {(icon || iconLeft) && <span className="shrink-0">{icon || iconLeft}</span>}
            <span className="truncate">{children}</span>
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
