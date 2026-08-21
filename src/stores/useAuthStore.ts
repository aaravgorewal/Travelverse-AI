import { create } from "zustand";
import { UserProfile, UserRole } from "../types";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  sessionExpiresAt: number | null;
  isSessionExpired: boolean;
  setUser: (user: UserProfile | null, token?: string, sessionExpiry?: number) => void;
  login: (user: UserProfile, token: string, sessionExpiry?: number) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  completeOnboarding: (preferences: any) => void;
  handleSessionExpired: () => void;
  clearSessionExpired: () => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr-01",
  name: "Elena Rostova",
  email: "elena.rostova@travelverse.ai",
  role: "traveler",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  loyaltyPoints: 34500,
  carbonOffsetKg: 850,
  passportNumber: "US-992817441",
  dietary: "Pescatarian",
  seatPreference: "Window",
  preferredCabin: "Business / First",
  onboardingCompleted: true,
  travelPreferences: {
    travelStyle: ["luxury", "cultural", "adventure"],
    budgetTier: "luxury",
    preferredSeat: "window",
    mealPreference: "standard",
    homeAirport: "SFO",
    currency: "USD",
  },
};

// Safe session loader: Reads only token and public profile metadata (no passwords or private secrets)
const loadInitialSession = () => {
  try {
    const raw = localStorage.getItem("travelverse_session");
    if (!raw) {
      return {
        user: DEFAULT_USER,
        token: "tv_sess_default_elena",
        sessionExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
        isAuthenticated: true,
      };
    }
    const session = JSON.parse(raw);
    if (session?.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem("travelverse_session");
      return {
        user: null,
        token: null,
        sessionExpiresAt: null,
        isAuthenticated: false,
      };
    }
    return {
      user: session.user || DEFAULT_USER,
      token: session.token || "tv_sess_default_elena",
      sessionExpiresAt: session.expiresAt || Date.now() + 1000 * 60 * 60 * 24,
      isAuthenticated: true,
    };
  } catch {
    return {
      user: DEFAULT_USER,
      token: "tv_sess_default_elena",
      sessionExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
      isAuthenticated: true,
    };
  }
};

const initial = loadInitialSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  isAuthenticated: initial.isAuthenticated,
  token: initial.token,
  sessionExpiresAt: initial.sessionExpiresAt,
  isSessionExpired: false,

  setUser: (user, token, sessionExpiry) => {
    const expiresAt = sessionExpiry || Date.now() + 1000 * 60 * 60 * 24;
    if (token && user) {
      // Store ONLY public session token and non-secret user object
      localStorage.setItem(
        "travelverse_session",
        JSON.stringify({
          token,
          expiresAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            loyaltyPoints: user.loyaltyPoints,
            carbonOffsetKg: user.carbonOffsetKg,
            onboardingCompleted: user.onboardingCompleted,
          },
        })
      );
    }
    set({
      user,
      isAuthenticated: !!user,
      token: token || null,
      sessionExpiresAt: token ? expiresAt : null,
      isSessionExpired: false,
    });
  },

  login: (user, token, sessionExpiry) => {
    const expiresAt = sessionExpiry || Date.now() + 1000 * 60 * 60 * 24;
    localStorage.setItem(
      "travelverse_session",
      JSON.stringify({
        token,
        expiresAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          loyaltyPoints: user.loyaltyPoints,
          carbonOffsetKg: user.carbonOffsetKg,
          onboardingCompleted: user.onboardingCompleted,
        },
      })
    );
    set({
      user,
      isAuthenticated: true,
      token,
      sessionExpiresAt: expiresAt,
      isSessionExpired: false,
    });
  },

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (updatedUser && state.token) {
        try {
          const raw = localStorage.getItem("travelverse_session");
          if (raw) {
            const session = JSON.parse(raw);
            session.user = { ...session.user, ...updates };
            localStorage.setItem("travelverse_session", JSON.stringify(session));
          }
        } catch {}
      }
      return { user: updatedUser };
    }),

  setRole: (role) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, role } : null;
      if (updatedUser && state.token) {
        try {
          const raw = localStorage.getItem("travelverse_session");
          if (raw) {
            const session = JSON.parse(raw);
            session.user.role = role;
            localStorage.setItem("travelverse_session", JSON.stringify(session));
          }
        } catch {}
      }
      return { user: updatedUser };
    }),

  completeOnboarding: (preferences) =>
    set((state) => {
      const updatedUser = state.user
        ? {
            ...state.user,
            name: preferences.name || state.user.name,
            homeCity: preferences.homeCity || state.user.homeCity,
            preferredLanguage: preferences.preferredLanguage || state.user.preferredLanguage,
            travelStyles: preferences.travelStyle || preferences.travelStyles || state.user.travelStyles,
            budgetPreference: preferences.budgetPreference || state.user.budgetPreference,
            favoriteDestinations: preferences.favoriteDestinations || state.user.favoriteDestinations,
            interests: preferences.interests || state.user.interests,
            dietaryPreferences: preferences.dietaryPreferences || state.user.dietaryPreferences,
            mobilityRequirements: preferences.mobilityRequirements || state.user.mobilityRequirements,
            dietary: Array.isArray(preferences.dietaryPreferences)
              ? preferences.dietaryPreferences.join(", ")
              : preferences.dietary || state.user.dietary,
            onboardingCompleted: true,
            travelPreferences: {
              ...state.user.travelPreferences,
              travelStyle: preferences.travelStyle || preferences.travelStyles || ["Luxury", "Culture"],
              budgetTier: preferences.budgetPreference || "luxury",
              preferredSeat: state.user.seatPreference || "window",
              mealPreference: Array.isArray(preferences.dietaryPreferences)
                ? preferences.dietaryPreferences[0] || "standard"
                : "standard",
              homeAirport: (preferences.homeCity || "SFO").slice(0, 3).toUpperCase(),
              currency: "USD",
              homeCity: preferences.homeCity,
              preferredLanguage: preferences.preferredLanguage,
              favoriteDestinations: preferences.favoriteDestinations,
              interests: preferences.interests,
              mobilityRequirements: preferences.mobilityRequirements,
              dietaryPreferences: preferences.dietaryPreferences,
            },
          }
        : null;

      if (updatedUser && state.token) {
        try {
          const raw = localStorage.getItem("travelverse_session");
          if (raw) {
            const session = JSON.parse(raw);
            session.user = { ...session.user, ...updatedUser };
            localStorage.setItem("travelverse_session", JSON.stringify(session));
          }
        } catch {}
      }

      return { user: updatedUser };
    }),

  handleSessionExpired: () => {
    localStorage.removeItem("travelverse_session");
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      sessionExpiresAt: null,
      isSessionExpired: true,
    });
  },

  clearSessionExpired: () => set({ isSessionExpired: false }),

  logout: () => {
    localStorage.removeItem("travelverse_session");
    localStorage.removeItem("travelverse_auth");
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      sessionExpiresAt: null,
      isSessionExpired: false,
    });
  },
}));

// Global event listener for 401 session expiration from API client
if (typeof window !== "undefined") {
  window.addEventListener("travelverse:session-expired", () => {
    useAuthStore.getState().handleSessionExpired();
  });
}

