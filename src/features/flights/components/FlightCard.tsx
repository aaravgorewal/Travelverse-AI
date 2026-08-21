import React from "react";
import {
  Plane,
  Clock,
  Luggage,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  Tag,
  Award,
  Plus,
  Check,
  Bot,
  Compass,
  ArrowRight,
  ChevronRight,
  Info,
  Leaf,
  Layers,
} from "lucide-react";
import { FlightOffer } from "../../../types";
import { Badge, Button } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface FlightCardProps {
  flight: FlightOffer;
  currency: string;
  isCompared?: boolean;
  onSelect: (flight: FlightOffer) => void;
  onToggleCompare: (flight: FlightOffer) => void;
  onAskAI: (flight: FlightOffer) => void;
  onAddToTrip: (flight: FlightOffer) => void;
  travelersCount?: number;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  currency,
  isCompared = false,
  onSelect,
  onToggleCompare,
  onAskAI,
  onAddToTrip,
  travelersCount = 1,
}) => {
  const totalPrice = flight.price * travelersCount;

  // Extract or derive departure/arrival times & terminals
  const firstSeg = flight.segments[0];
  const lastSeg = flight.segments[flight.segments.length - 1];

  const depTime = firstSeg?.origin?.time || flight.departureTime.slice(11, 16) || "08:30";
  const arrTime = lastSeg?.destination?.time || flight.arrivalTime.slice(11, 16) || "14:45";
  const depCode = flight.originCode;
  const arrCode = flight.destinationCode;
  const depTerminal = firstSeg?.origin?.terminal ? `T${firstSeg.origin.terminal}` : "Main";
  const arrTerminal = lastSeg?.destination?.terminal ? `T${lastSeg.destination.terminal}` : "Main";
  const flightNum = flight.flightNumber || firstSeg?.flightNumber || `${flight.airlineCode} ${flight.id.replace(/\D/g, "")}`;
  const aircraft = flight.aircraft || firstSeg?.aircraft || "Boeing 787-9";

  // AI Badge rendering
  const renderAIBadge = () => {
    if (!flight.aiBadge) return null;

    switch (flight.aiBadge) {
      case "Cheapest":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
            <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Cheapest</span>
          </span>
        );
      case "Fastest":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
            <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Fastest</span>
          </span>
        );
      case "Best Value":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60 shadow-xs">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Best Value</span>
          </span>
        );
      case "Best Match":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 shadow-xs">
            <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Best Match</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-600/50 flex flex-col gap-4 relative overflow-hidden group">
      {/* Top Header Row: Airline, Flight Number, Aircraft, Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-200/60 dark:border-slate-700">
            {flight.airlineLogo || "✈️"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {flight.airline}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                {flightNum}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 truncate">
              <span>{aircraft}</span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{flight.cabinClass}</span>
            </div>
          </div>
        </div>

        {/* Badges & Refundability Status */}
        <div className="flex items-center gap-2 shrink-0">
          {renderAIBadge()}

          {flight.refundable ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Refundable</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800">
              Non-refundable
            </span>
          )}
        </div>
      </div>

      {/* Main Flight Path Schedule & Transit Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Departure & Arrival Visual Route */}
        <div className="md:col-span-8 grid grid-cols-3 items-center gap-2 sm:gap-4">
          {/* Departure */}
          <div className="text-left">
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {depTime}
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {depCode}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {flight.originCity} ({depTerminal})
            </div>
          </div>

          {/* Flight Path Graphic & Stops */}
          <div className="flex flex-col items-center justify-center text-center px-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{flight.totalDuration}</span>
            </div>

            {/* Flight Line Graphic */}
            <div className="w-full flex items-center justify-center gap-1 relative my-1">
              <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700 relative">
                {flight.stops > 0 && (
                  <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-90 shrink-0" />
            </div>

            {/* Stops indicator */}
            <div className="text-[11px] font-bold">
              {flight.stops === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">Non-stop</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  {flight.stops} Stop {flight.layoverDetails ? `(${flight.layoverDetails.split(" ")[0]})` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {arrTime}
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {arrCode}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {flight.destinationCity} ({arrTerminal})
            </div>
          </div>
        </div>

        {/* Pricing & Value Summary */}
        <div className="md:col-span-4 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
          <div className="text-left md:text-right">
            <div className="text-[11px] text-slate-400 font-medium">Starting from</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalPrice, currency)}
            </div>
            <div className="text-[10px] text-slate-400">
              {travelersCount > 1 ? `${formatCurrency(flight.price, currency)} / traveler` : "Taxes & fees included"}
            </div>
          </div>

          <div className="text-right mt-1">
            {flight.seatsRemaining <= 5 && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                Only {flight.seatsRemaining} seats left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Perks & Luggage Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          {/* Baggage */}
          <div className="flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {flight.baggageIncluded
                ? flight.baggageDetails?.checkedBag || "1 Checked Bag (23kg) + Cabin"
                : "Cabin bag only (7kg)"}
            </span>
          </div>

          {/* Eco Score */}
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <Leaf className="w-3.5 h-3.5" />
            <span>{flight.carbonEmissionKg} kg CO₂ (Grade {flight.ecoScore})</span>
          </div>

          {/* On-Time Rating */}
          {flight.onTimeRate && (
            <div className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{flight.onTimeRate}%</span>
              <span>on-time</span>
            </div>
          )}
        </div>

        {/* AI Insight Teaser */}
        {flight.aiBadgeReason && (
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{flight.aiBadgeReason}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Bar: Select, Compare, Ask AI, Add to Trip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {/* Left Actions: Compare, Ask AI, Add to Trip */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Compare Button */}
          <button
            type="button"
            onClick={() => onToggleCompare(flight)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isCompared
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5 text-blue-500" />}
            <span>{isCompared ? "Comparing" : "Compare"}</span>
          </button>

          {/* Ask AI Button */}
          <button
            type="button"
            onClick={() => onAskAI(flight)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Ask AI</span>
          </button>

          {/* Add to Trip Button */}
          <button
            type="button"
            onClick={() => onAddToTrip(flight)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Add to Trip</span>
          </button>
        </div>

        {/* Right Primary Action: Select Flight */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(flight)}
          className="rounded-xl px-4 sm:px-5 font-bold shadow-md shadow-blue-600/20 text-xs sm:text-sm flex items-center gap-1.5"
        >
          <span>Select Flight</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
