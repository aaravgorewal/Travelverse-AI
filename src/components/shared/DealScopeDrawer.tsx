import React, { useState } from "react";
import { 
  X, Check, AlertCircle, Sparkles, PlusCircle, ArrowRight, DollarSign, Clock, ShieldCheck, HelpCircle, TrendingUp, Briefcase
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTripStore, useTravelStore } from "../../stores/useTravelStore";
import { Button, Badge, Card } from "../ui";
import { formatCurrency } from "../../lib/utils";
import { aiService } from "../../services";

export const DealScopeDrawer: React.FC = () => {
  const { isDealScopeOpen, closeDealScope, dealScopeData } = useUIStore();
  const { user } = useAuthStore();
  const { currency } = useTravelStore();
  const { activeTrip, addActivityToTrip } = useTripStore();
  
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<{ rationale: string; pros: string[]; cons: string[] } | null>(null);

  if (!isDealScopeOpen) return null;

  const isAgent = user?.role === "agent" || user?.role === "admin";

  // Mock data to ensure we have a robust UI even if dealScopeData isn't perfectly structured
  const options = {
    cheapest: dealScopeData?.cheapest || {
      id: "opt-1",
      title: "Basic Saver Option",
      price: 850,
      savings: 150,
      rating: 3.8,
      duration: "14h 20m",
      cancellation: "Strict / Non-refundable",
      aiMatch: 72,
      margin: 45,
    },
    bestValue: dealScopeData?.bestValue || {
      id: "opt-2",
      title: "Smart Flex Plus",
      price: 1100,
      savings: 200,
      rating: 4.5,
      duration: "11h 05m",
      cancellation: "Free Cancellation (48h)",
      aiMatch: 95,
      margin: 120,
    },
    premium: dealScopeData?.premium || {
      id: "opt-3",
      title: "Ultra Premium Direct",
      price: 2400,
      savings: 0,
      rating: 4.9,
      duration: "9h 30m",
      cancellation: "Fully Flexible",
      aiMatch: 88,
      margin: 350,
    }
  };

  const handleExplainBestValue = async () => {
    setIsExplaining(true);
    setExplanation(null);
    try {
      const res = await aiService.explain({
        topic: "Why is Smart Flex Plus the Best Value?",
        context: "Comparing 3 travel options based on price, duration, and cancellation policies.",
      });
      setExplanation({
        rationale: res.explanation || "This option balances price with a significantly shorter duration and flexible cancellation.",
        pros: res.pros || ["Saves 3 hours", "Free cancellation", "High AI match score"],
        cons: res.cons || ["Slightly more expensive than basic"],
      });
    } catch {
      setExplanation({
        rationale: "Based on our AI analysis, this option offers the best balance of time saved versus cost, plus it includes flexible cancellation which travelers value highly in this market.",
        pros: ["Saves 3 hours", "Free cancellation", "High AI match score"],
        cons: ["Slightly more expensive than basic"],
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAddToSmartBundle = (option: any) => {
    if (activeTrip) {
      addActivityToTrip(activeTrip.id, 1, {
        id: `bundle-${Date.now()}`,
        time: "10:00",
        title: option.title,
        type: "flight",
        location: "DealScope Add-on",
        description: "Bundled via DealScope Comparison.",
        cost: option.price,
      });
      alert(`Added ${option.title} to your SmartBundle (Active Trip: ${activeTrip.title})`);
    } else {
      alert("No active trip to bundle with. Please create a trip first.");
    }
  };

  const MetricRow = ({ label, icon, valC, valB, valP, highlightIndex }: any) => (
    <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 dark:border-slate-800/60 items-center text-sm">
      <div className="font-semibold text-slate-500 flex items-center gap-2">
        {icon} <span className="hidden sm:inline">{label}</span>
      </div>
      <div className={`text-center font-medium ${highlightIndex === 0 ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400"}`}>{valC}</div>
      <div className={`text-center font-medium ${highlightIndex === 1 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}>{valB}</div>
      <div className={`text-center font-medium ${highlightIndex === 2 ? "text-purple-600 dark:text-purple-400 font-bold" : "text-slate-600 dark:text-slate-400"}`}>{valP}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={closeDealScope} />

      {/* Drawer */}
      <div className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-950 h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">DealScope AI</Badge>
              {isAgent && <Badge variant="warning">B2B Margin View Enabled</Badge>}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Compare Options
            </h2>
          </div>
          <button onClick={closeDealScope} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Headers Row */}
          <div className="grid grid-cols-4 gap-4 sticky top-0 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 z-10 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col justify-end text-sm text-slate-500 font-bold">Metrics</div>
            
            <Card className="p-4 text-center border-slate-200 dark:border-slate-800">
              <div className="mx-auto w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Cheapest</h3>
            </Card>

            <Card className="p-4 text-center border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 relative shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="warning" className="shadow-sm">★ Top Choice</Badge>
              </div>
              <div className="mx-auto w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-2 mt-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100">Best Value</h3>
            </Card>

            <Card className="p-4 text-center border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="mx-auto w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-900 dark:text-purple-100">Premium</h3>
            </Card>
          </div>

          {/* Comparison Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <MetricRow 
              label="Total Price" icon={<DollarSign className="w-4 h-4" />} 
              valC={formatCurrency(options.cheapest.price, currency)} 
              valB={formatCurrency(options.bestValue.price, currency)} 
              valP={formatCurrency(options.premium.price, currency)} 
              highlightIndex={0} 
            />
            <MetricRow 
              label="Est. Savings" icon={<TrendingUp className="w-4 h-4" />} 
              valC={<span className="text-emerald-500">{formatCurrency(options.cheapest.savings, currency)}</span>} 
              valB={<span className="text-emerald-500">{formatCurrency(options.bestValue.savings, currency)}</span>} 
              valP="--" 
              highlightIndex={1} 
            />
            <MetricRow 
              label="Duration" icon={<Clock className="w-4 h-4" />} 
              valC={options.cheapest.duration} 
              valB={options.bestValue.duration} 
              valP={options.premium.duration} 
              highlightIndex={2} 
            />
            <MetricRow 
              label="Cancellation" icon={<ShieldCheck className="w-4 h-4" />} 
              valC={<span className="text-red-500 text-xs">{options.cheapest.cancellation}</span>} 
              valB={<span className="text-emerald-600 text-xs">{options.bestValue.cancellation}</span>} 
              valP={<span className="text-emerald-600 text-xs">{options.premium.cancellation}</span>} 
              highlightIndex={2} 
            />
            <MetricRow 
              label="AI Match Score" icon={<Sparkles className="w-4 h-4" />} 
              valC={`${options.cheapest.aiMatch}%`} 
              valB={<span className="text-amber-500 font-black">{options.bestValue.aiMatch}%</span>} 
              valP={`${options.premium.aiMatch}%`} 
              highlightIndex={1} 
            />
            
            {/* Agent Specific Margin Row */}
            {isAgent && (
              <MetricRow 
                label="B2B Margin" icon={<Briefcase className="w-4 h-4 text-blue-500" />} 
                valC={<span className="text-blue-600 dark:text-blue-400">{formatCurrency(options.cheapest.margin, currency)}</span>} 
                valB={<span className="text-blue-600 dark:text-blue-400">{formatCurrency(options.bestValue.margin, currency)}</span>} 
                valP={<span className="text-blue-600 dark:text-blue-400">{formatCurrency(options.premium.margin, currency)}</span>} 
                highlightIndex={2} 
              />
            )}
          </div>

          {/* AI Explain Flow */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-amber-500" /> ExplainMate Analysis
                </h3>
                {explanation ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      {explanation.rationale}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase">Pros</span>
                        <ul className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1 space-y-1 list-disc pl-4">
                          {explanation.pros.map(p => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-600 uppercase">Cons</span>
                        <ul className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 space-y-1 list-disc pl-4">
                          {explanation.cons.map(c => <li key={c}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Not sure why the middle option is tagged as "Best Value"? Let our AI analyze the trade-offs between price, duration, and flexibility.
                  </p>
                )}
              </div>
              
              {!explanation && (
                <Button 
                  onClick={handleExplainBestValue} 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"
                  isLoading={isExplaining}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Why Best Value?
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions - SmartBundle */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-4 gap-4">
          <div className="text-sm text-slate-500 flex flex-col justify-center">
            Select to bundle
          </div>
          <Button variant="outline" className="w-full text-xs" onClick={() => handleAddToSmartBundle(options.cheapest)}>
            <PlusCircle className="w-4 h-4 mr-1.5" /> Bundle Cheapest
          </Button>
          <Button className="w-full text-xs bg-amber-500 hover:bg-amber-600 text-slate-950" onClick={() => handleAddToSmartBundle(options.bestValue)}>
            <PlusCircle className="w-4 h-4 mr-1.5" /> Bundle Best Value
          </Button>
          <Button variant="outline" className="w-full text-xs" onClick={() => handleAddToSmartBundle(options.premium)}>
            <PlusCircle className="w-4 h-4 mr-1.5" /> Bundle Premium
          </Button>
        </div>
      </div>
    </div>
  );
};
