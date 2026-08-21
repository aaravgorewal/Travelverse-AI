import React, { useState } from "react";
import {
  Compass,
  Lock,
  UserPlus,
  KeyRound,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Plane,
  Globe2,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { ResetPasswordPage } from "./ResetPasswordPage";
import { VerifyEmailPage } from "./VerifyEmailPage";
import { SessionExpiredModal } from "./SessionExpiredModal";
import { Card, Badge } from "../../components/ui";

export type AuthSubPage =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email";

export const AuthView: React.FC = () => {
  const [activePage, setActivePage] = useState<AuthSubPage>("login");
  const [navState, setNavState] = useState<{
    email?: string;
    tokenOrCode?: string;
    devCode?: string;
  }>({});

  const handleNavigate = (page: AuthSubPage, extraState?: typeof navState) => {
    setActivePage(page);
    if (extraState) {
      setNavState(extraState);
    }
  };

  const pageTitles: Record<AuthSubPage, { title: string; subtitle: string }> = {
    login: {
      title: "Welcome to TravelVerse",
      subtitle: "Autonomous Global Travel & Sovereign Flight Operating System",
    },
    register: {
      title: "Create Traveler Account",
      subtitle: "Establish your sovereign travel DNA profile and loyalty status",
    },
    "forgot-password": {
      title: "Password Recovery",
      subtitle: "Initiate secure cryptographic identity verification",
    },
    "reset-password": {
      title: "Establish New Password",
      subtitle: "Update your master workspace encryption key",
    },
    "verify-email": {
      title: "Verify Travel Identity",
      subtitle: "Enter the 6-digit confirmation PIN sent to your inbox",
    },
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto">
      {/* Session Expired Handler */}
      <SessionExpiredModal />

      {/* Main Grid Layout: Form Container + Sovereign Travel OS Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side / Main Form Card (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand & Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/10">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
                  TRAVELVERSE IDENTITY CORE
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {pageTitles[activePage].title}
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pageTitles[activePage].subtitle}
            </p>
          </div>

          {/* Subpage Route Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => handleNavigate("login")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activePage === "login"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("register")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activePage === "register"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("forgot-password")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activePage === "forgot-password"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Forgot Password</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("verify-email")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activePage === "verify-email"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <MailCheck className="w-3.5 h-3.5" />
              <span>Verify Email</span>
            </button>
          </div>

          {/* Active Subpage Body */}
          <Card className="p-6 sm:p-8 shadow-2xl border-slate-200/80 dark:border-slate-800/80">
            {activePage === "login" && (
              <LoginPage
                onNavigate={handleNavigate}
                prefillEmail={navState.email}
              />
            )}
            {activePage === "register" && (
              <RegisterPage onNavigate={handleNavigate} />
            )}
            {activePage === "forgot-password" && (
              <ForgotPasswordPage onNavigate={handleNavigate} />
            )}
            {activePage === "reset-password" && (
              <ResetPasswordPage
                onNavigate={handleNavigate}
                prefillTokenOrCode={navState.tokenOrCode}
                prefillEmail={navState.email}
              />
            )}
            {activePage === "verify-email" && (
              <VerifyEmailPage
                onNavigate={handleNavigate}
                prefillEmail={navState.email}
                prefillDevCode={navState.devCode}
              />
            )}
          </Card>
        </div>

        {/* Right Side: Security Reassurance & Sovereign Travel OS Showcase (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security Charter Card */}
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-indigo-900/40 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                Cryptographic Security Guarantee
              </span>
            </div>

            <h3 className="text-base font-extrabold tracking-tight">
              Zero Raw Credential Exposure
            </h3>

            <p className="text-xs text-indigo-200/80 leading-relaxed">
              TravelVerse AI operates on strict zero-trust principles. Passwords and sensitive biometric tokens are hashed server-side with session-bound expiry tokens. 
              <strong> Never stored in plain text or client localStorage.</strong>
            </p>

            <div className="space-y-2 pt-2 border-t border-indigo-800/40 text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AES-256 GCM GDS Flight Booking Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>One-Time Password (OTP) & Google SSO Native Bridge</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Automatic 24-hour Session Expiry with Safe Invalidation</span>
              </div>
            </div>
          </Card>

          {/* Quick Overview of System Modules Card */}
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Autonomous Travel Capabilities
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mt-0.5">
                  <Plane className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-200">NDC Flight Engine:</strong> Live airline schedules with interactive seat map reservation.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <Globe2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-200">Spatial 360° VR:</strong> Inspect luxury villa suites and flight cabins before booking.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mt-0.5">
                  <LockKeyhole className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-200">Agent CRM & Vault:</strong> End-to-end itinerary builder with multi-currency quoting.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
