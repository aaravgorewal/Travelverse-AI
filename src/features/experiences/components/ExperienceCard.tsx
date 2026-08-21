import React from "react";
import {
  Sparkles,
  Clock,
  MapPin,
  Star,
  Plus,
  Eye,
  MessageSquareText,
  Compass,
  CheckCircle2,
  Zap,
  Globe,
  Headphones,
} from "lucide-react";
import { TravelExperience } from "../../../types";
import { Card, Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { useUIStore } from "../../../stores/useUIStore";

interface ExperienceCardProps {
  experience: TravelExperience;
  currency: string;
  onView: (exp: TravelExperience) => void;
  onAdd: (exp: TravelExperience) => void;
  onAskAI: (exp: TravelExperience) => void;
  onBook?: (exp: TravelExperience) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (exp: TravelExperience) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  currency,
  onView,
  onAdd,
  onAskAI,
  onBook,
  isFavorite,
  onToggleFavorite,
}) => {
  const { openVR } = useUIStore();

  const handleLaunchVR = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (experience.vrPreviewUrl) {
      openVR({
        id: experience.id,
        title: `${experience.name || experience.title} - 360° Preview`,
        destination: experience.city,
        country: experience.country,
        category: experience.category,
        type: "360-landscape",
        panoramaUrl: experience.vrPreviewUrl,
        thumbnailUrl: experience.imageUrl,
        description: experience.description,
        hotspots: [],
      });
    }
  };

  return (
    <Card
      id={`experience-card-${experience.id}`}
      hoverEffect
      className="p-0 overflow-hidden flex flex-col justify-between group border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl"
    >
      <div className="relative">
        {/* 1. IMAGE */}
        <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={experience.imageUrl}
            alt={experience.name || experience.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />

          {/* Top Left: Category Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1">
              <span className="text-xs">
                {experience.category === "Adventure"
                  ? "🧭"
                  : experience.category === "Culture"
                  ? "🏛️"
                  : experience.category === "Food"
                  ? "🍜"
                  : experience.category === "Family"
                  ? "👨‍👩‍👧‍👦"
                  : experience.category === "Nightlife"
                  ? "🍸"
                  : experience.category === "Shopping"
                  ? "🛍️"
                  : experience.category === "Wellness"
                  ? "🧘"
                  : "🌲"}
              </span>
              <span>{experience.category}</span>
            </span>
          </div>

          {/* Top Right: AI MATCH Badge */}
          {experience.aiMatchScore && (
            <div className="absolute top-3 right-3 z-10">
              <div
                title={experience.aiMatchReason || `${experience.aiMatchScore}% Match with your travel preferences`}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-extrabold shadow-md flex items-center gap-1 cursor-help border border-white/20"
              >
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                <span>{experience.aiMatchScore}% AI Match</span>
              </div>
            </div>
          )}

          {/* VR 360 Overlay Icon */}
          {experience.vrPreviewUrl && (
            <button
              onClick={handleLaunchVR}
              title="Experience in Spatial 360° VR"
              className="absolute top-12 right-3 z-10 px-2 py-1 rounded-lg bg-indigo-900/90 hover:bg-indigo-700 text-indigo-100 text-[10px] font-bold backdrop-blur-md border border-indigo-500/30 flex items-center gap-1 transition cursor-pointer shadow-md"
            >
              <Headphones className="w-3 h-3 text-indigo-300" />
              <span>360° VR</span>
            </button>
          )}

          {/* Bottom Left on Image: DURATION & LOCATION */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
            {/* DURATION */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-semibold text-[11px] border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{experience.duration}</span>
            </div>

            {/* RATING */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-bold text-[11px] text-amber-300 border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white">{experience.rating.toFixed(2)}</span>
              <span className="text-slate-300 text-[10px] font-normal">
                ({experience.reviewsCount})
              </span>
            </div>
          </div>
        </div>

        {/* 2. BODY CONTENT: Name, Location, AI Reason & Perks */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* LOCATION */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">
              {experience.location || `${experience.city}, ${experience.country}`}
            </span>
          </div>

          {/* NAME / TITLE */}
          <h3
            onClick={() => onView(experience)}
            className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
          >
            {experience.name || experience.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {experience.description}
          </p>

          {/* AI Match Insight Snippet */}
          {experience.aiMatchReason && (
            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1 italic">{experience.aiMatchReason}</span>
            </div>
          )}

          {/* Quick Perks / Language / Instant confirm */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {experience.instantConfirmation && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Zap className="w-3 h-3" />
                Instant Confirmation
              </span>
            )}
            {experience.guideLanguage && experience.guideLanguage.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                {experience.guideLanguage.slice(0, 2).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER: Price & ACTIONS (View, Add, Ask AI) */}
      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        {/* PRICE & Free Cancellation */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(experience.price, currency)}
              </span>
              {experience.originalPrice && experience.originalPrice > experience.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(experience.originalPrice, currency)}
                </span>
              )}
              <span className="text-[11px] text-slate-500 font-medium">/ person</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {experience.cancellationPolicy?.includes("Free") ? "Free cancellation" : "Flexible terms"}
            </span>
          </div>

          {onBook && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBook(experience)}
              className="text-xs font-bold border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200"
            >
              Book Now
            </Button>
          )}
        </div>

        {/* REQUIRED ACTIONS: View, Add, Ask AI */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* ACTION 1: VIEW */}
          <button
            id={`btn-view-experience-${experience.id}`}
            onClick={() => onView(experience)}
            className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>View</span>
          </button>

          {/* ACTION 2: ADD (to Trip) */}
          <button
            id={`btn-add-experience-${experience.id}`}
            onClick={() => onAdd(experience)}
            className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {/* ACTION 3: ASK AI */}
          <button
            id={`btn-askai-experience-${experience.id}`}
            onClick={() => onAskAI(experience)}
            className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
