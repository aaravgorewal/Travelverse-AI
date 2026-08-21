import React, { useState } from "react";
import {
  Calendar,
  Building,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { HotelOffer, HotelRoom, TripPlan } from "../../../types";
import { useTripStore } from "../../../stores/useTravelStore";
import { useUIStore } from "../../../stores/useUIStore";
import { Modal, Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { calculateStayPrice } from "../hotelData";

interface HotelAddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: HotelOffer;
  selectedRoom?: HotelRoom;
  checkInDate?: string;
  checkOutDate?: string;
  currency: string;
}

export const HotelAddToTripModal: React.FC<HotelAddToTripModalProps> = ({
  isOpen,
  onClose,
  hotel,
  selectedRoom,
  checkInDate = "2026-09-12",
  checkOutDate = "2026-09-15",
  currency,
}) => {
  const { trips, addTrip, addActivityToTrip } = useTripStore();
  const { setModule } = useUIStore();

  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips[0]?.id || "new"
  );
  const [newTripTitle, setNewTripTitle] = useState(
    `Luxury Stay in ${hotel.city}: ${hotel.name}`
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const room = selectedRoom || hotel.rooms[0];
  const start = new Date(checkInDate).getTime();
  const end = new Date(checkOutDate).getTime();
  const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const price = calculateStayPrice(hotel, room, nights);

  const handleConfirm = () => {
    let targetTripId = selectedTripId;

    if (selectedTripId === "new" || trips.length === 0) {
      const newTrip: TripPlan = {
        id: `trip-ht-${Date.now()}`,
        title: newTripTitle,
        destination: hotel.city,
        country: hotel.country,
        startDate: checkInDate,
        endDate: checkOutDate,
        coverImage: hotel.images[0],
        budgetTotal: price.totalPrice * 1.5,
        currency: hotel.currency,
        status: "upcoming",
        travelersCount: 2,
        days: [
          {
            dayNumber: 1,
            date: checkInDate,
            theme: `Check-in & Welcome at ${hotel.name}`,
            activities: [
              {
                id: `act-ht-${Date.now()}`,
                time: hotel.checkInTime || "15:00",
                title: `Check-in at ${hotel.name}`,
                type: "hotel",
                description: `Staying in ${room.name} (${room.bedType}). Free cancellation included.`,
                cost: price.totalPrice,
                location: `${hotel.address}, ${hotel.city}`,
                duration: `${nights} nights`,
                bookingRef: `HTV-${Math.floor(100000 + Math.random() * 900000)}`,
                completed: false,
              },
            ],
          },
        ],
        packingList: [
          { id: "pk-ht-1", item: "Hotel Confirmation Voucher & Passport", packed: true, category: "Documents" },
          { id: "pk-ht-2", item: "Swimwear for Spa & Onsen", packed: false, category: "Clothing" },
        ],
        emergencyContacts: [
          { name: `${hotel.name} Concierge Desk`, role: "VIP Hotel Front Desk", phone: "+1 (800) 555-HOTEL" },
        ],
      };
      addTrip(newTrip);
      targetTripId = newTrip.id;
    } else {
      addActivityToTrip(targetTripId, 1, {
        id: `act-ht-${Date.now()}`,
        time: hotel.checkInTime || "15:00",
        title: `Hotel Stay: ${hotel.name}`,
        type: "hotel",
        description: `Room: ${room.name}. Dates: ${checkInDate} to ${checkOutDate} (${nights} nights).`,
        cost: price.totalPrice,
        location: hotel.address,
        duration: `${nights} nights`,
        bookingRef: `HTV-${Math.floor(100000 + Math.random() * 900000)}`,
        completed: false,
      });
    }

    setIsSuccess(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Hotel Stay to Trip Plan"
      description={`Add ${hotel.name} (${nights} nights) to your travel schedule`}
      size="md"
    >
      <div className="space-y-6">
        {/* Hotel Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="blue">{hotel.city}, {hotel.country}</Badge>
                {hotel.aiMatchScore && (
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                    ✨ {hotel.aiMatchScore}% Match
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {hotel.name}
              </h4>
              <p className="text-xs text-slate-400">
                {room.name} • {nights} Nights ({checkInDate} → {checkOutDate})
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Estimated Total Price (incl. taxes)</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {formatCurrency(price.totalPrice, currency)}
            </span>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Hotel Added to Your Trip!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your check-in schedule, booking reference, and room details are saved.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Continue Browsing
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  setModule("trips");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                View in Trip Planner
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              Select Target Trip Itinerary
            </label>

            <div className="space-y-2">
              {trips.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedTripId === t.id
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="tripSelection"
                      checked={selectedTripId === t.id}
                      onChange={() => setSelectedTripId(t.id)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</div>
                      <div className="text-[10px] text-slate-400">{t.destination} • {t.startDate}</div>
                    </div>
                  </div>
                </label>
              ))}

              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedTripId === "new"
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tripSelection"
                    checked={selectedTripId === "new"}
                    onChange={() => setSelectedTripId("new")}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Create a New Trip Itinerary
                    </div>
                    <div className="text-[10px] text-slate-400">Initialize a dedicated holiday itinerary</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
            </div>

            {selectedTripId === "new" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold uppercase text-slate-400">
                  New Trip Itinerary Title
                </label>
                <input
                  type="text"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Confirm & Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
