import { apiClient } from "./apiClient";
import { UserProfile, UserRole } from "../types";

export interface LoginResponse {
  success: boolean;
  user: UserProfile;
  token: string;
  expiresIn?: number;
  sessionExpiry?: number;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: UserProfile;
  token: string;
  expiresIn?: number;
  sessionExpiry?: number;
  requireEmailVerification: boolean;
  verificationCodeDev?: string;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken: string;
  resetCodeDev?: string;
  expiresAt: number;
  exists?: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: UserProfile | null;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  devOtpCode?: string;
  expiresInSeconds?: number;
}

export const authService = {
  // 1. Password Login
  async loginWithPassword(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post("/v1/auth/login", {
      type: "password",
      email,
      password,
    });
  },

  // 2. Google SSO Login
  async loginWithGoogle(googleUser: {
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
  }): Promise<LoginResponse> {
    return apiClient.post("/v1/auth/login", {
      type: "google",
      googleUser,
    });
  },

  // 3A. Request OTP Code for Email Login
  async requestOtp(email: string): Promise<RequestOtpResponse> {
    return apiClient.post("/v1/auth/login", {
      type: "otp",
      action: "request-otp",
      email,
    });
  },

  // 3B. Login with OTP Code
  async loginWithOtp(email: string, otpCode: string): Promise<LoginResponse> {
    return apiClient.post("/v1/auth/login", {
      type: "otp",
      email,
      otpCode,
    });
  },

  // 4. User Registration
  async register(params: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<RegisterResponse> {
    return apiClient.post("/v1/auth/register", params);
  },

  // 5. Forgot Password
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return apiClient.post("/v1/auth/forgot-password", { email });
  },

  // 6. Reset Password
  async resetPassword(tokenOrCode: string, newPassword: string): Promise<ResetPasswordResponse> {
    return apiClient.post("/v1/auth/reset-password", {
      tokenOrCode,
      newPassword,
    });
  },

  // 7. Verify Email
  async verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
    return apiClient.post("/v1/auth/verify", { email, code });
  },

  // 8. Session Validation
  async getCurrentUser(): Promise<{ success: boolean; user: UserProfile; sessionExpiry?: number }> {
    return apiClient.get("/v1/auth/me");
  },

  // 9. Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post("/v1/auth/logout", {});
  },

  // Compatibility helper for legacy calls
  async login(
    emailOrCredentials: string | { email: string; password?: string },
    password?: string
  ): Promise<{ user: UserProfile; token: string }> {
    if (typeof emailOrCredentials === "string") {
      const res = await this.loginWithPassword(emailOrCredentials, password || "");
      return { user: res.user, token: res.token };
    }
    const res = await this.loginWithPassword(emailOrCredentials.email, emailOrCredentials.password || "");
    return { user: res.user, token: res.token };
  },
};

