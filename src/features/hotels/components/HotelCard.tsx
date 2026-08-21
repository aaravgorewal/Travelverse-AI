import React, { useState } from "react";
import {
  Star,
  MapPin,
  Sparkles,
  Check,
  ShieldCheck,
  Bed,
  Glasses,
  Bot,
  PlusCircle,
  ArrowRight,
  Scale,
  CalendarCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
} from "lucide-react";
import { HotelOffer, HotelRoom } from "../../../types";
import { Card, Badge, Button } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { calculateStayPrice } from "../hotelData";
import { useUIStore } from "../../../stores/useUIStore";
import { SEED_VR_SCENES } from "../../../config/constants";

interface HotelCardProps {
  hotel: HotelOffer;
  currency: string;
  nights?: number;
  roomsCount?: number;
  isCompared?: boolean;
  onToggleCompare?: (hotel: HotelOffer) => void;
  onSelectHotel: (hotel: HotelOffer) => void;
  onBookHotel: (hotel: HotelOffer, room?: HotelRoom) => void;
  onAskAI: (hotel: HotelOffer) => void;
  onAddToTrip: (hotel: HotelOffer) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  currency,
  nights = 3,
  roomsCount = 1,
  isCompared = false,
  onToggleCompare,
  onSelectHotel,
  onBookHotel,
  onAskAI,
  onAddToTrip,
}) => {
  const { openVR } = useUIStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const selectedRoom = hotel.rooms[0];
  const priceBreakdown = calculateStayPrice(hotel, selectedRoom, nights, roomsCount);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  return (
    <Card
      hoverEffect
      className="p-0 overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
    >
      {/* Left: Photos Carousel with Badges & VR Tour */}
      <div className="relative w-full md:w-80 lg:w-96 h-64 md:h-auto shrink-0 overflow-hidden bg-slate-950">
        <img
          src={hotel.images[currentImageIndex] || hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {hotel.aiMatchScore && (
              <span className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/90 text-white text-[11px] font-extrabold shadow-md backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{hotel.aiMatchScore}% Match</span>
              </span>
            )}
            {hotel.aiBadge && (
              <span className="pointer-events-auto inline-flex items-center px-2 py-1 rounded-xl bg-slate-900/80 text-blue-300 text-[10px] font-bold backdrop-blur-md border border-blue-400/30">
                {hotel.aiBadge}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-white"}`} />
          </button>
        </div>

        {/* Image navigation arrows */}
        {hotel.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-sm cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Carousel dots & VR trigger */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {hotel.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* 360 VR Tour button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const scene =
                SEED_VR_SCENES.find((s) =>
                  s.destination.toLowerCase().includes(hotel.city.toLowerCase())
                ) || SEED_VR_SCENES[0];
              openVR(scene);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-md backdrop-blur-md transition-colors cursor-pointer"
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>360° VR View</span>
          </button>
        </div>
      </div>

      {/* Right: Info, Amenities, Room Preview, Pricing & Full Actions */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between gap-4">
        {/* Header Title & Rating */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {hotel.propertyType || "5-Star Luxury Sanctuary"}
                </span>
                <span className="text-amber-400 text-xs">
                  {"★".repeat(hotel.starRating || 5)}
                </span>
              </div>
              <h3
                onClick={() => onSelectHotel(hotel)}
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                {hotel.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {hotel.city}, {hotel.country}
                </span>
                {hotel.neighborhood && (
                  <>
                    <span>•</span>
                    <span className="truncate">{hotel.neighborhood}</span>
                  </>
                )}
              </p>
            </div>

            {/* Overall Rating Pill */}
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 px-3 py-1.5 rounded-2xl shrink-0">
              <div className="text-right">
                <div className="text-xs font-black text-blue-900 dark:text-blue-200">
                  {hotel.ratingLabel || "Exceptional"}
                </div>
                <div className="text-[10px] text-slate-400">{hotel.reviewsCount} reviews</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {hotel.rating}
              </div>
            </div>
          </div>

          {/* AI Match Insight Snippet */}
          {hotel.aiMatchReason && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                {hotel.aiMatchReason}
              </p>
            </div>
          )}

          {/* Amenities Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hotel.amenities.slice(0, 5).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] font-medium text-slate-500">
                +{hotel.amenities.length - 5} more
              </span>
            )}
          </div>

          {/* Room Type & Cancellation Terms */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Bed className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{selectedRoom?.name || "Premier Suite"}</span>
              <span className="text-slate-400">({selectedRoom?.sqm} m²)</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{hotel.cancellationPolicy || "Free cancellation available"}</span>
            </div>
          </div>
        </div>

        {/* Pricing, Taxes & 5 Core Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* Price & Taxes Breakdown */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(hotel.pricePerNight, currency)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ night</span>

              {hotel.originalPricePerNight && (
                <span className="text-xs line-through text-slate-400 font-medium">
                  {formatCurrency(hotel.originalPricePerNight, currency)}
                </span>
              )}
            </div>

            {/* Itemized Taxes and Total Stay Price */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
              <div>
                + {formatCurrency(priceBreakdown.taxes, currency)} taxes & fees ({(priceBreakdown.taxRate * 100).toFixed(0)}%)
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(priceBreakdown.totalPrice, currency)} total for {nights} {nights === 1 ? "night" : "nights"}
              </div>
            </div>
          </div>

          {/* Action Row: Compare, Ask AI, Add to Trip, View, Book */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Compare Toggle */}
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(hotel)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCompared
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
                title="Compare up to 3 hotels"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? "Comparing" : "Compare"}</span>
              </button>
            )}

            {/* Ask AI */}
            <button
              type="button"
              onClick={() => onAskAI(hotel)}
              className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Ask AI Concierge about this hotel"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI</span>
            </button>

            {/* Add to Trip */}
            <button
              type="button"
              onClick={() => onAddToTrip(hotel)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save stay into trip planner"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>

            {/* View Details */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectHotel(hotel)}
              className="rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Button>

            {/* Book Now */}
            <Button
              size="sm"
              onClick={() => onBookHotel(hotel, selectedRoom)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
