import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  MapPin,
  Star,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  MessageSquareText,
  Calendar,
  Zap,
  Globe,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Award,
  Compass,
} from "lucide-react";
import { TravelExperience } from "../../../types";
import { Modal, Button, Badge } from "../../../components/ui";
import { formatCurrency } from "../../../lib/utils";
import { useUIStore } from "../../../stores/useUIStore";

interface ExperienceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: TravelExperience | null;
  currency: string;
  onAdd: (exp: TravelExperience) => void;
  onAskAI: (exp: TravelExperience) => void;
  onBook: (exp: TravelExperience, guestsCount: number, selectedDate: string) => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  isOpen,
  onClose,
  experience,
  currency,
  onAdd,
  onAskAI,
  onBook,
}) => {
  const { openVR } = useUIStore();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState("2026-09-14");
  const [guestsCount, setGuestsCount] = useState(2);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "inclusions" | "reviews">("overview");

  if (!experience) return null;

  const gallery = experience.images && experience.images.length > 0
    ? experience.images
    : [experience.imageUrl];

  const totalPrice = experience.price * guestsCount;

  const handleLaunchVR = () => {
    if (experience.vrPreviewUrl) {
      openVR({
        id: experience.id,
        title: `${experience.name || experience.title} - 360° Panorama`,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="space-y-6 -mt-4">
        {/* Photo Gallery & Hero Carousel */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 group">
          <img
            src={gallery[activePhotoIdx]}
            alt={experience.name || experience.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

          {/* Carousel arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActivePhotoIdx((prev) =>
                    prev === 0 ? gallery.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActivePhotoIdx((prev) =>
                    prev === gallery.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md border border-white/20">
                {experience.category}
              </span>
              {experience.aiMatchScore && (
                <div className="px-3 py-1 rounded-xl bg-emerald-600/95 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{experience.aiMatchScore}% AI Match</span>
                </div>
              )}
            </div>

            {experience.vrPreviewUrl && (
              <button
                onClick={handleLaunchVR}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold backdrop-blur-md border border-indigo-400/40 flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              >
                <Headphones className="w-4 h-4 text-indigo-200" />
                <span>Launch 360° VR View</span>
              </button>
            )}
          </div>

          {/* Bottom Floating Title & Key Metadata */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {experience.location || `${experience.city}, ${experience.country}`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {experience.duration}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {experience.rating.toFixed(2)} ({experience.reviewsCount} reviews)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {experience.name || experience.title}
            </h2>
          </div>

          {/* Gallery dots */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2 right-4 flex items-center gap-1.5 z-20">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activePhotoIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Highlights" },
            { id: "itinerary", label: "Full Itinerary Schedule" },
            { id: "inclusions", label: "What's Included" },
            { id: "reviews", label: `Guest Reviews (${experience.reviews?.length || 2})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Two Column Content: Left Main Info, Right Sticky Booking Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: TAB CONTENT */}
          <div className="lg:col-span-2 space-y-5">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* AI Match Explanation Box */}
                {experience.aiMatchReason && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Why our AI Travel Model recommends this for you</span>
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {experience.aiMatchReason}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Experience Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {experience.description}
                  </p>
                </div>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {experience.duration}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Group Size</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {experience.groupSize || "Small Group (Max 8)"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Languages</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {experience.guideLanguage?.join(", ") || "English"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Confirmation</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Instant & Verified
                    </p>
                  </div>
                </div>

                {/* Highlights List */}
                {experience.highlights && experience.highlights.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Curated Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {experience.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Host Profile */}
                {experience.host && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                    <img
                      src={experience.host.avatar}
                      alt={experience.host.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {experience.host.name}
                        </h5>
                        <Badge variant="blue" size="sm" className="gap-1">
                          <Award className="w-3 h-3" />
                          {experience.host.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {experience.host.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{experience.host.rating.toFixed(2)} Host Rating</span>
                        <span className="text-slate-400 font-normal ml-1">· Verified Local Expert</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meeting Point & Location */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Meeting & Departure Point</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {experience.meetingPoint}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ITINERARY */}
            {activeTab === "itinerary" && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Step-by-Step Schedule
                </h4>
                {experience.itinerarySchedule && experience.itinerarySchedule.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-blue-500/40 space-y-6 my-4">
                    {experience.itinerarySchedule.map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                        <div className="space-y-1">
                          <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                            {step.time}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {step.activity}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Detailed breakdown provided upon confirmation.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: INCLUSIONS */}
            {activeTab === "inclusions" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    What is Included
                  </h4>
                  <div className="space-y-2">
                    {experience.included?.map((inc, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    )) || (
                      <div className="text-xs text-slate-500">All essential gear and certified local host included.</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    What is NOT Included
                  </h4>
                  <div className="space-y-2">
                    {experience.notIncluded?.map((ninc, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2.5"
                      >
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{ninc}</span>
                      </div>
                    )) || (
                      <div className="text-xs text-slate-500">Personal souvenir purchases and discretionary gratuities.</div>
                    )}
                  </div>
                </div>

                {/* Cancellation Guarantee */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Cancellation & Refund Policy</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {experience.cancellationPolicy}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {experience.rating.toFixed(2)}
                    </span>
                    <div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Based on {experience.reviewsCount} verified traveler reviews
                      </span>
                    </div>
                  </div>
                  <Badge variant="warning">Top 1% Worldwide</Badge>
                </div>

                <div className="space-y-3">
                  {experience.reviews && experience.reviews.length > 0 ? (
                    experience.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                              alt={rev.author}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                {rev.author}
                              </h5>
                              <span className="text-[10px] text-slate-400">
                                {rev.travelerType || "Verified Guest"} · {rev.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                      "An extraordinary journey with incredible local insights. Everything was seamless from beginning to end." — Verified Traveler
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COL: STICKY BOOKING & ACTIONS DOCK */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(experience.price, currency)}
                  </span>
                  {experience.originalPrice && experience.originalPrice > experience.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatCurrency(experience.originalPrice, currency)}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">/ person</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  ✓ Instant confirmation & free cancellation
                </p>
              </div>

              {/* Date & Guests Picker */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Select Experience Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Number of Guests
                  </label>
                  <div className="flex items-center justify-between h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {guestsCount} {guestsCount === 1 ? "Guest" : "Guests"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                        className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setGuestsCount(Math.min(10, guestsCount + 1))}
                        className="w-6 h-6 rounded bg-white dark:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>
                    {formatCurrency(experience.price, currency)} x {guestsCount} guests
                  </span>
                  <span>{formatCurrency(totalPrice, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Booking & concierge fees</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-sm">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalPrice, currency)}</span>
                </div>
              </div>

              {/* PRIMARY & SECONDARY ACTIONS */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Book Now */}
                <Button
                  id="btn-book-experience-modal"
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-sm font-bold shadow-md shadow-blue-500/20"
                  onClick={() => onBook(experience, guestsCount, selectedDate)}
                >
                  Book & Secure Passes
                </Button>

                {/* 2. Add to Trip */}
                <Button
                  id="btn-add-experience-modal"
                  variant="outline"
                  size="md"
                  className="w-full justify-center gap-1.5 text-xs font-bold border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  onClick={() => onAdd(experience)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip Itinerary</span>
                </Button>

                {/* 3. Ask AI */}
                <button
                  id="btn-askai-experience-modal"
                  onClick={() => onAskAI(experience)}
                  className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Ask AI Concierge About This</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
