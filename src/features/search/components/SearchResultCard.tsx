import React from "react";
import {
  Star,
  MapPin,
  Glasses,
  Check,
  Shield,
  Clock,
  Users,
  Plane,
  Building,
  Car,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";
import { UniversalSearchResultItem } from "../universalSearchService";
import { Button, Card, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";

interface SearchResultCardProps {
  item: UniversalSearchResultItem;
  currency: string;
  onSelect: (item: UniversalSearchResultItem) => void;
  onOpenDetails: (item: UniversalSearchResultItem) => void;
  onOpenVR?: (item: UniversalSearchResultItem) => void;
  viewMode?: "grid" | "list";
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  item,
  currency,
  onSelect,
  onOpenDetails,
  onOpenVR,
  viewMode = "grid",
}) => {
  const getCategoryIcon = () => {
    switch (item.category) {
      case "flight":
        return <Plane className="w-3.5 h-3.5" />;
      case "hotel":
        return <Building className="w-3.5 h-3.5" />;
      case "package":
        return <MapPin className="w-3.5 h-3.5" />;
      case "transfer":
        return <Car className="w-3.5 h-3.5" />;
      case "car":
        return <Car className="w-3.5 h-3.5" />;
      case "experience":
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadgeVariant = () => {
    switch (item.category) {
      case "flight":
        return "blue";
      case "hotel":
        return "green";
      case "package":
        return "purple";
      case "transfer":
        return "amber";
      case "car":
        return "blue";
      case "experience":
        return "pink";
      default:
        return "neutral";
    }
  };

  if (viewMode === "list") {
    return (
      <Card hoverEffect className="p-0 overflow-hidden flex flex-col md:flex-row gap-0 group">
        {/* List Image */}
        <div className="relative md:w-72 h-48 md:h-auto shrink-0 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge variant={getCategoryBadgeVariant() as any} className="capitalize text-[10px] font-bold shadow-sm">
              <span className="flex items-center gap-1">
                {getCategoryIcon()}
                <span>{item.category}</span>
              </span>
            </Badge>
          </div>

          {item.vrAvailable && onOpenVR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenVR(item);
              }}
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 hover:bg-black transition-colors cursor-pointer"
            >
              <Glasses className="w-3.5 h-3.5 text-indigo-400" />
              <span>360° VR View</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location}
                  </span>
                  {item.duration && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  )}
                </div>
                <h3
                  onClick={() => onOpenDetails(item)}
                  className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {item.rating.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">({item.reviewsCount})</span>
              </div>
            </div>

            {/* Badges & Amenities */}
            <div className="flex flex-wrap gap-1.5">
              {item.badges.slice(0, 3).map((badge, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                >
                  {badge}
                </span>
              ))}
              {item.amenities.slice(0, 3).map((a, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[10px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1"
                >
                  <Check className="w-2.5 h-2.5 text-blue-500" />
                  <span>{a}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Cancellation + Pricing & Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>{item.cancellationText}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                {item.originalPrice && (
                  <span className="text-[10px] text-slate-400 line-through mr-1.5">
                    {formatCurrency(item.originalPrice, currency)}
                  </span>
                )}
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(item.price, currency)}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">/{item.priceUnit}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => onOpenDetails(item)} className="text-xs">
                  <Info className="w-3.5 h-3.5" />
                  <span>Details</span>
                </Button>
                <Button size="sm" onClick={() => onSelect(item)} className="text-xs font-bold gap-1">
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group h-full">
      <div>
        {/* Card Image Banner */}
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Category Badge & VR */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <Badge variant={getCategoryBadgeVariant() as any} className="capitalize text-[10px] font-bold shadow-md">
              <span className="flex items-center gap-1">
                {getCategoryIcon()}
                <span>{item.category}</span>
              </span>
            </Badge>

            {item.vrAvailable && onOpenVR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVR(item);
                }}
                className="px-2 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 hover:bg-black transition-colors cursor-pointer shadow-md"
              >
                <Glasses className="w-3.5 h-3.5 text-indigo-400" />
                <span>360° VR</span>
              </button>
            )}
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div className="min-w-0 pr-2">
              <span className="text-[11px] text-slate-200 flex items-center gap-1 font-medium truncate">
                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                <span>{item.location}</span>
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-white shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold">{item.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <h3
              onClick={() => onOpenDetails(item)}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
            >
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {item.subtitle}
            </p>
          </div>

          {/* Badges / Amenities Pills */}
          <div className="flex flex-wrap gap-1">
            {item.badges.slice(0, 2).map((b, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
              >
                {b}
              </span>
            ))}
            {item.amenities.slice(0, 2).map((a, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10px] font-semibold text-blue-700 dark:text-blue-300 truncate max-w-[140px]"
              >
                {a}
              </span>
            ))}
          </div>

          {/* Cancellation Info */}
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <Shield className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.cancellationText}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Pricing and Book Button */}
      <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div>
          {item.originalPrice && (
            <span className="text-[10px] text-slate-400 line-through block leading-none">
              {formatCurrency(item.originalPrice, currency)}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(item.price, currency)}
            </span>
            <span className="text-[10px] text-slate-400">/{item.priceUnit}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDetails(item)}
            className="text-xs px-2.5 py-1 h-8"
          >
            Details
          </Button>
          <Button
            size="sm"
            onClick={() => onSelect(item)}
            className="text-xs font-bold px-3 py-1 h-8 gap-1"
          >
            <span>Book</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
