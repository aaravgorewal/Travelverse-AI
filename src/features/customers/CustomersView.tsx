import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Star,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  MoreVertical,
  Briefcase,
  FileText,
  UserCheck,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge, Input } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";

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
    dietaryPreference: "Pescatarian / Organic",
    seatPreference: "1A / First Class",
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
    seatPreference: "Window / Suite",
  },
  {
    id: "cust-03",
    name: "Aria Sterling",
    email: "aria@luxurymedia.co",
    phone: "+44 20 7946 0912",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    tier: "Platinum",
    totalSpend: 31200,
    totalBookings: 8,
    lastTrip: "Kyoto Tea & Zen Sanctuary",
    status: "Active Traveler",
    dietaryPreference: "Vegan Only",
    seatPreference: "Aisle",
  },
  {
    id: "cust-04",
    name: "Julian De Vries",
    email: "julian@amsterdamcapital.nl",
    phone: "+31 20 555 1234",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    tier: "Gold",
    totalSpend: 19800,
    totalBookings: 5,
    lastTrip: "Amalfi Private Catamaran",
    status: "VIP Inactive",
    dietaryPreference: "None",
    seatPreference: "Window",
  },
  {
    id: "cust-05",
    name: "Dr. Kenji Sato",
    email: "sato.kenji@tokyobiotech.jp",
    phone: "+81 3 5555 0192",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    tier: "Diamond",
    totalSpend: 94100,
    totalBookings: 29,
    lastTrip: "Paris Haute Cuisine & Louvre VIP",
    status: "Active Traveler",
    dietaryPreference: "Halal / Kosher",
    seatPreference: "Suite 1K",
  },
];

export const CustomersView: React.FC = () => {
  const { currency } = useTravelStore();
  const { setModule, toggleAIConcierge } = useUIStore();

  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filteredCustomers = SEED_CUSTOMERS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.lastTrip.toLowerCase().includes(search.toLowerCase());
    const matchesTier = selectedTier === "all" || c.tier.toLowerCase() === selectedTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">B2B Agent VIP Network</Badge>
            <span className="text-xs text-slate-400 font-semibold">High-Net-Worth Portfolios</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Client CRM & Traveler Profiles
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={toggleAIConcierge} className="gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Client Dossier</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VIP clients by name, email, or recent destination..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto py-1">
          {["all", "Diamond", "Platinum", "Gold"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === t
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? "All Tiers" : `${t} VIP`}
            </button>
          ))}
        </div>
      </div>

      {/* 1. DESKTOP & TABLET VIEW: Responsive High-Density CRM Table */}
      <div className="hidden md:block">
        <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Client Name & Status</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Contact Details</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">VIP Tier</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Total LTV Spend</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Bookings</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Preferences</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="h-9 w-9 rounded-xl object-cover ring-2 ring-amber-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{cust.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cust.status === "Active Traveler"
                                  ? "bg-emerald-500"
                                  : cust.status === "Trip In-Progress"
                                  ? "bg-blue-500 animate-pulse"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span className="text-[10px] text-slate-400">{cust.status}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <p className="truncate">{cust.email}</p>
                      <p className="text-[10px] text-slate-400">{cust.phone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={cust.tier === "Diamond" ? "purple" : cust.tier === "Platinum" ? "default" : "warning"}>
                        ⭐ {cust.tier}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(cust.totalSpend, currency)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="font-bold">{cust.totalBookings}</span> Trips
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <p className="text-[11px] truncate max-w-[150px]">{cust.dietaryPreference}</p>
                      <p className="text-[10px] text-slate-400">{cust.seatPreference}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toggleAIConcierge();
                        }}
                        className="text-[11px] py-1 px-2.5 h-auto cursor-pointer"
                      >
                        ✦ AI Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 2. MOBILE VIEW (360px+): Transformed Responsive Cards */}
      <div className="md:hidden space-y-3.5">
        {filteredCustomers.map((cust) => (
          <Card key={cust.id} className="p-4 space-y-3">
            {/* Top Row: Avatar & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={cust.avatar}
                  alt={cust.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{cust.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        cust.status === "Active Traveler"
                          ? "bg-emerald-500"
                          : cust.status === "Trip In-Progress"
                          ? "bg-blue-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />
                    <span className="text-[11px] text-slate-500">{cust.status}</span>
                  </div>
                </div>
              </div>

              <Badge variant={cust.tier === "Diamond" ? "purple" : cust.tier === "Platinum" ? "default" : "warning"}>
                ⭐ {cust.tier}
              </Badge>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">LTV Spend</span>
                <span className="font-black text-slate-900 dark:text-white">{formatCurrency(cust.totalSpend, currency)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Trips</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{cust.totalBookings} Journeys</span>
              </div>
            </div>

            {/* Preferences Summary */}
            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
              <p className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Preferences:</span> {cust.dietaryPreference} • {cust.seatPreference}</p>
              <p className="truncate text-slate-400"><span className="font-semibold text-slate-500">Last Journey:</span> {cust.lastTrip}</p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
              <a
                href={`mailto:${cust.email}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Email</span>
              </a>

              <Button
                size="sm"
                onClick={toggleAIConcierge}
                className="flex-1 text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>✦ AI Proposal</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
