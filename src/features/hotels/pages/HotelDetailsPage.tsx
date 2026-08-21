import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Glasses,
  Bot,
  PlusCircle,
  Scale,
  Calendar,
  Users,
  Check,
  Heart,
  Share2,
  Clock,
  Building,
  Coffee,
  Info,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { HotelOffer, HotelRoom, HotelSearchParams } from "../../../types";
import { HotelPhotosModal } from "../components/HotelPhotosModal";
import { HotelRoomSelector } from "../components/HotelRoomSelector";
import { HotelReviewsSection } from "../components/HotelReviewsSection";
import { HotelAddToTripModal } from "../components/HotelAddToTripModal";
import { Button, Badge, Card } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { calculateStayPrice } from "../hotelData";
import { useUIStore } from "../../../stores/useUIStore";
import { SEED_VR_SCENES } from "../../../config/constants";

interface HotelDetailsPageProps {
  hotel: HotelOffer;
  currency: string;
  initialParams?: HotelSearchParams;
  onBookHotel: (hotel: HotelOffer, room?: HotelRoom) => void;
  onAskAI: (hotel: HotelOffer, queryContext?: string) => void;
  onBackToResults: () => void;
  onToggleCompare?: (hotel: HotelOffer) => void;
  isCompared?: boolean;
}

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({
  hotel,
  currency,
  initialParams,
  onBookHotel,
  onAskAI,
  onBackToResults,
  onToggleCompare,
  isCompared = false,
}) => {
  const { openVR } = useUIStore();
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom>(
    hotel.rooms[0]
  );
  const [checkInDate, setCheckInDate] = useState(
    initialParams?.checkInDate || "2026-09-12"
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialParams?.checkOutDate || "2026-09-15"
  );
  const [roomsCount, setRoomsCount] = useState(initialParams?.rooms || 1);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate nights
  const start = new Date(checkInDate).getTime();
  const end = new Date(checkOutDate).getTime();
  const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  const priceBreakdown = calculateStayPrice(hotel, selectedRoom, nights, roomsCount);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-24 w-full max-w-full overflow-x-hidden">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToResults}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotel Results</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(hotel)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isCompared
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? "In Comparison" : "Add to Compare"}</span>
            </button>
          )}

          <button
            onClick={() => onAskAI(hotel, `Tell me about what makes ${hotel.name} special, its best room, and dining.`)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask AI Concierge</span>
          </button>

          <button
            onClick={() => setShowTripModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Add to Trip</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Share Sanctuary"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Save to Favorites"
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {copiedLink && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
          Link copied to clipboard!
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">{hotel.propertyType || "5-Star Luxury Sanctuary"}</Badge>
          <span className="text-amber-400 text-sm">{"★".repeat(hotel.starRating || 5)}</span>
          {hotel.aiMatchScore && (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-black shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{hotel.aiMatchScore}% AI Match</span>
            </span>
          )}
          {hotel.aiBadge && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {hotel.aiBadge}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {hotel.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-blue-600" />
            {hotel.address}, {hotel.city}, {hotel.country}
          </span>
          <span>•</span>
          <span className="text-slate-500">{hotel.neighborhood}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
            ⭐ {hotel.rating} {hotel.ratingLabel} ({hotel.reviewsCount} reviews)
          </span>
        </div>
      </div>

      {/* Photos Grid Gallery Layout */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-80 sm:h-96 md:h-[440px]">
          {/* Main Large Photo */}
          <div
            onClick={() => setShowPhotosModal(true)}
            className="md:col-span-2 h-full relative group cursor-pointer overflow-hidden"
          >
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Side Photo 1 & 2 */}
          <div className="hidden md:grid grid-rows-2 gap-2 h-full">
            <div
              onClick={() => setShowPhotosModal(true)}
              className="relative group cursor-pointer overflow-hidden"
            >
              <img
                src={hotel.images[1] || hotel.images[0]}
                alt="Room view"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div
              onClick={() => setShowPhotosModal(true)}
              className="relative group cursor-pointer overflow-hidden"
            >
              <img
                src={hotel.images[2] || hotel.images[0]}
                alt="Amenities"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Side Photo 3 & 4 */}
          <div className="hidden md:grid grid-rows-2 gap-2 h-full">
            <div
              onClick={() => setShowPhotosModal(true)}
              className="relative group cursor-pointer overflow-hidden"
            >
              <img
                src={hotel.images[3] || hotel.images[0]}
                alt="Dining"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div
              onClick={() => setShowPhotosModal(true)}
              className="relative group cursor-pointer overflow-hidden"
            >
              <img
                src={hotel.images[4] || hotel.images[0]}
                alt="Terrace"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Gallery Trigger Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {/* 360 VR Spatial Tour */}
          <button
            onClick={() => {
              const scene =
                SEED_VR_SCENES.find((s) =>
                  s.destination.toLowerCase().includes(hotel.city.toLowerCase())
                ) || SEED_VR_SCENES[0];
              openVR(scene);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xl backdrop-blur-md transition-colors cursor-pointer"
          >
            <Glasses className="w-4 h-4" />
            <span>Launch 360° VR Tour</span>
          </button>

          {/* Show all photos button */}
          <button
            onClick={() => setShowPhotosModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold shadow-xl backdrop-blur-md transition-colors cursor-pointer"
          >
            View All {hotel.images.length} Photos
          </button>
        </div>
      </div>

      {/* Main Content Layout: Details vs Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Match Reason, Description, Amenities, Rooms, Reviews, Policies */}
        <div className="lg:col-span-8 space-y-10">
          {/* AI Match Reason Deep Dive */}
          {hotel.aiMatchReason && (
            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                    Why TravelVerse AI Matched You to This Property ({hotel.aiMatchScore}% Score)
                  </h3>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                    Calculated against your luxury preferences and traveler history
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                {hotel.aiMatchReason}
              </p>
            </div>
          )}

          {/* Sanctuary Overview & Philosophy */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              About the Sanctuary
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {hotel.description}
            </p>

            {/* Quick Property Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Check-in</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                  {hotel.checkInTime || "15:00"}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Check-out</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                  {hotel.checkOutTime || "12:00"}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Rooms</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                  {(hotel as any).totalRooms || 84} Suites
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Cancellation</div>
                <div className="text-xs font-black text-emerald-600 mt-0.5">100% Free</div>
              </div>
            </div>
          </div>

          {/* All Amenities & Features */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Amenities & VIP Inclusions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Selection Section */}
          <HotelRoomSelector
            hotel={hotel}
            selectedRoomId={selectedRoom.id}
            nights={nights}
            roomsCount={roomsCount}
            currency={currency}
            onSelectRoom={(room) => setSelectedRoom(room)}
            onBookRoom={(h, r) => onBookHotel(h, r)}
            onAskAIAboutRoom={(r) =>
              onAskAI(
                hotel,
                `Can you tell me more details about staying in the ${r.name} at ${hotel.name}? What are the views, perks, and inclusions?`
              )
            }
          />

          {/* Verified Reviews Section */}
          <HotelReviewsSection hotel={hotel} />

          {/* Location & Neighborhood Highlights */}
          <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Location & Surroundings
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {hotel.neighborhood}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
            {/* Price Header */}
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-400">Nightly Rate</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedRoom.pricePerNight, currency)}
                </span>
                <span className="text-xs text-slate-400">/ night</span>

                {hotel.originalPricePerNight && (
                  <span className="text-xs line-through text-slate-400">
                    {formatCurrency(hotel.originalPricePerNight, currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Date Inputs & Room Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Check-in</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Check-out</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Selected Suite:</span>
                <span className="text-slate-900 dark:text-white truncate max-w-[150px]">
                  {selectedRoom.name}
                </span>
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>
                  {formatCurrency(selectedRoom.pricePerNight, currency)} x {nights} {nights === 1 ? "night" : "nights"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(priceBreakdown.baseSubtotal, currency)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Taxes & Fees ({(priceBreakdown.taxRate * 100).toFixed(0)}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  +{formatCurrency(priceBreakdown.taxes, currency)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">Total Stay Price</span>
                  <div className="text-[10px] text-emerald-600 font-bold">100% Free Cancellation</div>
                </div>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {formatCurrency(priceBreakdown.totalPrice, currency)}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2.5">
              <Button
                size="lg"
                onClick={() => onBookHotel(hotel, selectedRoom)}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Suite Now</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTripModal(true)}
                className="w-full rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Add to Trip Planner</span>
              </Button>
            </div>

            {/* AI Guarantee snippet */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Instant confirmation • No upfront booking charges</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-res Photos Gallery Modal */}
      {showPhotosModal && (
        <HotelPhotosModal
          isOpen={showPhotosModal}
          onClose={() => setShowPhotosModal(false)}
          hotelName={hotel.name}
          images={hotel.images}
        />
      )}

      {/* Add to Trip Modal */}
      {showTripModal && (
        <HotelAddToTripModal
          isOpen={showTripModal}
          onClose={() => setShowTripModal(false)}
          hotel={hotel}
          selectedRoom={selectedRoom}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          currency={currency}
        />
      )}
    </div>
  );
};
