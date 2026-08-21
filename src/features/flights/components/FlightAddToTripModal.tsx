import React, { useState } from "react";
import {
  Compass,
  Plus,
  Calendar,
  MapPin,
  Check,
  Plane,
  X,
} from "lucide-react";
import { FlightOffer } from "../../../types";
import { useTripStore } from "../../../stores/useTravelStore";
import { useToast } from "../../../components/ui/Toast";
import { Modal, Button, Input } from "../../../components/ui";

interface FlightAddToTripModalProps {
  flight: FlightOffer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FlightAddToTripModal: React.FC<FlightAddToTripModalProps> = ({
  flight,
  isOpen,
  onClose,
}) => {
  const { trips, addTrip, addActivityToTrip } = useTripStore();
  const { showToast } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || "new");
  const [isCreatingNew, setIsCreatingNew] = useState(trips.length === 0);
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripDestination, setNewTripDestination] = useState(flight?.destinationCity || "Tokyo");
  const [newTripDate, setNewTripDate] = useState("2026-09-12");

  if (!flight) return null;

  const handleSaveToTrip = () => {
    let targetTripId = selectedTripId;

    if (isCreatingNew || selectedTripId === "new") {
      const newTrip = {
        id: `trip-${Date.now()}`,
        title: newTripTitle || `Trip to ${flight.destinationCity}`,
        destination: newTripDestination || flight.destinationCity,
        country: "Global",
        startDate: newTripDate,
        endDate: "2026-09-24",
        coverImage:
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        budgetTotal: flight.price * 2,
        currency: flight.currency,
        status: "upcoming" as const,
        travelersCount: 1,
        days: [
          {
            dayNumber: 1,
            date: newTripDate,
            theme: `Arrival & Departure: ${flight.airline}`,
            activities: [
              {
                id: `act-fl-${Date.now()}`,
                time: flight.departureTime.slice(11, 16) || "08:30",
                title: `Flight ${flight.flightNumber || flight.airline} (${flight.originCode} → ${flight.destinationCode})`,
                type: "flight" as const,
                description: `Boarding ${flight.airline} flight ${flight.flightNumber}. Cabin: ${flight.cabinClass}.`,
                cost: flight.price,
                location: `${flight.originCity} International Airport`,
                completed: false,
              },
            ],
          },
        ],
        packingList: [
          { id: "pk-1", item: "Passport & Boarding Pass", packed: true, category: "Documents" },
          { id: "pk-2", item: "Noise-Cancelling Headphones", packed: false, category: "Electronics" },
        ],
        emergencyContacts: [
          { name: "24/7 AI Concierge Assistance", role: "Flight & Travel Concierge", phone: "+1 (800) 555-FLYT" },
        ],
      };
      addTrip(newTrip);
      targetTripId = newTrip.id;
    } else {
      // Add activity to day 1 of existing trip
      addActivityToTrip(targetTripId, 1, {
        id: `act-fl-${Date.now()}`,
        time: flight.departureTime.slice(11, 16) || "08:30",
        title: `Flight ${flight.flightNumber || flight.airline} (${flight.originCode} → ${flight.destinationCode})`,
        type: "flight" as const,
        description: `Boarding ${flight.airline} flight ${flight.flightNumber}. Cabin: ${flight.cabinClass}.`,
        cost: flight.price,
        location: `${flight.originCity} Airport`,
        completed: false,
      });
    }

    showToast({
      type: "success",
      title: "Flight Added to Trip",
      message: `Successfully booked ${flight.flightNumber || flight.airline} into your trip plan!`,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Flight to Trip Itinerary"
      size="md"
    >
      <div className="space-y-5 pt-2 pb-3">
        {/* Flight summary badge */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{flight.airlineLogo || "✈️"}</span>
            <div>
              <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                {flight.flightNumber || flight.airline} • {flight.originCode} → {flight.destinationCode}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {flight.cabinClass} • {flight.totalDuration}
              </div>
            </div>
          </div>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
            ${flight.price}
          </span>
        </div>

        {/* Existing Trips Selection */}
        {trips.length > 0 && !isCreatingNew ? (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choose an Existing Trip
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    selectedTripId === trip.id
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 font-bold"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-slate-900 dark:text-white">{trip.title}</div>
                      <div className="text-[10px] text-slate-400">{trip.destination} • {trip.startDate}</div>
                    </div>
                  </div>
                  {selectedTripId === trip.id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Or create a brand new trip</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Create New Trip
              </label>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Back to existing trips
                </button>
              )}
            </div>

            <Input
              label="Trip Title"
              placeholder={`e.g. Expedition to ${flight.destinationCity}`}
              value={newTripTitle}
              onChange={(e) => setNewTripTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Destination"
                value={newTripDestination}
                onChange={(e) => setNewTripDestination(e.target.value)}
              />
              <Input
                label="Start Date"
                type="date"
                value={newTripDate}
                onChange={(e) => setNewTripDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveToTrip} className="font-bold">
            Confirm & Add to Trip
          </Button>
        </div>
      </div>
    </Modal>
  );
};
