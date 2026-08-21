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

export default apiClient;
