import React from "react";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Glasses,
  Coffee,
  Compass,
  ArrowRight,
  Star,
  MapPin,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { HotelOffer, HotelSearchParams } from "../../../types";
import { HotelSearchForm } from "../components/HotelSearchForm";
import {
  POPULAR_HOTEL_DESTINATIONS,
  HOTEL_CURATED_COLLECTIONS,
  SEED_COMPREHENSIVE_HOTELS,
} from "../hotelData";
import { Badge, Button } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface HotelSearchPageProps {
  currency: string;
  onSearch: (params: HotelSearchParams) => void;
  onSelectHotel: (hotel: HotelOffer) => void;
  onQuickDestination: (dest: string) => void;
}

export const HotelSearchPage: React.FC<HotelSearchPageProps> = ({
  currency,
  onSearch,
  onSelectHotel,
  onQuickDestination,
}) => {
  return (
    <div className="space-y-10 sm:space-y-14 pb-16 w-full max-w-full overflow-x-hidden">
      {/* Hero Header & Floating Search Card */}
      <div className="relative border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-white p-6 sm:p-10 lg:p-14 shadow-sm border  overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Luxury Sanctuary Matcher & Global Hotel Portfolio</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Curated Global Sanctuaries &{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Overwater Retreats.
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-2xl leading-relaxed">
            Discover verified 5-star hotels, private heated plunge pool villas, and skyline suites with complimentary VIP breakfast, spa credits, and 360° VR room inspection.
          </p>
        </div>

        {/* Floating Search Form Card */}
        <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-white/20 dark:border-slate-800 text-slate-900 dark:text-white">
          <HotelSearchForm onSearch={onSearch} />
        </div>
      </div>

      {/* Popular Global Destinations */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Popular Global Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore world-renowned destinations with verified luxury accommodations
            </p>
          </div>
          <Badge variant="purple">Live Inventory</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_HOTEL_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => onQuickDestination(`${dest.city}, ${dest.country}`)}
              className="relative h-64 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-5"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-[11px] font-bold backdrop-blur-md">
                  {dest.badge}
                </span>
                <span className="text-xs text-white/90 font-semibold backdrop-blur-xs">
                  {dest.propertiesCount} Properties
                </span>
              </div>

              <div className="relative z-10 text-white space-y-1">
                <h3 className="text-xl font-black text-white">{dest.city}</h3>
                <p className="text-xs text-slate-200 line-clamp-1">{dest.tagline}</p>
                <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs">
                  <span className="text-slate-300 font-medium">Starting from</span>
                  <span className="text-base font-black text-amber-300">
                    {formatCurrency(dest.startPrice, currency)}{" "}
                    <span className="text-xs font-normal text-white">/ nt</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Luxury Collections */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Curated Architectural Collections
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Handcrafted sanctuaries grouped by distinct design styles and natural scenery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOTEL_CURATED_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              onClick={() => onQuickDestination(col.filterTag)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-36 rounded-2xl overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                    {col.count} Stays
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                    {col.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {col.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured AI Top Picks */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured AI Top Matches
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Highest scoring global sanctuaries rated by traveler reviews & comfort
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickDestination("all")}
            className="rounded-xl font-bold"
          >
            View All Properties
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEED_COMPREHENSIVE_HOTELS.slice(0, 3).map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => onSelectHotel(hotel)}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-black shadow-md">
                      ✨ {hotel.aiMatchScore}% Match
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl bg-black/60 text-white text-xs font-bold backdrop-blur-md">
                      ⭐ {hotel.rating}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-bold text-blue-600 uppercase">
                    {hotel.city}, {hotel.country}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">From</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(hotel.pricePerNight, currency)}{" "}
                    <span className="text-xs font-normal text-slate-400">/ nt</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TravelVerse Guarantees */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">100% Free Cancellation</h4>
            <p className="text-xs text-slate-400 mt-1">
              Lock in early rates with zero penalty cancel up to 48 hours before check-in.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">360° VR Spatial Tours</h4>
            <p className="text-xs text-slate-400 mt-1">
              Inspect villa balconies, bedroom views, and plunge pools in virtual reality before booking.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">VIP Concierge Inclusions</h4>
            <p className="text-xs text-slate-400 mt-1">
              Complimentary gourmet breakfast, airport transfers, and spa dining credits on selected suites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
