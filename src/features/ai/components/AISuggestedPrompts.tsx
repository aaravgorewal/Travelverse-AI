import React from "react";
import { Sparkles, ArrowRight, DollarSign, Clock, Users, Compass, HelpCircle } from "lucide-react";
import { DEFAULT_SUGGESTED_PROMPTS } from "../types";

interface AISuggestedPromptsProps {
  prompts?: string[];
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const AISuggestedPrompts: React.FC<AISuggestedPromptsProps> = ({
  prompts = DEFAULT_SUGGESTED_PROMPTS,
  onSelectPrompt,
  disabled = false,
}) => {
  const getPromptIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("plan")) return <Compass className="w-3.5 h-3.5 text-blue-500" />;
    if (lower.includes("hotel") || lower.includes("cheaper")) return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
    if (lower.includes("optimize") || lower.includes("itinerary")) return <Clock className="w-3.5 h-3.5 text-purple-500" />;
    if (lower.includes("family")) return <Users className="w-3.5 h-3.5 text-amber-500" />;
    if (lower.includes("book first") || lower.includes("priority")) return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    return <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Suggested Prompts</span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
          1-click smart queries
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="group shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
          >
            {getPromptIcon(prompt)}
            <span>{prompt}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all opacity-70 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
};
