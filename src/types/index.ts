export type UserRole = "traveler" | "agent" | "admin";

export type TravelStyle =
  | "Family"
  | "Luxury"
  | "Adventure"
  | "Romantic"
  | "Business"
  | "Backpacking"
  | "Wellness"
  | "Culture"
  | "luxury"
  | "budget"
  | "adventure"
  | "cultural"
  | "relaxation"
  | "eco";

export interface UserPreferencesPayload {
  name: string;
  homeCity: string;
  preferredLanguage: string;
  travelStyle: string[];
  budgetPreference: string;
  favoriteDestinations: string[];
  interests: string[];
  dietaryPreferences: string[];
  mobilityRequirements: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  homeCity?: string;
  preferredLanguage?: string;
  travelStyles?: string[];
  budgetPreference?: string;
  favoriteDestinations?: string[];
  interests?: string[];
  dietaryPreferences?: string[];
  mobilityRequirements?: string[];
  dietary?: string;
  seatPreference?: string;
  preferredCabin?: string;
  loyaltyPoints: number;
  carbonOffsetKg: number;
  travelPreferences?: {
    travelStyle: (TravelStyle | string)[];
    budgetTier: string;
    preferredSeat: string;
    mealPreference: string;
    homeAirport: string;
    currency: string;
    homeCity?: string;
    preferredLanguage?: string;
    favoriteDestinations?: string[];
    interests?: string[];
    mobilityRequirements?: string[];
    dietaryPreferences?: string[];
  };
  onboardingCompleted: boolean;
}

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyTier: string;
  totalSpent: number;
  activeTripsCount: number;
  preferences: {
    preferredCabin: string;
    preferredHotel: string;
    dietary: string;
  };
  notes: string;
};

export interface FlightSegment {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  aircraft: string;
  origin: {
    code: string;
    name: string;
    city: string;
    terminal?: string;
    time: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    terminal?: string;
    time: string;
  };
  duration: string;
  durationMinutes: number;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  seat?: string;
}

export type FlightAIBadge = "Cheapest" | "Fastest" | "Best Value" | "Best Match";

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber?: string;
  aircraft?: string;
  price: number;
  currency: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  totalDuration: string;
  originCity: string;
  originCode: string;
  destinationCity: string;
  destinationCode: string;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  segments: FlightSegment[];
  baggageIncluded: boolean;
  baggageDetails?: {
    personalItem: boolean;
    cabinBag: string;
    checkedBag: string;
    weightKg?: number;
  };
  carbonEmissionKg: number;
  ecoScore: "A" | "B" | "C";
  refundable: boolean;
  seatsRemaining: number;
  aiBadge?: FlightAIBadge;
  aiBadgeReason?: string;
  amenities?: string[];
  onTimeRate?: number;
  layoverDetails?: string;
  fareType?: "Standard" | "Flex" | "Super Saver" | "VIP";
  seatMap?: {
    rows: number;
    seatsPerRow: string[];
    occupiedSeats: string[];
    premiumSeats: string[];
  };
}

export interface FlightSearchParams {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  tripType: "roundtrip" | "oneway" | "multicity";
  departureDate: string;
  returnDate?: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabin: "Economy" | "Premium Economy" | "Business" | "First" | "All Classes";
  directOnly?: boolean;
  maxPrice?: number;
  airlines?: string[];
  sortBy?: "cheapest" | "fastest" | "best_value" | "best_match" | "departure";
}

export interface HotelReview {
  id: string;
  author: string;
  avatar?: string;
  country?: string;
  rating: number;
  date: string;
  tripType?: "Couple" | "Solo" | "Family" | "Business" | "Friends";
  title: string;
  comment: string;
  pros?: string;
  cons?: string;
  roomType?: string;
  stayDuration?: string;
}

export interface HotelRoom {
  id: string;
  name: string;
  bedType: string;
  capacity: number;
  pricePerNight: number;
  sqm: number;
  sqft?: number;
  amenities: string[];
  imageUrl: string;
  gallery?: string[];
  vrTourAvailable: boolean;
  viewType?: string;
  cancellationPolicy?: string;
  refundable?: boolean;
  breakfastIncluded?: boolean;
  availableRoomsCount?: number;
  specialPerks?: string[];
}

export interface HotelOffer {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  neighborhood?: string;
  rating: number;
  ratingLabel?: string;
  starRating?: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPricePerNight?: number;
  currency: string;
  images: string[];
  vrPanoramaUrl: string;
  amenities: string[];
  tags: string[];
  rooms: HotelRoom[];
  featured: boolean;
  description: string;
  coordinates: { lat: number; lng: number };
  aiMatchScore?: number;
  aiBadge?: string;
  aiMatchReason?: string;
  cancellationPolicy?: string;
  cancellationType?: "free" | "flexible" | "strict";
  taxRate?: number;
  resortFeePerNight?: number;
  cleanlinessScore?: number;
  locationScore?: number;
  serviceScore?: number;
  valueScore?: number;
  propertyType?: "Resort & Spa" | "Boutique Hotel" | "Luxury Villa" | "Skyline Penthouse" | "Heritage Palace" | "Eco-Lodge" | string;
  neighborhoodHighlights?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  reviews?: HotelReview[];
}

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minAiMatchScore?: number;
  starRatings?: number[];
  amenities?: string[];
  propertyTypes?: string[];
  freeCancellationOnly?: boolean;
  breakfastIncludedOnly?: boolean;
  sortBy?: "ai_match" | "price_low" | "price_high" | "rating_high" | "popularity";
}

export interface TravelPackage {
  id: string;
  title: string;
  tagline: string;
  destination: string;
  country: string;
  days: number;
  nights: number;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  travelStyle: TravelStyle;
  rating: number;
  reviewsCount: number;
  departureDates: string[];
  featured: boolean;
  itinerarySummary: { day: number; title: string; desc: string }[];
}

export interface TransferOffer {
  id: string;
  title: string;
  vehicleType: "Luxury Sedan" | "Executive SUV" | "First Class Van" | "Helicopter" | "Private Speedboat" | "Electric Chauffeur" | string;
  originCity: string;
  originLocation: string;
  destinationCity: string;
  destinationLocation: string;
  price: number;
  currency: string;
  duration: string;
  durationMinutes: number;
  passengers: number;
  luggage: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  imageUrl: string;
  driverLanguage: string[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  meetAndGreet: boolean;
  flightTracking: boolean;
  carbonOffsetKg?: number;
  travelPreferencesMatch?: string[];
}

export interface CarRentalOffer {
  id: string;
  model: string;
  brand: string;
  category: "Luxury" | "SUV" | "Electric" | "Sports" | "Convertible" | "Compact" | "Executive" | string;
  city: string;
  country: string;
  pickupLocation: string;
  pricePerDay: number;
  currency: string;
  seats: number;
  doors: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Electric" | "Hybrid" | "Petrol" | "Diesel";
  mileage: "Unlimited" | string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  amenities: string[];
  freeCancellation: boolean;
  instantConfirmation: boolean;
  supplier: string;
  supplierLogo?: string;
  insuranceIncluded: boolean;
  travelPreferencesMatch?: string[];
}

export interface SearchFilterState {
  category: "all" | "flights" | "hotels" | "packages" | "transfers" | "cars" | "experiences";
  query: string;
  destination: string;
  origin: string;
  dateStart: string;
  dateEnd: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  amenities: string[];
  freeCancellationOnly: boolean;
  travelStyles: string[];
  flightClass?: string;
  carCategory?: string;
  transmission?: string;
  transferType?: string;
  sortBy: "recommended" | "price_asc" | "price_desc" | "rating_desc" | "duration_asc";
  page: number;
  itemsPerPage: number;
}

export type ExperienceCategory =
  | "Adventure"
  | "Culture"
  | "Food"
  | "Family"
  | "Nightlife"
  | "Shopping"
  | "Wellness"
  | "Nature"
  | string;

export interface ExperienceReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  country?: string;
  travelerType?: string;
}

export interface TravelExperience {
  id: string;
  title: string;
  name?: string; // Alias for title
  category: ExperienceCategory;
  city: string;
  country: string;
  location?: string;
  duration: string;
  durationHours?: number;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  aiMatchScore?: number;
  aiBadge?: string;
  aiMatchReason?: string;
  imageUrl: string;
  images?: string[];
  vrPreviewUrl?: string;
  guideLanguage: string[];
  instantConfirmation: boolean;
  cancellationPolicy: string;
  cancellationType?: "free" | "flexible" | "strict";
  description: string;
  meetingPoint: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  itinerarySchedule?: { time: string; activity: string; description: string }[];
  host?: {
    name: string;
    avatar: string;
    title: string;
    badge: string;
    rating: number;
    verified: boolean;
  };
  groupSize?: string;
  difficulty?: "Easy" | "Moderate" | "Challenging";
  minimumAge?: number;
  tags?: string[];
  reviews?: ExperienceReview[];
}

export interface TripActivity {
  id: string;
  time: string;
  title: string;
  type: "flight" | "hotel" | "activity" | "meal" | "transit" | "free-time" | "cultural" | "dining";
  location: string;
  description: string;
  duration?: string;
  estimatedCost?: number;
  cost?: number;
  transitToNext?: string;
  bookingRef?: string;
  completed?: boolean;
}

export interface TripDay {
  dayNumber: number;
  date: string;
  theme: string;
  activities: TripActivity[];
  weatherForecast?: {
    temp?: number;
    tempC?: number;
    condition: string;
    icon?: string;
    aiRecommendation?: string;
  };
}

export interface TripPlanFlight {
  id: string;
  type: "outbound" | "return";
  airline: string;
  flightNumber: string;
  airlineLogo?: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  stops: number;
  pricePerPerson: number;
  baggageIncluded: boolean;
  seatSuggestion?: string;
}

export interface TripPlanHotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  roomType: string;
  nightlyPrice: number;
  totalPrice: number;
  nights: number;
  location: string;
  address?: string;
  imageUrl: string;
  amenities: string[];
  matchReason?: string;
  badge?: string;
}

export interface TripPlanTransport {
  id: string;
  type: "train_pass" | "private_transfer" | "metro_card" | "car_rental" | "ferry" | string;
  title: string;
  description: string;
  cost: number;
  currency: string;
  coverage: string;
  bookingTip?: string;
  recommended: boolean;
}

export interface TripPlanCostBreakdown {
  flights: number;
  lodging: number;
  activities: number;
  foodDining: number;
  localTransit: number;
  taxesAndBuffer: number;
  totalEstimated: number;
  targetBudget: number;
  currency: string;
  savingsTips: string[];
}

export interface TripPlan {
  id: string;
  title: string;
  summary?: string;
  aiRationale?: string;
  seasonAdvice?: string;
  specialRequirementsHandled?: string[];
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed" | "draft";
  travelersCount: number;
  budgetTotal: number;
  currency: string;
  days: TripDay[];
  flights?: TripPlanFlight[];
  hotels?: TripPlanHotel[];
  curatedActivities?: TripActivity[];
  transportation?: TripPlanTransport[];
  costBreakdown?: TripPlanCostBreakdown;
  packingList: { id: string; item: string; packed: boolean; category: string }[];
  emergencyContacts: { name: string; role: string; phone: string }[];
  isAIGenerated?: boolean;
}

export interface VRScene {
  id: string;
  title: string;
  destination: string;
  country: string;
  category?: string;
  type: "360-landscape" | "hotel-suite" | "first-class-cabin" | "ancient-ruins" | "underwater";
  panoramaUrl: string;
  thumbnailUrl: string;
  ambientAudioUrl?: string;
  description: string;
  hotspots: {
    id: string;
    title: string;
    description: string;
    x: number;
    y: number;
    tag: string;
  }[];
}

export interface Booking {
  id: string;
  referenceNumber?: string;
  referenceCode?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  type: "flight" | "hotel" | "package" | "experience" | "transfer" | "car" | "multi-modal" | string;
  title: string;
  destination?: string;
  bookingDate?: string;
  createdAt?: string;
  travelDate?: string;
  returnDate?: string;
  dates?: { start: string; end?: string };
  status: "confirmed" | "completed" | "cancelled" | "pending";
  totalAmount?: number;
  totalPrice?: number;
  currency: string;
  travelersCount?: number;
  paymentMethod: string;
  paymentStatus: "paid" | "partial" | "refunded";
  itemDetails?: any;
  voucherUrl?: string;
  passengers?: {
    name: string;
    type: "Adult" | "Child" | "Infant";
    seat?: string;
    ticketNumber?: string;
  }[];
  details?: Record<string, any>;
  qrCodeUrl?: string;
  pdfVoucherUrl?: string;
}

export type BookingRecord = Booking;

export interface TravelDocument {
  id: string;
  userId?: string;
  title: string;
  documentType?: "boarding_pass" | "hotel_voucher" | "visa" | "passport" | "insurance" | "itinerary_pdf";
  type?: "boarding_pass" | "hotel_voucher" | "visa" | "passport" | "insurance" | "itinerary_pdf";
  bookingRef?: string;
  holderName?: string;
  issueDate?: string;
  expiryDate?: string;
  status: "valid" | "expiring_soon" | "expired" | "action_required";
  fileSize?: string;
  downloadUrl?: string;
  fileUrl?: string;
  qrCodeData?: string;
  metadata?: Record<string, string>;
}

export interface CustomerLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "quoted" | "booked" | "vip";
  budget: number;
  preferredDestination: string;
  assignedAgent: string;
  totalBookingsValue: number;
  notes: string;
  createdAt: string;
}

export interface AgentQuote {
  id: string;
  customerId?: string;
  clientName?: string;
  customerName?: string;
  tripTitle?: string;
  destination: string;
  totalQuote: number;
  commissionRate?: number;
  commissionEarned?: number;
  commissionAmount?: number;
  status: "draft" | "sent" | "accepted" | "expired" | "ready_to_send";
  validUntil?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "flight_update" | "price_drop" | "gate_change" | "ai_recommendation" | "document_expiry" | "payment" | "flight_delay";
  time: string;
  read: boolean;
  linkModule?: string;
}

export interface SupportTicket {
  id: string;
  subject?: string;
  category: string;
  priority?: "low" | "medium" | "high" | "urgent";
  urgency?: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "assigned";
  ticketId?: string;
  assignedAgent?: string;
  estimatedResponseMinutes?: number;
  createdAt?: string;
  messages?: {
    id: string;
    sender: "user" | "ai_agent" | "human_specialist";
    text: string;
    timestamp: string;
  }[];
}

export type AppModule =
  | "home"
  | "search"
  | "flights"
  | "hotels"
  | "packages"
  | "transfers"
  | "cars"
  | "experiences"
  | "trips"
  | "itinerary"
  | "ai"
  | "tripgenie"
  | "vr"
  | "support"
  | "notifications"
  | "profile"
  | "agent"
  | "customers"
  | "bookings"
  | "payments"
  | "documents"
  | "admin"
  | "onboarding"
  | "auth"
  | "destinations"
  | "travelpulse"
  | "design-system";
