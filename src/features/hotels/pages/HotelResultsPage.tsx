import React, { useState } from "react";
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Building,
  MapPin,
  Calendar,
  Users,
  Grid,
  List,
  RotateCcw,
  Bot,
  Scale,
  ArrowLeft,
} from "lucide-react";
import { HotelOffer, HotelRoom, HotelSearchParams } from "../../../types";
import { HotelCard } from "../components/HotelCard";
import { HotelFilterSidebar } from "../components/HotelFilterSidebar";
import { HotelComparisonDrawer } from "../components/HotelComparisonDrawer";
import { HotelAddToTripModal } from "../components/HotelAddToTripModal";
import { HotelSearchForm } from "../components/HotelSearchForm";
import { Button, Badge, Modal } from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";

interface HotelResultsPageProps {
  searchParams: HotelSearchParams;
  hotels: HotelOffer[];
  currency: string;
  onModifySearch: (newParams: HotelSearchParams) => void;
  onSelectHotel: (hotel: HotelOffer) => void;
  onBookHotel: (hotel: HotelOffer, room?: HotelRoom) => void;
  onAskAI: (hotel: HotelOffer) => void;
  onBackToSearch: () => void;
}

export const HotelResultsPage: React.FC<HotelResultsPageProps> = ({
  searchParams,
  hotels,
  currency,
  onModifySearch,
  onSelectHotel,
  onBookHotel,
  onAskAI,
  onBackToSearch,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showModifyBar, setShowModifyBar] = useState(false);
  const [comparedHotels, setComparedHotels] = useState<HotelOffer[]>([]);
  const [tripModalHotel, setTripModalHotel] = useState<HotelOffer | null>(null);

  // Calculate nights
  const start = new Date(searchParams.checkInDate || "2026-09-12").getTime();
  const end = new Date(searchParams.checkOutDate || "2026-09-15").getTime();
  const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  const { showToast } = useToast();

  const handleToggleCompare = (hotel: HotelOffer) => {
    if (comparedHotels.some((h) => h.id === hotel.id)) {
      setComparedHotels(comparedHotels.filter((h) => h.id !== hotel.id));
    } else {
      if (comparedHotels.length >= 3) {
        showToast({ title: "Compare Limit", message: "You can compare up to 3 hotels. Remove one first.", type: "error" });
        return;
      }
      setComparedHotels([...comparedHotels, hotel]);
    }
  };

  const handleSortChange = (
    sortBy: "ai_match" | "price_low" | "price_high" | "rating_high" | "popularity"
  ) => {
    onModifySearch({
      ...searchParams,
      sortBy,
    });
  };

  const handleFilterUpdate = (newFilters: Partial<HotelSearchParams>) => {
    onModifySearch({
      ...searchParams,
      ...newFilters,
    });
  };

  const handleResetFilters = () => {
    onModifySearch({
      destination: searchParams.destination,
      checkInDate: searchParams.checkInDate,
      checkOutDate: searchParams.checkOutDate,
      guests: searchParams.guests,
      rooms: searchParams.rooms,
      sortBy: "ai_match",
    });
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-full overflow-x-hidden">
      {/* Top Breadcrumb & Modify Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSearch}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Search Results
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  {nights} {nights === 1 ? "Night" : "Nights"} Stay
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {searchParams.destination || "All Destinations"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModifyBar(!showModifyBar)}
              className="rounded-2xl text-xs font-bold"
            >
              {showModifyBar ? "Hide Search Bar" : "Modify Search"}
            </Button>
          </div>
        </div>

        {/* Expandable Compact Modify Form */}
        {showModifyBar && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <HotelSearchForm
              compact
              initialParams={searchParams}
              onSearch={(params) => {
                onModifySearch(params);
                setShowModifyBar(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Main Results Layout: Filter Sidebar + Hotel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <HotelFilterSidebar
            searchParams={searchParams}
            currency={currency}
            onFilterChange={handleFilterUpdate}
            onResetFilters={handleResetFilters}
            totalResultsCount={hotels.length}
          />
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Controls: Count, Sort Tabs & Mobile Filter Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
              </button>

              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {hotels.length} {hotels.length === 1 ? "Property" : "Properties"} Found
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
              {[
                { id: "ai_match", label: "✨ AI Match" },
                { id: "price_low", label: "Price (Low)" },
                { id: "rating_high", label: "Rating" },
                { id: "popularity", label: "Popular" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSortChange(s.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    (searchParams.sortBy || "ai_match") === s.id
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel List */}
          {hotels.length > 0 ? (
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  currency={currency}
                  nights={nights}
                  roomsCount={searchParams.rooms || 1}
                  isCompared={comparedHotels.some((h) => h.id === hotel.id)}
                  onToggleCompare={handleToggleCompare}
                  onSelectHotel={onSelectHotel}
                  onBookHotel={onBookHotel}
                  onAskAI={onAskAI}
                  onAddToTrip={(h) => setTripModalHotel(h)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <Building className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  No properties match your exact filters
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try broadening your price range, star rating, or reset specific amenities.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleResetFilters}
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Drawer Dock */}
      <HotelComparisonDrawer
        comparedHotels={comparedHotels}
        currency={currency}
        nights={nights}
        roomsCount={searchParams.rooms || 1}
        onRemoveHotel={(id) => setComparedHotels(comparedHotels.filter((h) => h.id !== id))}
        onClearAll={() => setComparedHotels([])}
        onSelectHotel={onSelectHotel}
        onBookHotel={onBookHotel}
      />

      {/* Add to Trip Modal */}
      {tripModalHotel && (
        <HotelAddToTripModal
          isOpen={!!tripModalHotel}
          onClose={() => setTripModalHotel(null)}
          hotel={tripModalHotel}
          checkInDate={searchParams.checkInDate}
          checkOutDate={searchParams.checkOutDate}
          currency={currency}
        />
      )}

      {/* Mobile Filter Sheet Modal */}
      {showMobileFilters && (
        <Modal
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          title="Filter Hotel Sanctuaries"
          size="md"
        >
          <HotelFilterSidebar
            searchParams={searchParams}
            currency={currency}
            onFilterChange={(newF) => {
              handleFilterUpdate(newF);
            }}
            onResetFilters={() => {
              handleResetFilters();
              setShowMobileFilters(false);
            }}
            totalResultsCount={hotels.length}
          />
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              className="w-full bg-blue-600 text-white font-bold"
              onClick={() => setShowMobileFilters(false)}
            >
              Show {hotels.length} Properties
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
