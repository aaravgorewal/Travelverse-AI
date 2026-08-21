import React, { useState } from "react";
import {
  Bed,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  Maximize,
  Eye,
  Bot,
  ArrowRight,
  Coffee,
  Glasses,
} from "lucide-react";
import { HotelOffer, HotelRoom } from "../../../types";
import { Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { calculateStayPrice } from "../hotelData";
import { useUIStore } from "../../../stores/useUIStore";
import { SEED_VR_SCENES } from "../../../config/constants";

interface HotelRoomSelectorProps {
  hotel: HotelOffer;
  selectedRoomId?: string;
  nights?: number;
  roomsCount?: number;
  currency: string;
  onSelectRoom: (room: HotelRoom) => void;
  onBookRoom: (hotel: HotelOffer, room: HotelRoom) => void;
  onAskAIAboutRoom: (room: HotelRoom) => void;
}

export const HotelRoomSelector: React.FC<HotelRoomSelectorProps> = ({
  hotel,
  selectedRoomId,
  nights = 3,
  roomsCount = 1,
  currency,
  onSelectRoom,
  onBookRoom,
  onAskAIAboutRoom,
}) => {
  const { openVR } = useUIStore();
  const [activeRoomId, setActiveRoomId] = useState<string>(
    selectedRoomId || hotel.rooms[0]?.id || ""
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Available Suites & Private Villas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select your preferred sanctuary layout • Prices include VIP concierge service
          </p>
        </div>

        <Badge variant="blue">
          {hotel.rooms.length} Suite {hotel.rooms.length === 1 ? "Category" : "Categories"} Available
        </Badge>
      </div>

      <div className="space-y-4">
        {hotel.rooms.map((room) => {
          const isSelected = activeRoomId === room.id;
          const price = calculateStayPrice(hotel, room, nights, roomsCount);

          return (
            <div
              key={room.id}
              onClick={() => {
                setActiveRoomId(room.id);
                onSelectRoom(room);
              }}
              className={`rounded-3xl border transition-all duration-300 p-4 sm:p-6 bg-white dark:bg-slate-900 flex flex-col lg:flex-row gap-6 cursor-pointer ${
                isSelected
                  ? "border-blue-600 dark:border-blue-500 shadow-xl ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              }`}
            >
              {/* Room Image with Badges */}
              <div className="relative w-full lg:w-80 h-56 lg:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-950">
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl bg-black/70 text-white text-[11px] font-bold backdrop-blur-md">
                    {room.sqm} m² ({room.sqft || Math.round(room.sqm * 10.76)} sqft)
                  </span>
                </div>

                {/* VR Quick Button */}
                {room.vrTourAvailable && (
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
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-md backdrop-blur-md cursor-pointer"
                  >
                    <Glasses className="w-3.5 h-3.5" />
                    <span>360° VR Tour</span>
                  </button>
                )}
              </div>

              {/* Room Details & Perks */}
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {room.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {room.viewType || "Panoramic View"}
                        </span>
                        <span>•</span>
                        <span>{room.bedType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Up to {room.capacity} guests
                        </span>
                      </p>
                    </div>

                    {room.breakfastIncluded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Breakfast Included</span>
                      </span>
                    )}
                  </div>

                  {/* Room Amenities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {room.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Special VIP Inclusions */}
                  {room.specialPerks && room.specialPerks.length > 0 && (
                    <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Complimentary Suite Inclusions</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                        {room.specialPerks.map((perk, i) => (
                          <span key={i} className="font-semibold flex items-center gap-1">
                            • {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancellation */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{room.cancellationPolicy || hotel.cancellationPolicy}</span>
                  </div>
                </div>

                {/* Bottom Row: Pricing & Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(room.pricePerNight, currency)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ night</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      + {formatCurrency(price.taxes, currency)} taxes & fees •{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(price.totalPrice, currency)} total for {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAIAboutRoom(room);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI</span>
                    </button>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookRoom(hotel, room);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Suite</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
