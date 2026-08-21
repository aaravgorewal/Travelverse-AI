import React, { useState } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  Send,
  FileText,
  Sparkles,
  LayoutDashboard,
  Plane,
  Building2,
  Package,
  Calendar,
  BellRing,
  BarChart3,
  ShieldAlert,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { useTravelStore } from "../../stores/useTravelStore";
import { agentService } from "../../services";
import { Button, Card, Badge, EmptyState } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";

// Embedded Views
import { CustomersView } from "../customers/CustomersView";
import { FlightsView } from "../flights/FlightsView";
import { HotelsView } from "../hotels/HotelsView";
import { PackagesView } from "../packages/PackagesView";
import { BookingsView } from "../bookings/BookingsView";

// --- Stubs & Dashboard ---
const AgentDashboard: React.FC = () => {
  const { currency } = useTravelStore();
  const [commissionRate, setCommissionRate] = useState(12);
  const [quoteDestination, setQuoteDestination] = useState("Amalfi Coast, Italy");
  const [quoteBudget, setQuoteBudget] = useState(12500);
  const [quoteClient, setQuoteClient] = useState("Lord Hastings VIP Account");
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<any | null>(null);

  const mockAgentMetrics = {
    grossBookingsMonth: 184500,
    commissionEarned: 22140,
    activeVIPClients: 28,
    pendingProposals: 6,
  };

  const handleGenerateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingQuote(true);
    try {
      const res = await agentService.createClientProposal({
        clientName: quoteClient,
        destination: quoteDestination,
        budget: quoteBudget,
        commissionPercent: commissionRate,
      });
      setGeneratedProposal(res);
    } catch {
      setGeneratedProposal({
        id: `prop-${Date.now()}`,
        clientName: quoteClient,
        destination: quoteDestination,
        totalQuote: quoteBudget,
        commissionEarned: quoteBudget * (commissionRate / 100),
        status: "ready_to_send",
      });
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="warning">Travel Advisor B2B Workspace</Badge>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Agent Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">Manage VIP clients, generate white-label quotes, and track GDS commission payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross Bookings (MTD)</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(mockAgentMetrics.grossBookingsMonth, currency)}</p>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18.4%</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commission Earned</span>
          <p className="text-xl font-black text-amber-600">{formatCurrency(mockAgentMetrics.commissionEarned, currency)}</p>
          <span className="text-[10px] font-semibold text-slate-500">Avg 12.0% override</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active VIPs</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{mockAgentMetrics.activeVIPClients}</p>
          <span className="text-[10px] font-semibold text-blue-600">98% Retention Rate</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Quotes</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{mockAgentMetrics.pendingProposals}</p>
          <span className="text-[10px] font-semibold text-purple-600">3 follow-ups needed</span>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> AI Proposal Generator
          </h3>
        </div>
        <form onSubmit={handleGenerateQuote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">VIP Client</label>
              <input type="text" value={quoteClient} onChange={(e) => setQuoteClient(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Target Destination</label>
              <input type="text" value={quoteDestination} onChange={(e) => setQuoteDestination(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500" required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Budget ($)</label>
              <input type="number" value={quoteBudget} onChange={(e) => setQuoteBudget(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500" required />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Commission Override: {commissionRate}%</span>
            <input type="range" min="5" max="25" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-32" />
          </div>
          <Button type="submit" className="w-full text-xs h-9 bg-amber-600 hover:bg-amber-700" isLoading={isGeneratingQuote}>
            Generate Branded Itinerary PDF
          </Button>
        </form>

        {generatedProposal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mt-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="success">Proposal Ready</Badge>
              <span className="text-[10px] font-bold text-slate-400">#{generatedProposal.id}</span>
            </div>
            <p className="text-sm font-bold">{generatedProposal.clientName} - {generatedProposal.destination}</p>
            <div className="flex gap-4 mt-3">
              <div><span className="text-[10px] text-slate-500">Client Quote:</span> <span className="text-sm font-black block">{formatCurrency(generatedProposal.totalQuote, currency)}</span></div>
              <div><span className="text-[10px] text-slate-500">Net Payout:</span> <span className="text-sm font-black text-amber-600 block">{formatCurrency(generatedProposal.commissionEarned, currency)}</span></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

import { AgentCopilot } from "./components/AgentCopilot";

const AgentAlerts = () => (
  <Card className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
    <BellRing className="w-12 h-12 mb-4 text-amber-500" />
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Disruption Alerts</h3>
    <p className="text-sm max-w-sm mt-2">Monitor all your clients currently in transit. No active disruptions or missed connections detected at this time.</p>
  </Card>
);

const AgentAnalytics = () => (
  <Card className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
    <BarChart3 className="w-12 h-12 mb-4 text-emerald-500" />
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agency Analytics</h3>
    <p className="text-sm max-w-sm mt-2">View commission payout reports, conversion rates, and year-over-year revenue growth. (Requires Manager permissions)</p>
  </Card>
);

// --- Main Layout ---
export const AgentPortalView: React.FC = () => {
  const { user } = useAuthStore();
  const { setModule } = useUIStore();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    const handleCopilotPrompt = () => setActiveTab("Copilot");
    window.addEventListener("agent-copilot-prompt", handleCopilotPrompt);
    return () => window.removeEventListener("agent-copilot-prompt", handleCopilotPrompt);
  }, []);

  // Route Protection
  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    return (
      <div className="py-20 animate-in fade-in zoom-in-95">
        <EmptyState 
          icon={<ShieldAlert className="w-12 h-12 text-red-500" />} 
          title="Access Denied" 
          description="The TravelVerse Agent Portal is restricted to verified travel advisors and administrators."
          action={<Button onClick={() => setModule("home")}>Return Home</Button>}
        />
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Copilot", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Customers", icon: <Users className="w-4 h-4" /> },
    { name: "Flights", icon: <Plane className="w-4 h-4" /> },
    { name: "Hotels", icon: <Building2 className="w-4 h-4" /> },
    { name: "Packages", icon: <Package className="w-4 h-4" /> },
    { name: "Bookings", icon: <Calendar className="w-4 h-4" /> },
    { name: "Alerts", icon: <BellRing className="w-4 h-4" /> },
    { name: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "Dashboard": return <AgentDashboard />;
      case "Copilot": return <AgentCopilot />;
      case "Customers": return <div className="text-sm"><CustomersView /></div>;
      case "Flights": return <div className="text-sm"><FlightsView /></div>;
      case "Hotels": return <div className="text-sm"><HotelsView /></div>;
      case "Packages": return <div className="text-sm"><PackagesView /></div>;
      case "Bookings": return <div className="text-sm"><BookingsView /></div>;
      case "Alerts": return <AgentAlerts />;
      case "Analytics": return <AgentAnalytics />;
      default: return <AgentDashboard />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] bg-slate-50 dark:bg-slate-950 -mx-3 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" /> B2B Portal
              </h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">{user.name} • ID: {user.id.slice(0, 6)}</span>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.name 
                    ? "bg-amber-500/10 text-amber-400" 
                    : "hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 text-sm" onClick={() => setModule("home")}>
              <LogOut className="w-4 h-4 mr-2" /> Exit Agent Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 pt-16 md:pt-8 custom-scrollbar">
        {renderActiveView()}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};
