import React, { useState } from "react";
import {
  Compass,
  Search,
  Briefcase,
  Bot,
  User,
  Sparkles,
  Plane,
  Building,
  MapPin,
  Glasses,
  CreditCard,
  FileText,
  Users,
  TrendingUp,
  Sliders,
  DollarSign,
  X,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTripStore, useTravelStore, useNotificationStore } from "../../stores/useTravelStore";
import { AppModule } from "../../types";

export const MobileBottomNav: React.FC = () => {
  const { currentModule, setModule, toggleAIConcierge } = useUIStore();
  const { user, setRole } = useAuthStore();
  const { activeTrip } = useTripStore();
  const { bookings } = useTravelStore();
  const { unreadCount } = useNotificationStore();

  const [showExploreSheet, setShowExploreSheet] = useState(false);

  const isAgentActive = currentModule === "agent" || currentModule === "customers";

  // Check which main tab is active
  const isHomeActive = currentModule === "home";
  const isExploreActive = ["search", "flights", "hotels", "packages", "experiences", "vr"].includes(currentModule);
  const isTripsActive = ["trips", "itinerary", "bookings"].includes(currentModule);
  const isAIActive = currentModule === "ai";
  const isProfileActive = ["profile", "documents", "support", "admin", "design-system"].includes(currentModule);

  const exploreModules = [
    { module: "flights" as AppModule, label: "Flights", icon: <Plane className="w-5 h-5 text-blue-500" />, desc: "Global airline routes" },
    { module: "hotels" as AppModule, label: "Hotels", icon: <Building className="w-5 h-5 text-indigo-500" />, desc: "Luxury villas & stays" },
    { module: "packages" as AppModule, label: "Packages", icon: <MapPin className="w-5 h-5 text-purple-500" />, desc: "Curated expeditions" },
    { module: "experiences" as AppModule, label: "Experiences", icon: <Sparkles className="w-5 h-5 text-amber-500" />, desc: "VIP culinary & tours" },
    { module: "vr" as AppModule, label: "VR 360°", icon: <Glasses className="w-5 h-5 text-teal-500" />, desc: "Spatial room inspection" },
    { module: "search" as AppModule, label: "Omni-Search", icon: <Search className="w-5 h-5 text-slate-500" />, desc: "Smart full catalog search" },
  ];

  if (isAgentActive) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-amber-900/50 safe-bottom">
        <nav aria-label="Agent Navigation" className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
          {/* Agent Dashboard */}
          <button
            onClick={() => setModule("agent")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              currentModule === "agent"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Overview</span>
          </button>

          {/* Clients CRM */}
          <button
            onClick={() => setModule("customers")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              currentModule === "customers"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Clients</span>
          </button>

          {/* AI Proposal Hub */}
          <button
            onClick={() => {
              setModule("agent");
              window.scrollTo({ top: 350, behavior: "smooth" });
            }}
            className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 ring-4 ring-slate-950 group-active:scale-95 transition-transform">
              <DollarSign className="w-5 h-5 font-black" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 mt-0.5">Quote</span>
          </button>

          {/* GDS Bookings */}
          <button
            onClick={() => setModule("bookings")}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Bookings</span>
          </button>

          {/* Switch to Traveler OS */}
          <button
            onClick={() => {
              setRole("traveler");
              setModule("home");
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-5 h-5 mb-0.5 text-blue-400" />
            <span className="text-[10px] tracking-tight">Traveler</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <>
      {/* Traveler Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom">
        <nav aria-label="Mobile Navigation" className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => {
              setModule("home");
              setShowExploreSheet(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isHomeActive
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${isHomeActive ? "stroke-[2.5]" : "stroke-2"}`} />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* 2. Explore */}
          <button
            onClick={() => setShowExploreSheet(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isExploreActive
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Search className={`w-5 h-5 mb-0.5 ${isExploreActive ? "stroke-[2.5]" : "stroke-2"}`} />
            <span className="text-[10px] tracking-tight">Explore</span>
          </button>

          {/* 3. AI Center Action Button */}
          <button
            onClick={() => {
              setShowExploreSheet(false);
              toggleAIConcierge();
            }}
            className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
            aria-label="Open AI Concierge"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/35 ring-4 ring-white dark:ring-slate-900 group-active:scale-95 transition-transform">
              <Bot className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent mt-0.5">
              ✦ AI
            </span>
          </button>

          {/* 4. Trips */}
          <button
            onClick={() => {
              setShowExploreSheet(false);
              setModule(activeTrip ? "itinerary" : "trips");
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isTripsActive
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase className={`w-5 h-5 mb-0.5 ${isTripsActive ? "stroke-[2.5]" : "stroke-2"}`} />
            {bookings.length > 0 && (
              <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-[10px] tracking-tight">Trips</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => {
              setShowExploreSheet(false);
              setModule("profile");
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isProfileActive
                ? "text-blue-600 dark:text-blue-400 font-bold scale-105"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <User className={`w-5 h-5 mb-0.5 ${isProfileActive ? "stroke-[2.5]" : "stroke-2"}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-3.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        </nav>
      </div>

      {/* Explore Quick Modal / Bottom Sheet */}
      {showExploreSheet && (
        <div className="fixed inset-0 z-50 block md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Explore Travelverse</h3>
                <p className="text-xs text-slate-400">Direct booking channels & AI tools</p>
              </div>
              <button
                onClick={() => setShowExploreSheet(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {exploreModules.map((item) => (
                <button
                  key={item.module}
                  onClick={() => {
                    setModule(item.module);
                    setShowExploreSheet(false);
                  }}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    currentModule === item.module
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20"
                      : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/40 dark:border-slate-700/40 mb-2">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</span>
                </button>
              ))}
            </div>

            {/* Quick Extra Navigation */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => {
                  setModule("design-system");
                  setShowExploreSheet(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Design System Component Lab</span>
                </span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  setModule("documents");
                  setShowExploreSheet(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Digital Passport & eVisa Wallet</span>
                </span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
