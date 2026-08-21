import { apiClient } from "./apiClient";
import { FlightOffer } from "../types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: "Economy" | "Premium Economy" | "Business" | "First";
  maxStops?: number;
  maxPrice?: number;
}

export const flightService = {
  async searchFlights(params?: FlightSearchParams): Promise<FlightOffer[]> {
    return apiClient.get("/flights", { params });
  },

  async getFlightById(id: string): Promise<FlightOffer> {
    return apiClient.get(`/flights/${id}`);
  },

  async getSeatMap(flightId: string): Promise<{ availableSeats: string[]; occupiedSeats: string[]; seatClasses: Record<string, string> }> {
    return apiClient.get(`/flights/${flightId}/seatmap`);
  },
};
