import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Pin,
  Clock,
  Sparkles,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { AIChatSession } from "../types";

interface AIConversationHistoryProps {
  sessions: AIChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
}

export const AIConversationHistory: React.FC<AIConversationHistoryProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
      {/* Header & New Chat Button */}
      <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              History
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {sessions.length} chats
          </span>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Chat</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past conversations..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1">
        {/* Pinned Section */}
        {pinnedSessions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500 px-2">
              <Pin className="w-3 h-3 fill-amber-500" />
              <span>Pinned Sessions</span>
            </div>
            {pinnedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => onSelectSession(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onTogglePin={() => onTogglePinSession(session.id)}
              />
            ))}
          </div>
        )}

        {/* Recent Sessions */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
            <Clock className="w-3 h-3" />
            <span>Recent Sessions</span>
          </div>
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => onSelectSession(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onTogglePin={() => onTogglePinSession(session.id)}
              />
            ))
          ) : (
            <div className="text-center py-6 px-3 text-slate-400 dark:text-slate-500 text-xs">
              {searchQuery ? "No matching conversations." : "No recent chats."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: AIChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer text-left border ${
        isActive
          ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-2xs font-semibold"
          : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
      }`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-1.5">
          {session.isPinned && (
            <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
          )}
          <h4 className="text-xs font-bold truncate leading-tight">
            {session.title || "Untitled Conversation"}
          </h4>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{session.updatedAt}</span>
          <span>•</span>
          <span className="truncate">{session.tripContext?.destination || "General"}</span>
        </div>
      </div>

      {/* Hover Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={session.isPinned ? "Unpin chat" : "Pin chat"}
          className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Pin className={`w-3 h-3 ${session.isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete chat"
          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
