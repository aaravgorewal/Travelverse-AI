import React, { useState } from "react";
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
  ArrowRightLeft,
} from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTravelStore, useNotificationStore } from "../../stores/useTravelStore";
import { AppModule, UserRole } from "../../types";
import { APP_CONFIG } from "../../config/constants";
import { Button, Badge } from "../ui";
import { AgentNavbar } from "./AgentNavbar";

export const Navbar: React.FC = () => {
  const { currentModule, setModule, toggleAIConcierge } = useUIStore();
  const { user, setRole } = useAuthStore();
  const { currency, setCurrency } = useTravelStore();
  const { notifications, unreadCount, markAllRead } = useNotificationStore();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // If in Agent mode, show dedicated Agent Navigation
  if (currentModule === "agent" || currentModule === "customers") {
    return <AgentNavbar />;
  }

  const mainNavItems: { module: AppModule; label: string; icon: React.ReactNode }[] = [
    { module: "home", label: "Discover", icon: <Compass className="w-4 h-4" /> },
    { module: "ai", label: "AI Workspace", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
    { module: "search", label: "Search", icon: <Search className="w-4 h-4 text-blue-500" /> },
    { module: "flights", label: "Flights", icon: <Plane className="w-4 h-4" /> },
    { module: "hotels", label: "Hotels", icon: <Building className="w-4 h-4" /> },
    { module: "packages", label: "Packages", icon: <MapPin className="w-4 h-4" /> },
    { module: "experiences", label: "Experiences", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { module: "vr", label: "VR 360°", icon: <Glasses className="w-4 h-4 text-indigo-500" /> },
    { module: "trips", label: "My Trips", icon: <Briefcase className="w-4 h-4" /> },
    { module: "design-system", label: "Design System", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setModule("home")}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base">
                  TRAVELVERSE
                </span>
                <span className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 leading-none truncate hidden sm:block">
                Autonomous Travel OS
              </p>
            </div>
          </button>
        </div>

        {/* 1. Desktop Navigation (1440px / Large Screen) */}
        <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          {mainNavItems.map((item) => {
            const isActive = currentModule === item.module;
            return (
              <button
                key={item.module}
                onClick={() => setModule(item.module)}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 2. Tablet Navigation Bar (768px - 1024px) */}
        <nav aria-label="Tablet Navigation" className="hidden sm:flex lg:hidden items-center gap-1 overflow-x-auto scrollbar-none max-w-sm md:max-w-md py-1">
          {[
            { module: "home" as const, label: "Discover" },
            { module: "flights" as const, label: "Flights" },
            { module: "hotels" as const, label: "Hotels" },
            { module: "packages" as const, label: "Packages" },
            { module: "trips" as const, label: "Trips" },
          ].map((item) => {
            const isActive = currentModule === item.module;
            return (
              <button
                key={item.module}
                onClick={() => setModule(item.module)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls (AI Planner, Currency, Notifs, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* AI Travel Concierge Trigger */}
          <Button
            size="sm"
            onClick={() => setModule("ai")}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:to-pink-700 shadow-sm text-xs px-2.5 sm:px-3 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">✦ AI Workspace</span>
          </Button>

          {/* Currency Switcher (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {APP_CONFIG.currencies.map((curr) => (
                <option key={curr} value={curr} className="dark:bg-slate-800">
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-88 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Updates</h4>
                    {unreadCount > 0 && <Badge variant="danger">{unreadCount} new</Badge>}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.linkModule) setModule(notif.linkModule as AppModule);
                        setShowNotifDropdown(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        notif.read
                          ? "bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          : "bg-blue-50/40 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40 text-slate-900 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold">{notif.title}</p>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setModule("notifications");
                      setShowNotifDropdown(false);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All Notifications & SOS Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt={user?.name || "User"}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/30"
              />
              <div className="hidden xl:block text-left text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-100">{user?.name || "Traveler"}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || "traveler"}</p>
              </div>
            </button>

            {/* Profile & Module Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.avatar}
                      alt="Avatar"
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
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
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Workspace Mode:
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
                        className={`text-[10px] font-bold py-1 px-1 rounded-lg capitalize transition-all ${
                          user?.role === r
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>TravelDNA™ Onboarding</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("profile");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Traveler Profile & Miles</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("bookings");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span>Bookings & Tickets</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("documents");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Travel Documents & Wallet</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("support");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <Shield className="w-4 h-4 text-rose-500" />
                    <span>24/7 SOS & Concierge</span>
                  </button>
                  <button
                    onClick={() => {
                      setModule("admin");
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20 font-semibold text-left"
                  >
                    <Sliders className="w-4 h-4 text-purple-500" />
                    <span>Platform Admin Hub</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tablet/Mobile Full Menu Toggle */}
          <button
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {showMobileDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide-down Drawer for Tablet / Mobile Menu Button */}
      {showMobileDrawer && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { module: "home" as AppModule, label: "Home", icon: <Compass className="w-4 h-4" /> },
              { module: "flights" as AppModule, label: "Flights", icon: <Plane className="w-4 h-4" /> },
              { module: "hotels" as AppModule, label: "Hotels", icon: <Building className="w-4 h-4" /> },
              { module: "packages" as AppModule, label: "Packages", icon: <MapPin className="w-4 h-4" /> },
              { module: "experiences" as AppModule, label: "Experiences", icon: <Sparkles className="w-4 h-4" /> },
              { module: "vr" as AppModule, label: "VR 360°", icon: <Glasses className="w-4 h-4" /> },
              { module: "trips" as AppModule, label: "My Trips", icon: <Briefcase className="w-4 h-4" /> },
              { module: "itinerary" as AppModule, label: "Itinerary", icon: <MapPin className="w-4 h-4" /> },
              { module: "bookings" as AppModule, label: "Bookings", icon: <CreditCard className="w-4 h-4" /> },
              { module: "documents" as AppModule, label: "Documents", icon: <FileText className="w-4 h-4" /> },
              { module: "design-system" as AppModule, label: "Design System", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
              { module: "agent" as AppModule, label: "Agent Portal", icon: <Users className="w-4 h-4 text-amber-500" /> },
            ].map((item) => (
              <button
                key={item.module}
                onClick={() => {
                  setModule(item.module);
                  setShowMobileDrawer(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentModule === item.module
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
