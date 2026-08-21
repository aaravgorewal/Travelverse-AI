import React, { useState, useEffect } from "react";
import {
  Plane,
  Building,
  Compass,
  Sparkles,
  Glasses,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  Clock,
  AlertTriangle,
  PhoneCall,
  Bot,
  Send,
  RefreshCw,
  Luggage,
  BedDouble,
  Navigation,
  FileText,
  Ticket,
  ExternalLink,
  Info,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useTravelStore } from "../../stores/useTravelStore";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  SEED_PACKAGES,
  SEED_HOTELS,
  SEED_FLIGHTS,
  SEED_VR_SCENES,
  SEED_EXPERIENCES,
  SEED_TRIPS,
} from "../../config/constants";
import {
  Button,
  Card,
  Badge,
  Skeleton,
  SkeletonTripCard,
  SkeletonDestinationCard,
  SkeletonExperienceCard,
} from "../../components/ui";
import { formatCurrency } from "../../lib/utils";
import { apiClient } from "../../services/apiClient";
import { aiAPI } from "../../lib/api/ai";
import { useToast } from "../../components/ui/Toast";
import { useSEO } from "../../hooks/useSEO";

export const HomeView: React.FC = () => {
  useSEO({
    title: "TravelVerse AI - Autonomous Travel OS",
    description: "Discover, plan, and book optimized flight, hotel, and spatial VR travel itineraries with AI.",
    path: "/"
  });

  const { setModule, openVR, toggleAIConcierge } = useUIStore();
  const { currency, setSelectedPackage, setSelectedHotel, setSelectedFlight, setSelectedExperience, setCheckoutItem } =
    useTravelStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const userStyles = user?.travelStyles || (user?.travelPreferences?.travelStyle as string[]) || ["Luxury", "Culture"];
  const userCity = user?.homeCity || "San Francisco, USA";
  const userDestinations = user?.favoriteDestinations || ["Tokyo, Japan", "Amalfi Coast, Italy"];
  const userBudget = user?.budgetPreference || "Luxury";

  // Search & AI Hero State
  const [searchTab, setSearchTab] = useState<"flights" | "hotels" | "packages" | "experiences">("flights");
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [originInput, setOriginInput] = useState(userCity);
  const [destinationInput, setDestinationInput] = useState("Tokyo, Japan");
  const [datesInput, setDatesInput] = useState("Sep 12 - Sep 19, 2026");
  const [travelersInput, setTravelersInput] = useState("2 Travelers");

  // Dynamic Data & Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [destinationFilter, setDestinationFilter] = useState("All");

  // Copilot Live State
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<any>(null);

  // Fetch real API data for overview
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get("/v1/home/overview");
        if (isMounted && data) {
          setOverviewData(data);
        }
      } catch (err) {
        console.warn("Failed to fetch /api/v1/home/overview, falling back to seed data:", err);
      } finally {
        if (isMounted) {
          // Slight delay for smooth UX transition
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    };

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Hero Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = destinationInput.replace(/,.*/, "").trim();
    const orig = originInput.replace(/,.*/, "").trim();
    const params = new URLSearchParams();
    if (searchTab) params.set("category", searchTab);
    if (dest) params.set("destination", dest);
    if (orig && searchTab === "flights") params.set("origin", orig);
    window.history.pushState(null, "", `/search?${params.toString()}`);
    setModule("search");
  };

  // Handle Plan With AI button
  const handlePlanWithAI = (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPromptInput || "Plan a 5-day Dubai trip for my family under ₹2 lakh.";
    setModule("ai");
  };

  // Handle Agent Copilot Quick Query — uses real AI chat endpoint
  const handleCopilotSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || copilotQuery;
    if (!query.trim()) return;

    setCopilotLoading(true);
    try {
      const res = await aiAPI.chat({
          context: { user_id: "1", role: "traveler" },
        message: query,
        // conversationHistory: [],
        agentPersona: "TravelVerse Copilot",
      });
      setCopilotResponse({
        headline: res.message?.split(".")[0] || "Travel Plan Calibrated",
        analysis: res.message,
        estimatedBudget: null,
        suggestedPrompts: res.data?.suggestedPrompts || [] || [],
      });
    } catch (err: any) {
      showToast({ title: "Copilot Unavailable", message: err.message || "AI assistant is currently unavailable.", type: "error" });
      setCopilotResponse(null);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Data sources (API data prioritized, fallback to constants)
  const upcomingTrip = overviewData?.upcomingTrip || {
    id: "trip-01",
    title: "Autumn Serenade in Kyoto & Tokyo",
    destination: "Tokyo & Kyoto",
    country: "Japan",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    startDate: "2026-09-12",
    endDate: "2026-09-19",
    daysUntil: 22,
    status: "Confirmed & Ticketed",
    flightNumber: "QA 782 (Quantum Business SkySuite)",
    hotelName: "Aman Tokyo & Suiran Kyoto",
    departureGate: "Gate B14 • Terminal 1",
    boardingTime: "07:45 AM",
    pnrCode: "TV-89241X",
    travelersCount: 2,
    weatherForecast: { temp: 24, condition: "Clear & Crisp", icon: "☀️", advisory: "Optimal autumn foliage viewing" },
    progressPercent: 100,
    carbonOffsetKg: 420,
  };

  const aiRecommendations = overviewData?.aiRecommendations || [
    {
      id: "rec-1",
      badge: "AI Style Match • 99%",
      title: "Kyoto Twilight Zen & Michelin Kaiseki",
      category: "Cultural & Luxury",
      destination: "Kyoto, Japan",
      duration: "6 Days",
      estimatedCost: "$3,850",
      rating: 4.98,
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      aiRationale: "Selected based on your Pescatarian dining preference and passion for sacred architecture.",
      tags: ["Tea Ceremony", "Private Ryokan", "Gran Class Rail"],
    },
    {
      id: "rec-2",
      badge: "Trending Autonomous Deal",
      title: "Dubai Desert Oasis & Sky Lounge Helicopter Tour",
      category: "Luxury & Adventure",
      destination: "Dubai, UAE",
      duration: "5 Days",
      estimatedCost: "$2,400 (₹1.98 Lakh)",
      rating: 4.96,
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      aiRationale: "Matches your ₹2 lakh family budget target with private Bedouin falconry & Burj Khalifa access.",
      tags: ["Platinum Falconry", "Burj Al Arab", "Helicopter Transfer"],
    },
    {
      id: "rec-3",
      badge: "Wellness Sanctuary",
      title: "Amalfi Coast Yacht & Ravello Lemon Estate",
      category: "Wellness & Romance",
      destination: "Amalfi Coast, Italy",
      duration: "7 Days",
      estimatedCost: "$4,200",
      rating: 4.99,
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
      aiRationale: "Calibrated for step-free private boat transfers and panoramic cliffside relaxation.",
      tags: ["Private Riva Boat", "Cliffside Pool", "Organic Vineyard"],
    },
  ];

  const popularDestinations = overviewData?.popularDestinations || [
    {
      id: "dest-1",
      name: "Tokyo & Kyoto",
      country: "Japan",
      region: "East Asia",
      tagline: "Neon hyper-cities, ancient torii gates & culinary masters",
      rating: 4.97,
      temperature: "24°C",
      weather: "Sunny",
      startingPrice: 1240,
      currency: "USD",
      safetyLevel: "Level 1 (Highest Safety)",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Culture", "Gastronomy", "Transit Hub"],
    },
    {
      id: "dest-2",
      name: "Dubai",
      country: "United Arab Emirates",
      region: "Middle East",
      tagline: "Futuristic skyscrapers, golden dunes & luxury hospitality",
      rating: 4.95,
      temperature: "31°C",
      weather: "Clear Skies",
      startingPrice: 890,
      currency: "USD",
      safetyLevel: "Level 1 (Highest Safety)",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Family", "Luxury", "Shopping"],
    },
    {
      id: "dest-3",
      name: "Paris",
      country: "France",
      region: "Western Europe",
      tagline: "Haute couture, Louvre masterpieces & Seine romantic bistros",
      rating: 4.92,
      temperature: "21°C",
      weather: "Mild",
      startingPrice: 950,
      currency: "USD",
      safetyLevel: "Level 1 (Exercise Normal Precautions)",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Art", "Romantic", "Architecture"],
    },
    {
      id: "dest-4",
      name: "Maldives Islands",
      country: "Maldives",
      region: "Indian Ocean",
      tagline: "Pristine overwater bungalows, bioluminescent bays & coral reefs",
      rating: 4.99,
      temperature: "29°C",
      weather: "Tropical Breeze",
      startingPrice: 1850,
      currency: "USD",
      safetyLevel: "Level 1 (Highest Safety)",
      imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Honeymoon", "Diving", "Spa"],
    },
    {
      id: "dest-5",
      name: "Swiss Alps & Zermatt",
      country: "Switzerland",
      region: "Central Europe",
      tagline: "Panoramic Glacier Express, Matterhorn peaks & thermal spas",
      rating: 4.96,
      temperature: "16°C",
      weather: "Crisp Alpine",
      startingPrice: 1450,
      currency: "USD",
      safetyLevel: "Level 1 (Highest Safety)",
      imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Adventure", "Scenic Rail", "Ski"],
    },
    {
      id: "dest-6",
      name: "Amalfi Coast",
      country: "Italy",
      region: "Southern Europe",
      tagline: "Pastel cliffside villages, Capri blue grottos & lemon groves",
      rating: 4.98,
      temperature: "26°C",
      weather: "Sunny Coastal",
      startingPrice: 1320,
      currency: "USD",
      safetyLevel: "Level 1 (Exercise Normal Precautions)",
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
      vrAvailable: true,
      tags: ["Luxury", "Yachting", "Seafood"],
    },
  ];

  const filteredDestinations = popularDestinations.filter((d: any) => {
    if (destinationFilter === "All") return true;
    if (destinationFilter === "Asia") return d.region.includes("Asia");
    if (destinationFilter === "Middle East") return d.region.includes("Middle East");
    if (destinationFilter === "Europe") return d.region.includes("Europe");
    if (destinationFilter === "Tropical") return d.region.includes("Ocean") || d.tags.includes("Diving");
    return true;
  });

  const vrPortals = overviewData?.vrPortals || [
    {
      id: "vr-1",
      title: "Maldives Coral Lagoon Overwater Retreat",
      location: "Noonu Atoll, Maldives",
      type: "360° Overwater Villa",
      hotspotsCount: 3,
      thumbnailUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      badge: "4K Spatial Audio",
    },
    {
      id: "vr-2",
      title: "Tokyo Shibuya Sky at Twilight",
      location: "Tokyo, Japan",
      type: "360° Rooftop Panorama",
      hotspotsCount: 4,
      thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      badge: "Mount Fuji Horizon",
    },
    {
      id: "vr-3",
      title: "Swiss Alps Glacier Express Panorama Car",
      location: "Andermatt, Switzerland",
      type: "360° Alpine Train",
      hotspotsCount: 3,
      thumbnailUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
      badge: "Glass-Dome Vista",
    },
  ];

  const trendingExperiences = overviewData?.trendingExperiences || [
    {
      id: "exp-1",
      title: "Dubai Platinum Desert Falconry & Royal Dune Dinner",
      category: "VIP Safari",
      city: "Dubai",
      country: "UAE",
      duration: "6.5 hours",
      price: 240,
      currency: "USD",
      rating: 4.98,
      reviewsCount: 1840,
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      instantConfirmation: true,
      badge: "Top Seller",
    },
    {
      id: "exp-2",
      title: "Tokyo Cyber-Night Izakaya Odyssey & Secret Bars",
      category: "Culinary & Nightlife",
      city: "Tokyo",
      country: "Japan",
      duration: "4.5 hours",
      price: 135,
      currency: "USD",
      rating: 4.97,
      reviewsCount: 1680,
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      instantConfirmation: true,
      badge: "Michelin Insider",
    },
    {
      id: "exp-3",
      title: "Santorini Sunset Catamaran Cruise with Greek Feast",
      category: "Yacht & Sailing",
      city: "Santorini",
      country: "Greece",
      duration: "5 hours",
      price: 175,
      currency: "USD",
      rating: 4.96,
      reviewsCount: 2240,
      imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
      instantConfirmation: true,
      badge: "Best Sunset View",
    },
    {
      id: "exp-4",
      title: "Reykjavik Aurora Borealis Hunt by 4x4 Superjeep",
      category: "Adventure & Astro",
      city: "Reykjavik",
      country: "Iceland",
      duration: "4 hours",
      price: 195,
      currency: "USD",
      rating: 4.94,
      reviewsCount: 980,
      imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
      instantConfirmation: true,
      badge: "Free Re-Hunt Guarantee",
    },
  ];

  const travelSafety = overviewData?.travelSafety || {
    globalStatus: "Active & Monitored 24/7",
    activeAdvisoriesCount: 0,
    emergencyPhone: "+1 800 555 0199",
    sosStatus: "Instant Response Online",
    advisories: [
      {
        id: "saf-1",
        country: "Japan (Tokyo, Kyoto, Osaka)",
        level: "Level 1: Exercise Normal Precautions",
        statusColor: "emerald",
        entryRequirements: "eVisa / Visit Japan Web QR Code • 6-Month Passport Validity",
        healthStatus: "No quarantine or vaccination mandates required.",
        lastVerified: "Updated 10 mins ago via IATA & WHO feed",
      },
      {
        id: "saf-2",
        country: "United Arab Emirates (Dubai, Abu Dhabi)",
        level: "Level 1: Exercise Normal Precautions",
        statusColor: "emerald",
        entryRequirements: "30-day tourist visa on arrival for 70+ nations • Travel Insurance Recommended",
        healthStatus: "World-class healthcare coverage & medical concierge active.",
        lastVerified: "Updated 15 mins ago",
      },
      {
        id: "saf-3",
        country: "Schengen Zone (France, Italy, Switzerland)",
        level: "Level 1: Exercise Normal Precautions",
        statusColor: "emerald",
        entryRequirements: "ETIAS pre-clearance ready • Valid travel medical insurance ($30k+ coverage)",
        healthStatus: "Universal emergency medical standard verified.",
        lastVerified: "Updated 25 mins ago",
      },
    ],
    features: [
      { title: "24/7 Global SOS Dispatch", desc: "One-tap emergency medical evacuation and embassy concierge." },
      { title: "Autonomous Flight Delay Shield", desc: "Instant lounge passes and automatic re-routing on delays over 60 mins." },
      { title: "Biometric Wallet Encryption", desc: "Passports and boarding passes protected by multi-signature sovereign encryption." },
    ],
  };

  return (
    <div id="travelverse-home" className="space-y-16 pb-24">
      {/* 1. HERO SECTION */}
      <section
        id="hero-section"
        className="relative min-h-[580px] rounded-3xl overflow-hidden flex items-center justify-center p-6 sm:p-10 lg:p-12 text-white border border-slate-800/80 shadow-2xl"
      >
        {/* Ambient Photographic Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2200&q=85')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle Live Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 backdrop-blur-md px-4 py-1.5 border border-blue-400/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Autonomous Universe • AI Itineraries • Real-Time Inventory • 360° VR</span>
          </div>

          {/* Exact Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Your Journey. <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">Intelligently Connected.</span>
          </h1>

          {/* AI Travel Input Box */}
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="relative flex items-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 shadow-2xl focus-within:border-blue-400 transition-all">
              <Sparkles className="w-5 h-5 ml-3 text-amber-300 shrink-0" />
              <input
                id="ai-travel-input"
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePlanWithAI();
                }}
                placeholder="Tell TRAVELVERSE where you want to go..."
                className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-white placeholder-slate-300 focus:outline-none font-medium"
              />
              <Button
                id="btn-plan-with-ai-hero"
                size="sm"
                onClick={() => handlePlanWithAI()}
                className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md text-xs sm:text-sm font-bold px-4"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Plan with AI
              </Button>
            </div>

            {/* Example Prompt Pill */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Example:</span>
              <button
                type="button"
                onClick={() => {
                  setAiPromptInput("Plan a 5-day Dubai trip for my family under ₹2 lakh.");
                }}
                className="text-blue-300 hover:text-white underline decoration-blue-400/50 underline-offset-2 transition-colors cursor-pointer"
              >
                &ldquo;Plan a 5-day Dubai trip for my family under ₹2 lakh.&rdquo;
              </button>
            </div>
          </div>

          {/* Dedicated Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button
              id="btn-plan-with-ai-main"
              size="lg"
              onClick={() => handlePlanWithAI()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 px-6 py-3"
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-300" /> Plan with AI
            </Button>
            <Button
              id="btn-explore-vr-main"
              size="lg"
              variant="outline"
              onClick={() => {
                openVR(SEED_VR_SCENES[0]);
              }}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md rounded-2xl px-6 py-3"
            >
              <Glasses className="w-4 h-4 mr-2 text-teal-300" /> Explore VR
            </Button>
          </div>

          {/* Unified Search Engine Tabs */}
          <div className="mt-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 p-3 sm:p-4 text-slate-900 dark:text-white shadow-2xl backdrop-blur-xl border border-white/20 max-w-3xl mx-auto text-left">
            {/* Search Tabs: Flights, Hotels, Packages, Experiences */}
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              {[
                { id: "flights", label: "Flights", icon: <Plane className="w-3.5 h-3.5" /> },
                { id: "hotels", label: "Hotels", icon: <Building className="w-3.5 h-3.5" /> },
                { id: "packages", label: "Packages", icon: <MapPin className="w-3.5 h-3.5" /> },
                { id: "experiences", label: "Experiences", icon: <Compass className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setSearchTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    searchTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5 text-blue-500" /> Origin
                </label>
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  placeholder="City / Airport"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-indigo-500" /> Destination
                </label>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Where to?"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-teal-500" /> Dates
                </label>
                <input
                  type="text"
                  value={datesInput}
                  onChange={(e) => setDatesInput(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Select dates"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5 text-amber-500" /> Travelers
                  </label>
                  <input
                    type="text"
                    value={travelersInput}
                    onChange={(e) => setTravelersInput(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <Button
                  id="btn-execute-search"
                  type="submit"
                  size="lg"
                  className="h-full px-4.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING TRIP SECTION */}
      <section id="section-upcoming-trip" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Confirmed & Ticketed</Badge>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Departure in {upcomingTrip.daysUntil} Days
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Upcoming Trip
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="btn-view-itinerary"
              variant="outline"
              size="sm"
              onClick={() => setModule("trips")}
              className="text-xs"
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" /> Full Itinerary
            </Button>
            <Button
              id="btn-view-boarding-pass"
              size="sm"
              onClick={() => setModule("documents")}
              className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              <Ticket className="w-3.5 h-3.5 mr-1.5" /> Live Boarding Pass
            </Button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTripCard />
        ) : (
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-indigo-900/40 shadow-xl overflow-hidden relative">
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-cover bg-center hidden md:block"
              style={{ backgroundImage: `url('${upcomingTrip.coverImage}')` }}
            />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                    PNR: {upcomingTrip.pnrCode} • 2 Travelers
                  </span>
                  <h3 className="text-2xl font-black tracking-tight text-white mt-0.5">{upcomingTrip.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> {upcomingTrip.destination}
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> {upcomingTrip.startDate} to {upcomingTrip.endDate}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination Forecast</span>
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-1 justify-end">
                      {upcomingTrip.weatherForecast.icon} {upcomingTrip.weatherForecast.temp}°C • {upcomingTrip.weatherForecast.condition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Flight & Accommodation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-blue-300 font-bold">
                    <Plane className="w-4 h-4" /> Flight Outbound
                  </div>
                  <p className="text-sm font-extrabold text-white">{upcomingTrip.flightNumber}</p>
                  <p className="text-xs text-slate-400">{upcomingTrip.departureGate} • Boarding: {upcomingTrip.boardingTime}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold">
                    <BedDouble className="w-4 h-4" /> Accommodation
                  </div>
                  <p className="text-sm font-extrabold text-white">{upcomingTrip.hotelName}</p>
                  <p className="text-xs text-slate-400">7 Nights • Gran Class Ryokan & 5-Star Suite</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Autonomous Protection
                  </div>
                  <p className="text-sm font-extrabold text-white">Delay Shield & SOS Active</p>
                  <p className="text-xs text-slate-400">{upcomingTrip.carbonOffsetKg}kg CO₂ Offset 100% Certified</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. AI RECOMMENDATIONS SECTION */}
      <section id="section-ai-recommendations" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple">
                <Sparkles className="w-3 h-3 mr-1 text-purple-300" /> TravelDNA™ Tailored
              </Badge>
              <span className="text-xs font-semibold text-slate-400">
                Calibrated to your {userStyles.join(" & ")} preferences
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              AI Recommendations
            </h2>
          </div>

          <Button variant="outline" size="sm" onClick={() => setModule("ai")}>
            AI Itinerary Studio <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonExperienceCard />
            <SkeletonExperienceCard />
            <SkeletonExperienceCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.map((rec: any) => (
              <Card key={rec.id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={rec.imageUrl}
                      alt={rec.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 backdrop-blur-md">
                        ⭐ {rec.rating}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="purple" className="shadow-lg">
                        {rec.badge}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-xl bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 backdrop-blur-md">
                        {rec.duration} • {rec.destination}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{rec.title}</h3>
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span>{rec.aiRationale}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.tags?.map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          ✦ {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Est. Total</span>
                    <p className="text-base font-black text-slate-900 dark:text-white">{rec.estimatedCost}</p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setAiPromptInput(`Plan a trip for: ${rec.title}`);
                      setModule("ai");
                    }}
                  >
                    Generate Trip →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR DESTINATIONS SECTION */}
      <section id="section-popular-destinations" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="info">Global Network</Badge>
              <span className="text-xs font-semibold text-slate-400">Curated & Safety Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Destinations
            </h2>
          </div>

          {/* Destination Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Asia", "Middle East", "Europe", "Tropical"].map((filter) => (
              <button
                key={filter}
                id={`filter-dest-${filter.toLowerCase()}`}
                onClick={() => setDestinationFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  destinationFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <SkeletonDestinationCard />
            <SkeletonDestinationCard />
            <SkeletonDestinationCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredDestinations.map((dest: any) => (
              <Card key={dest.id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <Badge variant="default" className="bg-black/60 text-white backdrop-blur-md border-0 text-[10px]">
                        ⭐ {dest.rating}
                      </Badge>
                    </div>
                    {dest.vrAvailable && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-teal-500/90 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md flex items-center gap-1">
                          <Glasses className="w-3 h-3" /> 360° VR Ready
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-lg bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 backdrop-blur-md">
                        {dest.weather} • {dest.temperature}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{dest.name}</h3>
                      <span className="text-xs font-semibold text-slate-400">{dest.country}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{dest.tagline}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dest.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Flights from</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(dest.startingPrice, currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {dest.vrAvailable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openVR(SEED_VR_SCENES[0])}
                        className="text-xs px-2"
                        title="Preview in 360° VR"
                      >
                        <Glasses className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setDestinationInput(`${dest.name}, ${dest.country}`);
                        setModule("search");
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 5. EXPLORE IN VR SECTION */}
      <section id="section-explore-in-vr" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="md">
                <Glasses className="w-3.5 h-3.5 text-indigo-400" /> Spatial Reality Engine
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Interactive 360° WebGL Previews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore in VR
            </h2>
          </div>

          <Button
            id="btn-browse-all-vr"
            variant="outline"
            size="sm"
            onClick={() => setModule("vr")}
          >
            All VR Portals <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vrPortals.map((vr: any, index: number) => (
              <div
                key={vr.id}
                onClick={() => openVR(SEED_VR_SCENES[index] || SEED_VR_SCENES[0])}
                className="group relative h-72 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <img
                  src={vr.thumbnailUrl}
                  alt={vr.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-indigo-600/90 text-white text-[11px] font-bold px-3 py-1 backdrop-blur-md flex items-center gap-1 shadow-md">
                    <Glasses className="w-3.5 h-3.5" /> {vr.badge}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-teal-300">{vr.location}</span>
                  <h3 className="text-base font-bold text-white leading-snug">{vr.title}</h3>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-300">{vr.hotspotsCount} Interactive Hotspots</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Launch 360° <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. TRENDING EXPERIENCES SECTION */}
      <section id="section-trending-experiences" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Instant Confirmation</Badge>
              <span className="text-xs font-semibold text-slate-400">Handpicked by Local Insiders</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Trending Experiences
            </h2>
          </div>

          <Button
            id="btn-view-all-experiences"
            variant="outline"
            size="sm"
            onClick={() => setModule("experiences")}
          >
            View All Experiences <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <SkeletonExperienceCard />
            <SkeletonExperienceCard />
            <SkeletonExperienceCard />
            <SkeletonExperienceCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingExperiences.map((exp: any, i: number) => (
              <Card key={exp.id} hoverEffect className="p-0 overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={exp.imageUrl}
                      alt={exp.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="rounded-full bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md">
                        ⭐ {exp.rating} ({exp.reviewsCount})
                      </span>
                    </div>
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-lg bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md">
                        {exp.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="rounded-lg bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-md">
                        {exp.city}, {exp.country}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {exp.category} • {exp.duration}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {exp.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">From</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(exp.price, currency)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      const seedExp = SEED_EXPERIENCES[i] || SEED_EXPERIENCES[0];
                      setSelectedExperience(seedExp);
                      setCheckoutItem({
                        type: "experience",
                        item: seedExp,
                        travelers: 2,
                        dates: { start: "2026-09-15" },
                        totalPrice: exp.price * 2,
                      });
                      setModule("experiences");
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 7. TRAVEL SAFETY SECTION */}
      <section id="section-travel-safety" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {travelSafety.globalStatus}
              </Badge>
              <span className="text-xs font-semibold text-slate-400">
                Direct IATA, WHO & Embassy Health Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Travel Safety & Global Assurance
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${travelSafety.emergencyPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" /> 24/7 SOS: {travelSafety.emergencyPhone}
            </a>
          </div>
        </div>

        {/* Safety Advisories & Shield Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Advisories List */}
          <div className="lg:col-span-2 space-y-3">
            {travelSafety.advisories?.map((adv: any) => (
              <div
                key={adv.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{adv.country}</h4>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {adv.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Entry:</strong> {adv.entryRequirements}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span><strong>Health:</strong> {adv.healthStatus}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" /> {adv.lastVerified}
                </p>
              </div>
            ))}
          </div>

          {/* Safety Pillar Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white space-y-4 border border-indigo-900/40 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Autonomous Safety Shield</h4>
              </div>

              <div className="space-y-3">
                {travelSafety.features?.map((f: any, i: number) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {f.title}
                    </p>
                    <p className="text-[11px] text-slate-300 pl-5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setModule("documents")}
              className="w-full text-white border-white/20 hover:bg-white/10 text-xs"
            >
              Open Safety & Pass Vault
            </Button>
          </div>
        </div>
      </section>

      {/* 8. AGENT COPILOT SECTION */}
      <section id="section-agent-copilot" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="md">
                <Bot className="w-3.5 h-3.5 text-purple-300" /> Autonomous Agentic Copilot
              </Badge>
              <span className="text-xs font-semibold text-slate-400">
                Powered by Gemini 2.5 Real-Time Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Agent Copilot
            </h2>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" /> Autonomous Flight, Hotel & Budget Calculator
              </h3>
              <p className="text-xs text-slate-400">
                Ask Agent Copilot any travel query, rate comparison, or family budget optimization.
              </p>
            </div>

            {/* Quick Sample Queries */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                "Plan 5-day Dubai trip under ₹2 lakh",
                "Find Tokyo autumn business flights",
                "Best Maldives overwater villa with slide",
              ].map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => {
                    setCopilotQuery(query);
                    handleCopilotSubmit(undefined, query);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  ⚡ {query}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Copilot Query Form */}
          <form onSubmit={(e) => handleCopilotSubmit(e)} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="input-copilot-query"
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Ask Agent Copilot: e.g. 'Can I do a 4-day Amalfi Coast trip in October under $3,000?'"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all font-medium"
              />
            </div>
            <Button
              id="btn-submit-copilot"
              type="submit"
              disabled={copilotLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-5 py-3 font-bold text-xs sm:text-sm shrink-0"
            >
              {copilotLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Ask Copilot
                </span>
              )}
            </Button>
          </form>

          {/* Copilot Response Card */}
          {copilotResponse && (
            <div className="p-5 rounded-2xl bg-white/5 border border-indigo-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{copilotResponse.headline}</h4>
                </div>
                {copilotResponse.estimatedBudget && (
                  <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    Est: {copilotResponse.estimatedBudget}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {copilotResponse.analysis}
              </p>

              {/* Suggested Followup Action Pills */}
              {copilotResponse.suggestedPrompts && (
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/10">
                  <span className="text-[11px] text-slate-400">Suggested Next Steps:</span>
                  {copilotResponse.suggestedPrompts.map((p: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAiPromptInput(p);
                        setModule("ai");
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
                    >
                      → {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
