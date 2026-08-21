import { useEffect, useCallback } from "react";
import { SearchFilterState } from "../../types";
import { UniversalCategory, INITIAL_SEARCH_FILTERS } from "./universalSearchService";

export function parseFiltersFromUrl(): Partial<SearchFilterState> {
  if (typeof window === "undefined") return {};

  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const path = url.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  const parsed: Partial<SearchFilterState> = {};

  // Detect category from pathname or query param
  let category: UniversalCategory = "all";
  if (path === "hotels" || searchParams.get("category") === "hotels" || searchParams.get("type") === "hotels") {
    category = "hotels";
  } else if (path === "flights" || searchParams.get("category") === "flights" || searchParams.get("type") === "flights") {
    category = "flights";
  } else if (path === "packages" || searchParams.get("category") === "packages" || searchParams.get("type") === "packages") {
    category = "packages";
  } else if (path === "transfers" || searchParams.get("category") === "transfers" || searchParams.get("type") === "transfers") {
    category = "transfers";
  } else if (path === "cars" || searchParams.get("category") === "cars" || searchParams.get("type") === "cars") {
    category = "cars";
  } else if (path === "experiences" || searchParams.get("category") === "experiences" || searchParams.get("type") === "experiences") {
    category = "experiences";
  } else if (searchParams.get("category")) {
    category = (searchParams.get("category") as UniversalCategory) || "all";
  }
  parsed.category = category;

  // Search keyword query
  const q = searchParams.get("q") || searchParams.get("query") || searchParams.get("search");
  if (q) parsed.query = q;

  // Destination / Location
  const dest = searchParams.get("destination") || searchParams.get("dest") || searchParams.get("location") || searchParams.get("city");
  if (dest) parsed.destination = dest;

  // Origin
  const orig = searchParams.get("origin") || searchParams.get("from");
  if (orig) parsed.origin = orig;

  // Dates
  const dateStart = searchParams.get("dateStart") || searchParams.get("departure") || searchParams.get("checkIn") || searchParams.get("from_date");
  if (dateStart) parsed.dateStart = dateStart;

  const dateEnd = searchParams.get("dateEnd") || searchParams.get("return") || searchParams.get("checkOut") || searchParams.get("to_date");
  if (dateEnd) parsed.dateEnd = dateEnd;

  // Budget / Price
  const budget = searchParams.get("budget") || searchParams.get("maxPrice") || searchParams.get("priceMax");
  if (budget && !isNaN(Number(budget))) parsed.maxPrice = Number(budget);

  const minPrice = searchParams.get("minPrice") || searchParams.get("priceMin");
  if (minPrice && !isNaN(Number(minPrice))) parsed.minPrice = Number(minPrice);

  // Rating
  const rating = searchParams.get("rating") || searchParams.get("minRating");
  if (rating && !isNaN(Number(rating))) parsed.minRating = Number(rating);

  // Free cancellation
  const cancellation = searchParams.get("cancellation") || searchParams.get("freeCancellation");
  if (cancellation === "true" || cancellation === "free" || cancellation === "1") {
    parsed.freeCancellationOnly = true;
  }

  // Amenities (comma separated or multiple)
  const amenities = searchParams.get("amenities");
  if (amenities) {
    parsed.amenities = amenities.split(",").map((a) => a.trim()).filter(Boolean);
  }

  // Travel styles
  const styles = searchParams.get("travelStyles") || searchParams.get("style");
  if (styles) {
    parsed.travelStyles = styles.split(",").map((s) => s.trim()).filter(Boolean);
  }

  // Sub-filters
  const flightClass = searchParams.get("class") || searchParams.get("flightClass");
  if (flightClass) parsed.flightClass = flightClass;

  const carCategory = searchParams.get("carCategory") || searchParams.get("carType");
  if (carCategory) parsed.carCategory = carCategory;

  const transmission = searchParams.get("transmission");
  if (transmission) parsed.transmission = transmission;

  const transferType = searchParams.get("transferType");
  if (transferType) parsed.transferType = transferType;

  // Sort
  const sortBy = searchParams.get("sort") || searchParams.get("sortBy");
  if (sortBy) parsed.sortBy = sortBy as any;

  // Pagination
  const page = searchParams.get("page");
  if (page && !isNaN(Number(page))) parsed.page = Math.max(1, Number(page));

  const limit = searchParams.get("limit") || searchParams.get("itemsPerPage");
  if (limit && !isNaN(Number(limit))) parsed.itemsPerPage = Math.max(1, Number(limit));

  return parsed;
}

export function buildSearchUrl(filters: SearchFilterState): string {
  const params = new URLSearchParams();

  // If on a specific category, we can format cleanly as e.g. /hotels?destination=dubai&budget=15000&rating=4
  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.query && filters.query.trim()) {
    params.set("q", filters.query.trim());
  }

  if (filters.destination && filters.destination.trim()) {
    params.set("destination", filters.destination.trim());
  }

  if (filters.origin && filters.origin.trim()) {
    params.set("origin", filters.origin.trim());
  }

  if (filters.dateStart) {
    params.set("dateStart", filters.dateStart);
  }

  if (filters.dateEnd) {
    params.set("dateEnd", filters.dateEnd);
  }

  if (filters.maxPrice && filters.maxPrice < 10000) {
    params.set("budget", filters.maxPrice.toString());
  }

  if (filters.minPrice && filters.minPrice > 0) {
    params.set("minPrice", filters.minPrice.toString());
  }

  if (filters.minRating && filters.minRating > 0) {
    params.set("rating", filters.minRating.toString());
  }

  if (filters.freeCancellationOnly) {
    params.set("cancellation", "free");
  }

  if (filters.amenities && filters.amenities.length > 0) {
    params.set("amenities", filters.amenities.join(","));
  }

  if (filters.travelStyles && filters.travelStyles.length > 0) {
    params.set("travelStyles", filters.travelStyles.join(","));
  }

  if (filters.flightClass && filters.flightClass !== "all") {
    params.set("flightClass", filters.flightClass);
  }

  if (filters.carCategory && filters.carCategory !== "all") {
    params.set("carCategory", filters.carCategory);
  }

  if (filters.transmission && filters.transmission !== "all") {
    params.set("transmission", filters.transmission);
  }

  if (filters.transferType && filters.transferType !== "all") {
    params.set("transferType", filters.transferType);
  }

  if (filters.sortBy && filters.sortBy !== "recommended") {
    params.set("sort", filters.sortBy);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", filters.page.toString());
  }

  if (filters.itemsPerPage && filters.itemsPerPage !== 9) {
    params.set("limit", filters.itemsPerPage.toString());
  }

  const queryString = params.toString();
  const basePath = filters.category && filters.category !== "all" ? `/${filters.category}` : "/search";
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function useSearchUrlSync(
  filters: SearchFilterState,
  onUrlFiltersChange: (newFilters: Partial<SearchFilterState>) => void
) {
  // Sync state to URL on filter changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const newRelativeUrl = buildSearchUrl(filters);
    const currentRelativeUrl = window.location.pathname + window.location.search;

    if (newRelativeUrl !== currentRelativeUrl) {
      window.history.replaceState({ filters }, "", newRelativeUrl);
    }
  }, [filters]);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const parsed = parseFiltersFromUrl();
      onUrlFiltersChange(parsed);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onUrlFiltersChange]);

  const copyShareableLink = useCallback(async (): Promise<string> => {
    if (typeof window === "undefined") return "";
    const relativeUrl = buildSearchUrl(filters);
    const fullUrl = window.location.origin + relativeUrl;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      }
    } catch {
      // Fallback
    }
    return fullUrl;
  }, [filters]);

  return {
    copyShareableLink,
    getShareableUrl: () => (typeof window !== "undefined" ? window.location.origin + buildSearchUrl(filters) : ""),
  };
}
