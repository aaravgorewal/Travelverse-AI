import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordFormData } from "./authSchemas";
import { authService } from "../../services";
import { Button, Card, Alert } from "../../components/ui";

interface ForgotPasswordPageProps {
  onNavigate: (
    page: "login" | "register" | "forgot-password" | "reset-password" | "verify-email",
    extraState?: { tokenOrCode?: string; email?: string }
  ) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    email: string;
    resetToken: string;
    resetCodeDev?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "elena.rostova@travelverse.ai",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authService.forgotPassword(data.email);
      setSuccessInfo({
        message: res.message,
        email: data.email,
        resetToken: res.resetToken,
        resetCodeDev: res.resetCodeDev,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Could not dispatch recovery instructions. Please verify the address.");
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
        <Alert variant="danger" title="Dispatch Failed" onClose={() => setErrorMessage(null)}>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {!successInfo ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Password Recovery Protocol</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
              Enter the primary email address registered to your TravelVerse account. We'll send a cryptographic reset token and 6-digit recovery code valid for 15 minutes.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Your Registered Email</span>
            </label>
            <input
              type="email"
              placeholder="elena.rostova@travelverse.ai"
              {...register("email")}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                errors.email
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg shadow-blue-500/20"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Send Recovery Code
          </Button>
        </form>
      ) : (
        <div className="space-y-5 animate-in fade-in zoom-in-95">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Recovery Link Dispatched</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
              We have dispatched recovery instructions to <strong>{successInfo.email}</strong>.
            </p>
          </div>

          {/* Sandbox helper for immediate testing */}
          {successInfo.resetCodeDev && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sandbox Testing Code
                </span>
                <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Expires in 15m
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-sm font-black text-slate-800 dark:text-white tracking-wider">
                  {successInfo.resetCodeDev}
                </span>
                <span className="text-[11px] text-slate-400">PIN Code</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() =>
                onNavigate("reset-password", {
                  tokenOrCode: successInfo.resetCodeDev || successInfo.resetToken,
                  email: successInfo.email,
                })
              }
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Reset Password
            </Button>

            <button
              type="button"
              onClick={() => setSuccessInfo(null)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white text-center cursor-pointer"
            >
              Send to a different email address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
