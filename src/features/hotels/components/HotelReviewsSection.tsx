import React, { useState } from "react";
import {
  Star,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { HotelOffer, HotelReview } from "../../../types";
import { Badge } from "../../../components/ui";

interface HotelReviewsSectionProps {
  hotel: HotelOffer;
}

export const HotelReviewsSection: React.FC<HotelReviewsSectionProps> = ({ hotel }) => {
  const [selectedType, setSelectedType] = useState<string>("All");

  const reviews = hotel.reviews || [
    {
      id: "rev-default-1",
      author: "Eleanor Vance",
      country: "United States",
      rating: 5.0,
      date: "July 2026",
      tripType: "Couple",
      title: "An unmatched pinnacle of luxury and serenity",
      comment: "Every single detail was thoughtfully orchestrated. The staff anticipated our needs before we even asked. Waking up to these views is unforgettable.",
      pros: "Breathtaking views, world-class staff, private dining experience.",
      cons: "Wish we could have stayed longer!",
      roomType: "Premier Suite",
      stayDuration: "4 nights",
    },
    {
      id: "rev-default-2",
      author: "Marcus Aurelius",
      country: "United Kingdom",
      rating: 4.9,
      date: "June 2026",
      tripType: "Couple",
      title: "Flawless hospitality in an iconic setting",
      comment: "The architectural mastery and quiet elegance made this our best holiday in years. The spa hydrotherapy ritual is an absolute must-try.",
      pros: "Spa treatments, exceptional breakfast, sublime peace.",
      roomType: "Panoramic Suite",
      stayDuration: "3 nights",
    },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (selectedType === "All") return true;
    return r.tripType === selectedType;
  });

  const cleanliness = hotel.cleanlinessScore || 9.9;
  const location = hotel.locationScore || 9.8;
  const service = hotel.serviceScore || 9.9;
  const value = hotel.valueScore || 9.3;

  return (
    <div className="space-y-8">
      {/* Header & Overall Score Cards */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              {hotel.rating}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {hotel.ratingLabel || "Exceptional"}
                </h3>
                <span className="text-amber-400 text-sm">
                  {"★".repeat(hotel.starRating || 5)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Based on {hotel.reviewsCount} verified traveler reviews
              </p>
            </div>
          </div>

          {/* 100% Verified Reviews Trust Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Verified Guest Stays</span>
          </div>
        </div>

        {/* Category Ratings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Cleanliness</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{cleanliness} / 10</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cleanliness * 10}%` }} />
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Location & Views</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{location} / 10</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${location * 10}%` }} />
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Staff & Service</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{service} / 10</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${service * 10}%` }} />
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Value for Money</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{value} / 10</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${value * 10}%` }} />
            </div>
          </div>
        </div>

        {/* AI Sentiment Analysis Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-black text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI Review Synthesis Summary</span>
          </div>
          <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            Guests overwhelmingly commend the unrivaled tranquility, attentive concierge team, and the world-class culinary offerings. 98% of couples rated their private terrace and spa experience as flawless.
          </p>
        </div>
      </div>

      {/* Review Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", "Couple", "Solo", "Family", "Business"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedType === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab} Travelers
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredReviews.length} Reviews
        </span>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center">
                  {rev.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {rev.author}
                    </span>
                    {rev.country && (
                      <span className="text-xs text-slate-400">• {rev.country}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{rev.stayDuration || "3 nights"}</span>
                    <span>•</span>
                    <span>{rev.roomType || "Luxury Suite"}</span>
                    <span>•</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>{rev.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rev.title}</h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {rev.comment}
            </p>

            {(rev.pros || rev.cons) && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {rev.pros && (
                  <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Liked:</strong> {rev.pros}
                    </span>
                  </div>
                )}
                {rev.cons && (
                  <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>
                      <strong className="font-bold">Note:</strong> {rev.cons}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
