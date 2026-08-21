import { apiClient } from "./apiClient";
import { HotelOffer, TravelPackage, TravelExperience, VRScene } from "../types";

export interface HotelSearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minRating?: number;
  maxPrice?: number;
  amenities?: string[];
}

export const hotelService = {
  async searchHotels(params?: HotelSearchParams): Promise<HotelOffer[]> {
    return apiClient.get("/hotels", { params });
  },

  async getHotelById(id: string): Promise<HotelOffer> {
    return apiClient.get(`/hotels/${id}`);
  },
};

export const packageService = {
  async getPackages(style?: string): Promise<TravelPackage[]> {
    return apiClient.get("/packages", { params: { style } });
  },

  async getPackageById(id: string): Promise<TravelPackage> {
    return apiClient.get(`/packages/${id}`);
  },
};

export const experienceService = {
  async getExperiences(category?: string, city?: string): Promise<TravelExperience[]> {
    return apiClient.get("/experiences", { params: { category, city } });
  },

  async getExperienceById(id: string): Promise<TravelExperience> {
    return apiClient.get(`/experiences/${id}`);
  },
};

export const vrService = {
  async getScenes(): Promise<VRScene[]> {
    return apiClient.get("/vr/scenes");
  },

  async getSceneById(id: string): Promise<VRScene> {
    return apiClient.get(`/vr/scenes/${id}`);
  },
};
