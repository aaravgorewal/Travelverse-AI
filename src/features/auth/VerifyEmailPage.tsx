import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MailCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { verifyEmailSchema, VerifyEmailFormData } from "./authSchemas";
import { authService } from "../../services";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Alert } from "../../components/ui";

interface VerifyEmailPageProps {
  onNavigate: (page: "login" | "register" | "forgot-password" | "reset-password" | "verify-email") => void;
  prefillEmail?: string;
  prefillDevCode?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  onNavigate,
  prefillEmail = "",
  prefillDevCode = "",
}) => {
  const { user, updateUser } = useAuthStore();
  const { setModule } = useUIStore();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [emailAddress, setEmailAddress] = useState(
    prefillEmail || user?.email || "elena.rostova@travelverse.ai"
  );
  const [devCode, setDevCode] = useState<string | null>(prefillDevCode || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // If prefillDevCode is provided, optionally pre-fill or show banner
  useEffect(() => {
    if (prefillDevCode && prefillDevCode.length === 6) {
      setDevCode(prefillDevCode);
    }
  }, [prefillDevCode]);

  // Handle individual digit change
  const handleDigitChange = (index: number, value: string) => {
    // Handle pasting 6 digits
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = pasted[i] || "";
        }
        setDigits(nextDigits);
        const lastIdx = Math.min(pasted.length - 1, 5);
        inputRefs.current[lastIdx]?.focus();
        return;
      }
    }

    const clean = value.replace(/\D/g, "");
    const nextDigits = [...digits];
    nextDigits[index] = clean ? clean[clean.length - 1] : "";
    setDigits(nextDigits);

    // Auto advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Resend code handler
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrorMessage(null);
    try {
      const res = await authService.requestOtp(emailAddress);
      setDevCode(res.devOtpCode || null);
      setResendTimer(30);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification code.");
    }
  };

  // Submit verification code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join("");

    if (fullCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authService.verifyEmail(emailAddress, fullCode);
      setIsSuccess(true);
      if (user) {
        updateUser({ ...user, onboardingCompleted: user.onboardingCompleted });
      }

      setTimeout(() => {
        setModule("home");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid code. Please try again or request a new code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate("login")}
        className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sign In</span>
      </button>

      {/* Error state */}
      {errorMessage && (
        <Alert variant="danger" title="Verification Failed" onClose={() => setErrorMessage(null)}>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {isSuccess ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-in zoom-in-95">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Email Verified Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your TravelVerse identity is cryptographically confirmed.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => setModule("home")}
          >
            Enter TravelVerse OS
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <MailCheck className="w-4 h-4 text-blue-500" />
              <span>Verify Your Email Address</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
              We sent a 6-digit cryptographic verification pass to <strong>{emailAddress}</strong>.
            </p>
          </div>

          {/* Dev Test Code Helper */}
          {devCode && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sandbox Testing PIN
                </span>
                <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                  {devCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const arr = devCode.split("");
                  setDigits(arr);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          )}

          {/* 6-Digit PIN Split Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center block">
              Enter 6-Digit Code
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-black rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>

          {/* Resend Action */}
          <div className="flex items-center justify-center text-xs">
            {resendTimer > 0 ? (
              <span className="text-slate-400">Resend code in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend 6-Digit Code</span>
              </button>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg shadow-blue-500/20"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm & Unlock Account
          </Button>
        </form>
      )}
    </div>
  );
};
