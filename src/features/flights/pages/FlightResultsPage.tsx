import React, { useState, useMemo } from "react";
import {
  Plane,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Bot,
  Compass,
  ArrowLeft,
  ChevronDown,
  Clock,
  Tag,
  Zap,
  Award,
} from "lucide-react";
import { FlightOffer, FlightSearchParams } from "../../../types";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { FlightCard } from "../components/FlightCard";
import { FlightFilterSidebar, FlightFilterState } from "../components/FlightFilterSidebar";
import { FlightComparisonDrawer } from "../components/FlightComparisonDrawer";
import { FlightAddToTripModal } from "../components/FlightAddToTripModal";
import { MobileSidebarDrawer } from "../../../components/shared/MobileSidebarDrawer";
import { Button, Card, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface FlightResultsPageProps {
  searchParams: FlightSearchParams;
  flights: FlightOffer[];
  currency: string;
  onModifySearch: (params: any) => void;
  onSelectFlight: (flight: FlightOffer) => void;
  onAskAI: (flight: FlightOffer) => void;
  onBackToSearch: () => void;
}

export const FlightResultsPage: React.FC<FlightResultsPageProps> = ({
  searchParams,
  flights,
  currency,
  onModifySearch,
  onSelectFlight,
  onAskAI,
  onBackToSearch,
}) => {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<"cheapest" | "fastest" | "best_value" | "best_match" | "departure">("best_match");
  const [comparedFlights, setComparedFlights] = useState<FlightOffer[]>([]);
  const [tripModalFlight, setTripModalFlight] = useState<FlightOffer | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FlightFilterState>({
    stops: "all",
    cabinClass: searchParams.cabin || "All Classes",
    refundableOnly: false,
    baggageIncludedOnly: false,
    ecoOnly: false,
    minPrice: 0,
    maxPrice: 3000,
    selectedAirlines: [],
    departureTimeWindow: "all",
  });

  // Calculate available airlines and price bounds
  const { availableAirlines, priceRange } = useMemo(() => {
    const airlinesMap = new Map<string, { name: string; code: string; logo: string; minPrice: number; count: number }>();
    let min = Infinity;
    let max = -Infinity;

    flights.forEach((f) => {
      if (f.price < min) min = f.price;
      if (f.price > max) max = f.price;

      if (!airlinesMap.has(f.airline)) {
        airlinesMap.set(f.airline, {
          name: f.airline,
          code: f.airlineCode,
          logo: f.airlineLogo,
          minPrice: f.price,
          count: 1,
        });
      } else {
        const item = airlinesMap.get(f.airline)!;
        item.count += 1;
        if (f.price < item.minPrice) item.minPrice = f.price;
      }
    });

    return {
      availableAirlines: Array.from(airlinesMap.values()),
      priceRange: { min: min === Infinity ? 200 : min, max: max === -Infinity ? 2000 : max },
    };
  }, [flights]);

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let list = flights.filter((f) => {
      // Stops
      if (filters.stops === "direct" && f.stops !== 0) return false;
      if (filters.stops === "1" && f.stops > 1) return false;

      // Cabin
      if (filters.cabinClass !== "All Classes" && filters.cabinClass !== "all" && f.cabinClass !== filters.cabinClass) {
        return false;
      }

      // Refundable
      if (filters.refundableOnly && !f.refundable) return false;

      // Baggage
      if (filters.baggageIncludedOnly && !f.baggageIncluded) return false;

      // Eco
      if (filters.ecoOnly && f.ecoScore !== "A") return false;

      // Max Price
      if (filters.maxPrice && f.price > filters.maxPrice) return false;

      // Airlines
      if (filters.selectedAirlines.length > 0 && !filters.selectedAirlines.includes(f.airline)) {
        return false;
      }

      return true;
    });

    // Apply sorting
    if (activeSort === "cheapest") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === "fastest") {
      const parseDur = (d: string) => {
        const p = d.match(/(\d+)h\s*(\d+)?m?/);
        return p ? parseInt(p[1]) * 60 + (parseInt(p[2]) || 0) : 9999;
      };
      list.sort((a, b) => parseDur(a.totalDuration) - parseDur(b.totalDuration));
    } else if (activeSort === "best_value") {
      list.sort((a, b) => (b.aiBadge === "Best Value" ? 1 : 0) - (a.aiBadge === "Best Value" ? 1 : 0) || a.price - b.price);
    } else if (activeSort === "best_match") {
      list.sort((a, b) => (b.aiBadge === "Best Match" ? 1 : 0) - (a.aiBadge === "Best Match" ? 1 : 0) || b.onTimeRate! - a.onTimeRate!);
    } else if (activeSort === "departure") {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return list;
  }, [flights, filters, activeSort]);

  // Comparison toggle handler (Max 3)
  const handleToggleCompare = (flight: FlightOffer) => {
    if (comparedFlights.some((f) => f.id === flight.id)) {
      setComparedFlights(comparedFlights.filter((f) => f.id !== flight.id));
    } else {
      if (comparedFlights.length >= 3) {
        alert("You can compare a maximum of 3 flights at once. Please remove one first.");
        return;
      }
      setComparedFlights([...comparedFlights, flight]);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      stops: "all",
      cabinClass: "All Classes",
      refundableOnly: false,
      baggageIncludedOnly: false,
      ecoOnly: false,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      selectedAirlines: [],
      departureTimeWindow: "all",
    });
  };

  // 7-day low fare matrix mock
  const dateMatrix = [
    { date: "Sep 10", day: "Thu", price: 680 },
    { date: "Sep 11", day: "Fri", price: 695 },
    { date: "Sep 12", day: "Sat", price: 645, active: true },
    { date: "Sep 13", day: "Sun", price: 710 },
    { date: "Sep 14", day: "Mon", price: 615, lowest: true },
    { date: "Sep 15", day: "Tue", price: 630 },
    { date: "Sep 16", day: "Wed", price: 650 },
  ];

  return (
    <div className="space-y-6 pb-24 w-full max-w-full overflow-x-hidden">
      {/* Top Search Modify Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSearch}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Back to search"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 font-black text-sm sm:text-base text-slate-900 dark:text-white">
                <span>{searchParams.originCode || searchParams.origin}</span>
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span>{searchParams.destinationCode || searchParams.destination}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-normal">
                  {searchParams.tripType === "roundtrip" ? "Round-trip" : "One-way"}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{searchParams.departureDate}</span>
                {searchParams.returnDate && <span>- {searchParams.returnDate}</span>}
                <span>•</span>
                <span>{searchParams.travelers.adults + searchParams.travelers.children} Traveler(s)</span>
                <span>•</span>
                <span>{searchParams.cabin}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModifyOpen(!isModifyOpen)}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Modify Search</span>
            </Button>
          </div>
        </div>

        {/* Collapsible Modify Search Form */}
        {isModifyOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            <FlightSearchForm
              initialValues={{
                origin: searchParams.origin,
                originCode: searchParams.originCode,
                destination: searchParams.destination,
                destinationCode: searchParams.destinationCode,
                departureDate: searchParams.departureDate,
                returnDate: searchParams.returnDate,
                tripType: searchParams.tripType,
                travelers: searchParams.travelers,
                cabin: searchParams.cabin,
                directOnly: searchParams.directOnly,
              }}
              onSearch={(params) => {
                setIsModifyOpen(false);
                onModifySearch(params);
              }}
            />
          </div>
        )}
      </div>

      {/* 7-Day Low Fare Matrix Bar */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-lg flex items-center justify-between gap-2 overflow-x-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 px-2 hidden sm:block">
          7-Day Fare Matrix
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {dateMatrix.map((item, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded-xl text-center cursor-pointer transition-all shrink-0 border ${
                item.active
                  ? "bg-blue-600 border-blue-500 text-white shadow-md"
                  : "bg-slate-800/80 border-slate-700/80 hover:bg-slate-700 text-slate-300"
              }`}
            >
              <div className="text-[10px] text-slate-400 font-medium">
                {item.day}, {item.date}
              </div>
              <div className="text-xs font-black font-mono mt-0.5">
                {formatCurrency(item.price, currency)}
              </div>
              {item.lowest && (
                <span className="text-[9px] font-extrabold text-emerald-400 block">Lowest</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Results Layout: Filter Sidebar + Flight List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <FlightFilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            availableAirlines={availableAirlines}
            priceRange={priceRange}
          />
        </div>

        {/* Results Stream Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Sort & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Left Result Count */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {filteredFlights.length} Flights Available
              </span>
              <span className="text-xs text-slate-400">• Sorted by AI Scout</span>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                className="text-xs gap-1.5"
              >
                <Filter className="w-3.5 h-3.5 text-blue-500" />
                <span>Filters</span>
              </Button>
            </div>

            {/* AI Badges Sort Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
              {(
                [
                  { id: "best_match", label: "Best Match", icon: <Award className="w-3 h-3 text-blue-500" /> },
                  { id: "cheapest", label: "Cheapest", icon: <Tag className="w-3 h-3 text-emerald-500" /> },
                  { id: "fastest", label: "Fastest", icon: <Zap className="w-3 h-3 text-amber-500" /> },
                  { id: "best_value", label: "Best Value", icon: <Sparkles className="w-3 h-3 text-purple-500" /> },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSort(tab.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
                    activeSort === tab.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flights List */}
          {filteredFlights.length > 0 ? (
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  currency={currency}
                  travelersCount={searchParams.travelers.adults + searchParams.travelers.children}
                  isCompared={comparedFlights.some((f) => f.id === flight.id)}
                  onSelect={onSelectFlight}
                  onToggleCompare={handleToggleCompare}
                  onAskAI={onAskAI}
                  onAddToTrip={(f) => setTripModalFlight(f)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No flights matched your specific filter combination
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your price range, enabling stops, or switching cabin classes to find available routing.
              </p>
              <Button variant="primary" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Flight Filters"
        subtitle="Filter by stops, airlines, comfort & perks"
      >
        <FlightFilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          availableAirlines={availableAirlines}
          priceRange={priceRange}
        />
      </MobileSidebarDrawer>

      {/* Sticky Comparison Drawer (supports up to 3 flights) */}
      <FlightComparisonDrawer
        comparedFlights={comparedFlights}
        currency={currency}
        onRemoveFlight={(id) => setComparedFlights(comparedFlights.filter((f) => f.id !== id))}
        onClearAll={() => setComparedFlights([])}
        onSelectFlight={onSelectFlight}
      />

      {/* Add to Trip Modal */}
      <FlightAddToTripModal
        flight={tripModalFlight}
        isOpen={Boolean(tripModalFlight)}
        onClose={() => setTripModalFlight(null)}
      />
    </div>
  );
};
