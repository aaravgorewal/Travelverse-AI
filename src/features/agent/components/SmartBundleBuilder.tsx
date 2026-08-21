import React, { useState } from "react";
import { 
  PackagePlus, Plane, Building2, Map, Car, Sparkles, AlertCircle, Save, Send, CheckCircle2, ChevronRight, X, Briefcase, RefreshCw, Loader2, ArrowRight
} from "lucide-react";
import { useTravelStore } from "../../../stores/useTravelStore";
import { useUIStore } from "../../../stores/useUIStore";
import { Button, Card, Badge, Modal } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { aiAPI } from "../../../lib/api/ai";
import { useToast } from "../../../components/ui/Toast";

interface BundleItem {
  id: string;
  type: "flight" | "hotel" | "experience" | "transfer" | "car";
  title: string;
  provider: string;
  cost: number;
  marginOverride?: number; // percentage
  status: "confirmed" | "draft" | "optimizing";
}

const MOCK_INITIAL_BUNDLE: BundleItem[] = [
  { id: "b1", type: "flight", title: "Business Class - JFK to DXB", provider: "Emirates", cost: 3500, marginOverride: 12, status: "draft" },
  { id: "b2", type: "hotel", title: "Burj Al Arab - 5 Nights", provider: "Jumeirah", cost: 6000, marginOverride: 15, status: "draft" },
  { id: "b3", type: "transfer", title: "Private Helicopter Transfer", provider: "HeliDubai", cost: 800, marginOverride: 10, status: "draft" },
  { id: "b4", type: "experience", title: "Private Desert Safari", provider: "Platinum Heritage", cost: 450, marginOverride: 20, status: "draft" },
];

export const SmartBundleBuilder: React.FC = () => {
  const { currency, setCheckoutItem } = useTravelStore();
  const { setModule } = useUIStore();
  const { showToast } = useToast();
  
  const [items, setItems] = useState<BundleItem[]>(MOCK_INITIAL_BUNDLE);
  const [globalMargin, setGlobalMargin] = useState<number>(15); // Global margin toggle
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiMatchScore, setAiMatchScore] = useState(88);
  const [showShareModal, setShowShareModal] = useState(false);
  const [optimizingMsg, setOptimizingMsg] = useState("");

  const calculateFinancials = () => {
    let baseCost = 0;
    let totalMarginAmount = 0;
    
    items.forEach(item => {
      baseCost += item.cost;
      const appliedMargin = item.marginOverride !== undefined ? item.marginOverride : globalMargin;
      totalMarginAmount += (item.cost * appliedMargin) / 100;
    });

    const clientTotal = baseCost + totalMarginAmount;
    const bundleSavings = baseCost > 5000 ? 250 : 0; // Mock standard bundle savings negotiated via GDS
    
    return { baseCost, totalMarginAmount, clientTotal: clientTotal - bundleSavings, bundleSavings };
  };

  const financials = calculateFinancials();

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAIOptimize = async (action: "cost" | "experience" | "balance") => {
    setIsOptimizing(true);
    setOptimizingMsg(
      action === "cost" ? "Finding cheaper alternatives in GDS..." :
      action === "experience" ? "Upgrading to premium vendors..." :
      "Balancing itinerary via AI..."
    );

    try {
      // Mocking AI optimization delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      if (action === "cost") {
        setItems(items.map(i => i.type === "hotel" ? { ...i, title: "Jumeirah Beach Hotel (Downgrade)", cost: i.cost * 0.7 } : i));
        setAiMatchScore(75);
      } else if (action === "experience") {
        setItems(items.map(i => i.type === "experience" ? { ...i, title: "Royal Desert Safari (Upgraded)", cost: i.cost * 1.5 } : i));
        setAiMatchScore(96);
      } else {
        setAiMatchScore(92);
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCheckout = () => {
    // Convert bundle to a mock TravelPackage for checkout
    const bundlePkg = {
      id: `bundle-${Date.now()}`,
      title: "Custom SmartBundle Trip",
      destination: "Multiple",
      country: "Global",
      price: financials.clientTotal, // Client pays the gross amount
      days: 5,
      nights: 5,
      images: [],
      rating: 5,
      reviewsCount: 0,
      travelStyle: "custom",
      tagline: "Agent Crafted Custom Bundle",
      highlights: items.map(i => i.title),
      included: items.map(i => i.title),
      notIncluded: [],
      itinerarySummary: [],
      departureDates: [new Date().toISOString()]
    };
    
    setCheckoutItem({
      type: "package",
      item: bundlePkg,
      travelers: 1, // Base assumption
      dates: { start: new Date().toISOString() },
      totalPrice: financials.clientTotal,
    });
    setModule("payments");
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "flight": return <Plane className="w-4 h-4 text-blue-500" />;
      case "hotel": return <Building2 className="w-4 h-4 text-emerald-500" />;
      case "transfer": return <Car className="w-4 h-4 text-rose-500" />;
      case "car": return <Car className="w-4 h-4 text-orange-500" />;
      case "experience": return <Map className="w-4 h-4 text-amber-500" />;
      default: return <PackagePlus className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Agent SmartBundle</Badge>
            <Badge variant="success" className="gap-1"><Sparkles className="w-3 h-3" /> AI Active</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Package Builder</h2>
          <p className="text-sm text-slate-500">Construct, optimize, and quote complex multi-product itineraries.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Col: Canvas */}
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          
          {/* AI Optimization Toolbar */}
          <Card className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 flex flex-wrap items-center gap-2 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 mr-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> AI Actions
            </span>
            <Button size="sm" variant="outline" className="text-xs bg-white dark:bg-slate-900" onClick={() => handleAIOptimize("balance")} disabled={isOptimizing}>
              Optimize Flow
            </Button>
            <Button size="sm" variant="outline" className="text-xs bg-white dark:bg-slate-900 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAIOptimize("cost")} disabled={isOptimizing}>
              Reduce Total Cost
            </Button>
            <Button size="sm" variant="outline" className="text-xs bg-white dark:bg-slate-900 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleAIOptimize("experience")} disabled={isOptimizing}>
              Upgrade Experiences
            </Button>
          </Card>

          {isOptimizing && (
            <div className="p-8 flex flex-col items-center justify-center text-indigo-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="font-bold text-sm">{optimizingMsg}</p>
            </div>
          )}

          {/* Bundle Canvas Items */}
          {!isOptimizing && items.map((item, index) => (
            <Card key={item.id} className="p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative group transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
                {index + 1}
              </div>
              
              <div className="ml-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.title}
                      <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5 uppercase font-bold text-slate-400 border-slate-200 dark:border-slate-700">
                        {item.type}
                      </Badge>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Provider: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.provider}</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white text-lg">{formatCurrency(item.cost, currency)}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Net Cost</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!isOptimizing && items.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <PackagePlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-bold">Bundle is empty</p>
              <p className="text-sm">Search and add items from Flights, Hotels, or Experiences.</p>
            </div>
          )}

        </div>

        {/* Right Col: Financials & Actions */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card className="p-5 border border-slate-200 dark:border-slate-800 space-y-5 bg-white dark:bg-slate-900">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-slate-900 dark:text-white">SmartBundle Totals</h3>
                <Badge variant={aiMatchScore >= 90 ? "success" : "warning"} className="gap-1">
                  <Sparkles className="w-3 h-3" /> {aiMatchScore}% Match
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Based on client CRM preferences.</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Sum of Items (Net)</span>
                <span className="font-bold">{formatCurrency(financials.baseCost, currency)}</span>
              </div>
              
              <div className="flex justify-between items-center text-blue-700 dark:text-blue-400">
                <span className="flex items-center gap-1 cursor-help" title="Combined savings from GDS bulk mapping">
                  <ArrowRight className="w-3 h-3" /> Bundle Savings
                </span>
                <span className="font-bold">-{formatCurrency(financials.bundleSavings, currency)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Agent Margin</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={globalMargin} 
                    onChange={(e) => setGlobalMargin(Number(e.target.value))} 
                    className="w-14 p-1 text-right rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-xs font-bold"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <span>Expected Payout</span>
                <span>{formatCurrency(financials.totalMarginAmount, currency)}</span>
              </div>

              <div className="pt-4 mt-2 border-t-2 border-slate-100 dark:border-slate-800 flex justify-between items-end">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">Client Quote</span>
                  <span className="text-[10px] text-slate-400">Gross total sent to client</span>
                </div>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(financials.clientTotal, currency)}</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-2">
            <Button className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCheckout}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Continue to Booking
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setShowShareModal(true)}>
              <Send className="w-4 h-4 mr-2 text-blue-500" /> Send Quote to Customer
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Save className="w-4 h-4 mr-2 text-emerald-500" /> Save as Draft Package
            </Button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Send SmartBundle Quote">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will generate a white-labeled PDF/web link for the customer showing the total price of <strong>{formatCurrency(financials.clientTotal, currency)}</strong>. Individual item costs and your margin of <strong>{formatCurrency(financials.totalMarginAmount, currency)}</strong> will remain hidden.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500">
              https://travelverse.ai/quote/q-89f2a1b?agent=true
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                setShowShareModal(false);
                showToast({ title: "Quote Sent", message: "Quote sent to client CRM record.", type: "success" });
              }}>
                <Send className="w-4 h-4 mr-2" /> Send Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
