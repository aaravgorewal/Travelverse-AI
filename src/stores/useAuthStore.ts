import { create } from "zustand";
import { UserProfile, UserRole } from "../types";
import { authService } from "../services/authService";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isSessionExpired: boolean;
  initSession: () => Promise<void>;
  login: (user: UserProfile | null, token?: string, refreshToken?: string) => void;
  setUser: (user: UserProfile | null, token?: string, refreshToken?: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (preferences: any) => void;
  setRole: (role: UserRole) => void;
  handleSessionExpired: () => void;
  clearSessionExpired: () => void;
  logout: () => void;
}

const loadInitialSession = () => {
  try {
    const raw = localStorage.getItem("travelverse_session");
    if (!raw) {
      return { user: null, token: null, refreshToken: null, isAuthenticated: false };
    }
    const session = JSON.parse(raw);
    return {
      user: session.user || null,
      token: session.token || null,
      refreshToken: session.refreshToken || null,
      isAuthenticated: !!session.token,
    };
  } catch {
    return { user: null, token: null, refreshToken: null, isAuthenticated: false };
  }
};

const initial = loadInitialSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  isAuthenticated: initial.isAuthenticated,
  token: initial.token,
  refreshToken: initial.refreshToken,
  isSessionExpired: false,

  initSession: async () => {
    const state = get();
    if (!state.token) return;
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  login: (user, token, refreshToken) => set((state) => { state.setUser(user, token, refreshToken); return {}; }),
  setUser: (user, token, refreshToken) => {
    if (token && refreshToken && user) {
      localStorage.setItem(
        "travelverse_session",
        JSON.stringify({ token, refreshToken, user: { id: user.id, name: user.name, role: user.role } })
      );
      set({ user, token, refreshToken, isAuthenticated: true, isSessionExpired: false });
    } else {
      localStorage.removeItem("travelverse_session");
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    }
  },

  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  completeOnboarding: (prefs) => set((state) => ({ user: state.user ? { ...state.user, onboardingCompleted: true, travelPreferences: prefs } : null })),

  setRole: (role) => set((state) => ({ user: state.user ? { ...state.user, role } : null })),

  handleSessionExpired: () => {
    localStorage.removeItem("travelverse_session");
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isSessionExpired: true });
  },

  clearSessionExpired: () => set({ isSessionExpired: false }),

  logout: async () => {
    try {
        await authService.logout();
    } catch {}
    localStorage.removeItem("travelverse_session");
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },
}));

// Listen for session expiry from API client
if (typeof window !== "undefined") {
  window.addEventListener("travelverse:session-expired", () => {
    useAuthStore.getState().handleSessionExpired();
  });
}
