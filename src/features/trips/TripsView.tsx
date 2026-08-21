import React from "react";
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Plus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge } from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/utils";
import { PackMateAICard } from "./components/PackMateAICard";

export const TripsView: React.FC = () => {
  const { trips, activeTrip, setActiveTrip, togglePackingItem } = useTripStore();
  const { setModule } = useUIStore();

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Autonomous Trip Hub</Badge>
            <span className="text-xs text-slate-400 font-semibold">Active & Upcoming Journeys</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">My Trips & Itineraries</h1>
        </div>

        <Button onClick={() => setModule("ai")} className="gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Plan New AI Trip</span>
        </Button>
      </div>

      {/* Active Trip Hero Spotlight */}
      {activeTrip && (
        <Card className="p-0 overflow-hidden border-2 border-blue-500/30">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img src={activeTrip.coverImage} alt={activeTrip.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Upcoming Journey</Badge>
                  {activeTrip.isAIGenerated && <Badge variant="purple">Gemini 3.7 AI Optimized</Badge>}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">{activeTrip.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-400" /> {activeTrip.destination}, {activeTrip.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-indigo-400" /> {formatDate(activeTrip.startDate)} - {formatDate(activeTrip.endDate)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setModule("itinerary")} size="lg" className="shadow-xl">
                  Open Interactive Itinerary →
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/90 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Budget</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(activeTrip.budgetTotal, activeTrip.currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Days</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{activeTrip.days.length} Days Planned</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Travelers</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{activeTrip.travelersCount} Guests</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Packing Progress</span>
              <p className="text-lg font-extrabold text-emerald-600">
                {activeTrip.packingList.filter((p) => p.packed).length}/{activeTrip.packingList.length} Packed
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Packing Checklist & Emergency Contacts Grid */}
      {activeTrip && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Packing Checklist */}
          <PackMateAICard />

          {/* Emergency SOS & Local Support */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Emergency Contacts & SOS</h3>
              <Badge variant="danger">24/7 Verified</Badge>
            </div>

            <div className="space-y-3">
              {activeTrip.emergencyContacts.map((contact, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                    <p className="text-[11px] text-slate-400">{contact.role}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold border border-rose-200/50"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}

              <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-200">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" /> TravelVerse SOS Protocol
                </p>
                <p className="mt-1 text-[11px] text-blue-700/80 dark:text-blue-300/80">
                  Instant biometric embassy locator and automatic medical flight insurance authorization are active on this trip.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
