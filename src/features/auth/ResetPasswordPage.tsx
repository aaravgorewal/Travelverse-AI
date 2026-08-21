import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
  evaluatePasswordStrength,
} from "./authSchemas";
import { authService } from "../../services";
import { Button, Card, Alert } from "../../components/ui";

interface ResetPasswordPageProps {
  onNavigate: (page: "login" | "register" | "forgot-password" | "reset-password" | "verify-email") => void;
  prefillTokenOrCode?: string;
  prefillEmail?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigate,
  prefillTokenOrCode = "",
  prefillEmail = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      tokenOrCode: prefillTokenOrCode || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (prefillTokenOrCode) {
      setValue("tokenOrCode", prefillTokenOrCode);
    }
  }, [prefillTokenOrCode, setValue]);

  const passwordValue = watch("newPassword") || "";
  const strength = useMemo(() => evaluatePasswordStrength(passwordValue), [passwordValue]);

  // Countdown timer on success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      onNavigate("login");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, onNavigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authService.resetPassword(data.tokenOrCode, data.newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. Please check your reset code or token.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
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
        <Alert variant="danger" title="Reset Failed" onClose={() => setErrorMessage(null)}>
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
              Password Reset Complete!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your master credentials have been updated securely.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Redirecting to Sign In in {countdown} seconds...
          </div>

          <Button
            type="button"
            size="md"
            className="w-full"
            onClick={() => onNavigate("login")}
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Enter Reset Code & New Password</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
              Provide the 6-digit recovery code or token dispatched to your email, then establish your new credentials.
            </p>
          </div>

          {/* Reset Code / Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-500" />
              <span>Reset Token or 6-Digit PIN</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 123456 or tv_rst_..."
              {...register("tokenOrCode")}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                errors.tokenOrCode
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
              }`}
            />
            {errors.tokenOrCode && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.tokenOrCode.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>New Master Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("newPassword")}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  errors.newPassword
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {passwordValue.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Strength:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>Confirm New Password</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...register("confirmPassword")}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  errors.confirmPassword
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg shadow-blue-500/20 mt-2"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Update Password & Encrypt
          </Button>
        </form>
      )}
    </div>
  );
};
