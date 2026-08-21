import React from "react";
import { cn } from "../../lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
  badge?: string;
  ai?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "pills" | "underline" | "segmented" | "cards";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs px-4 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2.5 font-semibold",
  };

  if (variant === "underline") {
    return (
      <div className={cn("flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center pb-3 pt-1 border-b-2 font-bold transition-all relative whitespace-nowrap cursor-pointer",
                sizeClasses[size],
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {tab.ai && <span className="text-amber-400 text-xs">✦</span>}
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                sizeClasses[size],
                isActive
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab.ai && <span className="text-purple-500 text-xs">✦</span>}
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Pills variant
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center font-bold rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap",
              sizeClasses[size],
              isActive
                ? tab.ai
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-700/40"
            )}
          >
            {tab.ai && <span className="text-amber-300 text-xs">✦</span>}
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase bg-amber-500 text-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
