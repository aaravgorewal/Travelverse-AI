import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Compass,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  loginPasswordSchema,
  LoginPasswordFormData,
  loginOtpRequestSchema,
  LoginOtpRequestFormData,
  loginOtpVerifySchema,
  LoginOtpVerifyFormData,
} from "./authSchemas";
import { authService } from "../../services";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge, Alert } from "../../components/ui";

interface LoginPageProps {
  onNavigate: (page: "login" | "register" | "forgot-password" | "reset-password" | "verify-email") => void;
  prefillEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, prefillEmail = "" }) => {
  const { login } = useAuthStore();
  const { setModule } = useUIStore();

  // Login Mode: "password" | "google" | "otp"
  const [loginMethod, setLoginMethod] = useState<"password" | "google" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpTargetEmail, setOtpTargetEmail] = useState(prefillEmail || "");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 1. Password Form
  const passwordForm = useForm<LoginPasswordFormData>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: {
      email: prefillEmail || "elena.rostova@travelverse.ai",
      password: "Password123!",
      rememberMe: true,
    },
  });

  // 2. OTP Request Form
  const otpRequestForm = useForm<LoginOtpRequestFormData>({
    resolver: zodResolver(loginOtpRequestSchema),
    defaultValues: {
      email: prefillEmail || "elena.rostova@travelverse.ai",
    },
  });

  // 3. OTP Verify Form
  const otpVerifyForm = useForm<LoginOtpVerifyFormData>({
    resolver: zodResolver(loginOtpVerifySchema),
    defaultValues: {
      email: otpTargetEmail || "elena.rostova@travelverse.ai",
      otpCode: "",
    },
  });

  // Handle Password Submission
  const onPasswordSubmit = async (data: LoginPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.loginWithPassword(data.email, data.password);
      setSuccessMessage(res.message || "Authentication successful! Entering TravelVerse...");
      login(res.user, res.token, res.refreshToken);

      setTimeout(() => {
        if (res.user.role === "agent") {
          setModule("agent");
        } else if (res.user.role === "admin") {
          setModule("admin");
        } else {
          setModule("home");
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP Code Request
  const onRequestOtp = async (data: LoginOtpRequestFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.requestOtp(data.email);
      setOtpTargetEmail(data.email);
      otpVerifyForm.setValue("email", data.email);
      setOtpSent(true);
      setDevOtpCode(res.devOtpCode || null);
      setSuccessMessage(res.message);
      setResendTimer(30);

      // Countdown
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not generate OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP Verification Submission
  const onVerifyOtpSubmit = async (data: LoginOtpVerifyFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authService.loginWithOtp(data.email, data.otpCode);
      setSuccessMessage("One-Time Password verified successfully! Redirecting...");
      login(res.user, res.token, res.refreshToken);

      setTimeout(() => {
        setModule(res.user.role === "agent" ? "agent" : "home");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid OTP code. Please re-enter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google SSO Authentication
  const handleGoogleLogin = async (googleUser: {
    email: string;
    name: string;
    avatar?: string;
  }) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.loginWithGoogle(googleUser);
      setShowGoogleModal(false);
      setSuccessMessage(`Signed in as ${googleUser.name} via Google`);
      login(res.user, res.token, res.refreshToken);

      setTimeout(() => {
        setModule("home");
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || "Google authentication failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Demo Accounts Quick Fill
  const fillDemoAccount = (email: string, role: string) => {
    passwordForm.setValue("email", email);
    passwordForm.setValue("password", "Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {errorMessage && (
        <Alert variant="danger" title="Authentication Error" onClose={() => setErrorMessage(null)}>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Success" onClose={() => setSuccessMessage(null)}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}

      {/* Login Method Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("password");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "password"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLoginMethod("google");
            setShowGoogleModal(true);
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "google"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLoginMethod("otp");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "otp"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>OTP Code</span>
        </button>
      </div>

      {/* 1. PASSWORD LOGIN FORM */}
      {loginMethod === "password" && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@travelverse.ai"
                {...passwordForm.register("email")}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  passwordForm.formState.errors.email
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
            </div>
            {passwordForm.formState.errors.email && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Password</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                {...passwordForm.register("password")}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  passwordForm.formState.errors.password
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...passwordForm.register("rememberMe")}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Keep me signed in on this workstation
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg shadow-blue-500/20"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Sovereign Workspace
          </Button>
        </form>
      )}

      {/* 2. OTP LOGIN WORKFLOW */}
      {loginMethod === "otp" && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={otpRequestForm.handleSubmit(onRequestOtp)} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>Passwordless Verification</span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300/80">
                  Enter your registered email address to receive an instant 6-digit cryptographic verification code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@travelverse.ai"
                  {...otpRequestForm.register("email")}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                    otpRequestForm.formState.errors.email
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  }`}
                />
                {otpRequestForm.formState.errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {otpRequestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                icon={<Smartphone className="w-4 h-4" />}
              >
                Send 6-Digit Code
              </Button>
            </form>
          ) : (
            <form onSubmit={otpVerifyForm.handleSubmit(onVerifyOtpSubmit)} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Code Sent to {otpTargetEmail}</span>
                </div>
                {devOtpCode && (
                  <div className="mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                      Sandbox Test PIN: <strong>{devOtpCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => otpVerifyForm.setValue("otpCode", devOtpCode)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Enter 6-Digit PIN</span>
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-slate-400 font-normal">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRequestOtp({ email: otpTargetEmail })}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  {...otpVerifyForm.register("otpCode")}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-center font-mono text-lg font-black tracking-widest text-slate-900 dark:text-white focus:outline-none border-slate-200 dark:border-slate-700 focus:border-blue-500"
                />
                {otpVerifyForm.formState.errors.otpCode && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {otpVerifyForm.formState.errors.otpCode.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setOtpSent(false)}
                  className="flex-1"
                >
                  Change Email
                </Button>
                <Button
                  type="submit"
                  size="md"
                  className="flex-1"
                  isLoading={isSubmitting}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Verify & Sign In
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. GOOGLE SSO MODAL SIMULATION */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose an account to continue to <strong>TravelVerse Sovereign OS</strong>:
            </p>

            <div className="space-y-2">
              {[
                {
                  name: "Elena Rostova",
                  email: "elena.rostova@travelverse.ai",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                },
                {
                  name: "Marcus Vance",
                  email: "marcus.vance@travelverse.ai",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                },
                {
                  name: "Alex Thorne",
                  email: "alex.thorne@gmail.com",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={() => handleGoogleLogin(acc)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowGoogleModal(false)}
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}

      {/* Quick Demo Credentials Footer Helper */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <KeyRound className="w-3 h-3 text-amber-500" />
          <span>Quick 1-Click Demo Workstations</span>
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => fillDemoAccount("elena.rostova@travelverse.ai", "traveler")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-500 text-slate-700 dark:text-slate-300 font-medium transition-all text-center cursor-pointer"
          >
            ✈️ Traveler
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("marcus.vance@travelverse.ai", "agent")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-amber-500 text-slate-700 dark:text-slate-300 font-medium transition-all text-center cursor-pointer"
          >
            💼 Agent B2B
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("admin@travelverse.ai", "admin")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-purple-500 text-slate-700 dark:text-slate-300 font-medium transition-all text-center cursor-pointer"
          >
            ⚡ Admin
          </button>
        </div>
      </div>
    </div>
  );
};
