import React, { useState } from "react";
import {
  Sparkles,
  Plane,
  Building2,
  Calendar,
  DollarSign,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  TrendingDown,
  Crown,
  PlusCircle,
  Coffee,
  Smile,
  Save,
  Share2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Luggage,
  Sun,
  CloudSun,
  Navigation,
  Info,
  Car,
  Train,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { TripPlan, TripDay, TripPlanFlight, TripPlanHotel, TripPlanTransport } from "../../../types";
import { useToast } from "../../../components/ui/Toast";
import { useUIStore } from "../../../stores/useUIStore";
import { useTravelStore } from "../../../stores/useTravelStore";

interface TripGenieDisplayProps {
  trip: TripPlan;
  onAIAction: (
    action:
      | "optimize"
      | "reduce_cost"
      | "make_premium"
      | "add_activities"
      | "slow_down"
      | "family_friendly"
  ) => void;
  onSaveTrip: () => void;
  onShareTrip: () => void;
  onEditInputs: () => void;
  isActionLoading?: boolean;
  activeActionName?: string;
  isSaved?: boolean;
}

export function TripGenieDisplay({
  trip,
  onAIAction,
  onSaveTrip,
  onShareTrip,
  onEditInputs,
  isActionLoading = false,
  activeActionName = "",
  isSaved = false,
}: TripGenieDisplayProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "all" | "summary" | "flights" | "hotels" | "activities" | "itinerary" | "transport" | "cost"
  >("all");
  const { showToast } = useToast();
  const { setModule } = useUIStore();
  const { setCheckoutItem } = useTravelStore();

  const currentDay: TripDay | undefined = trip.days?.[selectedDayIndex] || trip.days?.[0];

  return (
    <div id="tripgenie-display-root" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP STICKY AI ACTIONS TOOLBAR */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status & Label */}
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                TripGenie AI Actions
              </span>
            </div>

            {/* Quick Edit Inputs Button */}
            <button
              id="tripgenie-edit-inputs-btn"
              onClick={onEditInputs}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold ml-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Inputs</span>
            </button>
          </div>

          {/* 8 AI Action Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* 1. Optimize Trip */}
            <button
              id="ai-action-optimize-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("optimize")}
              title="Streamline route, eliminate backtracking & optimize commute"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Optimize Trip</span>
            </button>

            {/* 2. Reduce Cost */}
            <button
              id="ai-action-reduce-cost-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("reduce_cost")}
              title="Find budget swaps and save 20-30% on hotels and activities"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Reduce Cost</span>
            </button>

            {/* 3. Make Premium */}
            <button
              id="ai-action-make-premium-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("make_premium")}
              title="Upgrade to Business/First class, 5★ suites, and Michelin dining"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Make Premium</span>
            </button>

            {/* 4. Add Activities */}
            <button
              id="ai-action-add-activities-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("add_activities")}
              title="Inject unique masterclasses, viewpoints, and hidden gems"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Add Activities</span>
            </button>

            {/* 5. Slow Down */}
            <button
              id="ai-action-slow-down-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("slow_down")}
              title="Relax daily pacing with late starts and spa downtime"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Coffee className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Slow Down</span>
            </button>

            {/* 6. Make Family Friendly */}
            <button
              id="ai-action-family-friendly-btn"
              disabled={isActionLoading}
              onClick={() => onAIAction("family_friendly")}
              title="Ensure all attractions are kid-friendly and stroller-accessible"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Smile className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Make Family Friendly</span>
            </button>

            {/* 7. Save Trip */}
            <button
              id="ai-action-save-trip-btn"
              onClick={onSaveTrip}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isSaved
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-slate-100"
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? "Saved to Trips" : "Save Trip"}</span>
            </button>

            {/* 8. Share Trip */}
            <button
              id="ai-action-share-trip-btn"
              onClick={onShareTrip}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>
          </div>
        </div>

        {/* Real-time AI Action Loading Indicator */}
        {isActionLoading && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                Applying AI transformation: <strong>{activeActionName || "Optimizing plan"}</strong>
                ...
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Updating itinerary live</span>
          </div>
        )}
      </div>

      {/* 2. TRIP SUMMARY HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={trip.coverImage || "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"}
            alt={trip.destination}
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              TripGenie AI Blueprint
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-medium">
              {trip.days.length} Days Itinerary
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              ${trip.budgetTotal?.toLocaleString()} {trip.currency || "USD"} Total Budget
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-purple-300 text-xs font-medium">
              {trip.travelersCount || 2} Traveler{trip.travelersCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {trip.title || `${trip.destination} Curated Journey`}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mt-3 max-w-3xl leading-relaxed">
              {trip.summary ||
                `An exquisitely orchestrated vacation in ${trip.destination} designed to balance culture, fine dining, and effortless pacing.`}
            </p>
          </div>

          {/* Strategic AI Insights / Climate / Special Requirements Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* AI Strategic Rationale */}
            {trip.aiRationale && (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                  <Compass className="w-4 h-4" />
                  <span>AI Design Rationale</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{trip.aiRationale}</p>
              </div>
            )}

            {/* Season & Attire Advice */}
            {trip.seasonAdvice && (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Sun className="w-4 h-4" />
                  <span>Climate & Clothing Tip</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{trip.seasonAdvice}</p>
              </div>
            )}

            {/* Special Requirements Handled */}
            {trip.specialRequirementsHandled && trip.specialRequirementsHandled.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Custom Requirements Met</span>
                </div>
                <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                  {trip.specialRequirementsHandled.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECTION NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none text-xs sm:text-sm font-bold">
        {[
          { id: "all", label: "Complete Overview", icon: Sparkles },
          { id: "flights", label: `Flights (${trip.flights?.length || 2})`, icon: Plane },
          { id: "hotels", label: `Hotels (${trip.hotels?.length || 1})`, icon: Building2 },
          { id: "activities", label: `Activities (${trip.curatedActivities?.length || trip.days.reduce((acc, d) => acc + d.activities.length, 0)})`, icon: Compass },
          { id: "itinerary", label: `Day-by-Day (${trip.days.length} Days)`, icon: Calendar },
          { id: "transport", label: `Transportation (${trip.transportation?.length || 1})`, icon: Train },
          { id: "cost", label: "Estimated Cost Breakdown", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. FLIGHTS SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "flights") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Plane className="w-5 h-5" />
              </div>
              <span>Flight Options & Transfers</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time airline matching</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trip.flights && trip.flights.length > 0 ? trip.flights : [
              {
                id: "fl-out-default",
                type: "outbound" as const,
                airline: "Global Premier Airways",
                flightNumber: "GP 408",
                fromCity: "Departure Hub",
                fromCode: "JFK",
                toCity: trip.destination.split(",")[0],
                toCode: trip.destination.slice(0, 3).toUpperCase(),
                departureTime: "08:15 AM",
                arrivalTime: "02:40 PM (+1)",
                duration: "13h 25m",
                cabinClass: "Premium Economy",
                stops: 0,
                pricePerPerson: 850,
                baggageIncluded: true,
                seatSuggestion: "14A (Window, extra legroom)",
              },
              {
                id: "fl-ret-default",
                type: "return" as const,
                airline: "Global Premier Airways",
                flightNumber: "GP 409",
                fromCity: trip.destination.split(",")[0],
                fromCode: trip.destination.slice(0, 3).toUpperCase(),
                toCity: "Departure Hub",
                toCode: "JFK",
                departureTime: "05:30 PM",
                arrivalTime: "08:15 PM",
                duration: "14h 10m",
                cabinClass: "Premium Economy",
                stops: 0,
                pricePerPerson: 850,
                baggageIncluded: true,
                seatSuggestion: "14K (Forward quiet cabin)",
              },
            ]).map((flight, idx) => (
              <div
                key={flight.id || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                      <Plane
                        className={`w-4 h-4 ${flight.type === "return" ? "rotate-180" : ""}`}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        {flight.type === "outbound" ? "🛫 Outbound Flight" : "🛬 Return Flight"}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {flight.airline} • {flight.flightNumber}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {flight.cabinClass}
                  </span>
                </div>

                {/* Timeline display */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-left">
                    <span className="text-lg font-black text-slate-900 dark:text-white block font-mono">
                      {flight.departureTime}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {flight.fromCode}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{flight.fromCity}</span>
                  </div>

                  <div className="flex-1 px-4 text-center">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      {flight.duration} • {flight.stops === 0 ? "Nonstop" : `${flight.stops} Stop`}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700" />
                      <Plane className="w-3.5 h-3.5 text-blue-600 absolute bg-white dark:bg-slate-900 px-0.5" />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white block font-mono">
                      {flight.arrivalTime}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {flight.toCode}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{flight.toCity}</span>
                  </div>
                </div>

                {/* Footer amenities & price */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    {flight.baggageIncluded && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Bag Included
                      </span>
                    )}
                    {flight.seatSuggestion && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Recommended: {flight.seatSuggestion}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-1">from</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      ${flight.pricePerPerson}
                    </span>
                    <span className="text-[11px] text-slate-400"> /person</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. HOTELS SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "hotels") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span>Curated Accommodations</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Handpicked boutique & 5★ stays</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trip.hotels && trip.hotels.length > 0 ? trip.hotels : [
              {
                id: "ht-default-1",
                name: `Grand Heritage Sanctuary ${trip.destination.split(",")[0]}`,
                stars: 5,
                rating: 4.94,
                roomType: "Executive Panoramic Garden Suite",
                nightlyPrice: 340,
                totalPrice: 340 * trip.days.length,
                nights: trip.days.length,
                location: "Historic Heart Quarter",
                imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                amenities: ["Infinity Thermal Pool", "Daily Champagne Breakfast", "24/7 Butler Service", "High-Speed Wi-Fi"],
                matchReason: "Strategically located within 5 minutes of primary cultural sights, completely quiet at night.",
                badge: "AI Top Pick",
              },
            ]).map((hotel, idx) => (
              <div
                key={hotel.id || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1 border border-white/10">
                        ★ {hotel.rating || 4.9} ({hotel.stars}★ Hotel)
                      </span>
                      {hotel.badge && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                          {hotel.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          {hotel.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hotel.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Room: {hotel.roomType}
                      </span>
                      {hotel.matchReason && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          💡 {hotel.matchReason}
                        </p>
                      )}
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.amenities?.map((amenity, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                      ${hotel.nightlyPrice}
                    </span>
                    <span className="text-xs text-slate-400"> /night</span>
                    <span className="block text-[11px] text-slate-500">
                      ${hotel.totalPrice} total ({hotel.nights || trip.days.length} nights)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      // BOOKING: sets checkout item and routes to payment module
                      setCheckoutItem({
                        type: "hotel",
                        item: hotel as any,
                        travelers: trip.travelersCount || 1,
                        dates: { start: trip.startDate || "TBD", end: trip.endDate },
                        totalPrice: hotel.totalPrice || hotel.nightlyPrice * (hotel.nights || trip.days.length)
                      });
                      showToast({ title: "Hotel Selected", message: `${hotel.name} added to checkout.`, type: "success" });
                      setModule("payments");
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CURATED STANDALONE ACTIVITIES */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "activities") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <span>Signature Experiences & Activities</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Curated highlights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trip.curatedActivities && trip.curatedActivities.length > 0
              ? trip.curatedActivities
              : trip.days.flatMap((d) => d.activities).slice(0, 4)
            ).map((act, idx) => (
              <div
                key={act.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      {act.type || "Experience"}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </h4>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono flex-shrink-0">
                    ${act.estimatedCost || 50}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DAY-BY-DAY ITINERARY SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "itinerary") && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <span>Day-by-Day Itinerary ({trip.days.length} Days)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Interactive timeline & transit pacing</span>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {trip.days.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <button
                  key={day.dayNumber || idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition flex flex-col gap-0.5 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xs font-bold">Day {day.dayNumber}</span>
                  <span
                    className={`text-[11px] truncate max-w-[120px] ${
                      isSelected ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {day.theme || `Route ${day.dayNumber}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Detail Card */}
          {currentDay && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              {/* Day Header & Weather */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      Day {currentDay.dayNumber}
                    </span>
                    <span className="text-xs text-slate-400">{currentDay.date}</span>
                  </div>
                  <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {currentDay.theme}
                  </h4>
                </div>

                {/* Weather widget */}
                {currentDay.weatherForecast && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
                    <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold block">
                        {currentDay.weatherForecast.temp}°C • {currentDay.weatherForecast.condition}
                      </span>
                      <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 block">
                        {currentDay.weatherForecast.aiRecommendation || "Ideal walking conditions"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Day Activities Timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {currentDay.activities?.map((act, actIdx) => (
                  <div key={act.id || actIdx} className="relative pl-10 group">
                    {/* Timeline bullet */}
                    <div className="absolute left-1.5 top-2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-125 transition-transform" />

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
                            {act.time}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold uppercase">
                            {act.type}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                          ${act.estimatedCost}
                        </span>
                      </div>

                      <h5 className="text-base font-bold text-slate-900 dark:text-white">
                        {act.title}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {act.duration}
                          </span>
                          {act.transitToNext && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <Navigation className="w-3.5 h-3.5" /> Next: {act.transitToNext}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TRANSPORTATION SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "transport") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                <Train className="w-5 h-5" />
              </div>
              <span>Ground Transportation & Passes</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Seamless connectivity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trip.transportation && trip.transportation.length > 0 ? trip.transportation : [
              {
                id: "tr-default-1",
                type: "train_pass",
                title: "Regional High-Speed Rail & City Metro Pass",
                description: `Unlimited first-class travel on all city metro lines, bullet trains, and regional scenic express lines for ${trip.days.length} days.`,
                cost: 195,
                currency: "USD",
                coverage: "Full Regional Network",
                bookingTip: "Instant digital QR wallet pass pre-loaded with seat reservations.",
                recommended: true,
              },
              {
                id: "tr-default-2",
                type: "private_transfer",
                title: "VIP Executive Airport Sedan Chauffeur",
                description: "Terminal arrival meet-and-greet with flight tracking and luxury private transfer directly to your hotel suite.",
                cost: 90,
                currency: "USD",
                coverage: "Airport to Central Hotel",
                bookingTip: "Includes 60-min complimentary flight delay buffer.",
                recommended: true,
              },
            ]).map((trans, idx) => (
              <div
                key={trans.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-teal-400 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    {trans.recommended && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[11px] font-bold">
                        ★ Recommended Transit
                      </span>
                    )}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {trans.title}
                    </h4>
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    ${trans.cost}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {trans.description}
                </p>

                {trans.bookingTip && (
                  <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300">
                    💡 <strong>Tip:</strong> {trans.bookingTip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. ESTIMATED COST BREAKDOWN */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "cost") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <span>Estimated Cost Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Total: ${trip.budgetTotal?.toLocaleString()} {trip.currency || "USD"}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            {/* Visual breakdown progress bars */}
            {(() => {
              const cb = trip.costBreakdown || {
                flights: Math.round(trip.budgetTotal * 0.32),
                lodging: Math.round(trip.budgetTotal * 0.42),
                activities: Math.round(trip.budgetTotal * 0.12),
                foodDining: Math.round(trip.budgetTotal * 0.10),
                localTransit: Math.round(trip.budgetTotal * 0.04),
                taxesAndBuffer: Math.round(trip.budgetTotal * 0.05),
                totalEstimated: trip.budgetTotal,
                targetBudget: trip.budgetTotal,
                currency: "USD",
                savingsTips: [
                  "Advance flight booking locks in flexible ticket cancellation.",
                  "Bundling regional transit passes saves up to 30% over individual point-to-point fares.",
                ],
              };

              const categories = [
                { name: "Flights & Long Distance", val: cb.flights, color: "bg-blue-600", text: "text-blue-600" },
                { name: "Hotels & Lodging", val: cb.lodging, color: "bg-purple-600", text: "text-purple-600" },
                { name: "Experiences & Activities", val: cb.activities, color: "bg-emerald-600", text: "text-emerald-600" },
                { name: "Gastronomy & Dining", val: cb.foodDining, color: "bg-amber-600", text: "text-amber-600" },
                { name: "Ground Transit & Transfers", val: cb.localTransit, color: "bg-teal-600", text: "text-teal-600" },
                { name: "Taxes & Contingency Buffer", val: cb.taxesAndBuffer, color: "bg-slate-500", text: "text-slate-500" },
              ];

              const total = categories.reduce((sum, c) => sum + c.val, 0) || trip.budgetTotal || 5000;

              return (
                <>
                  {/* Segmented Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                      {categories.map((cat, i) => (
                        <div
                          key={i}
                          style={{ width: `${Math.max(2, (cat.val / total) * 100)}%` }}
                          className={`${cat.color} h-full transition-all`}
                          title={`${cat.name}: $${cat.val.toLocaleString()}`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Budget efficiency: 98% Allocated</span>
                      <span>Target Budget: ${cb.targetBudget?.toLocaleString()} {cb.currency}</span>
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    {categories.map((cat, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                          ${cat.val.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {Math.round((cat.val / total) * 100)}% of trip cost
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Savings Tips */}
                  {cb.savingsTips && cb.savingsTips.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        <TrendingDown className="w-4 h-4" />
                        <span>TripGenie AI Smart Savings Insights</span>
                      </div>
                      <ul className="text-xs text-emerald-900/80 dark:text-emerald-200/80 space-y-1 list-disc list-inside">
                        {cb.savingsTips.map((tip, tIdx) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
