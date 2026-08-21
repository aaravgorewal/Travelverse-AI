import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Heart,
  FileText,
  Clock,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Sliders,
  ChevronRight,
  Flame,
  Globe,
  Loader2,
} from "lucide-react";
import { GenerateTripPlanParams } from "../../../services/aiService";

export interface TripGenieFormValues {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  budgetTier: "economy" | "moderate" | "luxury" | "ultra-luxury";
  budgetAmount: number;
  travelStyles: string[];
  interests: string[];
  specialRequirements: string;
}

interface TripGenieFormProps {
  onSubmit: (params: GenerateTripPlanParams) => void;
  isLoading: boolean;
  initialValues?: Partial<TripGenieFormValues>;
}

const POPULAR_DESTINATIONS = [
  { name: "Kyoto, Japan", tag: "Culture & Zen", icon: "🏯" },
  { name: "Amalfi Coast, Italy", tag: "Scenic & Romance", icon: "🍋" },
  { name: "Swiss Alps, Switzerland", tag: "Alpine & Hiking", icon: "🏔️" },
  { name: "Tokyo, Japan", tag: "Futuristic & Food", icon: "🗼" },
  { name: "Paris, France", tag: "Art & Gastronomy", icon: "🥐" },
  { name: "Bali, Indonesia", tag: "Tropical & Wellness", icon: "🌺" },
  { name: "Reykjavik, Iceland", tag: "Northern Lights & Glaciers", icon: "🌋" },
  { name: "New York, USA", tag: "Skyline & Broadway", icon: "🗽" },
];

const DURATION_PRESETS = [
  { days: 3, label: "3 Days", sub: "Weekend" },
  { days: 5, label: "5 Days", sub: "City Break" },
  { days: 7, label: "7 Days", sub: "1 Week" },
  { days: 10, label: "10 Days", sub: "Grand Tour" },
  { days: 14, label: "14 Days", sub: "2 Weeks" },
];

const TRAVEL_STYLES = [
  { id: "Culture & Heritage", label: "Culture & Heritage", icon: "🏛️" },
  { id: "Gastronomy & Foodie", label: "Gastronomy & Foodie", icon: "🍣" },
  { id: "Adventure & Outdoors", label: "Adventure & Outdoors", icon: "🧗" },
  { id: "Relaxed & Leisure", label: "Relaxed & Leisure", icon: "☕" },
  { id: "Luxury & VIP", label: "Luxury & VIP", icon: "✨" },
  { id: "Romantic Escape", label: "Romantic Escape", icon: "🥂" },
  { id: "Eco-Friendly", label: "Eco-Friendly", icon: "🌿" },
  { id: "Fast-Paced Explorer", label: "Fast-Paced Explorer", icon: "⚡" },
];

const INTEREST_OPTIONS = [
  { id: "Historic Landmarks", label: "Historic Landmarks", icon: "🏛️" },
  { id: "Fine Dining & Michelin", label: "Fine Dining & Michelin", icon: "🍷" },
  { id: "Scenic Photography", label: "Scenic Photography", icon: "📸" },
  { id: "Nature & Hiking", label: "Nature & Hiking", icon: "🌲" },
  { id: "Thermal Spas & Wellness", label: "Thermal Spas & Wellness", icon: "💆" },
  { id: "Nightlife & Rooftops", label: "Nightlife & Rooftops", icon: "🍸" },
  { id: "Art Galleries & Design", label: "Art Galleries & Design", icon: "🎨" },
  { id: "Yachting & Coastal", label: "Yachting & Coastal", icon: "⛵" },
  { id: "Artisan Shopping", label: "Artisan Shopping", icon: "🛍️" },
  { id: "Local Masterclasses", label: "Local Masterclasses", icon: "🍵" },
];

const SPECIAL_REQUIREMENT_PRESETS = [
  "Vegetarian / Halal dining",
  "Wheelchair & Step-free accessible",
  "Child & stroller friendly",
  "Late morning starts (no 8am)",
  "Michelin dining reservations",
  "Eco-certified hotels only",
  "Scenic high-speed train routes",
];

export function TripGenieForm({ onSubmit, isLoading, initialValues }: TripGenieFormProps) {
  const [destination, setDestination] = useState(initialValues?.destination || "Kyoto, Japan");
  const [startDate, setStartDate] = useState(initialValues?.startDate || "2026-09-12");
  const [endDate, setEndDate] = useState(initialValues?.endDate || "2026-09-19");
  const [durationDays, setDurationDays] = useState(initialValues?.durationDays || 7);
  const [adults, setAdults] = useState(initialValues?.travelers?.adults || 2);
  const [children, setChildren] = useState(initialValues?.travelers?.children || 0);
  const [infants, setInfants] = useState(initialValues?.travelers?.infants || 0);
  const [budgetTier, setBudgetTier] = useState<"economy" | "moderate" | "luxury" | "ultra-luxury">(
    initialValues?.budgetTier || "luxury"
  );
  const [budgetAmount, setBudgetAmount] = useState(initialValues?.budgetAmount || 5500);
  const [travelStyles, setTravelStyles] = useState<string[]>(
    initialValues?.travelStyles || ["Culture & Heritage", "Gastronomy & Foodie"]
  );
  const [interests, setInterests] = useState<string[]>(
    initialValues?.interests || [
      "Historic Landmarks",
      "Fine Dining & Michelin",
      "Scenic Photography",
      "Thermal Spas & Wellness",
    ]
  );
  const [specialRequirements, setSpecialRequirements] = useState(
    initialValues?.specialRequirements || "Prefer quiet boutique hotel rooms, vegetarian friendly options."
  );

  // Recalculate end date when duration changes
  const handleDurationPreset = (days: number) => {
    setDurationDays(days);
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + days);
      setEndDate(end.toISOString().split("T")[0]);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val) {
      const start = new Date(val);
      const end = new Date(start);
      end.setDate(start.getDate() + durationDays);
      setEndDate(end.toISOString().split("T")[0]);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val) {
      const start = new Date(startDate);
      const end = new Date(val);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setDurationDays(diffDays);
      }
    }
  };

  const toggleTravelStyle = (styleId: string) => {
    setTravelStyles((prev) =>
      prev.includes(styleId) ? prev.filter((s) => s !== styleId) : [...prev, styleId]
    );
  };

  const toggleInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.includes(interestId) ? prev.filter((i) => i !== interestId) : [...prev, interestId]
    );
  };

  const handleAddSpecialReq = (req: string) => {
    if (!specialRequirements.includes(req)) {
      setSpecialRequirements((prev) => (prev ? `${prev.trim()}, ${req}` : req));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalTravelers = adults + children + infants;
    onSubmit({
      destination,
      startDate,
      endDate,
      durationDays,
      daysCount: durationDays,
      travelers: totalTravelers,
      travelersCount: totalTravelers,
      budget: budgetTier,
      budgetLevel: budgetTier,
      travelStyle: travelStyles,
      interests,
      specialRequirements,
      dates: `${startDate} to ${endDate}`,
    });
  };

  const totalTravelers = adults + children + infants;

  return (
    <form
      id="tripgenie-inputs-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8"
    >
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous AI Travel Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Design Your Trip with TripGenie AI
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Provide your travel parameters below. Our AI model will synthesize real-time flights,
            handpicked luxury & boutique stays, day-by-day routing, and estimated budgets in seconds.
          </p>
        </div>
      </div>

      {/* 1. DESTINATION INPUT */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>1. Destination</span>
          <span className="text-xs font-normal text-slate-400">(City, Region, or Country)</span>
        </label>

        <div className="relative">
          <input
            id="tripgenie-destination-input"
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400"
          />
          <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Popular Destination Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs text-slate-400 flex-shrink-0 font-medium">Popular:</span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => setDestination(dest.name)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                destination === dest.name
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{dest.icon}</span>
              <span>{dest.name.split(",")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. DATES & DURATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>2. Dates & Trip Duration</span>
          </label>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
          </span>
        </div>

        {/* Duration Quick Presets */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.days}
              type="button"
              onClick={() => handleDurationPreset(preset.days)}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                durationDays === preset.days
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-xs sm:text-sm font-bold leading-tight">{preset.label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  durationDays === preset.days ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {preset.sub}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Start Date
            </label>
            <input
              id="tripgenie-start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              End Date
            </label>
            <input
              id="tripgenie-end-date-input"
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. TRAVELERS & BUDGET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TRAVELERS */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>3. Travelers</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {totalTravelers} Total Guest{totalTravelers > 1 ? "s" : ""}
            </span>
          </label>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Adults</span>
                <span className="text-[11px] text-slate-400">Age 13+</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults(adults + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Children</span>
                <span className="text-[11px] text-slate-400">Age 2–12</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">
                  {children}
                </span>
                <button
                  type="button"
                  onClick={() => setChildren(children + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Infants</span>
                <span className="text-[11px] text-slate-400">Under 2</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInfants(Math.max(0, infants - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">
                  {infants}
                </span>
                <button
                  type="button"
                  onClick={() => setInfants(infants + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BUDGET */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. Target Budget</span>
            </label>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${budgetAmount.toLocaleString()} USD
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            {/* Budget Tiers */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "economy" as const, label: "Economy", icon: "$" },
                { id: "moderate" as const, label: "Moderate", icon: "$$" },
                { id: "luxury" as const, label: "Luxury", icon: "$$$" },
                { id: "ultra-luxury" as const, label: "Ultra", icon: "$$$$" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    setBudgetTier(tier.id);
                    if (tier.id === "economy") setBudgetAmount(2500);
                    if (tier.id === "moderate") setBudgetAmount(4200);
                    if (tier.id === "luxury") setBudgetAmount(6800);
                    if (tier.id === "ultra-luxury") setBudgetAmount(14000);
                  }}
                  className={`py-2 px-1 rounded-xl text-center border transition ${
                    budgetTier === tier.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs font-bold">{tier.icon}</span>
                  <span className="block text-[10px] mt-0.5">{tier.label}</span>
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>$1,000</span>
                <span>$15,000+</span>
              </div>
              <input
                id="tripgenie-budget-slider"
                type="range"
                min="1000"
                max="20000"
                step="250"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. TRAVEL STYLE */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>5. Travel Style</span>
          <span className="text-xs font-normal text-slate-400">(Select all that match)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = travelStyles.includes(style.id);
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleTravelStyle(style.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 font-semibold"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">{style.icon}</span>
                <span className="text-xs leading-tight">{style.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-purple-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. INTERESTS */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>6. Interests & Passions</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => {
            const isSelected = interests.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isSelected && <Check className="w-3 h-3 text-rose-600 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. SPECIAL REQUIREMENTS */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>7. Special Requirements & Preferences</span>
        </label>

        <textarea
          id="tripgenie-special-requirements-input"
          rows={3}
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          placeholder="E.g., Vegetarian restaurants required, wheelchair accessible ground transit, avoid early mornings, prefer direct flights..."
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
        />

        {/* Quick Tag Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick add:</span>
          {SPECIAL_REQUIREMENT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddSpecialReq(preset)}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Powered by Gemini 3.7 Flash autonomous orchestrator</span>
        </div>

        <button
          id="tripgenie-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Synthesizing Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Generate Trip with TripGenie AI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
