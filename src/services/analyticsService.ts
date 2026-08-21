export type AnalyticsEventName =
  | "search_started"
  | "ai_prompt_sent"
  | "trip_generated"
  | "hotel_viewed"
  | "flight_selected"
  | "recommendation_clicked"
  | "vr_opened"
  | "trip_saved"
  | "package_created"
  | "booking_started"
  | "booking_completed"
  | "copilot_used";

export interface AnalyticsAdapter {
  name: string;
  track: (eventName: AnalyticsEventName, properties?: Record<string, any>) => void;
}

// Sensitive keys that must NEVER be sent to analytics providers
const SENSITIVE_KEYS = [
  "name",
  "email",
  "passport",
  "phone",
  "cardNumber",
  "card",
  "cvv",
  "expiry",
  "address",
  "dob",
  "companion",
];

const sanitizeProperties = (props?: Record<string, any>): Record<string, any> => {
  if (!props) return {};
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(props)) {
    const isSensitive = SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()));
    if (isSensitive) {
      sanitized[key] = "[REDACTED_SENSITIVE_DATA]";
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      sanitized[key] = sanitizeProperties(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
};

// Registered adapters
const adapters: AnalyticsAdapter[] = [];

// Dev Console Adapter registered by default
if (process.env.NODE_ENV !== "production" || typeof window !== "undefined") {
  adapters.push({
    name: "ConsoleLogger",
    track: (eventName, properties) => {
      console.log(`[Analytics:ConsoleLogger] Event: "${eventName}"`, properties);
    }
  });
}

export const analyticsService = {
  /**
   * Register a new analytics provider adapter dynamically (e.g. Mixpanel, GA)
   */
  registerAdapter(adapter: AnalyticsAdapter) {
    if (!adapters.some(a => a.name === adapter.name)) {
      adapters.push(adapter);
    }
  },

  /**
   * Track user events safely with automatic PII sanitization
   */
  trackEvent(eventName: AnalyticsEventName, properties?: Record<string, any>) {
    const cleanProps = sanitizeProperties(properties);
    
    adapters.forEach(adapter => {
      try {
        adapter.track(eventName, cleanProps);
      } catch (err) {
        console.error(`Analytics Adapter "${adapter.name}" failed to track event:`, err);
      }
    });
  }
};
export default analyticsService;
