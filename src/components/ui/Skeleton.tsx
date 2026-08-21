import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  aiThemed?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, aiThemed = false, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl",
        aiThemed
          ? "bg-gradient-to-r from-purple-200/50 via-purple-300/60 to-purple-200/50 dark:from-purple-950/40 dark:via-purple-900/40 dark:to-purple-950/40"
          : "bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded-md",
            i === lines - 1 ? "w-3/5" : i === 0 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<{ size?: "sm" | "md" | "lg" | "xl"; className?: string }> = ({
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };
  return <Skeleton className={cn("rounded-full shrink-0", sizeClasses[size], className)} />;
};

export const SkeletonFlightCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-4 items-center py-2">
        <div className="space-y-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-1 w-full" />
          <Skeleton className="h-2 w-12" />
        </div>
        <div className="space-y-1 text-right flex flex-col items-end">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonTripCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    </div>
  );
};

export const SkeletonDestinationCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden space-y-3", className)}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonExperienceCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden", className)}>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const AISkeletonLoader: React.FC<{ className?: string; defaultMessage?: string }> = ({ 
  className, 
  defaultMessage = "TRAVELVERSE is thinking..." 
}) => {
  const messages = [
    "TRAVELVERSE is thinking...",
    "Building your journey...",
    "Comparing travel options...",
    "Optimizing pricing variables...",
    "Locating premium flight slots..."
  ];

  const [messageIdx, setMessageIdx] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-150/40 dark:border-indigo-900/40 space-y-4 animate-pulse", className)}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <span className="h-4 w-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
        </div>
        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 transition-all duration-300">
          {messages[messageIdx]}
        </span>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
};

