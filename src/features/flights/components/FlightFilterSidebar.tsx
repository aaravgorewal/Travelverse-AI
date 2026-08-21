import React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Luggage,
  Clock,
  Leaf,
  DollarSign,
  Plane,
  Check,
} from "lucide-react";
import { Button } from "../../../components/ui";

export interface FlightFilterState {
  stops: "all" | "direct" | "1";
  cabinClass: string;
  refundableOnly: boolean;
  baggageIncludedOnly: boolean;
  ecoOnly: boolean;
  minPrice: number;
  maxPrice: number;
  selectedAirlines: string[];
  departureTimeWindow: "all" | "morning" | "afternoon" | "evening" | "night";
}

interface FlightFilterSidebarProps {
  filters: FlightFilterState;
  onChange: (filters: FlightFilterState) => void;
  onReset: () => void;
  availableAirlines: { name: string; code: string; logo: string; minPrice: number; count: number }[];
  priceRange: { min: number; max: number };
}

export const FlightFilterSidebar: React.FC<FlightFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  availableAirlines,
  priceRange,
}) => {
  const handleStopsChange = (stops: "all" | "direct" | "1") => {
    onChange({ ...filters, stops });
  };

  const handleCabinChange = (cabinClass: string) => {
    onChange({ ...filters, cabinClass });
  };

  const toggleAirline = (airlineName: string) => {
    const next = filters.selectedAirlines.includes(airlineName)
      ? filters.selectedAirlines.filter((a) => a !== airlineName)
      : [...filters.selectedAirlines, airlineName];
    onChange({ ...filters, selectedAirlines: next });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Flight Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Stops */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Number of Stops
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: "all", label: "All" },
              { id: "direct", label: "Direct" },
              { id: "1", label: "≤ 1 Stop" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStopsChange(s.id)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all border ${
                filters.stops === s.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cabin Class */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Cabin Class
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {["All Classes", "Economy", "Premium Economy", "Business", "First"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCabinChange(c)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold text-left transition-all border truncate ${
                filters.cabinClass === c
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Max Price
          </label>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
            ${filters.maxPrice || priceRange.max}
          </span>
        </div>
        <input
          type="range"
          min={priceRange.min || 100}
          max={priceRange.max || 2500}
          step={50}
          value={filters.maxPrice || priceRange.max}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
          <span>${priceRange.min}</span>
          <span>${priceRange.max}</span>
        </div>
      </div>

      {/* Airlines Selector */}
      {availableAirlines.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Airlines ({availableAirlines.length})
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableAirlines.map((airline) => {
              const isChecked = filters.selectedAirlines.includes(airline.name);
              return (
                <div
                  key={airline.name}
                  onClick={() => toggleAirline(airline.name)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isChecked
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 font-bold"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{airline.logo}</span>
                    <span className="text-slate-900 dark:text-white truncate">{airline.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-1">
                    from ${airline.minPrice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perks & Policy Toggles */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Protection & Perks
        </label>

        {/* Free Cancellation Toggle */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Free Cancellation Only</span>
          </div>
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={(e) => onChange({ ...filters, refundableOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
        </label>

        {/* Checked Baggage Included Toggle */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer text-xs">
          <div className="flex items-center gap-2">
            <Luggage className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Checked Bag Included</span>
          </div>
          <input
            type="checkbox"
            checked={filters.baggageIncludedOnly}
            onChange={(e) => onChange({ ...filters, baggageIncludedOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
        </label>

        {/* Eco Grade A Only */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer text-xs">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Eco-Certified (Grade A)</span>
          </div>
          <input
            type="checkbox"
            checked={filters.ecoOnly}
            onChange={(e) => onChange({ ...filters, ecoOnly: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
        </label>
      </div>
    </div>
  );
};
