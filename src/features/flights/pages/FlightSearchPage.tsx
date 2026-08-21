import React from "react";
import {
  Plane,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Leaf,
  Clock,
  Compass,
  ArrowRight,
  Tag,
  Star,
  Luggage,
} from "lucide-react";
import { FlightOffer } from "../../../types";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { POPULAR_FLIGHT_ROUTES, SEED_COMPREHENSIVE_FLIGHTS } from "../flightData";
import { Card, Badge, Button } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface FlightSearchPageProps {
  currency: string;
  onSearch: (params: any) => void;
  onSelectFlight: (flight: FlightOffer) => void;
  onQuickRoute: (from: string, fromCode: string, to: string, toCode: string) => void;
}

export const FlightSearchPage: React.FC<FlightSearchPageProps> = ({
  currency,
  onSearch,
  onSelectFlight,
  onQuickRoute,
}) => {
  return (
    <div className="space-y-8 sm:space-y-12 pb-16 w-full max-w-full overflow-x-hidden">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-blue-900/50 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Flight Scout & Global Fare Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Fly Anywhere. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Intelligently Routed.</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-2xl leading-relaxed">
            Real-time low fare prediction, carbon footprint scoring, non-stop luxury cabins, and interactive aircraft seat map selection across 400+ airlines.
          </p>
        </div>

        {/* Floating Search Card */}
        <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
          <FlightSearchForm onSearch={onSearch} />
        </div>
      </div>

      {/* Popular & Trending Flight Routes */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Popular Routes & Live Fare Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Curated non-stop flights and low-fare matrixes updated moments ago
            </p>
          </div>
          <Badge variant="blue">Updated 2m ago</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {POPULAR_FLIGHT_ROUTES.map((route, idx) => (
            <div
              key={idx}
              onClick={() => onQuickRoute(route.fromCity, route.from, route.toCity, route.to)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                  {route.tag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {route.duration}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {route.from}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{route.fromCity}</div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <Plane className="w-4 h-4 text-blue-500 rotate-90 group-hover:translate-x-1 transition-transform" />
                  <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-700 my-1" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Non-stop</span>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {route.to}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{route.toCity}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Fares starting at</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatCurrency(route.price, currency)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs font-bold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Curated Flight Deals with AI Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Global Flight Scout Deals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Hand-picked business suites, non-stop routes, and ultra-saver deals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEED_COMPREHENSIVE_FLIGHTS.slice(0, 3).map((flight) => (
            <div
              key={flight.id}
              onClick={() => onSelectFlight(flight)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{flight.airlineLogo}</span>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{flight.airline}</div>
                    <div className="text-[11px] text-slate-400">{flight.cabinClass} • {flight.flightNumber}</div>
                  </div>
                </div>
                {flight.aiBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    {flight.aiBadge}
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{flight.originCode}</div>
                  <div className="text-[10px] text-slate-400">{flight.originCity}</div>
                </div>
                <div className="text-center text-[10px] text-slate-400">
                  <span>{flight.totalDuration}</span>
                  <div className="text-emerald-600 font-bold">{flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop`}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-slate-900 dark:text-white">{flight.destinationCode}</div>
                  <div className="text-[10px] text-slate-400">{flight.destinationCity}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total from</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {formatCurrency(flight.price, currency)}
                  </span>
                </div>
                <Button variant="primary" size="sm" className="rounded-xl text-xs font-bold">
                  <span>View Details</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TravelVerse Flight Assurance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Price Drop Protection</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            If the fare drops after booking, our autonomous agent refunds you the difference instantly.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Instant AI Re-routing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Automated disruption detector reschedules delayed or cancelled connections in under 30 seconds.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">100% Carbon Offset</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Every flight booking includes verified Sustainable Aviation Fuel (SAF) carbon reduction credits.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Seat Comfort Guarantee</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            3D visual aircraft seat preview with verified legroom, window alignment, and power port specs.
          </p>
        </div>
      </div>
    </div>
  );
};
