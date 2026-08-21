import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated" | "glass" | "luxury" | "ai" | "ticket";
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  aiGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  hoverEffect = false,
  padding = "md",
  aiGlow = false,
  children,
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const variantStyles = {
    default:
      "border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100",
    flat:
      "border border-slate-200/60 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-100",
    elevated:
      "border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
    glass:
      "border border-white/40 bg-white/75 backdrop-blur-xl shadow-lg dark:border-slate-800/80 dark:bg-slate-900/75 dark:text-slate-100",
    luxury:
      "border border-amber-300/40 bg-gradient-to-b from-amber-500/5 via-slate-900/95 to-slate-950 text-white shadow-2xl shadow-amber-900/10 dark:border-amber-500/30",
    ai:
      "border border-purple-300/60 dark:border-purple-800/60 bg-gradient-to-b from-purple-50/40 via-white to-white dark:from-purple-950/20 dark:via-slate-900/90 dark:to-slate-900 shadow-lg shadow-purple-500/5 relative overflow-hidden dark:text-slate-100",
    ticket:
      "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md relative before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-6 before:h-6 before:rounded-full before:bg-slate-100 dark:before:bg-slate-950 after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-6 after:h-6 after:rounded-full after:bg-slate-100 dark:after:bg-slate-950",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200 relative",
        paddingStyles[padding],
        variantStyles[variant],
        hoverEffect && "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer",
        aiGlow && "shadow-lg shadow-purple-500/20 border-purple-500/40",
        className
      )}
      {...props}
    >
      {variant === "ai" && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      )}
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn("font-bold text-slate-900 dark:text-white text-lg tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={cn("text-xs text-slate-500 dark:text-slate-400 leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("space-y-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4", className)} {...props}>
    {children}
  </div>
);
