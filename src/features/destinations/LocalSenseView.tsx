import React, { useState, useEffect } from "react";
import { Sparkles, MapPin, Globe2, Book, AlertTriangle, Coins, Utensils, Shield, Languages, Bus, ThumbsUp, RefreshCw, X, FileText, Compass, Send } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { aiAPI } from "../../lib/api/ai";
import { Button, Card, Badge, Input } from "../../components/ui";

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

import { useSEO } from "../../hooks/useSEO";

export const LocalSenseView: React.FC = () => {
  useSEO({
    title: "Explore Global Destinations - TravelVerse AI",
    description: "Discover cultural insights, local tips, and AI-recommended travel spots.",
    path: "/destinations"
  });

  const { selectedDestinationId } = useUIStore();
  const destination = selectedDestinationId || "Tokyo"; // fallback
  const data = getDestinationData(destination);

  const [activeAIAction, setActiveAIAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationText, setTranslationText] = useState("");

  // Handle AI Actions
  const runAIAction = async (action: string, retry = false) => {
    setActiveAIAction(action);
    setIsLoading(true);
    setError(null);
    if (!retry) setAiResult(null);

    try {
      if (action === "culture") {
        const res = await aiAPI.explain({ topic: "Local Culture & Traditions", context_id: destination });
        setAiResult(res.message + "\n\n**Key Takeaways:**\n" + res.data?.keyTakeaways || [].join("\n- "));
      } else if (action === "phrases") {
        const res = await aiAPI.explain({ topic: "Essential Travel Phrases", context_id: destination });
        setAiResult(res.message);
      } else if (action === "avoid") {
        const res = await aiAPI.explain({ topic: "What to avoid doing", context_id: destination });
        setAiResult(res.data.explanation + "\n\n**Cons to watch out for:**\n" + res.data?.cons || [].join("\n- "));
      } else if (action === "recommendations") {
        const res = await aiAPI.recommend({ destination, interests: ["all"] });
        const list = res.data?.recommendations || [].map(r => `**${r.title}**: ${r.aiRationale}`).join("\n\n");
        setAiResult(res.message + "\n\n" + list);
      } else if (action === "translate") {
        if (!translationText.trim()) throw new Error("Please enter text to translate.");
        const res = await aiAPI.chat({ message: `Translate this to the local language of ${destination}: "${translationText}". Only provide the translation and pronunciation.`, context: { user_id: "agent", role: "agent", preferred_language: "English" } });
        setAiResult(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch AI insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30">Local Sense</Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{destination} Survival Guide</h1>
          <p className="text-emerald-100 max-w-2xl text-sm sm:text-base">
            Master the local culture, language, and unspoken rules before you even arrive. Powered by Travelverse AI context.
          </p>
        </div>
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <FactCard icon={<Languages className="w-5 h-5 text-indigo-500" />} title="Language" text={data.language} />
        <FactCard icon={<Coins className="w-5 h-5 text-amber-500" />} title="Currency" text={data.currency} />
        <FactCard icon={<Book className="w-5 h-5 text-rose-500" />} title="Culture" text={data.culture} />
        <FactCard icon={<ThumbsUp className="w-5 h-5 text-emerald-500" />} title="Etiquette" text={data.etiquette} />
        <FactCard icon={<Bus className="w-5 h-5 text-blue-500" />} title="Transport" text={data.transport} />
        <FactCard icon={<Utensils className="w-5 h-5 text-orange-500" />} title="Food" text={data.food} />
        <FactCard icon={<Coins className="w-5 h-5 text-cyan-500" />} title="Tipping" text={data.tipping} />
        <FactCard icon={<Shield className="w-5 h-5 text-green-500" />} title="Safety" text={data.safety} />
        <FactCard icon={<AlertTriangle className="w-5 h-5 text-red-500" />} title="Rules" text={data.rules} />
      </div>

      {/* AI Actions Area */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          AI Local Insights
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Button onClick={() => runAIAction("culture")} variant={activeAIAction === "culture" ? "primary" : "outline"} className="h-20 flex-col gap-2">
            <Globe2 className="w-6 h-6" /> Explain Culture
          </Button>
          <Button onClick={() => runAIAction("phrases")} variant={activeAIAction === "phrases" ? "primary" : "outline"} className="h-20 flex-col gap-2">
            <Languages className="w-6 h-6" /> Teach Phrases
          </Button>
          <Button onClick={() => runAIAction("avoid")} variant={activeAIAction === "avoid" ? "primary" : "outline"} className="h-20 flex-col gap-2">
            <AlertTriangle className="w-6 h-6" /> What To Avoid?
          </Button>
          <Button onClick={() => runAIAction("recommendations")} variant={activeAIAction === "recommendations" ? "primary" : "outline"} className="h-20 flex-col gap-2">
            <Compass className="w-6 h-6" /> Local Recs
          </Button>
          <Button onClick={() => { setActiveAIAction("translate"); setError(null); setAiResult(null); }} variant={activeAIAction === "translate" ? "primary" : "outline"} className="h-20 flex-col gap-2">
            <FileText className="w-6 h-6" /> Translate
          </Button>
        </div>

        {/* Action Result Panel */}
        {activeAIAction && (
          <Card className="p-6 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 capitalize flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                {activeAIAction.replace("-", " ")} - {destination}
              </h3>
              <button onClick={() => { setActiveAIAction(null); setAiResult(null); setError(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeAIAction === "translate" && (
              <div className="flex gap-2 mb-6">
                <Input
                  value={translationText}
                  onChange={(e) => setTranslationText(e.target.value)}
                  placeholder="Type something to translate..."
                  className="flex-1"
                  onKeyDown={(e: any) => e.key === 'Enter' && runAIAction("translate")}
                />
                <Button onClick={() => runAIAction("translate")} isLoading={isLoading}>
                  <Send className="w-4 h-4 mr-2" /> Translate
                </Button>
              </div>
            )}

            <div className="min-h-[150px] relative flex flex-col justify-center">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-500 animate-pulse bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
                  <Sparkles className="w-8 h-8 mb-2 animate-spin-slow" />
                  <span className="text-sm font-semibold">AI is analyzing {destination}...</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-4">{error}</p>
                  <Button variant="outline" onClick={() => runAIAction(activeAIAction, true)} className="border-red-200 text-red-600 hover:bg-red-100">
                    <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                </div>
              )}

              {aiResult && !isLoading && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  {aiResult}
                </div>
              )}

              {!aiResult && !isLoading && !error && activeAIAction !== "translate" && (
                <div className="text-center text-slate-500">
                  Ready to fetch insights for {destination}.
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const FactCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <Card hoverEffect className="p-5 border-slate-200/60 dark:border-slate-800/60 flex items-start gap-4">
    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 shadow-inner">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">{text}</p>
    </div>
  </Card>
);
