import React from "react";
import { Compass, ShieldCheck, Sparkles, Plane, Headphones, Globe2, Heart, Award } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { AppModule } from "../../types";

export const Footer: React.FC = () => {
  const { setModule } = useUIStore();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      {/* Top Value Propositions */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Gemini 3.7 Intelligence</p>
                <p className="text-xs text-slate-400">Autonomous dynamic trip orchestration</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">100% Verified Escrow</p>
                <p className="text-xs text-slate-400">Instant refundable fares & 3DS guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">360° VR Previews</p>
                <p className="text-xs text-slate-400">Inspect suites & flights before booking</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">24/7 Global SOS Desk</p>
                <p className="text-xs text-slate-400">Live human agents + emergency flight recovery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 text-white shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">TRAVELVERSE AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The next-generation end-to-end travel operating system powered by multimodal artificial intelligence, virtual reality immersion, and real-time global booking networks.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Globe2 className="h-4 w-4 text-blue-400" />
              <span>Available in 180+ countries & 45 currencies</span>
            </div>
          </div>

          {/* Module Direct Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">Explore</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setModule("flights")} className="hover:text-white transition-colors cursor-pointer">
                  Flights & Cabins
                </button>
              </li>
              <li>
                <button onClick={() => setModule("hotels")} className="hover:text-white transition-colors cursor-pointer">
                  Luxury Resorts
                </button>
              </li>
              <li>
                <button onClick={() => setModule("packages")} className="hover:text-white transition-colors cursor-pointer">
                  Curated Packages
                </button>
              </li>
              <li>
                <button onClick={() => setModule("experiences")} className="hover:text-white transition-colors cursor-pointer">
                  VIP Experiences
                </button>
              </li>
              <li>
                <button onClick={() => setModule("vr")} className="hover:text-white transition-colors cursor-pointer">
                  VR 360° Immersion
                </button>
              </li>
            </ul>
          </div>

          {/* Smart Platform */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">AI & Tools</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setModule("ai")} className="hover:text-white transition-colors cursor-pointer">
                  AI Trip Generator
                </button>
              </li>
              <li>
                <button onClick={() => setModule("itinerary")} className="hover:text-white transition-colors cursor-pointer">
                  Interactive Itinerary
                </button>
              </li>
              <li>
                <button onClick={() => setModule("documents")} className="hover:text-white transition-colors cursor-pointer">
                  Digital Travel Wallet
                </button>
              </li>
              <li>
                <button onClick={() => setModule("agent")} className="hover:text-white transition-colors cursor-pointer">
                  Agent B2B Workspace
                </button>
              </li>
              <li>
                <button onClick={() => setModule("admin")} className="hover:text-white transition-colors cursor-pointer">
                  Command Center
                </button>
              </li>
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white">Safety & Trust</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setModule("support")} className="hover:text-white transition-colors cursor-pointer">
                  24/7 SOS Desk
                </button>
              </li>
              <li>
                <button onClick={() => setModule("notifications")} className="hover:text-white transition-colors cursor-pointer">
                  Flight Delay Alerts
                </button>
              </li>
              <li>
                <button onClick={() => setModule("profile")} className="hover:text-white transition-colors cursor-pointer">
                  Carbon Offset & Miles
                </button>
              </li>
              <li>
                <span className="text-slate-500">IATA & ATOL Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TRAVELVERSE AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Trust Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
