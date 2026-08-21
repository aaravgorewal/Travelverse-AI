import React, { useState } from "react";
import {
  Scale,
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Bed,
  MapPin,
  ArrowRight,
  Maximize2,
  Trash2,
  Star,
  Eye,
} from "lucide-react";
import { HotelOffer, HotelRoom } from "../../../types";
import { Button, Modal, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { calculateStayPrice } from "../hotelData";

interface HotelComparisonDrawerProps {
  comparedHotels: HotelOffer[];
  currency: string;
  nights?: number;
  roomsCount?: number;
  onRemoveHotel: (hotelId: string) => void;
  onClearAll: () => void;
  onSelectHotel: (hotel: HotelOffer) => void;
  onBookHotel: (hotel: HotelOffer, room?: HotelRoom) => void;
}

const COMPARISON_AMENITIES = [
  "Traditional Onsen Spa",
  "Michelin Omakase",
  "Infinity Lap Pool",
  "Private Heated Infinity Pool",
  "High-speed Starlink",
  "Butler Service",
  "Retractable Stargazing Roof",
  "Water Slide into Lagoon",
  "Caldera Sunset View",
  "Hydrothermal Spa",
  "Ski Butler",
  "Dior Spa",
  "Rooftop Swimming Pool",
  "Private Geothermal Water Entry",
];

export const HotelComparisonDrawer: React.FC<HotelComparisonDrawerProps> = ({
  comparedHotels,
  currency,
  nights = 3,
  roomsCount = 1,
  onRemoveHotel,
  onClearAll,
  onSelectHotel,
  onBookHotel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (comparedHotels.length === 0) return null;

  return (
    <>
      {/* Sticky Bottom Dock */}
      <div className="fixed bottom-16 md:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-4xl w-full">
        <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-xl rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto py-1">
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <Scale className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs font-bold">
                  Comparing {comparedHotels.length} / 3 Properties
                </div>
                <div className="text-[10px] text-slate-400">Side-by-side AI match</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {comparedHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex items-center gap-2 bg-slate-800/90 rounded-2xl p-1.5 pr-2.5 border border-slate-700 shrink-0"
                >
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <div className="max-w-[120px] truncate">
                    <div className="text-[11px] font-bold truncate">{hotel.name}</div>
                    <div className="text-[10px] text-blue-400 font-extrabold">
                      {formatCurrency(hotel.pricePerNight, currency)}/nt
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveHotel(hotel.id)}
                    className="w-5 h-5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pr-1">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer hidden sm:block"
            >
              Clear
            </button>

            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Compare Full Spec</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Full Comparison Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Side-by-Side Hotel Comparison"
          description={`Comparing ${comparedHotels.length} luxury sanctuaries for ${nights} nights (${roomsCount} ${roomsCount === 1 ? "room" : "rooms"})`}
          size="full"
        >
          <div className="overflow-x-auto pb-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-4 w-48 text-xs font-bold uppercase text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-tl-2xl">
                    Criteria
                  </th>
                  {comparedHotels.map((hotel) => (
                    <th
                      key={hotel.id}
                      className="p-4 min-w-[240px] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50"
                    >
                      <div className="space-y-2">
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="h-32 w-full object-cover rounded-2xl shadow-xs"
                        />
                        <div>
                          <div className="text-xs font-bold text-blue-600 uppercase">
                            {hotel.city}, {hotel.country}
                          </div>
                          <div className="text-sm font-black line-clamp-1">{hotel.name}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* AI Match Score */}
                <tr className="bg-indigo-50/40 dark:bg-indigo-950/20">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Match Score</span>
                  </td>
                  {comparedHotels.map((hotel) => (
                    <td key={hotel.id} className="p-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{hotel.aiMatchScore || 95}% Match</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {hotel.aiMatchReason || "Tailored luxury match for your style."}
                        </p>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Nightly Rate & Total Stay Price */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Price Breakdown
                  </td>
                  {comparedHotels.map((hotel) => {
                    const price = calculateStayPrice(hotel, hotel.rooms[0], nights, roomsCount);
                    return (
                      <td key={hotel.id} className="p-4">
                        <div className="space-y-1">
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {formatCurrency(hotel.pricePerNight, currency)}{" "}
                            <span className="text-[11px] font-normal text-slate-400">/ night</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            + {formatCurrency(price.taxes, currency)} taxes ({(price.taxRate * 100).toFixed(0)}%)
                          </div>
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(price.totalPrice, currency)} total ({nights} nights)
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Rating & Reviews */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Guest Rating & Class
                  </td>
                  {comparedHotels.map((hotel) => (
                    <td key={hotel.id} className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-[11px]">
                            {hotel.rating}
                          </span>
                          <span>{hotel.ratingLabel || "Exceptional"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {hotel.reviewsCount} verified reviews • {hotel.starRating || 5} Stars
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Lead Room Type & Size */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Lead Suite & Space
                  </td>
                  {comparedHotels.map((hotel) => {
                    const room = hotel.rooms[0];
                    return (
                      <td key={hotel.id} className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {room?.name || "Premier Suite"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {room?.sqm} m² ({room?.sqft || room?.sqm * 10.76} sqft) • {room?.bedType}
                          </div>
                          <div className="text-[10px] text-blue-600 font-semibold">
                            Up to {room?.capacity || 2} guests
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Cancellation Terms */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Cancellation Policy
                  </td>
                  {comparedHotels.map((hotel) => (
                    <td key={hotel.id} className="p-4">
                      <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{hotel.cancellationPolicy || "Free cancellation"}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Location & Neighborhood */}
                <tr>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Neighborhood Highlights
                  </td>
                  {comparedHotels.map((hotel) => (
                    <td key={hotel.id} className="p-4">
                      <div className="text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {hotel.address}
                        </div>
                        <p className="text-[11px]">{hotel.neighborhood}</p>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Amenity Matrix Rows */}
                {COMPARISON_AMENITIES.map((amenity) => {
                  const anyHasIt = comparedHotels.some((h) =>
                    h.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
                  );
                  if (!anyHasIt) return null;

                  return (
                    <tr key={amenity}>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                        {amenity}
                      </td>
                      {comparedHotels.map((hotel) => {
                        const hasAmenity = hotel.amenities.some((a) =>
                          a.toLowerCase().includes(amenity.toLowerCase())
                        );
                        return (
                          <td key={hotel.id} className="p-4">
                            {hasAmenity ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <Check className="w-4 h-4" />
                                <span>Included</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Final Actions Row */}
                <tr className="bg-slate-50 dark:bg-slate-900/60">
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    Direct Actions
                  </td>
                  {comparedHotels.map((hotel) => (
                    <td key={hotel.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsModalOpen(false);
                            onBookHotel(hotel, hotel.rooms[0]);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                        >
                          Book Suite Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsModalOpen(false);
                            onSelectHotel(hotel);
                          }}
                          className="w-full text-xs font-bold"
                        >
                          View Full Details
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
};
