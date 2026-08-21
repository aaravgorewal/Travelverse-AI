import { FlightOffer } from "../../types";

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const POPULAR_AIRPORTS: AirportInfo[] = [
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "United States" },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "United States" },
  { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan" },
  { code: "NRT", name: "Tokyo Narita International", city: "Tokyo", country: "Japan" },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { code: "KEF", name: "Keflavik International", city: "Reykjavik", country: "Iceland" },
  { code: "MLE", name: "Velana International Airport", city: "Male / Maldives", country: "Maldives" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome", country: "Italy" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
];

export const POPULAR_FLIGHT_ROUTES = [
  { from: "SFO", fromCity: "San Francisco", to: "HND", toCity: "Tokyo", price: 645, duration: "6h 15m", tag: "Hot Deal" },
  { from: "JFK", fromCity: "New York", to: "CDG", toCity: "Paris", price: 389, duration: "7h 45m", tag: "Popular" },
  { from: "JFK", fromCity: "New York", to: "DXB", toCity: "Dubai", price: 840, duration: "12h 45m", tag: "Luxury Choice" },
  { from: "LAX", fromCity: "Los Angeles", to: "SYD", toCity: "Sydney", price: 1190, duration: "14h 25m", tag: "Dream Flight" },
  { from: "LHR", fromCity: "London", to: "SIN", toCity: "Singapore", price: 720, duration: "13h 10m", tag: "Direct Route" },
  { from: "LHR", fromCity: "London", to: "KEF", toCity: "Reykjavik", price: 290, duration: "4h 10m", tag: "Quick Escape" },
];

export const SEED_COMPREHENSIVE_FLIGHTS: FlightOffer[] = [
  {
    id: "fl-101",
    flightNumber: "QA 782",
    airline: "Quantum Airways",
    airlineCode: "QA",
    airlineLogo: "✈️",
    aircraft: "Boeing 787-9 Dreamliner",
    price: 645,
    currency: "USD",
    stops: 0,
    departureTime: "2026-09-12T08:30:00Z",
    arrivalTime: "2026-09-12T14:45:00Z",
    totalDuration: "6h 15m",
    originCity: "San Francisco",
    originCode: "SFO",
    destinationCity: "Tokyo",
    destinationCode: "HND",
    cabinClass: "Business",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "1x 10kg (55x40x23cm)",
      checkedBag: "2x 32kg included",
      weightKg: 74,
    },
    carbonEmissionKg: 380,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 4,
    aiBadge: "Best Match",
    aiBadgeReason: "Direct nonstop flight with premium lie-flat business suites & lowest carbon footprint rating.",
    onTimeRate: 97,
    fareType: "VIP",
    amenities: ["Lie-flat Seat", "Starlink Wi-Fi", "In-seat 4K Screen", "Champagne Service", "Power & USB-C", "Lounge Access"],
    segments: [
      {
        id: "seg-101",
        flightNumber: "QA 782",
        airline: "Quantum Airways",
        airlineCode: "QA",
        airlineLogo: "✈️",
        aircraft: "Boeing 787-9 Dreamliner",
        origin: { code: "SFO", name: "San Francisco Intl", city: "San Francisco", terminal: "I", time: "08:30" },
        destination: { code: "HND", name: "Tokyo Haneda", city: "Tokyo", terminal: "3", time: "14:45" },
        duration: "6h 15m",
        durationMinutes: 375,
        cabinClass: "Business",
        seat: "3A",
      },
    ],
  },
  {
    id: "fl-102",
    flightNumber: "AL 104",
    airline: "AeroLuxe International",
    airlineCode: "AL",
    airlineLogo: "🌐",
    aircraft: "Airbus A350-900 Ultra",
    price: 389,
    currency: "USD",
    stops: 1,
    departureTime: "2026-09-15T11:00:00Z",
    arrivalTime: "2026-09-15T22:30:00Z",
    totalDuration: "11h 30m",
    originCity: "New York",
    originCode: "JFK",
    destinationCity: "Paris",
    destinationCode: "CDG",
    cabinClass: "Economy",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "1x 8kg",
      checkedBag: "1x 23kg included",
      weightKg: 31,
    },
    carbonEmissionKg: 490,
    ecoScore: "B",
    refundable: false,
    seatsRemaining: 9,
    aiBadge: "Cheapest",
    aiBadgeReason: "Lowest available fare with 1 short scenic layover in London Heathrow.",
    onTimeRate: 91,
    fareType: "Super Saver",
    layoverDetails: "1h 45m layover in London Heathrow (LHR Terminal 2)",
    amenities: ["Complimentary Meal", "Seatback Entertainment", "USB-A Port", "Standard Wi-Fi"],
    segments: [
      {
        id: "seg-102a",
        flightNumber: "AL 104",
        airline: "AeroLuxe International",
        airlineCode: "AL",
        airlineLogo: "🌐",
        aircraft: "Airbus A350-900",
        origin: { code: "JFK", name: "John F Kennedy", city: "New York", terminal: "4", time: "11:00" },
        destination: { code: "LHR", name: "London Heathrow", city: "London", terminal: "2", time: "19:00" },
        duration: "6h 00m",
        durationMinutes: 360,
        cabinClass: "Economy",
      },
      {
        id: "seg-102b",
        flightNumber: "AL 982",
        airline: "AeroLuxe International",
        airlineCode: "AL",
        airlineLogo: "🌐",
        aircraft: "Airbus A320neo",
        origin: { code: "LHR", name: "London Heathrow", city: "London", terminal: "2", time: "20:45" },
        destination: { code: "CDG", name: "Paris Charles de Gaulle", city: "Paris", terminal: "2E", time: "22:30" },
        duration: "1h 45m",
        durationMinutes: 105,
        cabinClass: "Economy",
      },
    ],
  },
  {
    id: "fl-103",
    flightNumber: "EJ 001",
    airline: "Empyrean Jetways",
    airlineCode: "EJ",
    airlineLogo: "✨",
    aircraft: "Airbus A380-800 SkySuite",
    price: 1190,
    currency: "USD",
    stops: 0,
    departureTime: "2026-10-01T21:15:00Z",
    arrivalTime: "2026-10-02T13:40:00Z",
    totalDuration: "14h 25m",
    originCity: "Los Angeles",
    originCode: "LAX",
    destinationCity: "Sydney",
    destinationCode: "SYD",
    cabinClass: "First",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "2x 12kg",
      checkedBag: "3x 32kg included",
      weightKg: 120,
    },
    carbonEmissionKg: 620,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 2,
    aiBadge: "Best Value",
    aiBadgeReason: "Private enclosed First Class suite with onboard shower, private caviar dining & chauffeur transfer included.",
    onTimeRate: 98,
    fareType: "VIP",
    amenities: ["Private Suite Door", "Onboard Shower Spa", "Caviar & Dom Pérignon", "B&O Noise-Cancelling", "Chauffeur Transfer", "Starlink Ultra"],
    segments: [
      {
        id: "seg-103",
        flightNumber: "EJ 001",
        airline: "Empyrean Jetways",
        airlineCode: "EJ",
        airlineLogo: "✨",
        aircraft: "Airbus A380-800 SkySuite",
        origin: { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", terminal: "B", time: "21:15" },
        destination: { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", terminal: "1", time: "13:40" },
        duration: "14h 25m",
        durationMinutes: 865,
        cabinClass: "First",
        seat: "1K",
      },
    ],
  },
  {
    id: "fl-104",
    flightNumber: "NA 441",
    airline: "Nordic Aurora Air",
    airlineCode: "NA",
    airlineLogo: "❄️",
    aircraft: "Boeing 737 MAX 8",
    price: 290,
    currency: "USD",
    stops: 0,
    departureTime: "2026-11-05T09:10:00Z",
    arrivalTime: "2026-11-05T13:20:00Z",
    totalDuration: "4h 10m",
    originCity: "London",
    originCode: "LHR",
    destinationCity: "Reykjavik",
    destinationCode: "KEF",
    cabinClass: "Premium Economy",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "1x 10kg",
      checkedBag: "1x 23kg included",
      weightKg: 33,
    },
    carbonEmissionKg: 210,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 12,
    aiBadge: "Fastest",
    aiBadgeReason: "Direct non-stop flight arriving in under 4.2 hours with extra legroom seats.",
    onTimeRate: 95,
    fareType: "Flex",
    amenities: ["Extra Legroom (38\")", "Priority Boarding", "Artisanal Nordic Meals", "High-speed Wi-Fi"],
    segments: [
      {
        id: "seg-104",
        flightNumber: "NA 441",
        airline: "Nordic Aurora Air",
        airlineCode: "NA",
        airlineLogo: "❄️",
        aircraft: "Boeing 737 MAX 8",
        origin: { code: "LHR", name: "Heathrow", city: "London", terminal: "5", time: "09:10" },
        destination: { code: "KEF", name: "Keflavik", city: "Reykjavik", terminal: "1", time: "13:20" },
        duration: "4h 10m",
        durationMinutes: 250,
        cabinClass: "Premium Economy",
      },
    ],
  },
  {
    id: "fl-105",
    flightNumber: "EK 202",
    airline: "Emirates Royal Sky",
    airlineCode: "EK",
    airlineLogo: "🌟",
    aircraft: "Airbus A380 SkyLounge",
    price: 840,
    currency: "USD",
    stops: 0,
    departureTime: "2026-09-20T14:30:00Z",
    arrivalTime: "2026-09-21T07:15:00Z",
    totalDuration: "12h 45m",
    originCity: "New York",
    originCode: "JFK",
    destinationCity: "Dubai",
    destinationCode: "DXB",
    cabinClass: "Business",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "2x 7kg",
      checkedBag: "2x 32kg included",
      weightKg: 78,
    },
    carbonEmissionKg: 520,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 6,
    aiBadge: "Best Match",
    aiBadgeReason: "Ultra-luxury non-stop experience featuring onboard cocktail lounge & full flat bed.",
    onTimeRate: 94,
    fareType: "Flex",
    amenities: ["Onboard Bar & Lounge", "Lie-flat Bed", "Multi-course Gourmet Dining", "ICE 6,500 Channels", "Fast Wi-Fi"],
    segments: [
      {
        id: "seg-105",
        flightNumber: "EK 202",
        airline: "Emirates Royal Sky",
        airlineCode: "EK",
        airlineLogo: "🌟",
        aircraft: "Airbus A380 SkyLounge",
        origin: { code: "JFK", name: "John F Kennedy", city: "New York", terminal: "4", time: "14:30" },
        destination: { code: "DXB", name: "Dubai International", city: "Dubai", terminal: "3", time: "07:15" },
        duration: "12h 45m",
        durationMinutes: 765,
        cabinClass: "Business",
        seat: "7A",
      },
    ],
  },
  {
    id: "fl-106",
    flightNumber: "LX 317",
    airline: "Swiss Alpine Wings",
    airlineCode: "LX",
    airlineLogo: "🇨🇭",
    aircraft: "Airbus A220-300",
    price: 520,
    currency: "USD",
    stops: 0,
    departureTime: "2026-10-10T10:00:00Z",
    arrivalTime: "2026-10-10T12:00:00Z",
    totalDuration: "2h 00m",
    originCity: "London",
    originCode: "LHR",
    destinationCity: "Zurich",
    destinationCode: "ZRH",
    cabinClass: "Business",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "2x 8kg",
      checkedBag: "2x 32kg included",
      weightKg: 80,
    },
    carbonEmissionKg: 140,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 8,
    aiBadge: "Fastest",
    aiBadgeReason: "Direct flight with express 2h transit and Swiss chocolate lounge hospitality.",
    onTimeRate: 98,
    fareType: "Standard",
    amenities: ["Empty Middle Seat Guarantee", "Swiss Chocolates", "Priority Security", "Lounge Access"],
    segments: [
      {
        id: "seg-106",
        flightNumber: "LX 317",
        airline: "Swiss Alpine Wings",
        airlineCode: "LX",
        airlineLogo: "🇨🇭",
        aircraft: "Airbus A220-300",
        origin: { code: "LHR", name: "Heathrow", city: "London", terminal: "2", time: "10:00" },
        destination: { code: "ZRH", name: "Zurich Airport", city: "Zurich", terminal: "1", time: "12:00" },
        duration: "2h 00m",
        durationMinutes: 120,
        cabinClass: "Business",
      },
    ],
  },
  {
    id: "fl-107",
    flightNumber: "SQ 011",
    airline: "Singapore Celestial",
    airlineCode: "SQ",
    airlineLogo: "🇸🇬",
    aircraft: "Boeing 777-300ER",
    price: 780,
    currency: "USD",
    stops: 0,
    departureTime: "2026-09-18T13:15:00Z",
    arrivalTime: "2026-09-19T06:00:00Z",
    totalDuration: "13h 10m",
    originCity: "London",
    originCode: "LHR",
    destinationCity: "Singapore",
    destinationCode: "SIN",
    cabinClass: "Economy",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "1x 7kg",
      checkedBag: "1x 25kg included",
      weightKg: 32,
    },
    carbonEmissionKg: 460,
    ecoScore: "A",
    refundable: true,
    seatsRemaining: 15,
    aiBadge: "Best Value",
    aiBadgeReason: "World's top rated economy cabin with Book the Cook options and ergonomically engineered seating.",
    onTimeRate: 96,
    fareType: "Flex",
    amenities: ["KrisWorld 1,800+ Media", "Ergonomic Headrest", "Warm Towel Service", "Free Messaging Wi-Fi"],
    segments: [
      {
        id: "seg-107",
        flightNumber: "SQ 011",
        airline: "Singapore Celestial",
        airlineCode: "SQ",
        airlineLogo: "🇸🇬",
        aircraft: "Boeing 777-300ER",
        origin: { code: "LHR", name: "Heathrow", city: "London", terminal: "2", time: "13:15" },
        destination: { code: "SIN", name: "Changi Airport", city: "Singapore", terminal: "3", time: "06:00" },
        duration: "13h 10m",
        durationMinutes: 790,
        cabinClass: "Economy",
      },
    ],
  },
  {
    id: "fl-108",
    flightNumber: "NH 107",
    airline: "ANA All Nippon Sky",
    airlineCode: "NH",
    airlineLogo: "🇯🇵",
    aircraft: "Boeing 787-10 Dreamliner",
    price: 590,
    currency: "USD",
    stops: 0,
    departureTime: "2026-09-12T11:45:00Z",
    arrivalTime: "2026-09-12T18:10:00Z",
    totalDuration: "6h 25m",
    originCity: "San Francisco",
    originCode: "SFO",
    destinationCity: "Tokyo",
    destinationCode: "HND",
    cabinClass: "Economy",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "1x 10kg",
      checkedBag: "2x 23kg included",
      weightKg: 56,
    },
    carbonEmissionKg: 340,
    ecoScore: "A",
    refundable: false,
    seatsRemaining: 7,
    aiBadge: "Cheapest",
    aiBadgeReason: "Lowest nonstop economy rate with generous double 23kg checked baggage included.",
    onTimeRate: 99,
    fareType: "Standard",
    amenities: ["Japanese Bento Service", "Free Sake & Green Tea", "Touchscreen 4K", "Baggage 2x 23kg"],
    segments: [
      {
        id: "seg-108",
        flightNumber: "NH 107",
        airline: "ANA All Nippon Sky",
        airlineCode: "NH",
        airlineLogo: "🇯🇵",
        aircraft: "Boeing 787-10 Dreamliner",
        origin: { code: "SFO", name: "San Francisco Intl", city: "San Francisco", terminal: "I", time: "11:45" },
        destination: { code: "HND", name: "Tokyo Haneda", city: "Tokyo", terminal: "2", time: "18:10" },
        duration: "6h 25m",
        durationMinutes: 385,
        cabinClass: "Economy",
      },
    ],
  },
  {
    id: "fl-109",
    flightNumber: "QR 818",
    airline: "Qatar Horizon",
    airlineCode: "QR",
    airlineLogo: "🇶🇦",
    aircraft: "Airbus A350-1000 QSuite",
    price: 920,
    currency: "USD",
    stops: 1,
    departureTime: "2026-09-22T06:30:00Z",
    arrivalTime: "2026-09-22T21:45:00Z",
    totalDuration: "15h 15m",
    originCity: "San Francisco",
    originCode: "SFO",
    destinationCity: "Tokyo",
    destinationCode: "HND",
    cabinClass: "Business",
    baggageIncluded: true,
    baggageDetails: {
      personalItem: true,
      cabinBag: "2x 10kg",
      checkedBag: "2x 32kg included",
      weightKg: 84,
    },
    carbonEmissionKg: 510,
    ecoScore: "B",
    refundable: true,
    seatsRemaining: 5,
    aiBadge: "Best Value",
    aiBadgeReason: "Award-winning QSuite with double bed option and Doha Al Mourjan lounge access.",
    onTimeRate: 95,
    fareType: "Flex",
    layoverDetails: "2h 10m layover in Doha Hamad International (DOH)",
    amenities: ["QSuite Double Bed Door", "Dippyque Amenity Kit", "À La Carte Dining", "Oryx One 4,000+ Movies", "High-speed Wi-Fi"],
    segments: [
      {
        id: "seg-109a",
        flightNumber: "QR 818",
        airline: "Qatar Horizon",
        airlineCode: "QR",
        airlineLogo: "🇶🇦",
        aircraft: "Airbus A350-1000",
        origin: { code: "SFO", name: "San Francisco Intl", city: "San Francisco", terminal: "I", time: "06:30" },
        destination: { code: "DOH", name: "Doha Hamad Intl", city: "Doha", terminal: "1", time: "16:00" },
        duration: "15h 00m",
        durationMinutes: 900,
        cabinClass: "Business",
      },
      {
        id: "seg-109b",
        flightNumber: "QR 812",
        airline: "Qatar Horizon",
        airlineCode: "QR",
        airlineLogo: "🇶🇦",
        aircraft: "Boeing 777-300ER",
        origin: { code: "DOH", name: "Doha Hamad Intl", city: "Doha", terminal: "1", time: "18:10" },
        destination: { code: "HND", name: "Tokyo Haneda", city: "Tokyo", terminal: "3", time: "21:45" },
        duration: "9h 35m",
        durationMinutes: 575,
        cabinClass: "Business",
      },
    ],
  },
];

export function generateDynamicFlights(originCode: string, destCode: string, originCity: string, destCity: string): FlightOffer[] {
  const airlines = [
    { name: "Quantum Airways", code: "QA", logo: "✈️", aircraft: "Boeing 787-9 Dreamliner" },
    { name: "AeroLuxe International", code: "AL", logo: "🌐", aircraft: "Airbus A350-900" },
    { name: "Emirates Royal Sky", code: "EK", logo: "🌟", aircraft: "Airbus A380-800" },
    { name: "Singapore Celestial", code: "SQ", logo: "🇸🇬", aircraft: "Boeing 777-300ER" },
    { name: "Swiss Alpine Wings", code: "LX", logo: "🇨🇭", aircraft: "Airbus A220-300" },
    { name: "Empyrean Jetways", code: "EJ", logo: "✨", aircraft: "Airbus A380 SkySuite" },
  ];

  const results: FlightOffer[] = [];
  const basePrices = [420, 580, 790, 1150, 360, 890];
  const badges: ("Cheapest" | "Fastest" | "Best Value" | "Best Match")[] = ["Cheapest", "Fastest", "Best Match", "Best Value", "Cheapest", "Best Match"];

  airlines.forEach((air, idx) => {
    const isDirect = idx % 2 === 0 || idx === 1;
    const cabin = idx === 0 ? "Economy" : idx === 1 ? "Premium Economy" : idx === 2 ? "Business" : idx === 3 ? "Economy" : idx === 4 ? "Business" : "First";
    const depHour = 6 + idx * 3;
    const depTimeStr = `${String(depHour).padStart(2, "0")}:30`;
    const durationHours = isDirect ? 5 + (idx % 4) : 9 + (idx % 3);
    const arrHour = (depHour + durationHours) % 24;
    const arrTimeStr = `${String(arrHour).padStart(2, "0")}:15`;
    const price = basePrices[idx] + Math.floor(Math.random() * 50);

    results.push({
      id: `fl-dyn-${originCode.toLowerCase()}-${destCode.toLowerCase()}-${idx + 1}`,
      flightNumber: `${air.code} ${200 + idx * 117}`,
      airline: air.name,
      airlineCode: air.code,
      airlineLogo: air.logo,
      aircraft: air.aircraft,
      price,
      currency: "USD",
      stops: isDirect ? 0 : 1,
      departureTime: `2026-09-18T${depTimeStr}:00Z`,
      arrivalTime: `2026-09-18T${arrTimeStr}:00Z`,
      totalDuration: `${durationHours}h 45m`,
      originCity: originCity || "Departure City",
      originCode: originCode || "DEP",
      destinationCity: destCity || "Arrival City",
      destinationCode: destCode || "ARR",
      cabinClass: cabin,
      baggageIncluded: idx !== 0,
      baggageDetails: {
        personalItem: true,
        cabinBag: "1x 8kg",
        checkedBag: cabin === "Economy" ? "1x 23kg included" : "2x 32kg included",
        weightKg: cabin === "Economy" ? 31 : 74,
      },
      carbonEmissionKg: 280 + idx * 45,
      ecoScore: idx % 2 === 0 ? "A" : "B",
      refundable: idx % 2 !== 0,
      seatsRemaining: 3 + idx * 2,
      aiBadge: badges[idx],
      aiBadgeReason:
        badges[idx] === "Cheapest"
          ? "Unmatched lowest guaranteed round-trip rate."
          : badges[idx] === "Fastest"
          ? "Direct nonstop route with shortest airborne transit time."
          : badges[idx] === "Best Match"
          ? "Top scoring itinerary combining on-time reliability, baggage perks & comfort."
          : "Maximum cabin luxury, refundability & lounge access per dollar.",
      onTimeRate: 92 + (idx % 8),
      fareType: cabin === "First" || cabin === "Business" ? "VIP" : idx % 2 === 0 ? "Standard" : "Flex",
      layoverDetails: !isDirect ? `1h 50m layover in Hub Airport (${air.code === "EK" ? "DXB" : air.code === "SQ" ? "SIN" : "LHR"})` : undefined,
      amenities:
        cabin === "First"
          ? ["Private Suite", "Caviar & Champagne", "Shower Spa", "Starlink Ultra", "Chauffeur"]
          : cabin === "Business"
          ? ["Lie-flat Seat", "Gourmet Dining", "Lounge Access", "Fast Wi-Fi", "Priority Baggage"]
          : ["Complimentary Snack", "In-seat USB", "Seatback Media", "Beverage Service"],
      segments: isDirect
        ? [
            {
              id: `seg-${idx}-1`,
              flightNumber: `${air.code} ${200 + idx * 117}`,
              airline: air.name,
              airlineCode: air.code,
              airlineLogo: air.logo,
              aircraft: air.aircraft,
              origin: { code: originCode, name: `${originCity} Intl`, city: originCity, terminal: "1", time: depTimeStr },
              destination: { code: destCode, name: `${destCity} Intl`, city: destCity, terminal: "2", time: arrTimeStr },
              duration: `${durationHours}h 45m`,
              durationMinutes: durationHours * 60 + 45,
              cabinClass: cabin,
              seat: cabin === "Business" ? "4K" : undefined,
            },
          ]
        : [
            {
              id: `seg-${idx}-1a`,
              flightNumber: `${air.code} ${200 + idx * 117}`,
              airline: air.name,
              airlineCode: air.code,
              airlineLogo: air.logo,
              aircraft: air.aircraft,
              origin: { code: originCode, name: `${originCity} Intl`, city: originCity, terminal: "1", time: depTimeStr },
              destination: { code: "LHR", name: "London Heathrow", city: "London", terminal: "2", time: "15:00" },
              duration: "6h 00m",
              durationMinutes: 360,
              cabinClass: cabin,
            },
            {
              id: `seg-${idx}-1b`,
              flightNumber: `${air.code} ${500 + idx * 117}`,
              airline: air.name,
              airlineCode: air.code,
              airlineLogo: air.logo,
              aircraft: "Airbus A320neo",
              origin: { code: "LHR", name: "London Heathrow", city: "London", terminal: "2", time: "16:50" },
              destination: { code: destCode, name: `${destCity} Intl`, city: destCity, terminal: "3", time: arrTimeStr },
              duration: "3h 45m",
              durationMinutes: 225,
              cabinClass: cabin,
            },
          ],
    });
  });

  return results;
}

export function searchFlights(params: {
  origin?: string;
  originCode?: string;
  destination?: string;
  destinationCode?: string;
  cabin?: string;
  maxStops?: string;
  refundableOnly?: boolean;
  baggageIncludedOnly?: boolean;
  maxPrice?: number;
  airlines?: string[];
  departureTimeWindow?: string;
  sortBy?: string;
}): FlightOffer[] {
  const orig = (params.originCode || params.origin || "SFO").toLowerCase().trim();
  const dest = (params.destinationCode || params.destination || "HND").toLowerCase().trim();

  // Find matching seeds or generate dynamic flights
  let pool = [...SEED_COMPREHENSIVE_FLIGHTS];

  // Check if matches existing seeds
  const directMatches = pool.filter(
    (f) =>
      (f.originCode.toLowerCase().includes(orig) || f.originCity.toLowerCase().includes(orig)) &&
      (f.destinationCode.toLowerCase().includes(dest) || f.destinationCity.toLowerCase().includes(dest))
  );

  if (directMatches.length > 0) {
    pool = directMatches;
  } else {
    // Generate flights for this specific route
    const origAirport = POPULAR_AIRPORTS.find((a) => a.code.toLowerCase() === orig || a.city.toLowerCase().includes(orig)) || {
      code: orig.slice(0, 3).toUpperCase(),
      name: `${orig} Airport`,
      city: orig,
      country: "Global",
    };
    const destAirport = POPULAR_AIRPORTS.find((a) => a.code.toLowerCase() === dest || a.city.toLowerCase().includes(dest)) || {
      code: dest.slice(0, 3).toUpperCase(),
      name: `${dest} Airport`,
      city: dest,
      country: "Global",
    };
    pool = generateDynamicFlights(origAirport.code, destAirport.code, origAirport.city, destAirport.city);
  }

  // Filter cabin
  if (params.cabin && params.cabin !== "All Classes" && params.cabin !== "all") {
    pool = pool.filter((f) => f.cabinClass.toLowerCase() === params.cabin?.toLowerCase());
  }

  // Filter stops
  if (params.maxStops === "direct" || params.maxStops === "0") {
    pool = pool.filter((f) => f.stops === 0);
  } else if (params.maxStops === "1") {
    pool = pool.filter((f) => f.stops <= 1);
  }

  // Filter refundable
  if (params.refundableOnly) {
    pool = pool.filter((f) => f.refundable);
  }

  // Filter baggage
  if (params.baggageIncludedOnly) {
    pool = pool.filter((f) => f.baggageIncluded);
  }

  // Filter max price
  if (params.maxPrice && params.maxPrice > 0) {
    pool = pool.filter((f) => f.price <= params.maxPrice!);
  }

  // Filter airlines
  if (params.airlines && params.airlines.length > 0) {
    pool = pool.filter((f) => params.airlines!.includes(f.airline) || params.airlines!.includes(f.airlineCode));
  }

  // Sort
  if (params.sortBy === "cheapest") {
    pool.sort((a, b) => a.price - b.price);
  } else if (params.sortBy === "fastest") {
    const parseDur = (d: string) => {
      const parts = d.match(/(\d+)h\s*(\d+)?m?/);
      return parts ? parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0) : 9999;
    };
    pool.sort((a, b) => parseDur(a.totalDuration) - parseDur(b.totalDuration));
  } else if (params.sortBy === "best_value") {
    pool.sort((a, b) => (b.aiBadge === "Best Value" ? 1 : 0) - (a.aiBadge === "Best Value" ? 1 : 0) || a.price - b.price);
  } else if (params.sortBy === "best_match") {
    pool.sort((a, b) => (b.aiBadge === "Best Match" ? 1 : 0) - (a.aiBadge === "Best Match" ? 1 : 0) || b.onTimeRate! - a.onTimeRate!);
  } else if (params.sortBy === "departure") {
    pool.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  return pool;
}
