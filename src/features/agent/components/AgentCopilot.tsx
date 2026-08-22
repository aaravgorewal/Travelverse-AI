import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useToast } from "../../../components/ui/Toast";
import { Button, Input, Card } from "../../../components/ui";
import { aiAPI, CopilotChatRequest } from "../../../lib/api/ai";
import { useAIAction } from "../../../hooks/useAIAction";

interface AIResponse {
  request_id: string;
  conversation_id: string;
  feature: string;
  message: string;
  data: any;
  actions: any[];
  sources: any[];
  warnings: string[];
  confidence: "high" | "medium" | "low";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AIResponse;
}

export const AgentCopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const { execute, status, error, reset } = useAIAction();
  
  const { token } = useAuthStore();
  const { showToast } = useToast();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "loading") return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const payload: CopilotChatRequest = {
      message: userMsg.content,
      agent_id: "agent",
      conversation_id: conversationId || undefined
    };

    execute(aiAPI.copilotChat, [payload], {
      onSuccess: (data, response) => {
        if (!conversationId && response.conversation_id) {
          setConversationId(response.conversation_id);
        }
        
        const assistantMsg: ChatMessage = {
          id: response.request_id,
          role: "assistant",
          content: response.message,
          response: response
        };
        
        setMessages(prev => [...prev, assistantMsg]);
      },
      onError: () => {
        // Error state is handled by the UI automatically
      }
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agent Copilot</h2>
          <p className="text-sm text-slate-500">Your AI assistant for search, quotes, and booking.</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <Sparkles className="w-12 h-12 text-indigo-200 mb-4" />
            <p className="font-bold">How can I assist you today?</p>
            <p className="text-sm max-w-sm mt-2">Try asking for a specific hotel recommendation, generating a quote, or building a custom package.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                
                <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{msg.content}</p>
                
                {/* Copilot Extended Data */}
                {msg.response && (
                  <div className="mt-4 space-y-3">
                    
                    {/* Warnings */}
                    {msg.response.warnings && msg.response.warnings.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded text-amber-700 dark:text-amber-400 text-xs flex flex-col gap-1">
                        {msg.response.warnings.map((w, i) => (
                          <span key={i} className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {w}</span>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    {msg.response.actions && msg.response.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {msg.response.actions.map((act, i) => (
                          <Button 
                            key={i} 
                            size="sm" 
                            variant="outline" 
                            className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            onClick={() => {
                              showToast({ title: "Action Clicked", message: "This would trigger the associated workflow.", type: "info" });
                            }}
                          >
                            {act.type === 'ui' ? act.widget : act.action} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Sources */}
                    {msg.response.sources && msg.response.sources.length > 0 && (
                      <div className="text-xs text-slate-500 pt-2 flex flex-wrap gap-2">
                        {msg.response.sources.map((src, i) => (
                          <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            <ExternalLink className="w-3 h-3" /> {src.name || src.url}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {status === 'loading' && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-sm text-slate-500">Agent Copilot is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="shrink-0 flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask Agent Copilot..." 
          className="flex-1 bg-white dark:bg-slate-900 text-sm py-5 px-4 rounded-xl shadow-sm border-slate-200 dark:border-slate-800"
        />
        <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 shrink-0 h-auto" disabled={status === 'loading' || !input.trim()}>
          <Send className="w-4 h-4" /> 
        </Button>
      </form>
    </div>
  );
};
