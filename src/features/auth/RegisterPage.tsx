import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Plane,
  ShieldAlert,
} from "lucide-react";
import {
  registerSchema,
  RegisterFormData,
  evaluatePasswordStrength,
} from "./authSchemas";
import { authService } from "../../services";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { UserRole } from "../../types";
import { Button, Card, Badge, Alert } from "../../components/ui";

interface RegisterPageProps {
  onNavigate: (
    page: "login" | "register" | "forgot-password" | "reset-password" | "verify-email",
    extraState?: { email?: string; devCode?: string }
  ) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { login } = useAuthStore();
  const { setModule } = useUIStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "traveler",
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password") || "";
  const selectedRole = watch("role") || "traveler";

  // Password strength evaluation
  const strength = useMemo(() => evaluatePasswordStrength(passwordValue), [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
      });

      setSuccessMessage(res.message || "Account registered successfully!");
      login(res.user, res.token, res.sessionExpiry);

      setTimeout(() => {
        if (res.requireEmailVerification) {
          onNavigate("verify-email", {
            email: data.email,
            devCode: res.verificationCodeDev,
          });
        } else {
          setModule("onboarding");
        }
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not complete registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
      {errorMessage && (
        <Alert variant="danger" title="Registration Failed" onClose={() => setErrorMessage(null)}>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Account Created" onClose={() => setSuccessMessage(null)}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>Legal Full Name</span>
          </label>
          <input
            type="text"
            placeholder="Elena Rostova"
            {...register("name")}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
              errors.name
                ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Primary Email Address</span>
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

        {/* Account Role Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Workspace Persona & Access Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                role: "traveler" as UserRole,
                label: "Traveler",
                desc: "Personal VIP OS",
                icon: <Plane className="w-4 h-4 text-blue-500" />,
              },
              {
                role: "agent" as UserRole,
                label: "Agent B2B",
                desc: "GDS & CRM Engine",
                icon: <Briefcase className="w-4 h-4 text-amber-500" />,
              },
              {
                role: "admin" as UserRole,
                label: "Admin",
                desc: "Full Fleet Console",
                icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
              },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setValue("role", r.role)}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all cursor-pointer ${
                  selectedRole === r.role
                    ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  {r.icon}
                  {selectedRole === r.role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {r.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Create Secure Master Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              {...register("password")}
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs font-semibold text-slate-900 dark:text-white focus:outline-none transition-all ${
                errors.password
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

          {/* Real-time Password Strength Meter */}
          {passwordValue.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Security Strength:</span>
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

              {/* Requirement Checklist */}
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                <div
                  className={`flex items-center gap-1 ${
                    strength.checks.minLength ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""
                  }`}
                >
                  <span>{strength.checks.minLength ? "✓" : "○"}</span>
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    strength.checks.hasUpper ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""
                  }`}
                >
                  <span>{strength.checks.hasUpper ? "✓" : "○"}</span>
                  <span>Uppercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    strength.checks.hasLower ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""
                  }`}
                >
                  <span>{strength.checks.hasLower ? "✓" : "○"}</span>
                  <span>Lowercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    strength.checks.hasNumber && strength.checks.hasSpecial
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : ""
                  }`}
                >
                  <span>{strength.checks.hasNumber && strength.checks.hasSpecial ? "✓" : "○"}</span>
                  <span>Number & Symbol</span>
                </div>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>Confirm Password</span>
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

        {/* Terms Acceptance */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("termsAccepted")}
              className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              I agree to the <strong>TravelVerse Terms of Service</strong>, Global Aviation Privacy Charter, and End-User Operating License.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full shadow-lg shadow-blue-500/20 mt-2"
          isLoading={isSubmitting}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Create Sovereign Account
        </Button>
      </form>
    </div>
  );
};
