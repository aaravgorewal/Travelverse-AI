import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Heart,
  Plane,
  Building,
  Utensils,
  Glasses,
  Users,
  Crown,
  Compass as CompassIcon,
  Flame,
  Briefcase,
  Luggage,
  Smile,
  Landmark,
  MapPin,
  Globe2,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Accessibility,
  Plus,
  X,
  Languages,
  Check,
  Sparkle,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { apiClient } from "../../services/apiClient";
import { Button, Card, Badge, Alert } from "../../components/ui";
import { onboardingSchema, OnboardingFormData, TRAVEL_STYLES } from "./onboardingSchemas";

interface StyleDetail {
  id: string;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  badge: string;
}

const STYLE_DETAILS: StyleDetail[] = [
  {
    id: "Family",
    name: "Family",
    icon: <Users className="w-5 h-5 text-amber-500" />,
    tagline: "Kid-friendly adventures, spacious suites & multi-generational pacing",
    badge: "All Ages",
  },
  {
    id: "Luxury",
    name: "Luxury",
    icon: <Crown className="w-5 h-5 text-purple-500" />,
    tagline: "5-star retreats, Michelin dining, private yachts & VIP fast-track",
    badge: "VIP Tier",
  },
  {
    id: "Adventure",
    name: "Adventure",
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    tagline: "Trekking, diving, alpine expeditions & off-grid thrill-seeking",
    badge: "High Energy",
  },
  {
    id: "Romantic",
    name: "Romantic",
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    tagline: "Secluded cliffside villas, sunset champagne & intimate escapes",
    badge: "Couples",
  },
  {
    id: "Business",
    name: "Business",
    icon: <Briefcase className="w-5 h-5 text-blue-500" />,
    tagline: "Executive lounges, high-speed Wi-Fi & frictionless transit",
    badge: "Productive",
  },
  {
    id: "Backpacking",
    name: "Backpacking",
    icon: <Luggage className="w-5 h-5 text-emerald-500" />,
    tagline: "Budget-conscious hostels, local train hops & vibrant social hostels",
    badge: "Explorer",
  },
  {
    id: "Wellness",
    name: "Wellness",
    icon: <Smile className="w-5 h-5 text-teal-500" />,
    tagline: "Thermal spas, mindful meditation retreats & holistic rejuvenation",
    badge: "Restorative",
  },
  {
    id: "Culture",
    name: "Culture",
    icon: <Landmark className="w-5 h-5 text-indigo-500" />,
    tagline: "Ancient heritage, artisan workshops, museums & historic districts",
    badge: "Heritage",
  },
];

const BUDGET_OPTIONS = [
  {
    id: "Backpacking",
    title: "Backpacker / Value",
    range: "$50 - $150 / day",
    description: "Smart hostels, local transit, street food & scenic free wonders",
    icon: "🎒",
  },
  {
    id: "Moderate",
    title: "Comfort / Moderate",
    range: "$150 - $400 / day",
    description: "Charming boutique hotels, premium rail, curated day tours & bistro dining",
    icon: "✨",
  },
  {
    id: "Luxury",
    title: "Premium / Luxury",
    range: "$400 - $1,200 / day",
    description: "5-star luxury resorts, business class flights, private guides & fine dining",
    icon: "💎",
  },
  {
    id: "Ultra Luxury",
    title: "Ultra Luxury / Sovereign",
    range: "$1,200+ / day",
    description: "Private villas, first-class suites, chartered yachts & 24/7 bespoke concierge",
    icon: "👑",
  },
];

const POPULAR_DESTINATIONS = [
  "Tokyo, Japan",
  "Paris, France",
  "Amalfi Coast, Italy",
  "Kyoto, Japan",
  "Bali, Indonesia",
  "Swiss Alps, Switzerland",
  "New York City, USA",
  "Maldives Islands",
  "Cape Town, South Africa",
  "Santorini, Greece",
  "Reykjavik, Iceland",
  "Dubai, UAE",
  "Barcelona, Spain",
  "Queenstown, New Zealand",
];

const INTEREST_OPTIONS = [
  "Fine Dining & Wine Tasting",
  "Art, Museums & Historic Heritage",
  "Alpine Hiking & Outdoor Nature",
  "Pristine Beaches & Snorkeling",
  "Architecture & Sacred Temples",
  "Vibrant Nightlife & Live Music",
  "Wildlife Safaris & Eco Reserves",
  "Hot Spring Onsen & Spa Retreats",
  "Photography & Scenic Panoramas",
  "Street Markets & Local Gastronomy",
];

const DIETARY_OPTIONS = [
  "Standard (No restrictions)",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy Alert",
  "Low-Sodium / Diabetic",
];

const MOBILITY_OPTIONS = [
  "Standard (No special mobility assistance required)",
  "Wheelchair Accessible Priority",
  "Elevator & Step-Free Access Required",
  "Accessible Airport & Transit Assistance Priority",
  "Low Walking / Gentle Pace Itineraries",
  "Auditory / Visual Accessibility Support",
];

const LANGUAGE_OPTIONS = [
  { code: "English", name: "English (US/UK)", flag: "🇺🇸" },
  { code: "Spanish", name: "Español", flag: "🇪🇸" },
  { code: "French", name: "Français", flag: "🇫🇷" },
  { code: "German", name: "Deutsch", flag: "🇩🇪" },
  { code: "Japanese", name: "日本語", flag: "🇯🇵" },
  { code: "Mandarin", name: "中文 (Mandarin)", flag: "🇨🇳" },
  { code: "Italian", name: "Italiano", flag: "🇮🇹" },
  { code: "Portuguese", name: "Português", flag: "🇵🇹" },
  { code: "Arabic", name: "العربية", flag: "🇦🇪" },
  { code: "Korean", name: "한국어", flag: "🇰🇷" },
];

const POPULAR_HOME_CITIES = [
  "San Francisco, USA",
  "New York, USA",
  "London, UK",
  "Tokyo, Japan",
  "Paris, France",
  "Sydney, Australia",
  "Singapore",
  "Toronto, Canada",
  "Dubai, UAE",
  "Berlin, Germany",
];

export const OnboardingView: React.FC = () => {
  const { user, completeOnboarding } = useAuthStore();
  const { setModule } = useUIStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [customDestinationInput, setCustomDestinationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || "Elena Rostova",
      homeCity: user?.homeCity || "San Francisco, USA",
      preferredLanguage: user?.preferredLanguage || "English",
      travelStyle: (user?.travelStyles as string[]) || ["Luxury", "Culture"],
      budgetPreference: user?.budgetPreference || "Luxury",
      favoriteDestinations: user?.favoriteDestinations || ["Tokyo, Japan", "Amalfi Coast, Italy"],
      interests: user?.interests || ["Fine Dining & Wine Tasting", "Architecture & Sacred Temples"],
      dietaryPreferences: user?.dietaryPreferences || ["Pescatarian"],
      mobilityRequirements: user?.mobilityRequirements || ["Standard (No special mobility assistance required)"],
    },
    mode: "onChange",
  });

  const selectedStyles = watch("travelStyle") || [];
  const selectedBudget = watch("budgetPreference");
  const selectedDestinations = watch("favoriteDestinations") || [];
  const selectedInterests = watch("interests") || [];
  const selectedDietary = watch("dietaryPreferences") || [];
  const selectedMobility = watch("mobilityRequirements") || [];
  const selectedLanguage = watch("preferredLanguage");
  const homeCityVal = watch("homeCity");
  const nameVal = watch("name");

  const totalSteps = 5;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["name", "homeCity", "preferredLanguage"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["travelStyle", "budgetPreference"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["favoriteDestinations", "interests"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["dietaryPreferences", "mobilityRequirements"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setApiError(null);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setApiError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleArrayItem = (fieldName: keyof OnboardingFormData, item: string) => {
    const current = (watch(fieldName) as string[]) || [];
    if (current.includes(item)) {
      if (current.length > 1) {
        setValue(fieldName, current.filter((i) => i !== item) as any, { shouldValidate: true });
      }
    } else {
      setValue(fieldName, [...current, item] as any, { shouldValidate: true });
    }
  };

  const addCustomDestination = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDestinationInput.trim();
    if (trimmed && !selectedDestinations.includes(trimmed)) {
      setValue("favoriteDestinations", [...selectedDestinations, trimmed], { shouldValidate: true });
      setCustomDestinationInput("");
    }
  };

  const removeDestination = (dest: string) => {
    if (selectedDestinations.length > 1) {
      setValue(
        "favoriteDestinations",
        selectedDestinations.filter((d) => d !== dest),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // POST /api/v1/profile/preferences endpoint call as required
      const response: any = await apiClient.post("/v1/profile/preferences", {
        name: data.name,
        homeCity: data.homeCity,
        preferredLanguage: data.preferredLanguage,
        travelStyle: data.travelStyle,
        travelStyles: data.travelStyle,
        budgetPreference: data.budgetPreference,
        favoriteDestinations: data.favoriteDestinations,
        interests: data.interests,
        dietaryPreferences: data.dietaryPreferences,
        mobilityRequirements: data.mobilityRequirements,
      });

      // Update auth store with calibrated user profile
      completeOnboarding({
        name: data.name,
        homeCity: data.homeCity,
        preferredLanguage: data.preferredLanguage,
        travelStyle: data.travelStyle,
        travelStyles: data.travelStyle,
        budgetPreference: data.budgetPreference,
        favoriteDestinations: data.favoriteDestinations,
        interests: data.interests,
        dietaryPreferences: data.dietaryPreferences,
        mobilityRequirements: data.mobilityRequirements,
      });

      setIsSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"],
        });
      } catch {}

      // Short delay then navigate to personalized dashboard
      setTimeout(() => {
        setModule("home");
      }, 1400);
    } catch (err: any) {
      setApiError(err.message || "Failed to save profile preferences. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-3xl mx-auto space-y-6">
      {/* Top Header & Context */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>TravelDNA™ Autonomous Calibration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Personalize Your Sovereign Travel Experience
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Calibrate your AI agent with your destinations, travel styles, and accessibility requirements for tailored recommendations.
        </p>
      </div>

      {/* Progress Indicator Card */}
      <Card className="p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="space-y-3">
          {/* Step Header */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-600 dark:text-blue-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {currentStep === 1 && "Identity & Origin"}
              {currentStep === 2 && "Travel Styles & Budget"}
              {currentStep === 3 && "Destinations & Passions"}
              {currentStep === 4 && "Culinary & Accessibility"}
              {currentStep === 5 && "Autonomous Calibration Review"}
            </span>
            <span className="text-slate-400 font-mono">{progressPercent}%</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
              initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Step Breadcrumb Badges */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[
              { num: 1, label: "Identity" },
              { num: 2, label: "Styles" },
              { num: 3, label: "Destinations" },
              { num: 4, label: "Dining & Needs" },
              { num: 5, label: "Activate" },
            ].map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  disabled={s.num > currentStep}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-sm"
                      : isPast
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isPast ? <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : <span>{s.num}.</span>}
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {apiError && (
        <Alert variant="danger" title="Calibration Error" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      {/* Main Wizard Form Card */}
      <Card className="p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800/80">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* STEP 1: IDENTITY & ORIGIN */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-blue-600" />
                    Traveler Identity & Home Departure
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tell us your name, primary home hub for flight pricing, and preferred communication language.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                  </div>

                  {/* Home City */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> Home City & Departure Hub
                    </label>
                    <input
                      type="text"
                      {...register("homeCity")}
                      placeholder="e.g. San Francisco, USA"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {errors.homeCity && <p className="text-xs text-red-500 font-medium">{errors.homeCity.message}</p>}

                    {/* Quick City Chips */}
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Quick Select Hub:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_HOME_CITIES.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setValue("homeCity", city, { shouldValidate: true })}
                            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                              homeCityVal === city
                                ? "bg-blue-600 text-white font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-indigo-500" /> Preferred Language
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setValue("preferredLanguage", lang.code, { shouldValidate: true })}
                          className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-center gap-2.5 transition-all ${
                            selectedLanguage === lang.code
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="truncate">{lang.name}</span>
                          {selectedLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: TRAVEL STYLES & BUDGET */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Travel Styles & Budget Standard
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select all travel styles that match your travel personality, and choose your tier preference.
                  </p>
                </div>

                {/* 8 Required Travel Styles Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Travel Styles (Select one or more)
                    </label>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                      {selectedStyles.length} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STYLE_DETAILS.map((style) => {
                      const isSelected = selectedStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => toggleArrayItem("travelStyle", style.id)}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/30 text-slate-900 dark:text-white"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isSelected ? "bg-purple-600 text-white" : "bg-slate-200/80 dark:bg-slate-700"
                            }`}
                          >
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{style.name}</span>
                              <Badge
                                variant={isSelected ? "purple" : "default"}
                                size="sm"
                                className="text-[10px] py-0.5"
                              >
                                {style.badge}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {style.tagline}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.travelStyle && (
                    <p className="text-xs text-red-500 font-medium">{errors.travelStyle.message}</p>
                  )}
                </div>

                {/* Budget Preferences */}
                <div className="space-y-2 pt-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget Tier Preference
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUDGET_OPTIONS.map((tier) => {
                      const isSelected = selectedBudget === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setValue("budgetPreference", tier.id, { shouldValidate: true })}
                          className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30 text-slate-900 dark:text-white"
                              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-2xl shrink-0">{tier.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {tier.title}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                {tier.range}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {tier.description}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DESTINATIONS & PASSIONS */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CompassIcon className="w-5 h-5 text-indigo-600" />
                    Favorite Destinations & Passions
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pick destinations on your bucket list and travel interests to power your personalized dashboard feeds.
                  </p>
                </div>

                {/* Favorite Destinations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Favorite Destinations
                    </label>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                      {selectedDestinations.length} Selected
                    </span>
                  </div>

                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-h-[50px] items-center">
                    {selectedDestinations.map((dest) => (
                      <span
                        key={dest}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-sm"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{dest}</span>
                        {selectedDestinations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDestination(dest)}
                            className="hover:text-red-200 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Custom Add Tag Bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDestinationInput}
                      onChange={(e) => setCustomDestinationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomDestination();
                        }
                      }}
                      placeholder="Add another custom city or region (e.g. Florence, Bora Bora)..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => addCustomDestination()}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  {/* Popular Destinations Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Suggested Top Destinations:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_DESTINATIONS.map((dest) => {
                        const isSelected = selectedDestinations.includes(dest);
                        return (
                          <button
                            key={dest}
                            type="button"
                            onClick={() => toggleArrayItem("favoriteDestinations", dest)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {dest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {errors.favoriteDestinations && (
                    <p className="text-xs text-red-500 font-medium">{errors.favoriteDestinations.message}</p>
                  )}
                </div>

                {/* Interests & Passions */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Travel Passions & Activities
                    </label>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      {selectedInterests.length} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleArrayItem("interests", interest)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{interest}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.interests && <p className="text-xs text-red-500 font-medium">{errors.interests.message}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 4: DIETARY & MOBILITY ACCESSIBILITY */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-500" />
                    Dietary & Mobility Accessibility
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    TravelVerse automatically communicates dietary preferences to airlines, cruise hosts, and hotel kitchens, and filters for accessible routes.
                  </p>
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" /> Dietary Requirements & Allergies
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DIETARY_OPTIONS.map((diet) => {
                      const isSelected = selectedDietary.includes(diet);
                      return (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => toggleArrayItem("dietaryPreferences", diet)}
                          className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500 text-white border-amber-500 shadow-md"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{diet}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.dietaryPreferences && (
                    <p className="text-xs text-red-500 font-medium">{errors.dietaryPreferences.message}</p>
                  )}
                </div>

                {/* Mobility Requirements */}
                <div className="space-y-2 pt-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-teal-500" /> Mobility & Accessibility Accommodations
                  </label>
                  <div className="space-y-2">
                    {MOBILITY_OPTIONS.map((mobility) => {
                      const isSelected = selectedMobility.includes(mobility);
                      return (
                        <button
                          key={mobility}
                          type="button"
                          onClick={() => toggleArrayItem("mobilityRequirements", mobility)}
                          className={`w-full p-3.5 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 ring-2 ring-teal-500/30 text-teal-900 dark:text-teal-200"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Accessibility
                              className={`w-4 h-4 ${isSelected ? "text-teal-600" : "text-slate-400"}`}
                            />
                            <span>{mobility}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.mobilityRequirements && (
                    <p className="text-xs text-red-500 font-medium">{errors.mobilityRequirements.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 5: CALIBRATION REVIEW & COMPLETE */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Sovereign Profile Calibrated
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review your calibrated profile before finalizing. Your home dashboard will instantly personalize.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Traveler</span>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">{nameVal}</p>
                      <p className="text-slate-500">{homeCityVal} • {selectedLanguage}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Budget Standard</span>
                      <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        {selectedBudget} Tier
                      </p>
                      <p className="text-slate-500">{BUDGET_OPTIONS.find((b) => b.id === selectedBudget)?.range}</p>
                    </div>
                  </div>

                  {/* Travel Styles Badges */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                      Calibrated Travel Styles
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStyles.map((s) => (
                        <Badge key={s} variant="purple" size="md">
                          ✦ {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Favorite Destinations */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                      Target Destinations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDestinations.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          📍 {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dining & Mobility */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Dietary Preferences
                      </span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedDietary.join(", ") || "Standard"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Mobility Accommodations
                      </span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedMobility.join(", ") || "Standard"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Calibration Assurance */}
                <div className="p-4 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-300/60 dark:border-purple-800/60 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                    <span className="font-bold">Autonomous Sync Active:</span> Clicking finalize will register your profile with the backend (<code>POST /api/v1/profile/preferences</code>) and calibrate flight pricing from <strong>{homeCityVal}</strong>.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Navigation Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setModule("home")}>
                Skip for now
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} className="shadow-lg">
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || isSuccess}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-purple-500/20 px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calibrating TravelDNA...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Personalizing Home...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Complete Calibration & Launch
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
export default OnboardingView;
