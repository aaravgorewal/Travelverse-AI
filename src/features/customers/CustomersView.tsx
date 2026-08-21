import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Sparkles,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronRight,
  Plane,
  Building2,
  Coffee
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";
import { aiAPI } from "../../lib/api/ai";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: "Diamond" | "Platinum" | "Gold" | "Silver";
  totalSpend: number;
  totalBookings: number;
  lastTrip: string;
  status: "Active Traveler" | "Trip In-Progress" | "VIP Inactive";
  dietaryPreference: string;
  seatPreference: string;
  homeAirport: string;
  favoriteAirlines: string[];
  favoriteHotels: string[];
  budgetTier: string;
  notes: string;
}

const SEED_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-01",
    name: "Elena Rostova",
    email: "elena.rostova@travelverse.ai",
    phone: "+1 (415) 892-3310",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    tier: "Diamond",
    totalSpend: 48900,
    totalBookings: 14,
    lastTrip: "Tokyo Luxury Cherry Blossom",
    status: "Active Traveler",
    dietaryPreference: "Pescatarian",
    seatPreference: "First Class - Window",
    homeAirport: "SFO",
    favoriteAirlines: ["Emirates", "Singapore Airlines"],
    favoriteHotels: ["Four Seasons", "Aman"],
    budgetTier: "Ultra-Luxury",
    notes: "Requires late checkout. Prefers high floors. Severe peanut allergy.",
  },
  {
    id: "cust-02",
    name: "Marcus Vance",
    email: "marcus.v@summitglobal.io",
    phone: "+1 (212) 749-1120",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    tier: "Diamond",
    totalSpend: 72400,
    totalBookings: 21,
    lastTrip: "Swiss Alps Private Chalet",
    status: "Trip In-Progress",
    dietaryPreference: "Gluten-Free",
    seatPreference: "Business - Suite",
    homeAirport: "JFK",
    favoriteAirlines: ["Delta", "Swiss"],
    favoriteHotels: ["Ritz-Carlton", "St. Regis"],
    budgetTier: "Luxury",
    notes: "Always travels with golf clubs. Prefers morning flights.",
  }
];

export const CustomersView: React.FC = () => {
  const { currency } = useTravelStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  
  // AI Personalization State
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [personalizeError, setPersonalizeError] = useState<string | null>(null);

  const filteredCustomers = SEED_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handlePersonalize = async (customer: CustomerRecord) => {
    setIsPersonalizing(true);
    setPersonalizeError(null);
    try {
      const res = await aiAPI.personalize({
        userProfile: { name: customer.name, tier: customer.tier },
        travelPreferences: { 
          budget: customer.budgetTier, 
          dietary: customer.dietaryPreference, 
          seat: customer.seatPreference,
          airlines: customer.favoriteAirlines,
          hotels: customer.favoriteHotels 
        },
        destination: "Agent's Choice" // Or could prompt for a destination
      });
      
      const prompt = `Create a package for ${customer.name}. Use this AI context: ${res.message}. Preferences: ${customer.budgetTier} budget, ${customer.dietaryPreference} food.`;
      
      // Send to Copilot
      window.dispatchEvent(new CustomEvent("agent-copilot-prompt", { detail: prompt }));
    } catch (err) {
      setPersonalizeError("Failed to personalize trip. Please try again or check Copilot service.");
    } finally {
      setIsPersonalizing(false);
    }
  };

  if (selectedCustomer) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>

        {/* Profile Header */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{selectedCustomer.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedCustomer.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={selectedCustomer.tier === "Diamond" ? "purple" : "warning"}>⭐ {selectedCustomer.tier} VIP</Badge>
                  <Badge variant="default" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{selectedCustomer.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total LTV</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(selectedCustomer.totalSpend, currency)}</p>
              </div>
              <Button 
                onClick={() => handlePersonalize(selectedCustomer)} 
                className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto"
                isLoading={isPersonalizing}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Personalize Trip ✦
              </Button>
            </div>
          </div>
          
          {personalizeError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {personalizeError}
            </div>
          )}
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Preferences Column */}
          <div className="space-y-6">
            <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" /> Traveler Preferences</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-500 text-xs block">Budget Tier</span><span className="font-semibold">{selectedCustomer.budgetTier}</span></div>
                <div><span className="text-slate-500 text-xs block">Dietary</span><span className="font-semibold">{selectedCustomer.dietaryPreference}</span></div>
                <div><span className="text-slate-500 text-xs block">Seat & Cabin</span><span className="font-semibold">{selectedCustomer.seatPreference}</span></div>
                <div><span className="text-slate-500 text-xs block">Home Airport</span><span className="font-semibold">{selectedCustomer.homeAirport}</span></div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Favorites</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Plane className="w-3 h-3" /> Airlines</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCustomer.favoriteAirlines.map(a => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Building2 className="w-3 h-3" /> Hotels</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCustomer.favoriteHotels.map(h => <Badge key={h} variant="outline" className="text-xs">{h}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bookings & History */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-5 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold flex items-center gap-2 mb-4"><Briefcase className="w-4 h-4 text-emerald-500" /> AI CRM Summary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                {selectedCustomer.notes} <br /><br />
                <strong>AI Insight:</strong> {selectedCustomer.name} is a highly valuable {selectedCustomer.tier} client. They prioritize extreme comfort ({selectedCustomer.seatPreference}) and specialized cuisine ({selectedCustomer.dietaryPreference}). Proactively suggest {selectedCustomer.favoriteAirlines[0]} when booking long-haul flights.
              </p>
            </Card>

            <Card className="p-5 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> Recent Bookings</h3>
                <span className="text-xs font-bold text-slate-400">{selectedCustomer.totalBookings} Lifetime</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedCustomer.lastTrip}</h4>
                      <p className="text-xs text-slate-500">Completed 2 months ago • Package</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Maldives Overwater Villa</h4>
                      <p className="text-xs text-slate-500">Completed 8 months ago • Hotel Only</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Customer Profiles</h1>
          <p className="text-sm text-slate-500">Manage VIP clients and generate personalized trips.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
            <Users className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">No customers found.</p>
            <p className="text-sm">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <Card 
              key={cust.id} 
              className="p-5 cursor-pointer hover:border-indigo-500 transition-colors border-slate-200 dark:border-slate-800 flex flex-col h-full"
              onClick={() => setSelectedCustomer(cust)}
            >
              <div className="flex items-start gap-4 mb-4">
                <img src={cust.avatar} alt={cust.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{cust.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{cust.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">Tier</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{cust.tier}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">LTV</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(cust.totalSpend, currency)}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
