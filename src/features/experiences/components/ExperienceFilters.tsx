import React from "react";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Clock,
  ArrowUpDown,
  X,
} from "lucide-react";
import { ExperienceCategory } from "../../../types";
import { EXPERIENCE_CATEGORIES } from "../experienceData";
import { Badge } from "../../../components/ui";

interface ExperienceFiltersProps {
  selectedCategory: ExperienceCategory | "all";
  onSelectCategory: (cat: ExperienceCategory | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDestination: string;
  onSelectDestination: (dest: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  minAiMatch: number;
  onMinAiMatchChange: (match: number) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  durationFilter: string;
  onDurationFilterChange: (duration: string) => void;
  totalResultsCount: number;
  onResetFilters: () => void;
}

const QUICK_DESTINATIONS = [
  "All",
  "Tokyo",
  "Kyoto",
  "Paris",
  "Rome",
  "Bali",
  "Iceland",
  "Switzerland",
  "Barcelona",
  "New York",
  "Santorini",
];

export const ExperienceFilters: React.FC<ExperienceFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedDestination,
  onSelectDestination,
  maxPrice,
  onMaxPriceChange,
  minAiMatch,
  onMinAiMatchChange,
  sortBy,
  onSortByChange,
  durationFilter,
  onDurationFilterChange,
  totalResultsCount,
  onResetFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="space-y-5">
      {/* 1. Category Tabs Bar (8 Main Categories + All) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Browse by Category
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {totalResultsCount} Handpicked Experiences
          </span>
        </div>

        {/* 8 Categories pills with icons & active states */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* ALL */}
          <button
            onClick={() => onSelectCategory("all")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>✨</span>
            <span>All Categories</span>
          </button>

          {/* 8 SPECIFIC CATEGORIES */}
          {EXPERIENCE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id.toLowerCase()}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Search & Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword / Title / Activity Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search experiences (e.g., tea ceremony, paragliding, ramen, sunset sail)..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="ai_match">Sort by: AI Match (Highest)</option>
                <option value="rating_high">Sort by: Guest Rating</option>
                <option value="price_low">Sort by: Price (Low to High)</option>
                <option value="price_high">Sort by: Price (High to Low)</option>
                <option value="duration_short">Sort by: Duration (Shorter)</option>
              </select>
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex-1 h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                showAdvanced || maxPrice < 400 || minAiMatch > 0 || durationFilter !== "all"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(maxPrice < 400 || minAiMatch > 0 || durationFilter !== "all") && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {(searchQuery || selectedCategory !== "all" || selectedDestination !== "All" || maxPrice < 400 || minAiMatch > 0 || durationFilter !== "all") && (
              <button
                onClick={onResetFilters}
                className="h-11 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Destination Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            Destinations:
          </span>
          {QUICK_DESTINATIONS.map((dest) => {
            const isSelected = selectedDestination === dest;
            return (
              <button
                key={dest}
                onClick={() => onSelectDestination(dest)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {dest}
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Duration Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Duration Length
              </label>
              <select
                value={durationFilter}
                onChange={(e) => onDurationFilterChange(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Any Duration</option>
                <option value="short">Short (&lt; 3 Hours)</option>
                <option value="medium">Half Day (3 - 5 Hours)</option>
                <option value="full">Full Day (6+ Hours)</option>
              </select>
            </div>

            {/* AI Match Minimum Threshold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  Min AI Match
                </span>
                <span>{minAiMatch > 0 ? `${minAiMatch}%+` : "Any"}</span>
              </div>
              <input
                type="range"
                min="0"
                max="98"
                step="2"
                value={minAiMatch}
                onChange={(e) => onMinAiMatchChange(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>All</span>
                <span>90%+</span>
                <span>98%+ Match</span>
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>Max Price / Person</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                  ${maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$50</span>
                <span>$200</span>
                <span>$400+</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
