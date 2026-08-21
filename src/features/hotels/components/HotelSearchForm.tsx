import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  BedDouble,
  Sparkles,
  ChevronDown,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { HotelSearchParams } from "../../../types";
import { Button } from "../../../components/ui";

interface HotelSearchFormProps {
  initialParams?: Partial<HotelSearchParams>;
  onSearch: (params: HotelSearchParams) => void;
  compact?: boolean;
}

const POPULAR_CITIES = [
  "Tokyo, Japan",
  "Noonu Atoll, Maldives",
  "Santorini, Greece",
  "Paris, France",
  "Andermatt, Switzerland",
  "Kyoto, Japan",
  "Uluwatu, Bali",
  "Positano, Italy",
  "New York, USA",
  "Dubai, UAE",
  "London, UK",
  "Grindavík, Iceland",
];

export const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  initialParams,
  onSearch,
  compact = false,
}) => {
  const [destination, setDestination] = useState(initialParams?.destination || "Tokyo, Japan");
  const [checkInDate, setCheckInDate] = useState(initialParams?.checkInDate || "2026-09-12");
  const [checkOutDate, setCheckOutDate] = useState(initialParams?.checkOutDate || "2026-09-15");
  const [adults, setAdults] = useState(initialParams?.guests?.adults || 2);
  const [children, setChildren] = useState(initialParams?.guests?.children || 0);
  const [rooms, setRooms] = useState(initialParams?.rooms || 1);

  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Calculate nights
  const calculateNights = () => {
    const start = new Date(checkInDate).getTime();
    const end = new Date(checkOutDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDestDropdown(false);
    setShowGuestsDropdown(false);
    onSearch({
      destination,
      checkInDate,
      checkOutDate,
      guests: { adults, children },
      rooms,
      sortBy: "ai_match",
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full relative">
      <div className={`grid grid-cols-1 ${compact ? "lg:grid-cols-12 gap-3" : "md:grid-cols-2 lg:grid-cols-12 gap-3.5"} items-center`}>
        {/* Destination Field */}
        <div className={`relative ${compact ? "lg:col-span-4" : "lg:col-span-4"}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Destination / Hotel Name
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="Where are you staying?"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showDestDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowDestDropdown(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 max-h-72 overflow-y-auto space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>Popular Luxury Sanctuaries</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                {POPULAR_CITIES.filter(
                  (c) => !destination || c.toLowerCase().includes(destination.toLowerCase())
                ).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setDestination(city);
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {city}
                    </span>
                    {destination === city && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Check-in & Check-out Dates */}
        <div className={`grid grid-cols-2 gap-2 ${compact ? "lg:col-span-4" : "lg:col-span-4"}`}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Check-in Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Check-out
              </label>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                {nights} {nights === 1 ? "Night" : "Nights"}
              </span>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={checkOutDate}
                min={checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Guests & Rooms Popover */}
        <div className={`relative ${compact ? "lg:col-span-2" : "lg:col-span-2"}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Guests & Rooms
          </label>
          <button
            type="button"
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            className="w-full px-3 py-2.5 sm:py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between focus:ring-2 focus:ring-blue-500 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">
                {adults + children} {adults + children === 1 ? "Guest" : "Guests"}, {rooms} {rooms === 1 ? "Room" : "Rooms"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Guest selector dropdown */}
          {showGuestsDropdown && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowGuestsDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-30 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Adults</div>
                    <div className="text-[10px] text-slate-400">Ages 13 or above</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Children</div>
                    <div className="text-[10px] text-slate-400">Ages 0 to 12</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Rooms</div>
                    <div className="text-[10px] text-slate-400">Suites / Villas</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={rooms <= 1}
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {rooms}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowGuestsDropdown(false)}
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Search Submit Action Button */}
        <div className={`flex items-end ${compact ? "lg:col-span-2" : "lg:col-span-2"}`}>
          <Button
            type="submit"
            size="lg"
            className="w-full h-11 sm:h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
