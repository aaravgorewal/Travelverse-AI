import React from "react";
import {
  SlidersHorizontal,
  DollarSign,
  Star,
  Shield,
  Plane,
  Building,
  MapPin,
  Sparkles,
  Car,
  Calendar,
  Layers,
  RotateCcw,
  Check,
  Zap,
  Users,
  Compass,
} from "lucide-react";
import { SearchFilterState } from "../../../types";
import { UniversalCategory } from "../universalSearchService";
import { formatCurrency } from "../../../lib/utils";

interface SearchFilterSidebarProps {
  filters: SearchFilterState;
  currency: string;
  categoryCounts: Record<UniversalCategory, number>;
  onFilterChange: <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => void;
  onResetFilters: () => void;
}

export const SearchFilterSidebar: React.FC<SearchFilterSidebarProps> = ({
  filters,
  currency,
  categoryCounts,
  onFilterChange,
  onResetFilters,
}) => {
  const categories: { id: UniversalCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Categories", icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { id: "flights", label: "Flights", icon: <Plane className="w-4 h-4 text-indigo-500" /> },
    { id: "hotels", label: "Hotels & Villas", icon: <Building className="w-4 h-4 text-emerald-500" /> },
    { id: "packages", label: "Packages", icon: <MapPin className="w-4 h-4 text-purple-500" /> },
    { id: "transfers", label: "Transfers & Chauffeur", icon: <Car className="w-4 h-4 text-amber-500" /> },
    { id: "cars", label: "Car Rentals", icon: <Car className="w-4 h-4 text-teal-500" /> },
    { id: "experiences", label: "Experiences", icon: <Sparkles className="w-4 h-4 text-pink-500" /> },
  ];

  const travelStylesList = [
    { id: "family", label: "Family" },
    { id: "luxury", label: "Luxury" },
    { id: "adventure", label: "Adventure" },
    { id: "romantic", label: "Romantic" },
    { id: "business", label: "Business" },
    { id: "backpacking", label: "Backpacking" },
    { id: "wellness", label: "Wellness" },
    { id: "culture", label: "Culture" },
    { id: "eco", label: "Eco-Friendly" },
  ];

  const commonAmenities = [
    "Wi-Fi",
    "Pool",
    "Spa",
    "Breakfast",
    "Ocean View",
    "Free Cancellation",
    "Instant Confirmation",
    "EV Charging",
    "Autonomous",
    "Butler Service",
  ];

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities || [];
    const exists = current.includes(amenity);
    if (exists) {
      onFilterChange("amenities", current.filter((a) => a !== amenity));
    } else {
      onFilterChange("amenities", [...current, amenity]);
    }
  };

  const handleStyleToggle = (style: string) => {
    const current = filters.travelStyles || [];
    const exists = current.includes(style);
    if (exists) {
      onFilterChange("travelStyles", current.filter((s) => s !== style));
    } else {
      onFilterChange("travelStyles", [...current, style]);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold tracking-tight">Filter Search</h2>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Category Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Category
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onFilterChange("category", cat.id);
                  onFilterChange("page", 1);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isSelected ? "text-white" : ""}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Price Range
          </label>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            Up to {formatCurrency(filters.maxPrice, currency)}
          </span>
        </div>

        {/* Dynamic Range Slider */}
        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => {
            onFilterChange("maxPrice", Number(e.target.value));
            onFilterChange("page", 1);
          }}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        {/* Dual Numeric Price Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Min Price</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                max={filters.maxPrice}
                value={filters.minPrice || ""}
                onChange={(e) => {
                  onFilterChange("minPrice", Number(e.target.value) || 0);
                  onFilterChange("page", 1);
                }}
                placeholder="0"
                className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Max Budget</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={filters.minPrice}
                max="50000"
                value={filters.maxPrice || ""}
                onChange={(e) => {
                  onFilterChange("maxPrice", Number(e.target.value) || 5000);
                  onFilterChange("page", 1);
                }}
                placeholder="5000"
                className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Budget Preset Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "< $300", max: 300 },
            { label: "$300–$800", min: 300, max: 800 },
            { label: "$800–$2k", min: 800, max: 2000 },
            { label: "$2k+", min: 2000, max: 10000 },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                onFilterChange("minPrice", preset.min || 0);
                onFilterChange("maxPrice", preset.max);
                onFilterChange("page", 1);
              }}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors cursor-pointer text-slate-600 dark:text-slate-400"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rating Selection */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { val: 0, label: "Any" },
            { val: 4.0, label: "4.0★" },
            { val: 4.5, label: "4.5★" },
            { val: 4.8, label: "4.8★" },
          ].map((rt) => {
            const isSelected = filters.minRating === rt.val;
            return (
              <button
                key={rt.val}
                onClick={() => {
                  onFilterChange("minRating", rt.val);
                  onFilterChange("page", 1);
                }}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                {rt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Cancellation Policy Toggle */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <label
          onClick={() => {
            onFilterChange("freeCancellationOnly", !filters.freeCancellationOnly);
            onFilterChange("page", 1);
          }}
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Free Cancellation Only
            </span>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              filters.freeCancellationOnly
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {filters.freeCancellationOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </label>
      </div>

      {/* 5. Category-Specific Filters */}
      {filters.category === "flights" && (
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Cabin Class
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {["all", "economy", "premium economy", "business", "first"].map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  onFilterChange("flightClass", cls);
                  onFilterChange("page", 1);
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                  (filters.flightClass || "all") === cls
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {filters.category === "cars" && (
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Car Class & Transmission
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {["all", "electric", "luxury", "suv", "sports", "executive"].map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  onFilterChange("carCategory", cls);
                  onFilterChange("page", 1);
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                  (filters.carCategory || "all") === cls
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {filters.category === "transfers" && (
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Transfer Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {["all", "sedan", "van", "helicopter", "speedboat", "electric"].map((vType) => (
              <button
                key={vType}
                onClick={() => {
                  onFilterChange("transferType", vType);
                  onFilterChange("page", 1);
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                  (filters.transferType || "all") === vType
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {vType}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Traveler Preferences (TravelDNA) */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Traveler Style Match
        </label>
        <div className="flex flex-wrap gap-1.5">
          {travelStylesList.map((st) => {
            const isSelected = filters.travelStyles?.includes(st.id);
            return (
              <button
                key={st.id}
                onClick={() => {
                  handleStyleToggle(st.id);
                  onFilterChange("page", 1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Amenities & Perks Checklist */}
      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Amenities & Features
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {commonAmenities.map((amenity) => {
            const isSelected = filters.amenities?.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => {
                  handleAmenityToggle(amenity);
                  onFilterChange("page", 1);
                }}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-400"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                    isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="truncate">{amenity}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
