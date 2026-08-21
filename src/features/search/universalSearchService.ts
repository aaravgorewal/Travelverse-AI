import {
  FlightOffer,
  HotelOffer,
  TravelPackage,
  TravelExperience,
  TransferOffer,
  CarRentalOffer,
  SearchFilterState,
  TravelStyle,
} from "../../types";
import {
  SEED_FLIGHTS,
  SEED_HOTELS,
  SEED_PACKAGES,
  SEED_EXPERIENCES,
  SEED_TRANSFERS,
  SEED_CARS,
} from "../../config/constants";

export type UniversalCategory = "all" | "flights" | "hotels" | "packages" | "transfers" | "cars" | "experiences";

export interface UniversalSearchResultItem {
  id: string;
  category: "flight" | "hotel" | "package" | "transfer" | "car" | "experience";
  title: string;
  subtitle: string;
  location: string;
  city: string;
  country?: string;
  price: number;
  priceUnit: "per person" | "per night" | "per day" | "per vehicle" | "total";
  currency: string;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  secondaryImages?: string[];
  vrAvailable?: boolean;
  vrPanoramaUrl?: string;
  badges: string[];
  amenities: string[];
  cancellationText: string;
  freeCancellation: boolean;
  instantConfirmation: boolean;
  travelStyles: string[];
  departureOrDate?: string;
  duration?: string;
  capacityOrSeats?: string;
  rawItem: FlightOffer | HotelOffer | TravelPackage | TravelExperience | TransferOffer | CarRentalOffer;
}

export interface UniversalSearchResponse {
  items: UniversalSearchResultItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  categoryCounts: Record<UniversalCategory, number>;
  priceRange: { min: number; max: number };
}

export const INITIAL_SEARCH_FILTERS: SearchFilterState = {
  category: "all",
  query: "",
  destination: "",
  origin: "",
  dateStart: "",
  dateEnd: "",
  minPrice: 0,
  maxPrice: 10000,
  minRating: 0,
  amenities: [],
  freeCancellationOnly: false,
  travelStyles: [],
  flightClass: "all",
  carCategory: "all",
  transmission: "all",
  transferType: "all",
  sortBy: "recommended",
  page: 1,
  itemsPerPage: 9,
};

// Normalize Flight to UniversalSearchResultItem
function normalizeFlight(f: FlightOffer): UniversalSearchResultItem {
  return {
    id: f.id,
    category: "flight",
    title: `${f.airline} (${f.segments[0]?.flightNumber || f.airlineCode})`,
    subtitle: `${f.originCity} (${f.originCode}) → ${f.destinationCity} (${f.destinationCode}) • ${f.stops === 0 ? "Non-stop" : `${f.stops} stop`}`,
    location: `${f.originCity} to ${f.destinationCity}`,
    city: f.destinationCity,
    country: "Global",
    price: f.price,
    priceUnit: "per person",
    currency: f.currency,
    rating: 4.9,
    reviewsCount: 380,
    imageUrl:
      f.destinationCity.toLowerCase().includes("tokyo")
        ? "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"
        : f.destinationCity.toLowerCase().includes("dubai")
        ? "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
        : f.destinationCity.toLowerCase().includes("paris")
        ? "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    badges: [f.cabinClass, f.stops === 0 ? "Direct" : `${f.stops} Stop`, `Eco ${f.ecoScore}`],
    amenities: [
      f.baggageIncluded ? "Baggage Included" : "Cabin Bag Only",
      "In-Flight Wi-Fi",
      "Gourmet Meal",
      "Power Outlets",
      "USB Charging",
    ],
    cancellationText: f.refundable ? "Free cancellation up to 24h" : "Standard fare rules",
    freeCancellation: !!f.refundable,
    instantConfirmation: true,
    travelStyles: ["business", "luxury", "family"],
    departureOrDate: f.departureTime ? f.departureTime.split("T")[0] : undefined,
    duration: f.totalDuration,
    capacityOrSeats: `${f.seatsRemaining} seats left`,
    rawItem: f,
  };
}

// Normalize Hotel to UniversalSearchResultItem
function normalizeHotel(h: HotelOffer): UniversalSearchResultItem {
  return {
    id: h.id,
    category: "hotel",
    title: h.name,
    subtitle: `${h.address}, ${h.city}, ${h.country}`,
    location: `${h.city}, ${h.country}`,
    city: h.city,
    country: h.country,
    price: h.pricePerNight,
    priceUnit: "per night",
    currency: h.currency,
    rating: h.rating,
    reviewsCount: h.reviewsCount,
    imageUrl: h.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    secondaryImages: h.images,
    vrAvailable: !!h.vrPanoramaUrl,
    vrPanoramaUrl: h.vrPanoramaUrl,
    badges: [...(h.tags || []), h.featured ? "Featured Sanctuary" : "Verified 5-Star"],
    amenities: h.amenities || ["Wi-Fi", "Swimming Pool", "Spa & Wellness", "Breakfast Included"],
    cancellationText: "Free cancellation up to 48 hours before check-in",
    freeCancellation: true,
    instantConfirmation: true,
    travelStyles: ["luxury", "romantic", "wellness", "family"],
    capacityOrSeats: `${h.rooms?.length || 2} Suite categories`,
    rawItem: h,
  };
}

// Normalize TravelPackage to UniversalSearchResultItem
function normalizePackage(p: TravelPackage): UniversalSearchResultItem {
  return {
    id: p.id,
    category: "package",
    title: p.title,
    subtitle: `${p.tagline} • ${p.days} Days / ${p.nights} Nights in ${p.destination}`,
    location: `${p.destination}, ${p.country}`,
    city: p.destination,
    country: p.country,
    price: p.price,
    priceUnit: "per person",
    currency: p.currency,
    originalPrice: p.originalPrice,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    imageUrl: p.images[0] || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    secondaryImages: p.images,
    badges: [`${p.days}D / ${p.nights}N`, p.travelStyle.toUpperCase(), "All-Inclusive Tour"],
    amenities: [...p.included.slice(0, 4), "AI Concierge 24/7", "Local Host"],
    cancellationText: "Free cancellation up to 14 days before departure",
    freeCancellation: true,
    instantConfirmation: true,
    travelStyles: [p.travelStyle.toLowerCase(), "culture", "luxury"],
    duration: `${p.days} Days`,
    departureOrDate: p.departureDates[0],
    rawItem: p,
  };
}

// Normalize TransferOffer to UniversalSearchResultItem
function normalizeTransfer(t: TransferOffer): UniversalSearchResultItem {
  return {
    id: t.id,
    category: "transfer",
    title: t.title,
    subtitle: `${t.vehicleType} • ${t.originLocation} → ${t.destinationLocation}`,
    location: `${t.originCity} to ${t.destinationCity}`,
    city: t.destinationCity,
    country: t.originCity === "Dubai" ? "UAE" : t.originCity === "Tokyo" ? "Japan" : "Global",
    price: t.price,
    priceUnit: "per vehicle",
    currency: t.currency,
    rating: t.rating,
    reviewsCount: t.reviewsCount,
    imageUrl: t.imageUrl,
    badges: [t.vehicleType, `${t.passengers} Passengers`, `${t.luggage} Bags`],
    amenities: t.amenities,
    cancellationText: t.freeCancellation ? "Free cancellation up to 6 hours before pickup" : "Non-refundable within 24h",
    freeCancellation: t.freeCancellation,
    instantConfirmation: t.instantConfirmation,
    travelStyles: (t.travelPreferencesMatch || ["business", "luxury", "family"]).map((s) => s.toLowerCase()),
    duration: t.duration,
    capacityOrSeats: `Max ${t.passengers} guests • ${t.luggage} luggage`,
    rawItem: t,
  };
}

// Normalize CarRentalOffer to UniversalSearchResultItem
function normalizeCar(c: CarRentalOffer): UniversalSearchResultItem {
  return {
    id: c.id,
    category: "car",
    title: `${c.brand} ${c.model}`,
    subtitle: `${c.category} Class • ${c.transmission} • ${c.fuelType} • ${c.pickupLocation}`,
    location: `${c.city}, ${c.country}`,
    city: c.city,
    country: c.country,
    price: c.pricePerDay,
    priceUnit: "per day",
    currency: c.currency,
    rating: c.rating,
    reviewsCount: c.reviewsCount,
    imageUrl: c.imageUrl,
    badges: [c.category, c.transmission, c.fuelType, `${c.seats} Seats`],
    amenities: c.amenities,
    cancellationText: c.freeCancellation ? "Free cancellation up to 24 hours before pickup" : "Non-refundable",
    freeCancellation: c.freeCancellation,
    instantConfirmation: c.instantConfirmation,
    travelStyles: (c.travelPreferencesMatch || ["adventure", "family", "luxury"]).map((s) => s.toLowerCase()),
    capacityOrSeats: `${c.seats} Seats • ${c.doors} Doors • ${c.mileage}`,
    rawItem: c,
  };
}

// Normalize TravelExperience to UniversalSearchResultItem
function normalizeExperience(e: TravelExperience): UniversalSearchResultItem {
  return {
    id: e.id,
    category: "experience",
    title: e.title,
    subtitle: `${e.category} • ${e.duration} • Guided in ${e.guideLanguage.join(", ")}`,
    location: `${e.city}, ${e.country}`,
    city: e.city,
    country: e.country,
    price: e.price,
    priceUnit: "per person",
    currency: e.currency,
    rating: e.rating,
    reviewsCount: e.reviewsCount,
    imageUrl: e.imageUrl,
    badges: [e.category, e.duration, "Top Rated Activity"],
    amenities: ["Small Group Access", `Languages: ${e.guideLanguage.join(", ")}`, "Instant Mobile Ticket"],
    cancellationText: e.cancellationPolicy,
    freeCancellation: e.cancellationPolicy.toLowerCase().includes("free"),
    instantConfirmation: e.instantConfirmation,
    travelStyles: ["adventure", "culture", "culinary", "romantic"],
    duration: e.duration,
    rawItem: e,
  };
}

export const universalSearchService = {
  search(filters: Partial<SearchFilterState> = {}): UniversalSearchResponse {
    const activeFilters: SearchFilterState = {
      ...INITIAL_SEARCH_FILTERS,
      ...filters,
    };

    // 1. Gather all normalized items across all 6 categories
    const allNormalized: UniversalSearchResultItem[] = [
      ...SEED_FLIGHTS.map(normalizeFlight),
      ...SEED_HOTELS.map(normalizeHotel),
      ...SEED_PACKAGES.map(normalizePackage),
      ...SEED_TRANSFERS.map(normalizeTransfer),
      ...SEED_CARS.map(normalizeCar),
      ...SEED_EXPERIENCES.map(normalizeExperience),
    ];

    // Compute category counts before category filter
    const categoryCounts: Record<UniversalCategory, number> = {
      all: allNormalized.length,
      flights: SEED_FLIGHTS.length,
      hotels: SEED_HOTELS.length,
      packages: SEED_PACKAGES.length,
      transfers: SEED_TRANSFERS.length,
      cars: SEED_CARS.length,
      experiences: SEED_EXPERIENCES.length,
    };

    // Calculate absolute price min & max
    let minPriceOverall = Infinity;
    let maxPriceOverall = 0;
    allNormalized.forEach((item) => {
      if (item.price < minPriceOverall) minPriceOverall = item.price;
      if (item.price > maxPriceOverall) maxPriceOverall = item.price;
    });

    // 2. Filter pipeline
    let filtered = allNormalized.filter((item) => {
      // Category filter
      if (activeFilters.category !== "all") {
        const itemCatKey = item.category === "flight"
          ? "flights"
          : item.category === "hotel"
          ? "hotels"
          : item.category === "package"
          ? "packages"
          : item.category === "transfer"
          ? "transfers"
          : item.category === "car"
          ? "cars"
          : "experiences";
        if (itemCatKey !== activeFilters.category) return false;
      }

      // Keyword query search across title, subtitle, location, city, country, amenities, badges
      if (activeFilters.query.trim()) {
        const q = activeFilters.query.toLowerCase().trim();
        const matchesText =
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          (item.country && item.country.toLowerCase().includes(q)) ||
          item.badges.some((b) => b.toLowerCase().includes(q)) ||
          item.amenities.some((a) => a.toLowerCase().includes(q));

        if (!matchesText) return false;
      }

      // Destination filter
      if (activeFilters.destination.trim()) {
        const dest = activeFilters.destination.toLowerCase().trim();
        const matchesDest =
          item.city.toLowerCase().includes(dest) ||
          item.location.toLowerCase().includes(dest) ||
          (item.country && item.country.toLowerCase().includes(dest)) ||
          item.title.toLowerCase().includes(dest);
        if (!matchesDest) return false;
      }

      // Origin filter (specifically for flights & transfers)
      if (activeFilters.origin && activeFilters.origin.trim()) {
        const orig = activeFilters.origin.toLowerCase().trim();
        if (item.category === "flight") {
          const rawFlight = item.rawItem as FlightOffer;
          if (
            !rawFlight.originCity.toLowerCase().includes(orig) &&
            !rawFlight.originCode.toLowerCase().includes(orig)
          ) {
            return false;
          }
        } else if (item.category === "transfer") {
          const rawTransfer = item.rawItem as TransferOffer;
          if (
            !rawTransfer.originCity.toLowerCase().includes(orig) &&
            !rawTransfer.originLocation.toLowerCase().includes(orig)
          ) {
            return false;
          }
        }
      }

      // Price range
      if (activeFilters.minPrice > 0 && item.price < activeFilters.minPrice) {
        return false;
      }
      if (activeFilters.maxPrice > 0 && item.price > activeFilters.maxPrice) {
        return false;
      }

      // Rating filter
      if (activeFilters.minRating > 0 && item.rating < activeFilters.minRating) {
        return false;
      }

      // Free cancellation filter
      if (activeFilters.freeCancellationOnly && !item.freeCancellation) {
        return false;
      }

      // Amenities filter
      if (activeFilters.amenities && activeFilters.amenities.length > 0) {
        const hasAllAmenities = activeFilters.amenities.every((reqAmenity) =>
          item.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      // Traveler preference / TravelDNA style filter
      if (activeFilters.travelStyles && activeFilters.travelStyles.length > 0) {
        const matchesStyle = activeFilters.travelStyles.some((reqStyle) =>
          item.travelStyles.some((s) => s.toLowerCase().includes(reqStyle.toLowerCase()))
        );
        if (!matchesStyle) return false;
      }

      // Category-specific filters
      if (item.category === "flight" && activeFilters.flightClass && activeFilters.flightClass !== "all") {
        const rawF = item.rawItem as FlightOffer;
        if (rawF.cabinClass.toLowerCase() !== activeFilters.flightClass.toLowerCase()) {
          return false;
        }
      }

      if (item.category === "car") {
        const rawC = item.rawItem as CarRentalOffer;
        if (activeFilters.carCategory && activeFilters.carCategory !== "all") {
          if (rawC.category.toLowerCase() !== activeFilters.carCategory.toLowerCase()) {
            return false;
          }
        }
        if (activeFilters.transmission && activeFilters.transmission !== "all") {
          if (rawC.transmission.toLowerCase() !== activeFilters.transmission.toLowerCase()) {
            return false;
          }
        }
      }

      if (item.category === "transfer" && activeFilters.transferType && activeFilters.transferType !== "all") {
        const rawT = item.rawItem as TransferOffer;
        if (!rawT.vehicleType.toLowerCase().includes(activeFilters.transferType.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // 3. Sort pipeline
    filtered.sort((a, b) => {
      switch (activeFilters.sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating_desc":
          return b.rating - a.rating || b.reviewsCount - a.reviewsCount;
        case "duration_asc": {
          const durA = (a.rawItem as any).durationMinutes || (a.rawItem as any).days || 999;
          const durB = (b.rawItem as any).durationMinutes || (b.rawItem as any).days || 999;
          return durA - durB;
        }
        case "recommended":
        default:
          // AI Score algorithm based on rating, review volume, and verified badges
          const scoreA = a.rating * 20 + Math.min(a.reviewsCount / 50, 20) + (a.vrAvailable ? 5 : 0);
          const scoreB = b.rating * 20 + Math.min(b.reviewsCount / 50, 20) + (b.vrAvailable ? 5 : 0);
          return scoreB - scoreA;
      }
    });

    // 4. Pagination
    const totalCount = filtered.length;
    const itemsPerPage = Math.max(1, activeFilters.itemsPerPage || 9);
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    const page = Math.min(Math.max(1, activeFilters.page || 1), totalPages);

    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      items: paginatedItems,
      totalCount,
      totalPages,
      currentPage: page,
      itemsPerPage,
      categoryCounts,
      priceRange: {
        min: minPriceOverall === Infinity ? 0 : minPriceOverall,
        max: maxPriceOverall || 5000,
      },
    };
  },
};
