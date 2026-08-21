import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Plane,
  Building,
  MapPin,
  Sparkles,
  Car,
  DollarSign,
  Star,
  ArrowRight,
  Filter,
  Layers,
  Share2,
  Check,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Calendar,
  Shield,
  Glasses,
  Flame,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { useToast } from "../../components/ui/Toast";
import { SearchFilterState, VRScene } from "../../types";
import {
  universalSearchService,
  UniversalCategory,
  UniversalSearchResultItem,
  INITIAL_SEARCH_FILTERS,
} from "./universalSearchService";
import { useSearchUrlSync, parseFiltersFromUrl } from "./useSearchUrlSync";
import { SearchFilterSidebar } from "./components/SearchFilterSidebar";
import { SearchResultCard } from "./components/SearchResultCard";
import { SearchItemDetailModal } from "./components/SearchItemDetailModal";
import { MobileSidebarDrawer } from "../../components/shared/MobileSidebarDrawer";
import { Button, Card, Badge, Input } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";

export const SearchView: React.FC = () => {
  const {
    currency,
    setSelectedFlight,
    setSelectedHotel,
    setSelectedPackage,
    setSelectedExperience,
    setSelectedTransfer,
    setSelectedCar,
    setCheckoutItem,
  } = useTravelStore();

  const { setModule, openVR } = useUIStore();
  const { showToast } = useToast();

  // 1. Initial State synced from URL parameters
  const [filters, setFilters] = useState<SearchFilterState>(() => ({
    ...INITIAL_SEARCH_FILTERS,
    ...parseFiltersFromUrl(),
  }));

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<UniversalSearchResultItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 2. URL Sync Hook
  const handleUrlFiltersChange = useCallback((newFilters: Partial<SearchFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const { copyShareableLink } = useSearchUrlSync(filters, handleUrlFiltersChange);

  const updateFilter = <K extends keyof SearchFilterState>(key: K, value: SearchFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      ...INITIAL_SEARCH_FILTERS,
      category: filters.category, // keep current active category
    });
  };

  // 3. Search Engine Execution
  const searchResults = useMemo(() => {
    return universalSearchService.search(filters);
  }, [filters]);

  // Simulate subtle query response transition
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 120);
    return () => clearTimeout(t);
  }, [filters]);

  // Quick destination chips
  const popularDestinations = ["Dubai", "Tokyo", "Paris", "Santorini", "Swiss Alps", "London", "Maldives"];

  // Category navigation tabs
  const categoryTabs: { id: UniversalCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Travel", icon: <Layers className="w-4 h-4" /> },
    { id: "flights", label: "Flights", icon: <Plane className="w-4 h-4" /> },
    { id: "hotels", label: "Hotels", icon: <Building className="w-4 h-4" /> },
    { id: "packages", label: "Packages", icon: <MapPin className="w-4 h-4" /> },
    { id: "transfers", label: "Transfers", icon: <Car className="w-4 h-4" /> },
    { id: "cars", label: "Cars", icon: <Car className="w-4 h-4" /> },
    { id: "experiences", label: "Experiences", icon: <Sparkles className="w-4 h-4" /> },
  ];

  // Active filters list for chips
  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.query) {
      chips.push({
        label: `"${filters.query}"`,
        onRemove: () => updateFilter("query", ""),
      });
    }
    if (filters.destination) {
      chips.push({
        label: `Destination: ${filters.destination}`,
        onRemove: () => updateFilter("destination", ""),
      });
    }
    if (filters.origin) {
      chips.push({
        label: `Origin: ${filters.origin}`,
        onRemove: () => updateFilter("origin", ""),
      });
    }
    if (filters.maxPrice < 10000) {
      chips.push({
        label: `Budget ≤ ${formatCurrency(filters.maxPrice, currency)}`,
        onRemove: () => updateFilter("maxPrice", 10000),
      });
    }
    if (filters.minPrice > 0) {
      chips.push({
        label: `Min Price ≥ ${formatCurrency(filters.minPrice, currency)}`,
        onRemove: () => updateFilter("minPrice", 0),
      });
    }
    if (filters.minRating > 0) {
      chips.push({
        label: `Rating ≥ ${filters.minRating}★`,
        onRemove: () => updateFilter("minRating", 0),
      });
    }
    if (filters.freeCancellationOnly) {
      chips.push({
        label: "Free Cancellation",
        onRemove: () => updateFilter("freeCancellationOnly", false),
      });
    }
    if (filters.flightClass && filters.flightClass !== "all") {
      chips.push({
        label: `Class: ${filters.flightClass}`,
        onRemove: () => updateFilter("flightClass", "all"),
      });
    }
    if (filters.carCategory && filters.carCategory !== "all") {
      chips.push({
        label: `Car: ${filters.carCategory}`,
        onRemove: () => updateFilter("carCategory", "all"),
      });
    }
    if (filters.transferType && filters.transferType !== "all") {
      chips.push({
        label: `Transfer: ${filters.transferType}`,
        onRemove: () => updateFilter("transferType", "all"),
      });
    }
    (filters.amenities || []).forEach((amenity) => {
      chips.push({
        label: amenity,
        onRemove: () =>
          updateFilter(
            "amenities",
            (filters.amenities || []).filter((a) => a !== amenity)
          ),
      });
    });
    (filters.travelStyles || []).forEach((style) => {
      chips.push({
        label: `Style: ${style}`,
        onRemove: () =>
          updateFilter(
            "travelStyles",
            (filters.travelStyles || []).filter((s) => s !== style)
          ),
      });
    });

    return chips;
  }, [filters, currency]);

  // Handle item selection & booking
  const handleSelectItem = (item: UniversalSearchResultItem) => {
    if (item.category === "flight") {
      setSelectedFlight(item.rawItem as any);
    } else if (item.category === "hotel") {
      setSelectedHotel(item.rawItem as any);
    } else if (item.category === "package") {
      setSelectedPackage(item.rawItem as any);
    } else if (item.category === "experience") {
      setSelectedExperience(item.rawItem as any);
    } else if (item.category === "transfer") {
      setSelectedTransfer(item.rawItem as any);
    } else if (item.category === "car") {
      setSelectedCar(item.rawItem as any);
    }

    // Set checkout item
    setCheckoutItem({
      type: item.category,
      item: item.rawItem,
      travelers: 1,
      dates: {
        start: filters.dateStart || new Date().toISOString().split("T")[0],
        end: filters.dateEnd || undefined,
      },
      totalPrice: item.price,
    });

    // Navigate to payment
    setModule("payments");
  };

  const handleOpenVR = (item: UniversalSearchResultItem) => {
    const vrScene: VRScene = {
      id: `vr-${item.id}`,
      title: item.title,
      destination: item.location,
      country: item.country || "Global",
      type: item.category === "hotel" ? "hotel-suite" : item.category === "flight" ? "first-class-cabin" : "360-landscape",
      panoramaUrl:
        item.vrPanoramaUrl ||
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
      thumbnailUrl: item.imageUrl,
      description: `${item.title} - Immersive 360° Spatial Immersion`,
      hotspots: [
        {
          id: "h1",
          title: "Panoramic View",
          description: "Stunning 360-degree panoramic perspective",
          x: 50,
          y: 50,
          tag: "Viewpoint",
        },
      ],
    };
    openVR(vrScene);
  };

  const handleCopyLink = async () => {
    await copyShareableLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast({
      type: "success",
      title: "Search Link Copied",
      message: "Shareable filtered search link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full max-w-full overflow-x-hidden animate-fade-in">
      {/* 1. Top Universal Search Command Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryTabs.map((tab) => {
            const isSelected = filters.category === tab.id;
            const count = searchResults.categoryCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  updateFilter("category", tab.id);
                  updateFilter("page", 1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Multi-Field Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main Keyword / Query */}
          <div className="relative md:col-span-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => {
                updateFilter("query", e.target.value);
                updateFilter("page", 1);
              }}
              placeholder="Search keyword, airline, hotel, or car..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Destination */}
          <div className="relative md:col-span-3">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.destination}
              onChange={(e) => {
                updateFilter("destination", e.target.value);
                updateFilter("page", 1);
              }}
              placeholder="Destination (e.g. Dubai, Tokyo)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Date Picker */}
          <div className="relative md:col-span-3">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={filters.dateStart || ""}
              onChange={(e) => {
                updateFilter("dateStart", e.target.value);
                updateFilter("page", 1);
              }}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            />
          </div>

          {/* Mobile Filter Drawer Button / Actions */}
          <div className="flex items-center gap-2 md:col-span-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex-1 gap-2 text-xs py-2.5 rounded-2xl"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
              <span>Filters ({activeFilterChips.length})</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              title="Copy shareable filter URL"
              className="px-3 py-2.5 rounded-2xl text-xs gap-1.5 font-bold shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Popular Destination Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
            Popular:
          </span>
          {popularDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => {
                updateFilter("destination", dest);
                updateFilter("page", 1);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                filters.destination.toLowerCase() === dest.toLowerCase()
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Search Viewport (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar (Left 3 cols) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-20 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <SearchFilterSidebar
            filters={filters}
            currency={currency}
            categoryCounts={searchResults.categoryCounts}
            onFilterChange={updateFilter}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Search Results Area (Right 9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Active Filter Chips & Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Found {searchResults.totalCount} results
              </span>

              {activeFilterChips.length > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                >
                  Clear all ({activeFilterChips.length})
                </button>
              )}
            </div>

            {/* View Mode & Sort Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="recommended">AI Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="duration_asc">Shortest Duration</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Removable Active Filter Pills */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeFilterChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs font-semibold text-blue-700 dark:text-blue-300 animate-fade-in"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="p-0.5 hover:bg-blue-200/60 dark:hover:bg-blue-800/60 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Results Grid / List */}
          {searchResults.items.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
                  : "space-y-4"
              }
            >
              {searchResults.items.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  currency={currency}
                  onSelect={handleSelectItem}
                  onOpenDetails={(it) => setSelectedDetailItem(it)}
                  onOpenVR={handleOpenVR}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  No travel options match your filters
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Try adjusting your price range, clearing specific amenities, or selecting "All Categories" to discover more options.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button onClick={handleResetFilters} variant="primary" size="sm">
                  Reset All Filters
                </Button>
                <Button onClick={() => updateFilter("destination", "Dubai")} variant="outline" size="sm">
                  Explore Dubai
                </Button>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {searchResults.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {(searchResults.currentPage - 1) * searchResults.itemsPerPage + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {Math.min(searchResults.currentPage * searchResults.itemsPerPage, searchResults.totalCount)}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {searchResults.totalCount}
                </strong>{" "}
                results
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchResults.currentPage <= 1}
                  onClick={() => updateFilter("page", searchResults.currentPage - 1)}
                  className="p-2 h-8 w-8"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: searchResults.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => updateFilter("page", pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      searchResults.currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchResults.currentPage >= searchResults.totalPages}
                  onClick={() => updateFilter("page", searchResults.currentPage + 1)}
                  className="p-2 h-8 w-8"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Filter Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Universal Search Filters"
        subtitle={`Filtering across ${searchResults.totalCount} travel items`}
      >
        <SearchFilterSidebar
          filters={filters}
          currency={currency}
          categoryCounts={searchResults.categoryCounts}
          onFilterChange={updateFilter}
          onResetFilters={handleResetFilters}
        />
        <div className="pt-6">
          <Button onClick={() => setIsMobileFilterOpen(false)} className="w-full">
            Show {searchResults.totalCount} Results
          </Button>
        </div>
      </MobileSidebarDrawer>

      {/* 4. Deep Item Detail Modal */}
      {selectedDetailItem && (
        <SearchItemDetailModal
          item={selectedDetailItem}
          currency={currency}
          onClose={() => setSelectedDetailItem(null)}
          onBookNow={handleSelectItem}
          onOpenVR={handleOpenVR}
        />
      )}
    </div>
  );
};
