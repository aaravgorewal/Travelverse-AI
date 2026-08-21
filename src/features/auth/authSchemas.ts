import { z } from "zod";

// 1. Password Login Schema
export const loginPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g., name@example.com)"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean().optional(),
});

export type LoginPasswordFormData = z.infer<typeof loginPasswordSchema>;

// 2. OTP Request Schema
export const loginOtpRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type LoginOtpRequestFormData = z.infer<typeof loginOtpRequestSchema>;

// 3. OTP Verify Schema
export const loginOtpVerifySchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  otpCode: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type LoginOtpVerifyFormData = z.infer<typeof loginOtpVerifySchema>;

// 4. Registration Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Name cannot exceed 60 characters"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special symbol (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["traveler", "agent", "admin"], {
      message: "Please select an account role",
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// 5. Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// 6. Reset Password Schema
export const resetPasswordSchema = z
  .object({
    tokenOrCode: z
      .string()
      .min(1, "Reset token or 6-digit code is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special symbol (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// 7. Verify Email Schema
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// Password Strength Evaluation Helper
export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const passCount = Object.values(checks).filter(Boolean).length;

  let score = 0;
  let label: PasswordStrengthResult["label"] = "Very Weak";
  let color = "bg-rose-500";

  if (passCount === 5) {
    score = 4;
    label = "Very Strong";
    color = "bg-emerald-500";
  } else if (passCount >= 4) {
    score = 3;
    label = "Strong";
    color = "bg-emerald-400";
  } else if (passCount >= 3) {
    score = 2;
    label = "Fair";
    color = "bg-amber-400";
  } else if (passCount >= 2) {
    score = 1;
    label = "Weak";
    color = "bg-orange-400";
  } else {
    score = 0;
    label = "Very Weak";
    color = "bg-rose-500";
  }

  return { score, label, color, checks };
}
