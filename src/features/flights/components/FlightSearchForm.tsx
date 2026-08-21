import React, { useState, useRef, useEffect } from "react";
import {
  Plane,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  ChevronDown,
  Check,
  MapPin,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { POPULAR_AIRPORTS, AirportInfo } from "../flightData";
import { Button } from "../../../components/ui";

export interface FlightSearchFormProps {
  initialValues?: {
    origin?: string;
    originCode?: string;
    destination?: string;
    destinationCode?: string;
    departureDate?: string;
    returnDate?: string;
    tripType?: "roundtrip" | "oneway" | "multicity";
    travelers?: { adults: number; children: number; infants: number };
    cabin?: string;
    directOnly?: boolean;
  };
  onSearch: (params: {
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departureDate: string;
    returnDate?: string;
    tripType: "roundtrip" | "oneway" | "multicity";
    travelers: { adults: number; children: number; infants: number };
    cabin: string;
    directOnly: boolean;
  }) => void;
  compact?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  initialValues,
  onSearch,
  compact = false,
}) => {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway" | "multicity">(
    initialValues?.tripType || "roundtrip"
  );
  const [origin, setOrigin] = useState(initialValues?.origin || "San Francisco (SFO)");
  const [originCode, setOriginCode] = useState(initialValues?.originCode || "SFO");
  const [destination, setDestination] = useState(initialValues?.destination || "Tokyo Haneda (HND)");
  const [destinationCode, setDestinationCode] = useState(initialValues?.destinationCode || "HND");
  const [departureDate, setDepartureDate] = useState(initialValues?.departureDate || "2026-09-12");
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate || "2026-09-24");
  const [adults, setAdults] = useState(initialValues?.travelers?.adults || 1);
  const [children, setChildren] = useState(initialValues?.travelers?.children || 0);
  const [infants, setInfants] = useState(initialValues?.travelers?.infants || 0);
  const [cabin, setCabin] = useState(initialValues?.cabin || "Economy");
  const [directOnly, setDirectOnly] = useState(initialValues?.directOnly || false);

  // Popover state
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isTravelersOpen, setIsTravelersOpen] = useState(false);
  const [isCabinOpen, setIsCabinOpen] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const travelersRef = useRef<HTMLDivElement>(null);
  const cabinRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setIsDestOpen(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) {
        setIsTravelersOpen(false);
      }
      if (cabinRef.current && !cabinRef.current.contains(e.target as Node)) {
        setIsCabinOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalTravelers = adults + children + infants;

  const handleSwapAirports = () => {
    const tempO = origin;
    const tempOC = originCode;
    setOrigin(destination);
    setOriginCode(destinationCode);
    setDestination(tempO);
    setDestinationCode(tempOC);
  };

  const handleSelectOriginAirport = (airport: AirportInfo) => {
    setOrigin(`${airport.city} (${airport.code})`);
    setOriginCode(airport.code);
    setIsOriginOpen(false);
  };

  const handleSelectDestAirport = (airport: AirportInfo) => {
    setDestination(`${airport.city} (${airport.code})`);
    setDestinationCode(airport.code);
    setIsDestOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin,
      originCode,
      destination,
      destinationCode,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      tripType,
      travelers: { adults, children, infants },
      cabin,
      directOnly,
    });
  };

  const cabinOptions = ["Economy", "Premium Economy", "Business", "First"];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Trip Type Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          {(
            [
              { id: "roundtrip", label: "Round-trip" },
              { id: "oneway", label: "One-way" },
              { id: "multicity", label: "Multi-city" },
            ] as const
          ).map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTripType(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tripType === t.id
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Flights Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(e) => setDirectOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <span>Direct flights only</span>
          </label>
        </div>
      </div>

      {/* Main Search Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
        {/* Origin & Destination Container */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
          {/* Origin Picker */}
          <div ref={originRef} className="relative">
            <div
              onClick={() => setIsOriginOpen(!isOriginOpen)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/60 transition-all flex items-center gap-3 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">From / Origin</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {origin}
                </span>
              </div>
            </div>

            {/* Origin Dropdown */}
            {isOriginOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 max-h-72 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">Popular Departure Hubs</div>
                <div className="space-y-1">
                  {POPULAR_AIRPORTS.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => handleSelectOriginAirport(airport)}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                        originCode === airport.code ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{airport.city}</span>
                          <span className="text-[11px] text-slate-400 block">{airport.name}</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {airport.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button for Desktop */}
          <button
            type="button"
            onClick={handleSwapAirports}
            title="Swap Origin and Destination"
            aria-label="Swap Origin and Destination"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 hidden sm:flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Destination Picker */}
          <div ref={destRef} className="relative">
            <div
              onClick={() => setIsDestOpen(!isDestOpen)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/60 transition-all flex items-center gap-3 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Plane className="w-4 h-4 rotate-45" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">To / Destination</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {destination}
                </span>
              </div>
            </div>

            {/* Destination Dropdown */}
            {isDestOpen && (
              <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2.5 max-h-72 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">Global Destinations</div>
                <div className="space-y-1">
                  {POPULAR_AIRPORTS.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => handleSelectDestAirport(airport)}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                        destinationCode === airport.code ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{airport.city}</span>
                          <span className="text-[11px] text-slate-400 block">{airport.name}</span>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {airport.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates Container */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2">
          {/* Departure Date */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Departure</span>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date */}
          <div
            className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-2.5 transition-opacity ${
              tripType === "oneway" ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Return</span>
              <input
                type="date"
                value={returnDate}
                disabled={tripType === "oneway"}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Travelers & Cabin & Submit Button */}
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-2 gap-2">
          {/* Travelers & Cabin Combined Popover */}
          <div ref={travelersRef} className="relative">
            <div
              onClick={() => setIsTravelersOpen(!isTravelersOpen)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/60 transition-all flex items-center gap-2 shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Travelers & Cabin</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {totalTravelers} {totalTravelers === 1 ? "Pax" : "Pax"}, {cabin.split(" ")[0]}
                </span>
              </div>
            </div>

            {/* Travelers & Cabin Dropdown */}
            {isTravelersOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                <div className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <span>Travelers & Cabin Class</span>
                  <span className="text-[11px] text-blue-600 font-semibold">{totalTravelers} total</span>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Adults</div>
                    <div className="text-[11px] text-slate-400">Age 12+</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{adults}</span>
                    <button
                      type="button"
                      disabled={adults >= 9}
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Children</div>
                    <div className="text-[11px] text-slate-400">Age 2-11</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{children}</span>
                    <button
                      type="button"
                      disabled={children >= 8}
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Infants</div>
                    <div className="text-[11px] text-slate-400">Under 2 (on lap)</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={infants <= 0}
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{infants}</span>
                    <button
                      type="button"
                      disabled={infants >= 4}
                      onClick={() => setInfants(infants + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cabin Class Selection */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">Cabin Class</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cabinOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCabin(opt)}
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                          cabin === opt
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsTravelersOpen(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full h-full min-h-[52px] rounded-2xl font-bold shadow-lg shadow-blue-600/20 text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Flights</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
