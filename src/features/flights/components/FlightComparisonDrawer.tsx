import React, { useState } from "react";
import {
  Layers,
  X,
  Check,
  Plane,
  Clock,
  Luggage,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Maximize2,
  Trash2,
  Tag,
  Zap,
  Award,
} from "lucide-react";
import { FlightOffer } from "../../../types";
import { Button, Badge, Modal } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface FlightComparisonDrawerProps {
  comparedFlights: FlightOffer[];
  currency: string;
  onRemoveFlight: (flightId: string) => void;
  onClearAll: () => void;
  onSelectFlight: (flight: FlightOffer) => void;
}

export const FlightComparisonDrawer: React.FC<FlightComparisonDrawerProps> = ({
  comparedFlights,
  currency,
  onRemoveFlight,
  onClearAll,
  onSelectFlight,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (comparedFlights.length === 0) return null;

  // Find best metrics among compared flights
  const minPrice = Math.min(...comparedFlights.map((f) => f.price));
  const minStops = Math.min(...comparedFlights.map((f) => f.stops));
  const maxOnTime = Math.max(...comparedFlights.map((f) => f.onTimeRate || 0));

  return (
    <>
      {/* Sticky Bottom Comparison Floating Dock */}
      <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between gap-3">
          {/* Left Title & Counter */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight">Compare Flights</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {comparedFlights.length}/3 Selected
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Side-by-side fare, amenity, and routing inspection
              </p>
            </div>
          </div>

          {/* Center Mini Flight Avatars */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[45%]">
            {comparedFlights.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs shrink-0 group relative"
              >
                <span>{f.airlineLogo || "✈️"}</span>
                <span className="font-bold text-slate-200 truncate max-w-[80px] sm:max-w-[110px]">
                  {f.flightNumber || f.airline}
                </span>
                <span className="font-black text-blue-400 ml-1">{formatCurrency(f.price, currency)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFlight(f.id);
                  }}
                  className="w-4 h-4 rounded-full bg-slate-700 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors ml-1"
                  title="Remove from comparison"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 hidden sm:block"
            >
              Clear All
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Compare ({comparedFlights.length})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Full Comparison Modal Table */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Side-by-Side Flight Comparison (Up to 3 Flights)"
        size="xl"
      >
        <div className="space-y-6 pt-2 pb-4 overflow-x-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span>Analyzing specs across {comparedFlights.length} selected flights</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Flights</span>
            </button>
          </div>

          {/* Comparison Grid Table */}
          <div className="min-w-[650px] divide-y divide-slate-100 dark:divide-slate-800">
            {/* Header: Airline & Flight Info */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center font-bold text-xs uppercase tracking-wider text-slate-400">
              <div>Flight Overview</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="relative p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => onRemoveFlight(f.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove flight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{f.airlineLogo || "✈️"}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white normal-case text-sm truncate">
                      {f.airline}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                    {f.flightNumber || `${f.airlineCode} Flight`}
                  </div>
                  <div className="text-[10px] text-slate-400 normal-case">{f.aircraft || "Commercial Jet"}</div>
                </div>
              ))}
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Total Price</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{formatCurrency(f.price, currency)}</span>
                  {f.price === minPrice && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Lowest Fare
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Route & Schedule Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Schedule & Route</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="space-y-1">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {f.departureTime.slice(11, 16)} ({f.originCode}) → {f.arrivalTime.slice(11, 16)} ({f.destinationCode})
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{f.totalDuration}</span>
                    <span>•</span>
                    <span className={f.stops === 0 ? "text-emerald-600 font-semibold" : "text-amber-600"}>
                      {f.stops === 0 ? "Non-stop" : `${f.stops} Stop`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cabin & Seating Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Cabin Class</div>
              {comparedFlights.map((f) => (
                <div key={f.id}>
                  <Badge variant={f.cabinClass === "First" ? "purple" : f.cabinClass === "Business" ? "blue" : "outline"}>
                    {f.cabinClass}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Baggage Allowance Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Baggage Allowance</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">
                      {f.baggageIncluded
                        ? f.baggageDetails?.checkedBag || "1x 23kg Checked Included"
                        : "Cabin Bag Only"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Personal Item + Cabin Bag Included</div>
                </div>
              ))}
            </div>

            {/* Refundability Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Refund Policy</div>
              {comparedFlights.map((f) => (
                <div key={f.id}>
                  {f.refundable ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Free Cancellation</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Non-refundable</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Eco Emissions Row */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Carbon & Eco Score</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{f.carbonEmissionKg} kg CO₂</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                    Grade {f.ecoScore}
                  </span>
                </div>
              ))}
            </div>

            {/* Amenities Highlights */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">In-Flight Amenities</div>
              {comparedFlights.map((f) => (
                <div key={f.id} className="space-y-1">
                  {(f.amenities || ["Wi-Fi", "Meal", "USB Power"]).slice(0, 3).map((amenity, i) => (
                    <div key={i} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <Check className="w-3 h-3 text-blue-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* AI Recommendation Badge */}
            <div className="grid grid-cols-4 gap-4 py-3 items-center text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">AI Intelligence</div>
              {comparedFlights.map((f) => (
                <div key={f.id}>
                  {f.aiBadge ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                      {f.aiBadge}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Standard Match</span>
                  )}
                </div>
              ))}
            </div>

            {/* Select Buttons Row */}
            <div className="grid grid-cols-4 gap-4 pt-4 pb-2 items-center">
              <div className="text-xs font-bold text-slate-400">Decision</div>
              {comparedFlights.map((f) => (
                <div key={f.id}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold rounded-xl text-xs"
                    onClick={() => {
                      setIsOpen(false);
                      onSelectFlight(f);
                    }}
                  >
                    <span>Select Flight</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
