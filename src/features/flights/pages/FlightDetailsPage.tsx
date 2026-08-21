import React, { useState } from "react";
import {
  Plane,
  ArrowLeft,
  Clock,
  Luggage,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Sparkles,
  Bot,
  Compass,
  Check,
  Armchair,
  Wifi,
  Tv,
  Coffee,
  Zap,
  Info,
  DollarSign,
  ChevronRight,
  Share2,
} from "lucide-react";
import { FlightOffer } from "../../../types";
import { FlightAddToTripModal } from "../components/FlightAddToTripModal";
import { Button, Card, Badge } from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";
import { formatCurrency } from "../../../lib/utils";

interface FlightDetailsPageProps {
  flight: FlightOffer;
  currency: string;
  onBack: () => void;
  onBookFlight: (flight: FlightOffer, selectedSeat?: string, carbonOffsetOptIn?: boolean) => void;
  onAskAI: (flight: FlightOffer) => void;
}

export const FlightDetailsPage: React.FC<FlightDetailsPageProps> = ({
  flight,
  currency,
  onBack,
  onBookFlight,
  onAskAI,
}) => {
  const { showToast } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<string>("3A");
  const [includeCarbonOffset, setIncludeCarbonOffset] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "seats" | "baggage" | "policies">("overview");
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  const carbonOffsetCost = 18;
  const seatFee = selectedSeat.startsWith("1") || selectedSeat.startsWith("2") ? 0 : 0;
  const taxesAndFees = Math.round(flight.price * 0.14);
  const grandTotal = flight.price + taxesAndFees + (includeCarbonOffset ? carbonOffsetCost : 0);

  // Seat layout configuration
  const seatRows = [
    { row: "1", seats: ["1A", "1B", "", "1E", "1F"], occupied: ["1B"], premium: ["1A", "1F"] },
    { row: "2", seats: ["2A", "2B", "", "2E", "2F"], occupied: ["2E"], premium: ["2A", "2F"] },
    { row: "3", seats: ["3A", "3B", "", "3E", "3F"], occupied: ["3F"], premium: ["3A", "3B"] },
    { row: "4", seats: ["4A", "4B", "", "4E", "4F"], occupied: ["4A", "4E"], premium: [] },
    { row: "5", seats: ["5A", "5B", "", "5E", "5F"], occupied: ["5B"], premium: [] },
    { row: "6", seats: ["6A", "6B", "", "6E", "6F"], occupied: ["6F"], premium: [] },
  ];

  const handleShareFlight = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({
        type: "success",
        title: "Flight Link Copied",
        message: "Shareable direct link copied to clipboard!",
      });
    } catch {
      showToast({
        type: "info",
        title: "Flight Ready",
        message: `${flight.flightNumber} ready for booking`,
      });
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-full overflow-x-hidden animate-in fade-in">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Flight Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareFlight}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-xs"
            title="Share Flight"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onAskAI(flight)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Ask AI Scout</span>
          </button>
          <button
            type="button"
            onClick={() => setIsTripModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Add to Trip</span>
          </button>
        </div>
      </div>

      {/* Hero Flight Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-md">
              {flight.airlineLogo || "✈️"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{flight.airline}</h1>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
                  {flight.flightNumber || `${flight.airlineCode} 782`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {flight.aircraft || "Boeing 787-9 Dreamliner"} • {flight.cabinClass} Suite
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {flight.aiBadge && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm">
                {flight.aiBadge}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{flight.refundable ? "100% Refundable" : "Standard Policy"}</span>
            </span>
          </div>
        </div>

        {/* Schedule & Route Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Origin */}
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">
              {flight.departureTime.slice(11, 16) || "08:30"}
            </div>
            <div className="text-base font-extrabold text-blue-400">{flight.originCode}</div>
            <div className="text-xs text-slate-400">{flight.originCity} • Terminal {flight.segments[0]?.origin?.terminal || "I"}</div>
          </div>

          {/* Flight Path */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{flight.totalDuration} Total</span>
            </div>
            <div className="w-full flex items-center justify-center gap-2 my-2">
              <div className="h-[2px] w-full bg-slate-700 relative">
                {flight.stops > 0 && (
                  <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>
              <Plane className="w-5 h-5 text-blue-400 rotate-90 shrink-0" />
            </div>
            <div className="text-xs font-extrabold text-emerald-400">
              {flight.stops === 0 ? "Non-stop Flight" : `${flight.stops} Stop (${flight.layoverDetails || "Connection"})`}
            </div>
          </div>

          {/* Destination */}
          <div className="md:text-right">
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">
              {flight.arrivalTime.slice(11, 16) || "14:45"}
            </div>
            <div className="text-base font-extrabold text-indigo-400">{flight.destinationCode}</div>
            <div className="text-xs text-slate-400">{flight.destinationCity} • Terminal {flight.segments[flight.segments.length - 1]?.destination?.terminal || "3"}</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: "overview", label: "Overview & Amenities" },
          { id: "seats", label: "Interactive Seat Map" },
          { id: "baggage", label: "Baggage Allowance" },
          { id: "policies", label: "Fare Rules & Eco Score" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Grid: Active Tab Details + Fare Breakdown Sticky Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tab Views */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab 1: Overview & In-Flight Amenities */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  In-Flight Experience & Comfort
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                    <Wifi className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Starlink High-Speed Wi-Fi</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Complimentary 250 Mbps low-latency browsing & video streaming</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                    <Tv className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">4K OLED Entertainment</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">18-inch touchscreen with 2,400+ movies, live sports & series</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Michelin-Curated Dining</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Multi-course gourmet meals, sommelier wines & specialty coffee</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">65W USB-C & AC Power</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Dedicated fast-charging at every single passenger seat</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Segment breakdown */}
              <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Flight Segment & Layover Itinerary
                </h2>
                <div className="space-y-4">
                  {flight.segments.map((seg, idx) => (
                    <div key={seg.id} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-blue-600 dark:text-blue-400">Segment {idx + 1}: {seg.flightNumber}</span>
                        <span className="text-slate-500">{seg.duration}</span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {seg.origin.city} ({seg.origin.code}) → {seg.destination.city} ({seg.destination.code})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Aircraft: {seg.aircraft} • Cabin: {seg.cabinClass}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Tab 2: Interactive Seat Map */}
          {activeTab === "seats" && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Select Your Aircraft Seat
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Boeing 787-9 Dreamliner • {flight.cabinClass} Configuration
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Selected ({selectedSeat})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-slate-300 dark:bg-slate-700 opacity-50" />
                  <span>Occupied</span>
                </div>
              </div>

              {/* Seat Map Visual Fuselage */}
              <div className="max-w-md mx-auto p-6 bg-slate-100 dark:bg-slate-800/80 rounded-3xl border-2 border-slate-300 dark:border-slate-700 space-y-3">
                <div className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                  ▲ Cockpit / Forward Cabin ▲
                </div>

                <div className="space-y-2">
                  {seatRows.map((row) => (
                    <div key={row.row} className="flex items-center justify-between gap-2">
                      <span className="w-4 text-xs font-mono font-bold text-slate-400 text-center">{row.row}</span>

                      <div className="flex items-center gap-2 flex-1 justify-center">
                        {row.seats.map((seatId, sIdx) => {
                          if (!seatId) {
                            return <div key={sIdx} className="w-6 text-center text-slate-300 text-[10px]">Aisle</div>;
                          }
                          const isOccupied = row.occupied.includes(seatId);
                          const isSelected = selectedSeat === seatId;

                          return (
                            <button
                              key={seatId}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-md scale-105"
                                  : isOccupied
                                  ? "bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-40"
                                  : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {seatId}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                  Selected Seat: <span className="underline">{selectedSeat}</span> (Window Suite, Included)
                </div>
              </div>
            </Card>
          )}

          {/* Tab 3: Baggage Allowance */}
          {activeTab === "baggage" && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Baggage Policy & Dimensions
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Personal Item</div>
                      <div className="text-slate-400">Fits under the seat (40 x 30 x 15 cm)</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">Included</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Cabin Carry-On Bag</div>
                      <div className="text-slate-400">Overhead bin up to 10kg (55 x 40 x 23 cm)</div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">Included</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Checked Baggage</div>
                      <div className="text-slate-400">
                        {flight.baggageIncluded ? flight.baggageDetails?.checkedBag || "2x 32kg bags" : "1x 23kg standard"}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">
                    {flight.baggageIncluded ? "Included in Fare" : "$45 at check-in"}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 4: Policies & Eco Score */}
          {activeTab === "policies" && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cancellation & Environmental Impact
              </h2>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Eco-Certification: Grade {flight.ecoScore}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Estimated emissions: <strong>{flight.carbonEmissionKg} kg CO₂</strong> per passenger. This flight emits 24% less carbon than the route average due to high-efficiency engines.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white">Cancellation & Changes:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Free cancellation up to 24 hours after booking.</li>
                  <li>Flight change fees waived for travel dates within 14 days of departure.</li>
                  <li>Full refund to original payment method or instant TravelVerse AI wallet credits.</li>
                </ul>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Sticky Fare Breakdown & Booking Confirmation Box */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Fare Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Base Flight Fare (1 Adult)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(flight.price, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Airport Security Fees</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(taxesAndFees, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Seat Selection ({selectedSeat})</span>
                <span className="font-mono font-bold text-emerald-600">Included</span>
              </div>

              {/* Carbon Offset Option */}
              <label className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeCarbonOffset}
                    onChange={(e) => setIncludeCarbonOffset(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    SAF Carbon Offset
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  +${carbonOffsetCost}
                </span>
              </label>

              {/* Grand Total */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-black text-slate-900 dark:text-white">Grand Total</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full font-extrabold rounded-2xl py-3 shadow-lg shadow-blue-600/30 text-sm flex items-center justify-center gap-2"
                onClick={() => onBookFlight(flight, selectedSeat, includeCarbonOffset)}
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full text-xs font-bold rounded-2xl"
                onClick={() => setIsTripModalOpen(true)}
              >
                <Compass className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>Save to Trip Itinerary</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add to Trip Modal */}
      <FlightAddToTripModal
        flight={flight}
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
      />
    </div>
  );
};
