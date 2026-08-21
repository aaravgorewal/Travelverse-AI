import React, { useState } from "react";
import {
  Calendar,
  Compass,
  Check,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { TravelExperience, TripPlan } from "../../../types";
import { useTripStore } from "../../../stores/useTravelStore";
import { useUIStore } from "../../../stores/useUIStore";
import { Modal, Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface ExperienceAddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: TravelExperience;
  currency: string;
}

export const ExperienceAddToTripModal: React.FC<ExperienceAddToTripModalProps> = ({
  isOpen,
  onClose,
  experience,
  currency,
}) => {
  const { trips, addTrip, addActivityToTrip } = useTripStore();
  const { setModule } = useUIStore();

  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips[0]?.id || "new"
  );
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activityTime, setActivityTime] = useState<string>("10:00");
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [newTripTitle, setNewTripTitle] = useState<string>(
    `Explore ${experience.city}: ${experience.title}`
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const totalPrice = experience.price * guestsCount;

  const handleConfirm = () => {
    let targetTripId = selectedTripId;

    if (selectedTripId === "new" || trips.length === 0) {
      const newTrip: TripPlan = {
        id: `trip-exp-${Date.now()}`,
        title: newTripTitle,
        destination: experience.city,
        country: experience.country,
        startDate: "2026-09-12",
        endDate: "2026-09-16",
        coverImage: experience.imageUrl,
        budgetTotal: totalPrice * 3,
        currency: experience.currency || currency,
        status: "upcoming",
        travelersCount: guestsCount,
        days: [
          {
            dayNumber: 1,
            date: "2026-09-12",
            theme: `${experience.category} Highlights in ${experience.city}`,
            activities: [
              {
                id: `act-exp-${Date.now()}`,
                time: activityTime,
                title: experience.name || experience.title,
                type: "activity",
                description: `${experience.description.slice(0, 140)}... Includes ${experience.included?.[0] || "VIP local host"}.`,
                cost: totalPrice,
                location: experience.location || `${experience.city}, ${experience.country}`,
                duration: experience.duration,
                bookingRef: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
                completed: false,
              },
            ],
          },
          {
            dayNumber: 2,
            date: "2026-09-13",
            theme: `Exploring Local Cuisine & Leisure`,
            activities: [],
          },
        ],
        packingList: [
          { id: "pk-exp-1", item: "Experience Confirmation & Voucher", packed: true, category: "Documents" },
          { id: "pk-exp-2", item: "Comfortable walking shoes & camera", packed: false, category: "Gear" },
        ],
        emergencyContacts: [
          { name: `${experience.host?.name || "Local Host Desk"}`, role: "Experience Guide", phone: "+1 (800) 555-GUIDE" },
        ],
      };
      addTrip(newTrip);
      targetTripId = newTrip.id;
    } else {
      addActivityToTrip(targetTripId, selectedDay, {
        id: `act-exp-${Date.now()}`,
        time: activityTime,
        title: experience.name || experience.title,
        type: "activity",
        description: `${experience.category} Experience: ${experience.duration}. Meeting at: ${experience.meetingPoint}`,
        cost: totalPrice,
        location: experience.location || `${experience.city}, ${experience.country}`,
        duration: experience.duration,
        bookingRef: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        completed: false,
      });
    }

    setIsSuccess(true);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Add Experience to Itinerary"
      description={`Schedule "${experience.name || experience.title}" into your trip calendar`}
      size="md"
    >
      <div className="space-y-6">
        {/* Experience Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={experience.imageUrl}
              alt={experience.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {experience.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  {experience.city}, {experience.country}
                </span>
                {experience.aiMatchScore && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {experience.aiMatchScore}% Match
                  </Badge>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                {experience.name || experience.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {experience.duration}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(experience.price, currency)} / guest
                </span>
              </div>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
              <Check className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Experience Added to Trip!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {experience.name || experience.title} has been scheduled into Day {selectedDay} of your trip itinerary.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={handleResetAndClose}>
                Done
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  handleResetAndClose();
                  setModule("trips");
                }}
              >
                <span>View Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trip Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Select Target Trip
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title} ({trip.destination}, {trip.startDate})
                  </option>
                ))}
                <option value="new">+ Create New Trip for this Experience</option>
              </select>
            </div>

            {selectedTripId === "new" ? (
              <div className="space-y-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <label className="text-[11px] font-bold text-blue-900 dark:text-blue-200">
                  New Trip Name
                </label>
                <input
                  type="text"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Tokyo Cultural & Culinary Odyssey"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Schedule on Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {selectedTrip?.days?.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        Day {d.dayNumber}: {d.theme || `Day ${d.dayNumber}`}
                      </option>
                    )) || <option value={1}>Day 1</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Time Slot
                  </label>
                  <input
                    type="time"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Travelers / Guests Counter */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Travelers / Passes
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {formatCurrency(experience.price, currency)} per guest
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">
                  {guestsCount}
                </span>
                <button
                  onClick={() => setGuestsCount(Math.min(10, guestsCount + 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Activity Cost:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalPrice, currency)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirm} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Confirm & Add to Schedule</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
