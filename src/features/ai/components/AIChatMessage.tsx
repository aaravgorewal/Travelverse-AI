import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Calendar,
  DollarSign,
  Hotel,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { AIChatMessageItem } from "../types";
import { useUIStore } from "../../../stores/useUIStore";

interface AIChatMessageProps {
  message: AIChatMessageItem;
  onFollowUpClick?: (prompt: string) => void;
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message,
  onFollowUpClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { setModule } = useUIStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio speech
    const cleanText = message.content
      .replace(/[#*`_~[\]()]/g, " ")
      .replace(/\|/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 sm:gap-4 w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}

      {/* Message Body */}
      <div
        className={`flex flex-col max-w-[88%] sm:max-w-[80%] lg:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {isUser ? "You" : "TravelVerse AI"}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {message.timestamp}
          </span>
        </div>

        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 prose-headings:font-bold prose-headings:tracking-tight prose-h3:text-base prose-h4:text-sm prose-p:leading-relaxed prose-table:border-collapse prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-800 prose-th:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:p-2 prose-ul:my-2 prose-li:my-0.5">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {/* Quick Action Shortcuts inside Assistant Message */}
          {!isUser && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy response"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                        Copied
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>

                {"speechSynthesis" in window && (
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    title={isSpeaking ? "Stop voice audio" : "Listen to audio narration"}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSpeaking
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 animate-pulse"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Voice Audio</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Action shortcuts based on conversation topics */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModule("hotels")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer"
                >
                  <Hotel className="w-3 h-3" />
                  <span>Hotels</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                </button>
                <button
                  type="button"
                  onClick={() => setModule("trips")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                >
                  <Compass className="w-3 h-3" />
                  <span>Itinerary</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Contextual Follow-up Chips */}
        {!isUser && message.suggestedPrompts && message.suggestedPrompts.length > 0 && onFollowUpClick && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.suggestedPrompts.slice(0, 3).map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => onFollowUpClick(prompt)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white shadow-xs">
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
    </div>
  );
};
