import os

# 1. Update apiClient.ts
with open("src/services/apiClient.ts", "r") as f:
    api_client_content = f.read()

# Replace getStoredToken and add getRefreshToken
token_funcs = """// Safe in-memory getter for auth token
export const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem("travelverse_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    const raw = localStorage.getItem("travelverse_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.refreshToken || null;
  } catch {
    return null;
  }
};

// Request queue for refresh tokens
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
"""

api_client_content = api_client_content[:api_client_content.find("// Safe in-memory")] + token_funcs + api_client_content[api_client_content.find("// Request Interceptor"):]

# Update the response interceptor
interceptor = """// Response Interceptor: Catch 401 and handle expired session
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("travelverse:session-expired"));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post("/api/v1/auth/refresh", null, {
          params: { refresh_token: refreshToken }
        });
        
        const raw = localStorage.getItem("travelverse_session");
        if (raw) {
          const session = JSON.parse(raw);
          session.token = data.access_token;
          session.refreshToken = data.refresh_token;
          localStorage.setItem("travelverse_session", JSON.stringify(session));
        }
        
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
        processQueue(null, data.access_token);
        return axios(originalRequest).then(r => r.data);
      } catch (err) {
        processQueue(err as Error, null);
        window.dispatchEvent(new CustomEvent("travelverse:session-expired"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Check for offline/timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error')) {
      return Promise.reject(new Error("Request timed out. Please check your connection and try again."));
    }

    const message =
      (error.response?.data as any)?.error ||
      (error.response?.data as any)?.detail ||
      error.message ||
      "An unexpected error occurred in TravelVerse API.";
    return Promise.reject(new Error(message));
  }
);
"""

api_client_content = api_client_content[:api_client_content.find("// Response Interceptor")] + interceptor + "\nexport default apiClient;\n"

with open("src/services/apiClient.ts", "w") as f:
    f.write(api_client_content)


# 2. Update authService.ts
with open("src/services/authService.ts", "r") as f:
    auth_service_content = f.read()

# Replace loginWithPassword and add getCurrentUser / logout
new_auth_methods = """  async loginWithPassword(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const data: any = await apiClient.post("/v1/auth/login", formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return {
        success: True,
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: {} as any // We will fetch user right after
    } as any;
  },
  
  async getCurrentUser(): Promise<UserProfile> {
    const data: any = await apiClient.get("/v1/auth/me");
    return data;
  },
  
  async logout(): Promise<void> {
    await apiClient.post("/v1/auth/logout");
  },
"""
start_idx = auth_service_content.find("async loginWithPassword")
end_idx = auth_service_content.find("// 2. Google SSO Login")

auth_service_content = auth_service_content[:start_idx] + new_auth_methods + auth_service_content[end_idx:]

with open("src/services/authService.ts", "w") as f:
    f.write(auth_service_content)

# 3. Update useAuthStore.ts
with open("src/stores/useAuthStore.ts", "r") as f:
    auth_store_content = f.read()
    
new_store = """import { create } from "zustand";
import { UserProfile, UserRole } from "../types";
import { authService } from "../services/authService";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isSessionExpired: boolean;
  initSession: () => Promise<void>;
  setUser: (user: UserProfile | null, token?: string, refreshToken?: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
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
"""

with open("src/stores/useAuthStore.ts", "w") as f:
    f.write(new_store)
    
print("Auth services and store updated")
