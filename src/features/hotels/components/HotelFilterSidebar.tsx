import React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Coffee,
  Star,
  Check,
  DollarSign,
  Building,
  Waves,
} from "lucide-react";
import { HotelSearchParams } from "../../../types";
import { formatCurrency } from "../../../lib/utils";

interface HotelFilterSidebarProps {
  searchParams: HotelSearchParams;
  currency: string;
  onFilterChange: (newParams: Partial<HotelSearchParams>) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

const POPULAR_AMENITIES_LIST = [
  "Traditional Onsen Spa",
  "Michelin Omakase",
  "Infinity Lap Pool",
  "Private Heated Infinity Pool",
  "High-speed Starlink",
  "Butler Service",
  "Retractable Stargazing Roof",
  "Water Slide into Lagoon",
  "Caldera Sunset View",
  "Hydrothermal Spa",
  "Ski Butler",
  "Dior Spa",
  "Rooftop Swimming Pool",
  "Private Geothermal Water Entry",
];

const PROPERTY_TYPES_LIST = [
  "Skyline Penthouse",
  "Luxury Villa",
  "Resort & Spa",
  "Boutique Hotel",
  "Heritage Palace",
  "Eco-Lodge",
];

export const HotelFilterSidebar: React.FC<HotelFilterSidebarProps> = ({
  searchParams,
  currency,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
}) => {
  const maxPrice = searchParams.maxPrice || 2500;
  const minAiScore = searchParams.minAiMatchScore || 0;
  const currentStarRatings = searchParams.starRatings || [];
  const currentAmenities = searchParams.amenities || [];
  const currentPropertyTypes = searchParams.propertyTypes || [];
  const freeCancellation = searchParams.freeCancellationOnly || false;
  const breakfastIncluded = searchParams.breakfastIncludedOnly || false;

  const toggleStarRating = (stars: number) => {
    if (currentStarRatings.includes(stars)) {
      onFilterChange({
        starRatings: currentStarRatings.filter((s) => s !== stars),
      });
    } else {
      onFilterChange({
        starRatings: [...currentStarRatings, stars],
      });
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (currentAmenities.includes(amenity)) {
      onFilterChange({
        amenities: currentAmenities.filter((a) => a !== amenity),
      });
    } else {
      onFilterChange({
        amenities: [...currentAmenities, amenity],
      });
    }
  };

  const togglePropertyType = (type: string) => {
    if (currentPropertyTypes.includes(type)) {
      onFilterChange({
        propertyTypes: currentPropertyTypes.filter((t) => t !== type),
      });
    } else {
      onFilterChange({
        propertyTypes: [...currentPropertyTypes, type],
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Filter Properties
          </h3>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* AI Match Score Threshold */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Minimum AI Match Score</span>
          </label>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            {minAiScore > 0 ? `${minAiScore}%+` : "Any"}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="98"
          step="2"
          value={minAiScore}
          onChange={(e) => onFilterChange({ minAiMatchScore: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>All properties</span>
          <span>90% Top Matches</span>
          <span>98% Flawless</span>
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white">
            Max Nightly Rate
          </label>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(maxPrice, currency)}
          </span>
        </div>

        <input
          type="range"
          min="300"
          max="2800"
          step="50"
          value={maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>$300</span>
          <span>$1,500</span>
          <span>$2,800+</span>
        </div>
      </div>

      {/* Quick Toggles: Free Cancellation & Breakfast Included */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Key Perks & Flexibility
        </label>

        {/* Free Cancellation Toggle */}
        <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Free Cancellation</div>
              <div className="text-[10px] text-slate-400">100% risk-free refundable rates</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={freeCancellation}
            onChange={(e) => onFilterChange({ freeCancellationOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </label>

        {/* Breakfast Included Toggle */}
        <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <Coffee className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Breakfast Included</div>
              <div className="text-[10px] text-slate-400">Gourmet morning dining included</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={breakfastIncluded}
            onChange={(e) => onFilterChange({ breakfastIncludedOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Star Ratings */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Property Star Class
        </label>
        <div className="space-y-1.5">
          {[5, 4, 3].map((stars) => {
            const isSelected = currentStarRatings.includes(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => toggleStarRating(stars)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span>{stars} Stars</span>
                </div>
                <span className="text-amber-400 text-xs">{"★".repeat(stars)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Types */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Sanctuary Type
        </label>
        <div className="space-y-1">
          {PROPERTY_TYPES_LIST.map((type) => {
            const isSelected = currentPropertyTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => togglePropertyType(type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span>{type}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Luxury Amenities */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-900 dark:text-white block">
          Amenities & Features
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {POPULAR_AMENITIES_LIST.map((amenity) => {
            const isSelected = currentAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-3.5 h-3.5 rounded-md border shrink-0 flex items-center justify-center ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className="truncate">{amenity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
