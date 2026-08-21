import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure Axios Retry (3 retries, exponential backoff, only for idempotent/network errors)
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 503 || error.response?.status === 504 || error.response?.status === 429;
  },
});

// Safe in-memory getter for auth token
export const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem("travelverse_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session?.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem("travelverse_session");
      return null;
    }
    return session?.token || null;
  } catch {
    return null;
  }
};

// Request Interceptor: Attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Customize timeouts per domain if needed
    if (config.url?.includes("/ai/")) {
      config.timeout = 60000; // AI requests can take longer
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 and handle expired session
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Broadcast session expired event
      window.dispatchEvent(new CustomEvent("travelverse:session-expired"));
    }
    
    // Check for offline/timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error("Request timed out. Please check your connection and try again."));
    }

    const message =
      (error.response?.data as any)?.error ||
      error.message ||
      "An unexpected error occurred in TravelVerse API.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

