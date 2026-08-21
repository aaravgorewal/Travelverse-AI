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
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getHotelById(id: string): Promise<HotelOffer> {
    return new Promise(resolve => setTimeout(() => resolve({} as HotelOffer), 800));
  },
};

export const packageService = {
  async getPackages(style?: string): Promise<TravelPackage[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getPackageById(id: string): Promise<TravelPackage> {
    return new Promise(resolve => setTimeout(() => resolve({} as TravelPackage), 800));
  },
};

export const experienceService = {
  async getExperiences(category?: string, city?: string): Promise<TravelExperience[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getExperienceById(id: string): Promise<TravelExperience> {
    return new Promise(resolve => setTimeout(() => resolve({} as TravelExperience), 800));
  },
};

export const vrService = {
  async getScenes(): Promise<VRScene[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getSceneById(id: string): Promise<VRScene> {
    return new Promise(resolve => setTimeout(() => resolve({} as VRScene), 800));
  },
};
