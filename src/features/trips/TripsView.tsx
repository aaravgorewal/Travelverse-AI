import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Calendar,
  Users,
  MapPin
} from "lucide-react";
import { useTripStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { formatCurrency, formatDate } from "../../lib/utils";
import { PageHeader, DataList, StatusBadge, AIActionButton, SaaSEmptyState } from "../../components/ui/SaaSCore";

export const TripsView: React.FC = () => {
  const { trips, activeTrip, setActiveTrip } = useTripStore();
  const { setModule } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleTripClick = (tripId: string) => {
    const tripToSet = [activeTrip, ...trips].find(t => t?.id === tripId);
    if (tripToSet) {
      setActiveTrip(tripToSet);
    }
    setModule("itinerary");
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return <StatusBadge status="info">Active</StatusBadge>;
      case "upcoming":
      case "confirmed & ticketed": return <StatusBadge status="success">Upcoming</StatusBadge>;
      case "completed": return <StatusBadge status="neutral">Completed</StatusBadge>;
      case "draft":
      case "planning": return <StatusBadge status="warning">Draft</StatusBadge>;
      default: return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const filteredTrips = [activeTrip, ...trips].filter(Boolean).filter((trip: any, index, self) => 
    index === self.findIndex((t) => t.id === trip.id)
  ).filter((trip: any) => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          trip.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.status.toLowerCase().includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 pt-8">
      <PageHeader
        title="Trips & Itineraries"
        description="Manage your active, upcoming, and past travel workspaces."
        action={
          <AIActionButton onClick={() => setModule("ai")}>
            <Plus className="w-4 h-4 mr-1" /> Create Trip
          </AIActionButton>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search destination or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
            {["all", "upcoming", "active", "draft", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {filteredTrips.length === 0 ? (
          <SaaSEmptyState
            title="No trips found"
            description="You don't have any trips matching these filters."
            action={<AIActionButton onClick={() => setModule("ai")}>Create Trip</AIActionButton>}
          />
        ) : (
          <DataList className="border-y-0">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Trip Details</div>
              <div className="col-span-3">Dates & Status</div>
              <div className="col-span-2">Travelers</div>
              <div className="col-span-2">Budget</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            
            {filteredTrips.map((trip: any) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="col-span-1 md:col-span-4 flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {trip.title}
                  </span>
                  <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                    <MapPin className="w-3 h-3" /> {trip.destination}, {trip.country}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex flex-col items-start gap-1">
                  {getStatusBadge(trip.status)}
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {formatDate(trip.startDate)}
                  </span>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" /> {trip.travelersCount}
                </div>

                <div className="col-span-1 md:col-span-2 flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(trip.budgetTotal || 0, trip.currency || "USD")}
                  </span>
                  {trip.progressPercent !== undefined && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${trip.progressPercent}%` }} />
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-1 flex justify-end">
                  <button className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 dark:hover:text-indigo-400">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </DataList>
        )}
      </div>
    </div>
  );
};
