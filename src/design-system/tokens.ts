/**
 * TRAVELVERSE AI DESIGN SYSTEM TOKENS
 * Personality: Premium, Modern, Intelligent, Trustworthy, Immersive, Fast
 * Visual Language: High-contrast precision, obsidian & celestial azure, starlight AI accents (✦).
 */

export const DESIGN_TOKENS = {
  name: "TravelVerse Aero Design System",
  version: "2.0.0",
  personality: ["Premium", "Modern", "Intelligent", "Trustworthy", "Immersive", "Fast"],

  colors: {
    // Primary Aero Brand Palette
    brand: {
      50: "#EEF2FF",
      100: "#E0E7FF",
      200: "#C7D2FE",
      300: "#A5B4FC",
      400: "#818CF8",
      500: "#6366F1",
      600: "#4F46E5",
      700: "#4338CA",
      800: "#3730A3",
      900: "#312E81",
      950: "#1E1B4B",
      primary: "#2563EB", // Celestial Azure
      hover: "#1D4ED8",
      active: "#1E40AF",
      glow: "rgba(37, 99, 235, 0.25)",
    },

    // AI Starlight & Neural Visual Language
    ai: {
      symbol: "✦",
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
      subtleGradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)",
      glow: "0 0 20px -3px rgba(139, 92, 246, 0.35)",
      border: "rgba(139, 92, 246, 0.3)",
      text: "#A855F7",
      surfaceDark: "rgba(15, 23, 42, 0.8)",
      accentPink: "#EC4899",
      accentCyan: "#06B6D4",
      accentViolet: "#8B5CF6",
    },

    // Luxury First Class / VIP Palette
    luxury: {
      gold: "#D97706",
      lightGold: "#FEF3C7",
      darkGold: "#92400E",
      champagne: "#F59E0B",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      badgeBg: "rgba(245, 158, 11, 0.12)",
      badgeBorder: "rgba(245, 158, 11, 0.3)",
    },

    // Altitude & Environmental Status Colors
    status: {
      success: {
        bg: "#ECFDF5",
        border: "#A7F3D0",
        text: "#065F46",
        darkBg: "rgba(6, 95, 70, 0.2)",
        darkText: "#34D399",
        solid: "#10B981",
      },
      warning: {
        bg: "#FFFBEB",
        border: "#FDE68A",
        text: "#92400E",
        darkBg: "rgba(146, 64, 14, 0.2)",
        darkText: "#FBBF24",
        solid: "#F59E0B",
      },
      danger: {
        bg: "#FEF2F2",
        border: "#FECACA",
        text: "#991B1B",
        darkBg: "rgba(153, 27, 27, 0.2)",
        darkText: "#F87171",
        solid: "#EF4444",
      },
      info: {
        bg: "#EFF6FF",
        border: "#BFDBFE",
        text: "#1E40AF",
        darkBg: "rgba(30, 64, 175, 0.2)",
        darkText: "#60A5FA",
        solid: "#3B82F6",
      },
    },

    // Neutrals & Dark Surface Canvas
    neutral: {
      50: "#FAFAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
      950: "#090D16", // Aero Obsidian
    },
  },

  typography: {
    fontFamilies: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      display: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
    scale: {
      display1: { size: "3.5rem", lineHeight: "1.1", weight: "900", tracking: "-0.04em" },
      display2: { size: "2.75rem", lineHeight: "1.15", weight: "800", tracking: "-0.03em" },
      h1: { size: "2.25rem", lineHeight: "1.2", weight: "800", tracking: "-0.025em" },
      h2: { size: "1.75rem", lineHeight: "1.25", weight: "700", tracking: "-0.02em" },
      h3: { size: "1.375rem", lineHeight: "1.3", weight: "700", tracking: "-0.015em" },
      h4: { size: "1.125rem", lineHeight: "1.4", weight: "600", tracking: "-0.01em" },
      bodyLg: { size: "1.0625rem", lineHeight: "1.6", weight: "400" },
      body: { size: "0.9375rem", lineHeight: "1.6", weight: "400" },
      bodySm: { size: "0.8125rem", lineHeight: "1.5", weight: "500" },
      caption: { size: "0.75rem", lineHeight: "1.4", weight: "600", tracking: "0.02em" },
      monoCode: { size: "0.8125rem", lineHeight: "1.4", weight: "700", tracking: "0.05em" },
    },
  },

  spacing: {
    baseline: "4px",
    scale: {
      1: "0.25rem", // 4px
      2: "0.5rem",  // 8px
      3: "0.75rem", // 12px
      4: "1rem",    // 16px
      5: "1.25rem", // 20px
      6: "1.5rem",  // 24px
      8: "2rem",    // 32px
      10: "2.5rem", // 40px
      12: "3rem",   // 48px
      16: "4rem",   // 64px
      20: "5rem",   // 80px
      24: "6rem",   // 96px
    },
  },

  radii: {
    none: "0px",
    sm: "0.375rem", // 6px
    md: "0.625rem", // 10px
    lg: "0.875rem", // 14px
    xl: "1.125rem", // 18px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem",   // 32px
    full: "9999px",
  },

  shadows: {
    subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
    elevated: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
    floating: "0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
    modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    aiGlow: "0 0 25px -2px rgba(139, 92, 246, 0.35)",
    brandGlow: "0 0 25px -2px rgba(37, 99, 235, 0.35)",
  },

  aiActionPresets: [
    { label: "Ask AI", symbol: "✦", intent: "query", tooltip: "Initiate contextual conversation with Travel AI" },
    { label: "Optimize", symbol: "✦", intent: "efficiency", tooltip: "AI route and schedule transit optimization" },
    { label: "Explain", symbol: "✦", intent: "transparency", tooltip: "Explain fare rules, weather risks, and visa caveats" },
    { label: "Find Better Deal", symbol: "✦", intent: "savings", tooltip: "Autonomous GDS price tracker & error fare finder" },
    { label: "Personalize", symbol: "✦", intent: "tailoring", tooltip: "Calibrate recommendations to your Travel DNA" },
    { label: "Auto-Rebook", symbol: "✦", intent: "recovery", tooltip: "Instant zero-click rebooking for flight disruptions" },
  ],
};
