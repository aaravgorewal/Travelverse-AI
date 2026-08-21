import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { TravelExperience, ExperienceCategory } from "../../types";
import {
  SEED_COMPREHENSIVE_EXPERIENCES,
  EXPERIENCE_CATEGORIES,
} from "./experienceData";
import { ExperienceCard } from "./components/ExperienceCard";
import { ExperienceDetailModal } from "./components/ExperienceDetailModal";
import { ExperienceAddToTripModal } from "./components/ExperienceAddToTripModal";
import { ExperienceFilters } from "./components/ExperienceFilters";
import { Button, Badge } from "../../components/ui";

export const ExperiencesView: React.FC = () => {
  const { currency, setSelectedExperience, setCheckoutItem } = useTravelStore();
  const { setModule, openAIWithPrompt } = useUIStore();

  // Category and filter states
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("All");
  const [maxPrice, setMaxPrice] = useState(400);
  const [minAiMatch, setMinAiMatch] = useState(0);
  const [sortBy, setSortBy] = useState("ai_match");
  const [durationFilter, setDurationFilter] = useState("all");

  // Modal states
  const [detailExperience, setDetailExperience] = useState<TravelExperience | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [addToTripExperience, setAddToTripExperience] = useState<TravelExperience | null>(null);
  const [isAddToTripOpen, setIsAddToTripOpen] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);

  // Parse URL search params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("expCategory");
    const expIdParam = urlParams.get("expId");
    const destParam = urlParams.get("expDest");

    if (categoryParam) {
      const match = EXPERIENCE_CATEGORIES.find(
        (c) => c.id.toLowerCase() === categoryParam.toLowerCase()
      );
      if (match) setSelectedCategory(match.id);
    }

    if (destParam) {
      setSelectedDestination(destParam);
    }

    if (expIdParam) {
      const found = SEED_COMPREHENSIVE_EXPERIENCES.find((e) => e.id === expIdParam);
      if (found) {
        setDetailExperience(found);
        setIsDetailOpen(true);
      }
    }
  }, []);

  // Filter and sort experiences
  const filteredExperiences = useMemo(() => {
    return SEED_COMPREHENSIVE_EXPERIENCES.filter((exp) => {
      // 1. Category filter (8 categories)
      if (
        selectedCategory !== "all" &&
        exp.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // 2. Destination filter
      if (
        selectedDestination !== "All" &&
        !exp.city.toLowerCase().includes(selectedDestination.toLowerCase()) &&
        !exp.country.toLowerCase().includes(selectedDestination.toLowerCase())
      ) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (exp.name || exp.title).toLowerCase().includes(q);
        const matchesCity = exp.city.toLowerCase().includes(q);
        const matchesCountry = exp.country.toLowerCase().includes(q);
        const matchesDesc = exp.description.toLowerCase().includes(q);
        const matchesTags = exp.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCity && !matchesCountry && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // 4. Max Price
      if (exp.price > maxPrice) {
        return false;
      }

      // 5. Min AI Match
      if (minAiMatch > 0 && (exp.aiMatchScore || 0) < minAiMatch) {
        return false;
      }

      // 6. Duration filter
      if (durationFilter === "short" && (exp.durationHours || 4) >= 3) {
        return false;
      }
      if (durationFilter === "medium" && ((exp.durationHours || 4) < 3 || (exp.durationHours || 4) > 5)) {
        return false;
      }
      if (durationFilter === "full" && (exp.durationHours || 4) < 6) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "ai_match") {
        return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
      }
      if (sortBy === "rating_high") {
        return b.rating - a.rating;
      }
      if (sortBy === "price_low") {
        return a.price - b.price;
      }
      if (sortBy === "price_high") {
        return b.price - a.price;
      }
      if (sortBy === "duration_short") {
        return (a.durationHours || 0) - (b.durationHours || 0);
      }
      return 0;
    });
  }, [
    selectedCategory,
    selectedDestination,
    searchQuery,
    maxPrice,
    minAiMatch,
    durationFilter,
    sortBy,
  ]);

  // Action handlers
  const handleViewExperience = (exp: TravelExperience) => {
    setDetailExperience(exp);
    setIsDetailOpen(true);
  };

  const handleAddExperience = (exp: TravelExperience) => {
    setAddToTripExperience(exp);
    setIsAddToTripOpen(true);
  };

  const handleAskAI = (exp: TravelExperience) => {
    const prompt = `I am evaluating the "${exp.name || exp.title}" in ${exp.city}, ${exp.country} (${exp.category} experience, ${exp.duration}, ${exp.price} USD). Can you give me tailored advice on the best time of day to do this, what to wear/bring, how it compares to other local activities, and any hidden tips?`;
    openAIWithPrompt(prompt);
  };

  const handleBookExperience = (
    exp: TravelExperience,
    guestsCount = 2,
    date = "2026-09-14"
  ) => {
    setSelectedExperience(exp);
    setCheckoutItem({
      type: "experience",
      item: exp,
      travelers: guestsCount,
      dates: { start: date },
      totalPrice: exp.price * guestsCount,
    });
    setModule("payments");
  };

  const handleToggleFavorite = (exp: TravelExperience) => {
    if (favorites.includes(exp.id)) {
      setFavorites(favorites.filter((id) => id !== exp.id));
    } else {
      setFavorites([...favorites, exp.id]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedDestination("All");
    setMaxPrice(400);
    setMinAiMatch(0);
    setSortBy("ai_match");
    setDurationFilter("all");
  };

  return (
    <div className="space-y-8 pb-16 w-full max-w-full">
      {/* 1. HERO HEADER */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-blue-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 backdrop-blur-md">
              VIP Local Passes & Masterclasses
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              AI Preference Matching
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Curated Local Experiences & World-Class Adventures
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            From Arctic glacier ice caves and Kyoto tea ceremonies to secret izakaya food crawls,
            private fashion stylists, and rooftop jazz clubs—tailored precisely to your traveler profile.
          </p>

          {/* 8 Category Badges Preview */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {EXPERIENCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  window.scrollTo({ top: 320, behavior: "smooth" });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold"
                    : "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <ExperienceFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDestination={selectedDestination}
        onSelectDestination={setSelectedDestination}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        minAiMatch={minAiMatch}
        onMinAiMatchChange={setMinAiMatch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        durationFilter={durationFilter}
        onDurationFilterChange={setDurationFilter}
        totalResultsCount={filteredExperiences.length}
        onResetFilters={handleResetFilters}
      />

      {/* 3. EXPERIENCES CARD GRID */}
      {filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              currency={currency}
              onView={handleViewExperience}
              onAdd={handleAddExperience}
              onAskAI={handleAskAI}
              onBook={handleBookExperience}
              isFavorite={favorites.includes(exp.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Experiences Match Your Criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your category, price range, or clearing the search query to explore all activities.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset All Filters
          </Button>
        </div>
      )}

      {/* 4. MODALS */}
      {/* (A) Detail Modal (triggered by "View" action) */}
      <ExperienceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        experience={detailExperience}
        currency={currency}
        onAdd={(exp) => {
          setIsDetailOpen(false);
          handleAddExperience(exp);
        }}
        onAskAI={handleAskAI}
        onBook={(exp, guests, date) => {
          setIsDetailOpen(false);
          handleBookExperience(exp, guests, date);
        }}
      />

      {/* (B) Add to Trip Modal (triggered by "Add" action) */}
      {addToTripExperience && (
        <ExperienceAddToTripModal
          isOpen={isAddToTripOpen}
          onClose={() => setIsAddToTripOpen(false)}
          experience={addToTripExperience}
          currency={currency}
        />
      )}
    </div>
  );
};
