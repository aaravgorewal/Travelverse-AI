import React, { useState } from "react";
import { Sparkles, Send, Plane, Building2, Map, Car, ArrowRight, Loader2, RefreshCw, PlusCircle, CheckCircle2 } from "lucide-react";
import { aiService } from "../../../services";
import { TripPlan } from "../../../types";
import { Button, Card, Badge, Input } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

export const AgentCopilot: React.FC = () => {
  const [prompt, setPrompt] = useState("Create a 5-day Dubai package for a family of 4 under ₹2 lakh.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TripPlan | null>(null);
  const [margin, setMargin] = useState(15);
  const [currency] = useState("INR");

  React.useEffect(() => {
    const handlePrompt = (e: any) => {
      if (e.detail) setPrompt(e.detail);
    };
    window.addEventListener("agent-copilot-prompt", handlePrompt);
    return () => window.removeEventListener("agent-copilot-prompt", handlePrompt);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Primitive parsing of the prompt to feed the structured API
    const destMatch = prompt.match(/(dubai|paris|tokyo|london|bali|maldives)/i);
    const destination = destMatch ? destMatch[1] : "Custom Destination";
    
    const daysMatch = prompt.match(/(\d+)[- ]day/i);
    const durationDays = daysMatch ? parseInt(daysMatch[1]) : 7;
    
    const familyMatch = prompt.match(/family of (\d+)/i);
    const travelersCount = familyMatch ? parseInt(familyMatch[1]) : 2;

    try {
      const res = await aiService.planTrip({
        destination,
        durationDays,
        travelersCount,
        specialRequirements: prompt
      });
      setResult(res.trip);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotal = () => {
    if (!result || !result.costBreakdown) return 0;
    return result.costBreakdown.totalEstimated || 0;
  };

  const netTotal = calculateTotal();
  const marginAmount = netTotal * (margin / 100);
  const grossTotal = netTotal + marginAmount;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">B2B Copilot Engine</h2>
          <p className="text-sm text-slate-500">Generate complex itineraries from natural language instructions.</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-2">
        <Input 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="E.g., Create a 5-day Dubai package for a family of 4 under ₹2 lakh." 
          className="flex-1 bg-white dark:bg-slate-900 text-sm py-5 px-4 rounded-xl shadow-sm border-slate-200 dark:border-slate-800"
        />
        <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 shrink-0 h-auto" isLoading={isGenerating}>
          <Sparkles className="w-4 h-4 mr-2" /> 
          Generate Package
        </Button>
      </form>

      {isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <h3 className="font-bold">Analyzing request & querying GDS...</h3>
          <p className="text-sm">Mapping best flights, hotels, and markup calculations.</p>
        </div>
      )}

      {result && !isGenerating && (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 overflow-hidden">
          
          {/* Structured Results */}
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
            
            {/* Customer Understanding */}
            <Card className="p-5 border-l-4 border-l-indigo-500">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider text-indigo-500">AI Requirement Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Identified a request for a <strong>{result.days.length}-day</strong> trip to <strong>{result.destination}</strong> for <strong>{result.travelersCount} travelers</strong>.
                Optimizing for value, direct flights where possible, and family-friendly accommodations.
              </p>
              {result.aiRationale && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{result.aiRationale}"</p>
              )}
            </Card>

            {/* Inventory Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Flights */}
              <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
                  <Plane className="w-4 h-4 text-blue-500" /> Suggested Flights
                </h4>
                {result.flights && result.flights.length > 0 ? (
                  result.flights.map(f => (
                    <div key={f.id} className="text-sm border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                        <span>{f.airline}</span>
                        <span>{formatCurrency(f.pricePerPerson * result.travelersCount, currency)}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <span>{f.fromCode}</span>
                        <ArrowRight className="w-3 h-3 mx-1" />
                        <span>{f.toCode}</span>
                        <span className="mx-2">•</span>
                        <span>{f.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No flights securely matched. Require manual GDS mapping.</p>
                )}
              </Card>

              {/* Hotels */}
              <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-emerald-500" /> Accommodation
                </h4>
                {result.hotels && result.hotels.length > 0 ? (
                  result.hotels.map(h => (
                    <div key={h.id} className="text-sm border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                        <span>{h.name} <span className="text-amber-500 text-xs">{"★".repeat(h.stars)}</span></span>
                        <span>{formatCurrency(h.totalPrice, currency)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{h.nights} Nights • {h.roomType}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Standard API fallback hotel used.</p>
                )}
              </Card>

              {/* Activities */}
              <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
                  <Map className="w-4 h-4 text-amber-500" /> Curated Activities
                </h4>
                <div className="space-y-2">
                  {result.days.slice(0, 3).map(d => (
                    d.activities.slice(0, 1).map((a, i) => (
                      <div key={i} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold block text-slate-700 dark:text-slate-200">{a.title}</span>
                        <span className="text-slate-500">{a.description.slice(0, 60)}...</span>
                      </div>
                    ))
                  ))}
                  <div className="text-[10px] text-amber-500 font-bold uppercase mt-2">+{result.days.length * 2 - 3} more activities mapped in itinerary</div>
                </div>
              </Card>

              {/* Transfers */}
              <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white">
                  <Car className="w-4 h-4 text-rose-500" /> Transfers & Transport
                </h4>
                {result.transportation && result.transportation.length > 0 ? (
                  result.transportation.map(t => (
                    <div key={t.id} className="text-sm border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200">
                        <span>{t.title}</span>
                        <span>{formatCurrency(t.cost, currency)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{t.type.replace("_", " ")}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Standard airport transfers included via local DMC.</p>
                )}
              </Card>

            </div>
          </div>

          {/* Pricing & Actions Sidebar */}
          <div className="w-full xl:w-80 shrink-0 space-y-4">
            <Card className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 space-y-4">
              <h3 className="font-black text-indigo-900 dark:text-indigo-200">Quote & Margin</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Net Inventory Cost</span>
                  <span className="font-bold">{formatCurrency(netTotal, currency)}</span>
                </div>
                
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                  <span>Margin Override</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={margin} 
                      onChange={(e) => setMargin(Number(e.target.value))} 
                      className="w-16 p-1 text-right rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <span>Expected Commission</span>
                  <span>{formatCurrency(marginAmount, currency)}</span>
                </div>

                <div className="pt-3 mt-3 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">Client Package Total</span>
                  <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">{formatCurrency(grossTotal, currency)}</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Book Package Instantly
              </Button>
              <Button variant="outline" className="w-full justify-start border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Send className="w-4 h-4 mr-2" /> Send to Customer (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="w-4 h-4 mr-2" /> Build / Save Draft Package
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" /> Modify Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" /> Compare Alternatives
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
