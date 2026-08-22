import React, { useState, useEffect } from "react";
import { Compass, Menu, X, ChevronDown, Search, Bell, User } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { Button } from "../ui";
import type { AppModule } from "../../types";

interface DropdownItem {
  label: string;
  id: AppModule;
}

const NavDropdown = ({ label, items, setModule }: { label: string; items: DropdownItem[]; setModule: (id: AppModule) => void }) => {
  return (
    <div className="relative group/navitem">
      <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors h-16">
        {label}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/navitem:text-slate-600 dark:group-hover/navitem:text-slate-300 transition-colors" />
      </button>
      
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/navitem:opacity-100 group-hover/navitem:translate-y-0 group-hover/navitem:pointer-events-auto transition-all duration-200 z-50">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-2 w-48 flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PublicHeader: React.FC = () => {
  const { setModule, setGlobalSearchOpen, currentModule } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productDropdown: DropdownItem[] = [
    { label: "AI Planner", id: "ai" },
    { label: "My Trips", id: "trips" },
    { label: "Itinerary", id: "itinerary" },
    { label: "AI Workspace", id: "ai" },
  ];

  const exploreDropdown: DropdownItem[] = [
    { label: "Flights", id: "flights" },
    { label: "Hotels", id: "hotels" },
    { label: "Packages", id: "packages" },
    { label: "Experiences", id: "experiences" },
    { label: "Destinations", id: "destinations" },
  ];

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 h-[72px] transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm" 
          : "bg-white dark:bg-slate-950 border-b border-transparent dark:border-slate-800"
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          
          {/* LEFT: Logo & Descriptor */}
          <div className="flex items-center gap-4 shrink-0">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setModule("home")}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors">
                <Compass className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">TravelVerse</span>
            </div>
            {/* Optional subtle descriptor */}
            <div className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="hidden lg:block text-xs font-medium text-slate-500 dark:text-slate-400">Autonomous Travel OS</span>
          </div>

          {/* CENTER: Primary Navigation */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <NavDropdown label="Product" items={productDropdown} setModule={setModule} />
            <NavDropdown label="Explore" items={exploreDropdown} setModule={setModule} />
            
            <button
              onClick={() => setModule("home")}
              className={`text-sm font-medium transition-colors h-16 flex items-center ${
                currentModule === 'home' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              How It Works
            </button>
            
            <button
              onClick={() => setModule("travelpulse")}
              className={`text-sm font-medium transition-colors h-16 flex items-center ${
                currentModule === 'travelpulse' 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Travel Intelligence
            </button>
          </nav>

          {/* RIGHT: Desktop Actions */}
          <div className="hidden md:flex items-center shrink-0 gap-6">
            
            {/* Secondary Actions Group */}
            <div className="flex items-center gap-1">
              {/* Search Trigger */}
              <button 
                onClick={() => setGlobalSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                aria-label="Search"
                title="Search (Cmd+K)"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Notifications Trigger */}
              {isAuthenticated && (
                <button 
                  className="relative w-9 h-9 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
                </button>
              )}
            </div>

            {/* Account & Primary CTA Group */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <button 
                  onClick={() => setModule("profile")}
                  className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label="User Profile"
                >
                  {user?.name ? (
                    <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="w-[18px] h-[18px]" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setModule("auth")}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus:outline-none px-2 py-1 rounded-md"
                >
                  Sign In
                </button>
              )}

              <Button
                onClick={() => setModule("ai")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm px-5 py-2 min-h-[36px]"
              >
                Start Planning
              </Button>
            </div>
          </div>

          {/* RIGHT: Mobile Actions */}
          <div className="flex md:hidden items-center shrink-0 gap-1">
            <button 
              onClick={() => setGlobalSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setModule(isAuthenticated ? "profile" : "auth")}
              className="w-10 h-10 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Account"
            >
              {isAuthenticated && user?.name ? (
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-white dark:bg-slate-950 md:hidden flex flex-col overflow-y-auto border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
          <div className="flex-1 px-6 py-6 space-y-8">
            
            {/* Product Group */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">
                Product
              </h3>
              <nav className="flex flex-col">
                {productDropdown.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setModule(item.id); setIsMobileMenuOpen(false); }} 
                    className="flex items-center text-left text-slate-900 dark:text-slate-100 font-semibold text-lg py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </section>

            {/* Explore Group */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">
                Explore
              </h3>
              <nav className="flex flex-col">
                {exploreDropdown.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setModule(item.id); setIsMobileMenuOpen(false); }} 
                    className="flex items-center text-left text-slate-900 dark:text-slate-100 font-semibold text-lg py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </section>

            {/* Other Group */}
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">
                Other
              </h3>
              <nav className="flex flex-col">
                <button 
                  onClick={() => { setModule("travelpulse"); setIsMobileMenuOpen(false); }} 
                  className="flex items-center text-left text-slate-900 dark:text-slate-100 font-semibold text-lg py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                >
                  Travel Intelligence
                </button>
                <button 
                  onClick={() => { setModule("home"); setIsMobileMenuOpen(false); }} 
                  className="flex items-center text-left text-slate-900 dark:text-slate-100 font-semibold text-lg py-3 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                >
                  How It Works
                </button>
              </nav>
            </section>
          </div>

          {/* Bottom Fixed Action Area */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky bottom-0">
            <Button
              onClick={() => { setModule("ai"); setIsMobileMenuOpen(false); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 text-base shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Start Planning
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
