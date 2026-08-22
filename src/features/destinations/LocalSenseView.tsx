import React, { useState } from "react";
import { Sparkles, MapPin, Globe2, Book, AlertTriangle, Coins, Utensils, Shield, Languages, Bus, ThumbsUp, Search, Filter, Compass, Plus, ArrowRight, RefreshCw } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { aiAPI } from "../../lib/api/ai";
import { PageHeader, DataList, DataListItem, ContextPanel, StatusBadge, AIActionButton } from "../../components/ui/SaaSCore";
import { useSEO } from "../../hooks/useSEO";

const DestinationMockData: Record<string, any> = {
  Tokyo: {
    language: "Japanese",
    currency: "Japanese Yen (¥)",
    culture: "Respectful, punctual, and group-oriented.",
    etiquette: "Bow when greeting, take off shoes indoors.",
    transport: "World-class train/subway network. Suica/Pasmo cards used.",
    food: "Sushi, Ramen, Tempura. Slurping noodles is a compliment.",
    tipping: "Not required and often considered rude.",
    safety: "Extremely safe, low crime rate.",
    rules: "No smoking on streets except designated areas.",
    phrases: ["Konnichiwa (Hello)", "Arigato (Thank you)"],
  },
  Paris: {
    language: "French",
    currency: "Euro (€)",
    culture: "Appreciation for art, food, and debate.",
    etiquette: "Say 'Bonjour' when entering a shop.",
    transport: "Extensive Metro system. Taxis and bikes available.",
    food: "Baguettes, cheese, wine, croissants.",
    tipping: "Service included, but rounding up is appreciated.",
    safety: "Generally safe, watch for pickpockets in tourist areas.",
    rules: "Always carry ID. Public transit tickets must be kept until exiting.",
    phrases: ["Bonjour (Hello)", "Merci (Thank you)"],
  },
};

const getDestinationData = (dest: string) => {
  return DestinationMockData[dest] || {
    language: "Local Language",
    currency: "Local Currency",
    culture: "Rich and diverse.",
    etiquette: "Be respectful to locals.",
    transport: "Public transit and taxis available.",
    food: "Try the local street food.",
    tipping: "Check local customs.",
    safety: "Exercise normal precautions.",
    rules: "Follow local laws.",
    phrases: ["Hello", "Thank you"],
  };
};

export const LocalSenseView: React.FC = () => {
  useSEO({
    title: "Destination Intelligence - TravelVerse AI",
    description: "Discover cultural insights, local tips, and AI-recommended travel spots.",
    path: "/destinations"
  });

  const { selectedDestinationId, setModule } = useUIStore();
  const destination = selectedDestinationId || "Tokyo";
  const data = getDestinationData(destination);

  const [activeAIAction, setActiveAIAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAIAction = async (action: string) => {
    setActiveAIAction(action);
    setIsLoading(true);
    setError(null);
    setAiResult(null);

    try {
      if (action === "culture") {
        const res = await aiAPI.explain({ topic: "Local Culture & Traditions", context_id: destination });
        setAiResult(res.message + "\n\n**Key Takeaways:**\n" + (res.data?.keyTakeaways || []).join("\n- "));
      } else if (action === "recommendations") {
        const res = await aiAPI.recommend({ preferences: { interests: ["all"] }, location: destination });
        const list = (res.data?.recommendations || []).map((r: any) => `**${r.title}**: ${r.aiRationale}`).join("\n\n");
        setAiResult(res.message + "\n\n" + list);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch AI insights.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <PageHeader
            title={`Destination Intelligence: ${destination}`}
            description="Operational overview, practical guidelines, and AI insights."
            action={
              <AIActionButton onClick={() => setModule("ai")}>
                <Plus className="w-4 h-4 mr-1" /> Start Planning Here
              </AIActionButton>
            }
          />

          <div className="flex gap-4 items-center mt-4">
            <div className="relative flex-1 sm:w-96 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search other destinations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button className="p-2 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-indigo-500" /> Practical Info
                </h3>
              </div>
              <DataList className="border-y-0">
                <DataListItem label="Language" value={data.language} />
                <DataListItem label="Currency" value={data.currency} />
                <DataListItem label="Transport" value={<span className="truncate max-w-[200px] inline-block" title={data.transport}>{data.transport}</span>} />
                <DataListItem label="Tipping" value={<span className="truncate max-w-[200px] inline-block" title={data.tipping}>{data.tipping}</span>} />
              </DataList>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> Safety & Rules
                </h3>
              </div>
              <DataList className="border-y-0">
                <DataListItem label="Safety Rating" value={<StatusBadge status="success">High Safety</StatusBadge>} />
                <DataListItem label="Key Rule" value={<span className="truncate max-w-[200px] inline-block" title={data.rules}>{data.rules}</span>} />
                <DataListItem label="Etiquette" value={<span className="truncate max-w-[200px] inline-block" title={data.etiquette}>{data.etiquette}</span>} />
              </DataList>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> AI Intelligence
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => runAIAction("culture")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${activeAIAction === "culture" ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}
              >
                Deep Dive: Culture
              </button>
              <button 
                onClick={() => runAIAction("recommendations")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${activeAIAction === "recommendations" ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}
              >
                Generate Recommendations
              </button>
            </div>

            {(isLoading || aiResult || error) && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing destination parameters...
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                    {aiResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ContextPanel title="Related Destinations" className="w-80 hidden lg:flex flex-shrink-0">
        <div className="space-y-2">
          {[
            { name: "Kyoto, Japan", match: "98% Match", icon: <Compass className="w-4 h-4 text-slate-400"/> },
            { name: "Seoul, South Korea", match: "85% Match", icon: <Compass className="w-4 h-4 text-slate-400"/> },
            { name: "Taipei, Taiwan", match: "82% Match", icon: <Compass className="w-4 h-4 text-slate-400"/> }
          ].map((dest, i) => (
            <button key={i} className="w-full flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 hover:border-indigo-300 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  {dest.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{dest.name}</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{dest.match}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </ContextPanel>
    </div>
  );
};
