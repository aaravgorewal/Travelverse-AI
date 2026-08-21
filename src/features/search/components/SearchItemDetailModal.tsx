import React, { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Glasses,
  Shield,
  Clock,
  Check,
  Calendar,
  CreditCard,
  ArrowRight,
  Plane,
  Building,
  Car,
  Sparkles,
  Users,
  Share2,
} from "lucide-react";
import { UniversalSearchResultItem } from "../universalSearchService";
import { Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface SearchItemDetailModalProps {
  item: UniversalSearchResultItem | null;
  currency: string;
  onClose: () => void;
  onBookNow: (item: UniversalSearchResultItem) => void;
  onOpenVR?: (item: UniversalSearchResultItem) => void;
}

export const SearchItemDetailModal: React.FC<SearchItemDetailModalProps> = ({
  item,
  currency,
  onClose,
  onBookNow,
  onOpenVR,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!item) return null;

  const images = item.secondaryImages && item.secondaryImages.length > 0 ? item.secondaryImages : [item.imageUrl];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Badge variant="blue" className="capitalize text-xs font-bold">
              {item.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({item.reviewsCount} reviews)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Image Gallery */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden group">
              <img
                src={images[activeImageIdx]}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {item.vrAvailable && onOpenVR && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenVR(item);
                  }}
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl cursor-pointer"
                >
                  <Glasses className="w-4 h-4 text-indigo-400" />
                  <span>Launch Spatial 360° VR Tour</span>
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? "border-blue-600 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.location}</span>
              {item.duration && <span>• {item.duration}</span>}
              {item.capacityOrSeats && <span>• {item.capacityOrSeats}</span>}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {item.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {item.subtitle}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {item.badges.map((b, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {b}
              </span>
            ))}
          </div>

          {/* Included Amenities & Features */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Verified Amenities & Inclusions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {item.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation & Protection Policy */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                TRAVELVERSE Protection & Flexibility
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {item.cancellationText}. Instant digital confirmation and 24/7 AI Concierge support included.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer: Sticky Price & Booking CTA */}
        <div className="sticky bottom-0 z-10 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            {item.originalPrice && (
              <span className="text-xs text-slate-400 line-through block">
                {formatCurrency(item.originalPrice, currency)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(item.price, currency)}
              </span>
              <span className="text-xs text-slate-500">/{item.priceUnit}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                onBookNow(item);
              }}
              className="text-xs font-bold gap-2 px-5 py-2.5 shadow-lg shadow-blue-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Reserve & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
