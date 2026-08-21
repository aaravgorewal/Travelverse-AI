import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { SEED_PACKAGES } from "../../config/constants";
import { TravelPackage } from "../../types";
import { Button, Card, Badge, Modal } from "../../components/ui";
import { formatCurrency } from "../../lib/utils";

export const PackagesView: React.FC = () => {
  const { currency, setSelectedPackage, setCheckoutItem } = useTravelStore();
  const { setModule } = useUIStore();

  const [activeStyle, setActiveStyle] = useState<string>("all");
  const [selectedPkgDetail, setSelectedPkgDetail] = useState<TravelPackage | null>(null);

  const filteredPackages = SEED_PACKAGES.filter((p) => {
    if (activeStyle !== "all" && p.travelStyle !== activeStyle) return false;
    return true;
  });

  const handleBookPackage = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setCheckoutItem({
      type: "package",
      item: pkg,
      travelers: 2,
      dates: { start: pkg.departureDates[0] },
      totalPrice: pkg.price * 2,
    });
    setModule("payments");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <Badge variant="purple">Fully Guided & Private Luxury Packages</Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Curated Multi-Day Expeditions & Epochs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Handcrafted luxury itineraries with private bullet trains, yacht charters, Michelin tastings, and 24/7 dedicated local hosts.
          </p>
        </div>
      </div>

      {/* Style Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Styles" },
            { id: "cultural", label: "Cultural & Temple Epochs" },
            { id: "luxury", label: "Private Yacht & Villas" },
            { id: "adventure", label: "Alpine Glacier Expeditions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStyle(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeStyle === tab.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500">{filteredPackages.length} Packages Available</span>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-56 w-full">
                <img src={pkg.images[0]} alt={pkg.title} className="h-full w-full object-cover" />
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="bg-black/60 text-white backdrop-blur-md border-0">
                    ⭐ {pkg.rating} ({pkg.reviewsCount})
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-xl bg-purple-600/90 text-white text-[11px] font-bold px-3 py-1 backdrop-blur-md">
                    {pkg.days} Days / {pkg.nights} Nights
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
                    {pkg.destination}, {pkg.country}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">{pkg.title}</h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{pkg.tagline}</p>

                {/* Highlights List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {pkg.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Price (per person)</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(pkg.price, currency)}
                </p>
              </div>

              <Button size="sm" onClick={() => setSelectedPkgDetail(pkg)}>
                Itinerary & Book
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Package Detail & Day-by-Day Modal */}
      {selectedPkgDetail && (
        <Modal
          isOpen={!!selectedPkgDetail}
          onClose={() => setSelectedPkgDetail(null)}
          title={selectedPkgDetail.title}
          description={`${selectedPkgDetail.destination}, ${selectedPkgDetail.country} • ${selectedPkgDetail.days} Days / ${selectedPkgDetail.nights} Nights`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Highlights */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Signature Package Inclusions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPkgDetail.included.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day by day timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Day-by-Day Itinerary</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {selectedPkgDetail.itinerarySummary.map((day) => (
                  <div
                    key={day.day}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-start gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold">
                      D{day.day}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{day.title}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{day.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Per Traveler Total</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(selectedPkgDetail.price, currency)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedPkgDetail(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedPkgDetail(null);
                    handleBookPackage(selectedPkgDetail);
                  }}
                >
                  Proceed to Checkout (2 Guests)
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
