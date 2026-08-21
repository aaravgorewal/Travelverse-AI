import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Briefcase,
  Navigation,
  Compass,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Edit2,
  X,
} from "lucide-react";
import { TripContextData } from "../../../services/aiService";
import { useTripStore, useTravelStore } from "../../../stores/useTravelStore";

interface AITripContextPanelProps {
  tripContext: TripContextData;
  onChange: (updated: TripContextData) => void;
  onSyncWithStore?: () => void;
  onAskAIToOptimize?: () => void;
}

const PREFERENCE_OPTIONS = [
  "Michelin Dining",
  "Historic Temples",
  "Onsen Spas",
  "Bullet Trains",
  "Modern Art",
  "Luxury 5★",
  "Family Friendly",
  "Nightlife",
  "Nature Hiking",
  "Shopping & Fashion",
  "Street Food Crawl",
  "Photography Spots",
  "Slow Pace / Relax",
];

const TRIP_STAGES: ("Dreaming" | "Planning" | "Booked" | "In-Trip" | "Post-Trip")[] = [
  "Dreaming",
  "Planning",
  "Booked",
  "In-Trip",
  "Post-Trip",
];

const STAGE_ICONS = {
  Dreaming: "✨",
  Planning: "📝",
  Booked: "🎟️",
  "In-Trip": "✈️",
  "Post-Trip": "📸",
};

export const AITripContextPanel: React.FC<AITripContextPanelProps> = ({
  tripContext,
  onChange,
  onSyncWithStore,
  onAskAIToOptimize,
}) => {
  const { activeTrip } = useTripStore();
  const { bookings: storeBookings } = useTravelStore();

  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBookingTitle, setNewBookingTitle] = useState("");
  const [newBookingType, setNewBookingType] = useState("hotel");
  const [newBookingAmount, setNewBookingAmount] = useState("450");

  const [newCustomPref, setNewCustomPref] = useState("");
  const [showAddPref, setShowAddPref] = useState(false);

  const datesObj =
    typeof tripContext.dates === "object"
      ? tripContext.dates
      : { start: "2026-09-12", end: "2026-09-19" };

  const travelersCount =
    typeof tripContext.travelers === "object"
      ? tripContext.travelers.adults + (tripContext.travelers.children || 0)
      : Number(tripContext.travelers) || 2;

  const handleDestinationChange = (val: string) => {
    onChange({ ...tripContext, destination: val });
  };

  const handleDateChange = (type: "start" | "end", val: string) => {
    const updatedDates = { ...datesObj, [type]: val };
    onChange({ ...tripContext, dates: updatedDates });
  };

  const handleTravelerCountChange = (delta: number) => {
    const current =
      typeof tripContext.travelers === "object"
        ? tripContext.travelers.adults
        : Number(tripContext.travelers) || 2;
    const next = Math.max(1, Math.min(16, current + delta));
    onChange({
      ...tripContext,
      travelers: { adults: next, children: 0 },
    });
  };

  const handleBudgetChange = (val: string) => {
    onChange({ ...tripContext, budget: val });
  };

  const handleTogglePreference = (pref: string) => {
    const current = tripContext.preferences || [];
    const exists = current.includes(pref);
    const next = exists ? current.filter((p) => p !== pref) : [...current, pref];
    onChange({ ...tripContext, preferences: next });
  };

  const handleAddCustomPref = () => {
    if (!newCustomPref.trim()) return;
    const current = tripContext.preferences || [];
    if (!current.includes(newCustomPref.trim())) {
      onChange({ ...tripContext, preferences: [...current, newCustomPref.trim()] });
    }
    setNewCustomPref("");
    setShowAddPref(false);
  };

  const handleStageChange = (stage: "Dreaming" | "Planning" | "Booked" | "In-Trip" | "Post-Trip") => {
    onChange({ ...tripContext, tripStage: stage });
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingTitle.trim()) return;

    const newBookingItem = {
      id: `bkg-${Date.now()}`,
      type: newBookingType,
      title: newBookingTitle.trim(),
      status: "Confirmed",
      date: datesObj.start,
      amount: Number(newBookingAmount) || 0,
    };

    onChange({
      ...tripContext,
      bookings: [...(tripContext.bookings || []), newBookingItem],
    });

    setNewBookingTitle("");
    setIsAddingBooking(false);
  };

  const handleDeleteBooking = (id: string) => {
    onChange({
      ...tripContext,
      bookings: (tripContext.bookings || []).filter((b) => b.id !== id),
    });
  };

  const handleCurrentLocationDetect = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange({
            ...tripContext,
            currentLocation: `GPS Location (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
          });
        },
        () => {
          onChange({
            ...tripContext,
            currentLocation: "San Francisco International (SFO)",
          });
        }
      );
    }
  };

  const handleSyncFromStore = () => {
    if (activeTrip) {
      onChange({
        destination: activeTrip.destination || tripContext.destination,
        dates: {
          start: activeTrip.startDate || "2026-09-12",
          end: activeTrip.endDate || "2026-09-19",
        },
        travelers: activeTrip.travelersCount || 2,
        budget: `$${activeTrip.budgetTotal || 5400}`,
        preferences: (activeTrip as any).interests || tripContext.preferences,
        bookings: storeBookings?.map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title,
          status: b.status,
          date: b.dates?.start,
          amount: b.totalPrice,
        })) || tripContext.bookings,
        currentLocation: tripContext.currentLocation,
        tripStage: "Planning",
      });
    }
    if (onSyncWithStore) onSyncWithStore();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Trip Context
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live AI Synced</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncFromStore}
          title="Sync from active Travel Store trip"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="text-[11px]">Sync Store</span>
        </button>
      </div>

      {/* 1. Trip Stage (Dreaming, Planning, Booked, In-Trip, Post-Trip) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trip Stage
          </label>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            {STAGE_ICONS[tripContext.tripStage]} {tripContext.tripStage}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {TRIP_STAGES.map((stage) => {
            const isActive = tripContext.tripStage === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => handleStageChange(stage)}
                title={stage}
                className={`py-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs scale-102"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <span className="text-xs">{STAGE_ICONS[stage]}</span>
                <span className="truncate max-w-full text-[9px]">{stage}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Destination */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Destination</span>
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            value={tripContext.destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            placeholder="e.g. Kyoto & Tokyo, Japan"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {/* Destination quick chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          {[
            "Tokyo & Kyoto",
            "Amalfi Coast",
            "Swiss Alps",
            "Bali, Ubud",
            "Paris & Riviera",
          ].map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => handleDestinationChange(dest)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dates & Duration */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Travel Dates</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Departure</span>
            <input
              type="date"
              value={datesObj.start}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Return</span>
            <input
              type="date"
              value={datesObj.end}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Travelers & Budget */}
      <div className="grid grid-cols-2 gap-3">
        {/* Travelers */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Travelers</span>
          </label>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTravelerCountChange(-1)}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer shadow-2xs"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {travelersCount} {travelersCount === 1 ? "Guest" : "Guests"}
            </span>
            <button
              type="button"
              onClick={() => handleTravelerCountChange(1)}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer shadow-2xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Budget</span>
          </label>
          <input
            type="text"
            value={tripContext.budget}
            onChange={(e) => handleBudgetChange(e.target.value)}
            placeholder="$5,500"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 5. Current Location */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-teal-500" />
            <span>Current Location</span>
          </label>
          <button
            type="button"
            onClick={handleCurrentLocationDetect}
            className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Auto-Detect
          </button>
        </div>
        <input
          type="text"
          value={tripContext.currentLocation}
          onChange={(e) => onChange({ ...tripContext, currentLocation: e.target.value })}
          placeholder="San Francisco, CA (SFO)"
          className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 6. Preferences */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span>Preferences</span>
          </label>
          <button
            type="button"
            onClick={() => setShowAddPref(!showAddPref)}
            className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            + Add Tag
          </button>
        </div>

        {showAddPref && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <input
              type="text"
              value={newCustomPref}
              onChange={(e) => setNewCustomPref(e.target.value)}
              placeholder="e.g. Scuba Diving, Gluten-Free"
              className="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
            />
            <button
              type="button"
              onClick={handleAddCustomPref}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {PREFERENCE_OPTIONS.map((pref) => {
            const isSelected = (tripContext.preferences || []).includes(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => handleTogglePreference(pref)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Bookings Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Bookings</span>
          </label>
          <button
            type="button"
            onClick={() => setIsAddingBooking(!isAddingBooking)}
            className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            + New Booking
          </button>
        </div>

        {/* Add booking inline form */}
        {isAddingBooking && (
          <form
            onSubmit={handleAddBooking}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Attach Booking to Context
            </div>
            <input
              type="text"
              value={newBookingTitle}
              onChange={(e) => setNewBookingTitle(e.target.value)}
              placeholder="e.g. Aman Tokyo Suite Reservation"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newBookingType}
                onChange={(e) => setNewBookingType(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="experience">Experience</option>
                <option value="car">Car / Train</option>
              </select>
              <input
                type="number"
                value={newBookingAmount}
                onChange={(e) => setNewBookingAmount(e.target.value)}
                placeholder="Price $"
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingBooking(false)}
                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Bookings list */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {(tripContext.bookings || []).length > 0 ? (
            (tripContext.bookings || []).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {booking.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="capitalize font-semibold text-blue-500">
                      {booking.type}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">
                      {booking.status}
                    </span>
                    {booking.amount ? (
                      <>
                        <span>•</span>
                        <span>${booking.amount}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteBooking(booking.id)}
                  title="Remove from context"
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs">
              No bookings attached yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
