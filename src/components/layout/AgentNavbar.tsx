import React from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Compass,
  ArrowRightLeft,
  Shield,
  Bell,
  Search,
  Sliders,
  Sparkles,
  Percent,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTravelStore } from "../../stores/useTravelStore";
import { Button, Badge } from "../ui";
import { formatCurrency } from "../../lib/utils";

export const AgentNavbar: React.FC = () => {
  const { currentModule, setModule, toggleAIConcierge } = useUIStore();
  const { user, setRole } = useAuthStore();
  const { currency } = useTravelStore();

  return (
    <div className="w-full bg-slate-950 text-white border-b border-amber-900/40 sticky top-0 z-40 backdrop-blur-md select-none">
      <div className="w-full h-full px-3 sm:px-5 lg:px-6 xl:px-8">
        {/* Main Bar Container */}
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Brand Logo & Mode Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setModule("agent")}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
                    TRAVELVERSE
                  </span>
                  <span className="rounded-md bg-amber-500 text-slate-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    PRO AGENT
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/80 leading-none truncate hidden sm:block">
                  IATA Certified B2B Portal
                </p>
              </div>
            </button>
          </div>

          {/* Desktop & Tablet Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-amber-900/30">
            {[
              { module: "agent" as const, label: "Command Center", icon: <TrendingUp className="w-4 h-4 text-amber-400" /> },
              { module: "customers" as const, label: "Client CRM (28)", icon: <Users className="w-4 h-4 text-blue-400" /> },
              { module: "bookings" as const, label: "GDS Tickets", icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
              { module: "documents" as const, label: "Visa & Passes", icon: <Shield className="w-4 h-4 text-indigo-400" /> },
            ].map((item) => {
              const isActive = currentModule === item.module;
              return (
                <button
                  key={item.module}
                  onClick={() => setModule(item.module)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick MTD Live Earning Widget (Desktop only) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-400">Commission MTD:</span>
              <span className="font-extrabold text-emerald-400">
                {formatCurrency(22140, currency)}
              </span>
            </div>

            {/* AI Proposal Tool Trigger */}
            <Button
              size="sm"
              onClick={toggleAIConcierge}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:to-pink-700 shadow-sm text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </Button>

            {/* Exit Agent Mode / Switch to Traveler */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRole("traveler");
                setModule("home");
              }}
              className="bg-slate-900 border-amber-700/50 text-amber-200 hover:bg-slate-800 text-xs gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exit to Traveler</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
