export interface AppError {
  code: number | "TIMEOUT" | "OFFLINE" | "AI_UNAVAILABLE";
  title: string;
  message: string;
}

export const ERROR_CATALOG: Record<string, AppError> = {
  "400": {
    code: 400,
    title: "Invalid Request Params",
    message: "The server could not understand your flight request query. Please double check dates and airport codes.",
  },
  "401": {
    code: 401,
    title: "Authentication Required",
    message: "Your secure GDS token expired or is missing. Please log back in to review invoices.",
  },
  "403": {
    code: 403,
    title: "Access Denied",
    message: "You do not have credentials to read this B2B travel queue database or modify these bookings.",
  },
  "404": {
    code: 404,
    title: "Resource Not Found",
    message: "We searched the global inventory database, but the requested flight route or hotel room is no longer listed.",
  },
  "409": {
    code: 409,
    title: "Inventory Conflict",
    message: "The selected seat or hotel room category was booked by another client during checkout. Please search routes again.",
  },
  "429": {
    code: 429,
    title: "Rate Limit Exceeded",
    message: "Our sync channels received too many GDS queries from your IP. Please wait a minute before requesting live status updates.",
  },
  "500": {
    code: 500,
    title: "Internal Travel OS Error",
    message: "A GDS database or payment gateway node timed out. Rest assured, our engineering guard is debugging this now.",
  },
  "503": {
    code: 503,
    title: "GDS Pipeline Under Maintenance",
    message: "The global ticketing channel is temporarily offline for scheduled system sync. Ticketing is currently paused.",
  },
  "TIMEOUT": {
    code: "TIMEOUT",
    title: "API Timeout",
    message: "The GDS or hotels server took too long to respond. The system was aborted to guard against double billing.",
  },
  "OFFLINE": {
    code: "OFFLINE",
    title: "Network Offline",
    message: "Your browser lost connection. Local schedules and cached e-tickets remain readable, but booking operations are offline.",
  },
  "AI_UNAVAILABLE": {
    code: "AI_UNAVAILABLE",
    title: "AI Model Unavailable",
    message: "The Gemini AI orchestration node is currently overloaded or rate-limited. Please retry in a few moments.",
  }
};

export const getFriendlyError = (err: any): AppError => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return ERROR_CATALOG["OFFLINE"];
  }

  // Handle Axios timeouts/errors
  if (err?.code === "ECONNABORTED" || err?.message?.toLowerCase().includes("timeout")) {
    return ERROR_CATALOG["TIMEOUT"];
  }

  // API Unavailable / overloading
  if (err?.message?.toLowerCase().includes("ai unavailable") || err?.message?.toLowerCase().includes("gemini")) {
    return ERROR_CATALOG["AI_UNAVAILABLE"];
  }

  const status = err?.response?.status || err?.status;
  if (status && ERROR_CATALOG[status.toString()]) {
    return ERROR_CATALOG[status.toString()];
  }

  return {
    code: 500,
    title: "Unexpected Error Occurred",
    message: err?.message || "An unexpected error occurred in TravelVerse. Please retry the operation.",
  };
};
