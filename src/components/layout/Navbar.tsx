import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  Plane,
  Building,
  Sparkles,
  Glasses,
  Briefcase,
  MapPin,
  FileText,
  Shield,
  CreditCard,
  User,
  Users,
  Bell,
  Search,
  Menu,
  X,
  Bot,
  Globe,
  Sliders,
  DollarSign,
  ChevronDown,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTravelStore, useNotificationStore } from "../../stores/useTravelStore";
import { useI18nStore } from "../../stores/useI18nStore";
import { AppModule, UserRole } from "../../types";
import { APP_CONFIG } from "../../config/constants";
import { Button, Badge } from "../ui";
import { AgentNavbar } from "./AgentNavbar";

export const Navbar: React.FC = () => {
  const { currentModule, setModule, toggleAIConcierge, setGlobalSearchOpen } = useUIStore();
  const { user, setRole } = useAuthStore();
  const { currency, setCurrency } = useTravelStore();
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const { t } = useI18nStore();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showTravelDropdown, setShowTravelDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const travelMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
      if (travelMenuRef.current && !travelMenuRef.current.contains(target)) {
        setShowTravelDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer and dropdowns on route change
  useEffect(() => {
    setShowMobileDrawer(false);
    setShowTravelDropdown(false);
    setShowMoreDropdown(false);
  }, [currentModule]);

  // If in Agent mode, show dedicated Agent Navigation
  if (currentModule === "agent" || currentModule === "customers") {
    return <AgentNavbar />;
  }

  // Navigation Categorization
  const primaryNavItems: { module: AppModule; label: string; icon: React.ReactNode }[] = [
    { module: "home", label: t("discover") || "Discover", icon: <Compass className="w-4 h-4 text-blue-400" /> },
    { module: "ai", label: t("aiWorkspace") || "AI Workspace", icon: <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> },
  ];

  const travelNavItems: { module: AppModule; label: string; icon: React.ReactNode; desc: string }[] = [
    { module: "flights", label: t("flights") || "Flights", icon: <Plane className="w-4 h-4 text-sky-400" />, desc: "Real-time global airline routing" },
    { module: "hotels", label: t("hotels") || "Hotels", icon: <Building className="w-4 h-4 text-amber-400" />, desc: "Luxury resorts & smart match" },
    { module: "packages", label: t("packages") || "Packages", icon: <MapPin className="w-4 h-4 text-emerald-400" />, desc: "Curated multi-destination bundles" },
    { module: "experiences", label: t("experiences") || "Experiences", icon: <Sparkles className="w-4 h-4 text-rose-400" />, desc: "Local insider activities & tours" },
  ];

  const secondaryNavItems: { module: AppModule; label: string; icon: React.ReactNode; desc: string }[] = [
    { module: "vr", label: t("vrGallery") || "VR 360°", icon: <Glasses className="w-4 h-4 text-indigo-400" />, desc: "Spatial destination previews" },
    { module: "trips", label: t("myTrips") || "My Trips", icon: <Briefcase className="w-4 h-4 text-emerald-400" />, desc: "Active & past itineraries" },
    { module: "design-system", label: "Design System", icon: <Layers className="w-4 h-4 text-purple-400" />, desc: "Aero UI design specification" },
    { module: "destinations", label: "LocalSense™", icon: <Globe className="w-4 h-4 text-blue-400" />, desc: "Cultural & neighborhood intelligence" },
  ];

  const isTravelActive = travelNavItems.some((item) => item.module === currentModule);
  const isSecondaryActive = secondaryNavItems.some((item) => item.module === currentModule);

  return (
    <header className="sticky top-0 z-40 w-full h-[70px] border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all shadow-lg shadow-black/20 select-none">
      <div className="w-full h-full px-3 sm:px-5 lg:px-6 xl:px-8 flex items-center justify-between gap-2 lg:gap-4 xl:gap-6 min-w-0">
        
        {/* ========================================================= */}
        {/* SECTION 1: LEFT (Logo & Brand) - flex: 0 0 auto */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setModule("home")}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl p-1 group cursor-pointer"
            aria-label="TravelVerse AI Home"
          >
            {/* Holographic Logo Icon */}
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Compass className="h-5.5 w-5.5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-12 duration-300" />
            </div>

            {/* Brand Title & Tagline */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">
                  TRAVELVERSE
                </span>
                <span className="rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-1.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm shadow-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 group-hover:text-slate-300 transition-colors leading-none truncate hidden md:block tracking-wide mt-0.5">
                Autonomous Travel OS
              </p>
            </div>
          </button>

          {/* Subtle Vertical Divider */}
          <div className="hidden 2xl:block h-6 w-px bg-slate-800/80 mx-1" />
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: CENTER (Adaptive Priority Navigation) - flex: 1 1 auto; min-width: 0 */}
        {/* ========================================================= */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner max-w-full overflow-hidden">
            
            {/* Primary Nav Items (Always Visible on Desktop) */}
            {primaryNavItems.map((item) => {
              const isActive = currentModule === item.module;
              return (
                <button
                  key={item.module}
                  onClick={() => setModule(item.module)}
                  className={`relative flex items-center gap-1.5 px-3 xl:px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-800 text-blue-400 shadow-sm border border-blue-500/30 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Divider between Primary and Travel */}
            <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

            {/* Travel Items on 2XL+ Displays (All visible) */}
            <div className="hidden 2xl:flex items-center gap-1">
              {travelNavItems.map((item) => {
                const isActive = currentModule === item.module;
                return (
                  <button
                    key={item.module}
                    onClick={() => setModule(item.module)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700 font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Travel Items on XL Displays (Flights, Hotels, Packages visible; Experiences in dropdown) */}
            <div className="hidden xl:flex 2xl:hidden items-center gap-1">
              {travelNavItems.slice(0, 3).map((item) => {
                const isActive = currentModule === item.module;
                return (
                  <button
                    key={item.module}
                    onClick={() => setModule(item.module)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-slate-800 text-blue-400 shadow-sm border border-slate-700 font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Compact "Travel ▾" Dropdown for LG displays (1024px - 1279px) */}
            <div className="xl:hidden relative" ref={travelMenuRef}>
              <button
                onClick={() => {
                  setShowTravelDropdown(!showTravelDropdown);
                  setShowMoreDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  isTravelActive || showTravelDropdown
                    ? "bg-slate-800 text-blue-400 border border-blue-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
                aria-expanded={showTravelDropdown}
                aria-haspopup="true"
              >
                <Plane className="w-3.5 h-3.5 text-sky-400" />
                <span>Travel</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTravelDropdown ? "rotate-180" : ""}`} />
              </button>

              {showTravelDropdown && (
                <div className="absolute left-0 mt-2.5 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Travel Inventory
                  </div>
                  <div className="space-y-1">
                    {travelNavItems.map((item) => (
                      <button
                        key={item.module}
                        onClick={() => {
                          setModule(item.module);
                          setShowTravelDropdown(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          currentModule === item.module
                            ? "bg-blue-600/15 text-blue-300 border border-blue-500/20"
                            : "hover:bg-slate-800/70 text-slate-300"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800/80 mt-0.5">{item.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">{item.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* "More ▾" Secondary Features Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => {
                  setShowMoreDropdown(!showMoreDropdown);
                  setShowTravelDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSecondaryActive || showMoreDropdown
                    ? "bg-slate-800 text-indigo-300 border border-indigo-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
                aria-expanded={showMoreDropdown}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreDropdown ? "rotate-180" : ""}`} />
              </button>

              {showMoreDropdown && (
                <div className="absolute right-0 lg:left-0 mt-2.5 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Extended Features
                  </div>
                  <div className="space-y-1">
                    {/* Include Experiences in dropdown if not visible on navbar (for xl screens) */}
                    <div className="xl:block 2xl:hidden">
                      <button
                        onClick={() => {
                          setModule("experiences");
                          setShowMoreDropdown(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          currentModule === "experiences"
                            ? "bg-blue-600/15 text-blue-300 border border-blue-500/20"
                            : "hover:bg-slate-800/70 text-slate-300"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800/80 mt-0.5"><Sparkles className="w-4 h-4 text-rose-400" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">Experiences</div>
                          <div className="text-[10px] text-slate-400 truncate">Curated activities & tours</div>
                        </div>
                      </button>
                    </div>

                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.module}
                        onClick={() => {
                          setModule(item.module);
                          setShowMoreDropdown(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          currentModule === item.module
                            ? "bg-blue-600/15 text-blue-300 border border-blue-500/20"
                            : "hover:bg-slate-800/70 text-slate-300"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800/80 mt-0.5">{item.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">{item.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </nav>

        {/* ========================================================= */}
        {/* SECTION 3: RIGHT (Controls, CTA & User) - flex: 0 0 auto */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* 1. Global Search Trigger (Pill on 2XL, Icon on smaller screens) */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer text-xs group shrink-0"
            aria-label="Search destinations and flights"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="hidden 2xl:inline text-slate-400 font-medium">Search...</span>
            <kbd className="hidden 2xl:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-slate-700 bg-slate-950 px-1.5 font-mono text-[9px] font-semibold text-slate-400">
              <span>⌘K</span>
            </kbd>
          </button>

          {/* 2. Currency Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:border-slate-700 transition-colors shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
              aria-label="Select Currency"
            >
              {APP_CONFIG.currencies.map((curr) => (
                <option key={curr} value={curr} className="bg-slate-900 text-white">
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Notifications Bell Trigger & Popover */}
          <div className="relative shrink-0" ref={notifMenuRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md shadow-rose-500/50 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Live Updates</h4>
                    {unreadCount > 0 && <Badge variant="danger" size="sm">{unreadCount} new</Badge>}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.linkModule) setModule(notif.linkModule as AppModule);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          notif.read
                            ? "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900/80"
                            : "bg-blue-950/30 border-blue-900/40 text-slate-200 hover:bg-blue-950/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white">{notif.title}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-xs mt-1 text-slate-400 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center">
                  <button
                    onClick={() => {
                      setModule("notifications");
                      setShowNotifDropdown(false);
                    }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View All Notifications & SOS Alerts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Standout Primary CTA: AI Workspace Button (Full on XL+, Compact on smaller) */}
          <button
            onClick={() => setModule("ai")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/20 cursor-pointer group shrink-0"
            title="Launch AI Workspace"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="hidden sm:inline tracking-wide">AI Workspace</span>
            <span className="sm:hidden tracking-wide">AI</span>
          </button>

          {/* 5. User Account / Profile Menu */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              aria-label="User Profile Menu"
            >
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={user?.name || "User"}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="hidden 2xl:block text-left text-xs">
                <p className="font-bold text-white truncate max-w-[85px]">{user?.name || "Traveler"}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || "traveler"}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2.5 w-76 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                {/* User Header */}
                <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl mb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                      alt="Avatar"
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="purple" size="sm">
                          ⭐ {(user?.loyaltyPoints || 0).toLocaleString()} Miles
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="p-2 bg-slate-900/60 border border-slate-800/60 rounded-xl mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Active Workspace Mode:
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {(["traveler", "agent", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          if (r === "agent") setModule("agent");
                          else if (r === "admin") setModule("admin");
                          else setModule("home");
                          setShowUserDropdown(false);
                        }}
                        className={`text-[10px] font-bold py-1.5 px-1 rounded-lg capitalize transition-all cursor-pointer ${
                          user?.role === r
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setModule("onboarding");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/40 text-left font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>TravelDNA™ Onboarding</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("profile");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-left transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Traveler Profile & Miles</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("bookings");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-left transition-colors cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Bookings & Tickets</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("documents");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-left transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Travel Documents & Passes</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("support");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-left transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span>24/7 SOS & Concierge</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. Tablet/Mobile Full Menu Toggle */}
          <button
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {showMobileDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE / TABLET SLIDE-DOWN DRAWER */}
      {/* ========================================================= */}
      {showMobileDrawer && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto">
          
          {/* Quick Mobile Currency Switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              Currency:
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 text-xs font-bold text-white px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
            >
              {APP_CONFIG.currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Core Navigation Items */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Explore & Travel
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { module: "home" as AppModule, label: "Discover", icon: <Compass className="w-4 h-4 text-blue-400" /> },
                { module: "ai" as AppModule, label: "AI Workspace", icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
                { module: "flights" as AppModule, label: "Flights", icon: <Plane className="w-4 h-4 text-sky-400" /> },
                { module: "hotels" as AppModule, label: "Hotels", icon: <Building className="w-4 h-4 text-amber-400" /> },
                { module: "packages" as AppModule, label: "Packages", icon: <MapPin className="w-4 h-4 text-emerald-400" /> },
                { module: "experiences" as AppModule, label: "Experiences", icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
                { module: "vr" as AppModule, label: "VR 360°", icon: <Glasses className="w-4 h-4 text-indigo-400" /> },
                { module: "trips" as AppModule, label: "My Trips", icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
                { module: "destinations" as AppModule, label: "LocalSense™", icon: <Globe className="w-4 h-4 text-blue-400" /> },
                { module: "design-system" as AppModule, label: "Design System", icon: <Layers className="w-4 h-4 text-purple-400" /> },
              ].map((item) => (
                <button
                  key={item.module}
                  onClick={() => {
                    setModule(item.module);
                    setShowMobileDrawer(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentModule === item.module
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setModule("ai");
                setShowMobileDrawer(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Travel Copilot</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;


