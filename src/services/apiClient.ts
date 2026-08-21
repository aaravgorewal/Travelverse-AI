import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
    const message =
      (error.response?.data as any)?.error ||
      error.message ||
      "An unexpected error occurred in TravelVerse API.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

