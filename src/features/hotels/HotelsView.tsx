import React, { useState, useEffect } from "react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { HotelOffer, HotelRoom, HotelSearchParams } from "../../types";
import { searchHotels, calculateStayPrice, SEED_COMPREHENSIVE_HOTELS } from "./hotelData";
import { HotelSearchPage } from "./pages/HotelSearchPage";
import { HotelResultsPage } from "./pages/HotelResultsPage";
import { HotelDetailsPage } from "./pages/HotelDetailsPage";

type HotelSubView = "search" | "results" | "details";

export const HotelsView: React.FC = () => {
  const { currency, setSelectedHotel, setCheckoutItem } = useTravelStore();
  const { setModule, openAIWithPrompt, openVR } = useUIStore();

  const [subView, setSubView] = useState<HotelSubView>("search");
  const [selectedHotelDetail, setSelectedHotelDetail] = useState<HotelOffer | null>(null);

  // Search parameters state
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
    destination: "Tokyo, Japan",
    checkInDate: "2026-09-12",
    checkOutDate: "2026-09-15",
    guests: { adults: 2, children: 0 },
    rooms: 1,
    sortBy: "ai_match",
  });

  const [hotels, setHotels] = useState<HotelOffer[]>([]);
  const [comparedHotels, setComparedHotels] = useState<HotelOffer[]>([]);

  // Parse URL state on initial mount or popstate
  useEffect(() => {
    const parseUrlState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hotelId = urlParams.get("hotelId");
      const destParam = urlParams.get("destination") || urlParams.get("dest");
      const checkInParam = urlParams.get("checkIn") || "2026-09-12";
      const checkOutParam = urlParams.get("checkOut") || "2026-09-15";
      const adultsParam = parseInt(urlParams.get("adults") || "2", 10);
      const roomsParam = parseInt(urlParams.get("rooms") || "1", 10);
      const viewParam = urlParams.get("hotelView");

      if (destParam) {
        const loadedParams: HotelSearchParams = {
          destination: destParam,
          checkInDate: checkInParam,
          checkOutDate: checkOutParam,
          guests: { adults: adultsParam, children: 0 },
          rooms: roomsParam,
          sortBy: "ai_match",
        };
        setSearchParams(loadedParams);
        const results = searchHotels(loadedParams);
        setHotels(results);

        if (hotelId) {
          const found =
            results.find((h) => h.id === hotelId) ||
            SEED_COMPREHENSIVE_HOTELS.find((h) => h.id === hotelId);
          if (found) {
            setSelectedHotelDetail(found);
            setSubView("details");
            return;
          }
        }

        if (viewParam === "results" || destParam) {
          setSubView("results");
          return;
        }
      }
    };

    parseUrlState();
    window.addEventListener("popstate", parseUrlState);
    return () => window.removeEventListener("popstate", parseUrlState);
  }, []);

  // Update browser URL query string for seamless sharing/bookmarking
  const syncUrl = (view: HotelSubView, params: HotelSearchParams, hotelId?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("hotelView", view);
    url.searchParams.set("destination", params.destination);
    url.searchParams.set("checkIn", params.checkInDate);
    url.searchParams.set("checkOut", params.checkOutDate);
    url.searchParams.set("adults", String(params.guests.adults));
    url.searchParams.set("rooms", String(params.rooms || 1));

    if (hotelId) {
      url.searchParams.set("hotelId", hotelId);
    } else {
      url.searchParams.delete("hotelId");
    }

    window.history.pushState({}, "", url.toString());
  };

  // Perform search
  const handlePerformSearch = (params: HotelSearchParams) => {
    setSearchParams(params);
    const results = searchHotels(params);
    setHotels(results);
    setSubView("results");
    syncUrl("results", params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quick destination jump from landing hero cards
  const handleQuickDestination = (dest: string) => {
    const newParams: HotelSearchParams = {
      ...searchParams,
      destination: dest === "all" ? "" : dest,
      sortBy: "ai_match",
    };
    handlePerformSearch(newParams);
  };

  // Select hotel to view details
  const handleSelectHotel = (hotel: HotelOffer) => {
    setSelectedHotelDetail(hotel);
    setSelectedHotel(hotel);
    setSubView("details");
    syncUrl("details", searchParams, hotel.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Book hotel -> redirect to payments checkout
  const handleBookHotel = (hotel: HotelOffer, room?: HotelRoom) => {
    const chosenRoom = room || hotel.rooms[0];
    const start = new Date(searchParams.checkInDate).getTime();
    const end = new Date(searchParams.checkOutDate).getTime();
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const price = calculateStayPrice(hotel, chosenRoom, nights, searchParams.rooms || 1);

    setSelectedHotel(hotel);
    setCheckoutItem({
      type: "hotel",
      item: hotel,
      travelers: (searchParams.guests.adults || 2) + (searchParams.guests.children || 0),
      dates: { start: searchParams.checkInDate, end: searchParams.checkOutDate },
      totalPrice: price.totalPrice,
    });
    setModule("payments");
  };

  // Ask AI Concierge
  const handleAskAI = (hotel: HotelOffer, queryContext?: string) => {
    const prompt =
      queryContext ||
      `Can you evaluate ${hotel.name} in ${hotel.city}, ${hotel.country}? I want to know about its best suite options, culinary highlights, spa, cancellation flexibility, and overall value.`;
    openAIWithPrompt(prompt);
  };

  // Toggle compare hotel
  const handleToggleCompare = (hotel: HotelOffer) => {
    if (comparedHotels.some((h) => h.id === hotel.id)) {
      setComparedHotels(comparedHotels.filter((h) => h.id !== hotel.id));
    } else {
      if (comparedHotels.length >= 3) {
        alert("You can compare up to 3 hotels at once.");
        return;
      }
      setComparedHotels([...comparedHotels, hotel]);
    }
  };

  return (
    <div className="w-full max-w-full">
      {/* 1. Landing & Search Page (/hotels) */}
      {subView === "search" && (
        <HotelSearchPage
          currency={currency}
          onSearch={handlePerformSearch}
          onSelectHotel={handleSelectHotel}
          onQuickDestination={handleQuickDestination}
        />
      )}

      {/* 2. Results Page (/hotels/results) */}
      {subView === "results" && (
        <HotelResultsPage
          searchParams={searchParams}
          hotels={hotels}
          currency={currency}
          onModifySearch={handlePerformSearch}
          onSelectHotel={handleSelectHotel}
          onBookHotel={handleBookHotel}
          onAskAI={handleAskAI}
          onBackToSearch={() => {
            setSubView("search");
            syncUrl("search", searchParams);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* 3. Details Page (/hotels/[id]) */}
      {subView === "details" && selectedHotelDetail && (
        <HotelDetailsPage
          hotel={selectedHotelDetail}
          currency={currency}
          initialParams={searchParams}
          onBookHotel={handleBookHotel}
          onAskAI={handleAskAI}
          onBackToResults={() => {
            if (hotels.length > 0) {
              setSubView("results");
              syncUrl("results", searchParams);
            } else {
              setSubView("search");
              syncUrl("search", searchParams);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onToggleCompare={handleToggleCompare}
          isCompared={comparedHotels.some((h) => h.id === selectedHotelDetail.id)}
        />
      )}
    </div>
  );
};
