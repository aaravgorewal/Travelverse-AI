import { z } from "zod";

export const TRAVEL_STYLES = [
  "Family",
  "Luxury",
  "Adventure",
  "Romantic",
  "Business",
  "Backpacking",
  "Wellness",
  "Culture",
] as const;

export type TravelStyleOption = (typeof TRAVEL_STYLES)[number];

export const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  homeCity: z.string().min(2, "Home city is required").max(60, "City name is too long"),
  preferredLanguage: z.string().min(2, "Preferred language is required"),
  travelStyle: z
    .array(z.string())
    .min(1, "Please select at least one travel style to calibrate your AI agent"),
  budgetPreference: z.string().min(1, "Please select your budget preference"),
  favoriteDestinations: z
    .array(z.string())
    .min(1, "Please select or add at least one favorite destination"),
  interests: z
    .array(z.string())
    .min(1, "Please select at least one travel interest"),
  dietaryPreferences: z
    .array(z.string())
    .min(1, "Please select at least one dietary preference"),
  mobilityRequirements: z
    .array(z.string())
    .min(1, "Please select your mobility / accessibility requirement"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
