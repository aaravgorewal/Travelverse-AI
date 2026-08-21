import React, { useState, useEffect } from "react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { FlightOffer, FlightSearchParams } from "../../types";
import { searchFlights, SEED_COMPREHENSIVE_FLIGHTS } from "./flightData";
import { FlightSearchPage } from "./pages/FlightSearchPage";
import { FlightResultsPage } from "./pages/FlightResultsPage";
import { FlightDetailsPage } from "./pages/FlightDetailsPage";

type FlightSubView = "search" | "results" | "details";

export const FlightsView: React.FC = () => {
  const { currency, setSelectedFlight, setCheckoutItem } = useTravelStore();
  const { setModule, openAIWithPrompt } = useUIStore();

  const [subView, setSubView] = useState<FlightSubView>("search");
  const [selectedFlightDetail, setSelectedFlightDetail] = useState<FlightOffer | null>(null);

  // Search parameters
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    origin: "San Francisco (SFO)",
    originCode: "SFO",
    destination: "Tokyo Haneda (HND)",
    destinationCode: "HND",
    departureDate: "2026-09-12",
    returnDate: "2026-09-24",
    tripType: "roundtrip",
    travelers: { adults: 1, children: 0, infants: 0 },
    cabin: "Economy",
    directOnly: false,
  });

  const [flights, setFlights] = useState<FlightOffer[]>([]);

  // Parse URL on initial mount or popstate
  useEffect(() => {
    const parseUrlState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const flightId = urlParams.get("flightId");
      const originParam = urlParams.get("origin");
      const destParam = urlParams.get("dest");
      const originCodeParam = urlParams.get("originCode") || originParam || "SFO";
      const destCodeParam = urlParams.get("destCode") || destParam || "HND";
      const depDateParam = urlParams.get("departureDate") || urlParams.get("dep") || "2026-09-12";
      const retDateParam = urlParams.get("returnDate") || urlParams.get("ret") || "2026-09-24";
      const cabinParam = (urlParams.get("cabin") as any) || "Economy";
      const paxParam = parseInt(urlParams.get("pax") || "1", 10);
      const tripTypeParam = (urlParams.get("tripType") as any) || "roundtrip";
      const viewParam = urlParams.get("view");

      if (originParam && destParam) {
        const loadedParams: FlightSearchParams = {
          origin: originParam,
          originCode: originCodeParam,
          destination: destParam,
          destinationCode: destCodeParam,
          departureDate: depDateParam,
          returnDate: retDateParam,
          tripType: tripTypeParam,
          travelers: { adults: paxParam, children: 0, infants: 0 },
          cabin: cabinParam,
          directOnly: urlParams.get("direct") === "true",
        };
        setSearchParams(loadedParams);
        const results = searchFlights(loadedParams);
        setFlights(results);

        if (flightId) {
          const found = results.find((f) => f.id === flightId) || SEED_COMPREHENSIVE_FLIGHTS.find((f) => f.id === flightId);
          if (found) {
            setSelectedFlightDetail(found);
            setSubView("details");
            return;
          }
        }

        if (viewParam === "results" || originParam) {
          setSubView("results");
          return;
        }
      }
    };

    parseUrlState();
    window.addEventListener("popstate", parseUrlState);
    return () => window.removeEventListener("popstate", parseUrlState);
  }, []);

  // Update browser URL query string for sharing/bookmarking
  const syncUrl = (view: FlightSubView, params: FlightSearchParams, flightId?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    url.searchParams.set("origin", params.origin);
    url.searchParams.set("originCode", params.originCode);
    url.searchParams.set("dest", params.destination);
    url.searchParams.set("destCode", params.destinationCode);
    url.searchParams.set("departureDate", params.departureDate);
    if (params.returnDate) {
      url.searchParams.set("returnDate", params.returnDate);
    } else {
      url.searchParams.delete("returnDate");
    }
    url.searchParams.set("cabin", params.cabin);
    url.searchParams.set("pax", String(params.travelers.adults + params.travelers.children));
    url.searchParams.set("tripType", params.tripType);

    if (flightId) {
      url.searchParams.set("flightId", flightId);
    } else {
      url.searchParams.delete("flightId");
    }

    window.history.pushState({}, "", url.toString());
  };

  // Search handler triggered from Search Page or Modify bar
  const handleExecuteSearch = (newParams: FlightSearchParams) => {
    setSearchParams(newParams);
    const results = searchFlights(newParams);
    setFlights(results);
    setSubView("results");
    syncUrl("results", newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quick route card click
  const handleQuickRoute = (fromCity: string, fromCode: string, toCity: string, toCode: string) => {
    const nextParams: FlightSearchParams = {
      ...searchParams,
      origin: `${fromCity} (${fromCode})`,
      originCode: fromCode,
      destination: `${toCity} (${toCode})`,
      destinationCode: toCode,
    };
    handleExecuteSearch(nextParams);
  };

  // Select flight to open full details page
  const handleSelectFlight = (flight: FlightOffer) => {
    setSelectedFlightDetail(flight);
    setSubView("details");
    syncUrl("details", searchParams, flight.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Book flight & proceed to payment checkout
  const handleBookFlight = (flight: FlightOffer, selectedSeat?: string, carbonOffsetOptIn?: boolean) => {
    setSelectedFlight(flight);
    const totalTravelers = searchParams.travelers.adults + searchParams.travelers.children;
    const carbonCost = carbonOffsetOptIn ? 18 : 0;
    const taxes = Math.round(flight.price * 0.14);
    const totalPrice = (flight.price + taxes + carbonCost) * totalTravelers;

    setCheckoutItem({
      type: "flight",
      item: {
        ...flight,
        selectedSeat: selectedSeat || "3A",
      },
      travelers: totalTravelers,
      dates: {
        start: flight.departureTime,
        end: flight.arrivalTime,
      },
      totalPrice,
    });

    setModule("payments");
  };

  // Ask AI Concierge with deep contextual prompt
  const handleAskAI = (flight: FlightOffer) => {
    const prompt = `I am reviewing this flight option on TravelVerse:
- Airline: ${flight.airline} (${flight.flightNumber || flight.airlineCode})
- Route: ${flight.originCity} (${flight.originCode}) to ${flight.destinationCity} (${flight.destinationCode})
- Cabin Class: ${flight.cabinClass}
- Total Price: $${flight.price} (${flight.currency})
- Duration: ${flight.totalDuration}, Stops: ${flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop (${flight.layoverDetails || ""})`}
- AI Tag: ${flight.aiBadge || "Standard Match"} (${flight.aiBadgeReason || ""})
- Baggage: ${flight.baggageIncluded ? "Checked bag included" : "Carry-on only"}
- Eco Score: Grade ${flight.ecoScore} (${flight.carbonEmissionKg} kg CO2)
- On-Time Performance: ${flight.onTimeRate || 88}%

Please provide an expert flight analysis:
1. Is this price and cabin quality a great value for this route?
2. What are the pros & cons regarding the aircraft type, baggage allowance, and layover?
3. Any smart tips for seat selection or maximizing miles/comfort?`;

    openAIWithPrompt(prompt);
  };

  // Render sub-page views
  return (
    <div className="w-full">
      {subView === "search" && (
        <FlightSearchPage
          currency={currency}
          onSearch={handleExecuteSearch}
          onSelectFlight={handleSelectFlight}
          onQuickRoute={handleQuickRoute}
        />
      )}

      {subView === "results" && (
        <FlightResultsPage
          searchParams={searchParams}
          flights={flights.length > 0 ? flights : searchFlights(searchParams)}
          currency={currency}
          onModifySearch={handleExecuteSearch}
          onSelectFlight={handleSelectFlight}
          onAskAI={handleAskAI}
          onBackToSearch={() => {
            setSubView("search");
            syncUrl("search", searchParams);
          }}
        />
      )}

      {subView === "details" && selectedFlightDetail && (
        <FlightDetailsPage
          flight={selectedFlightDetail}
          currency={currency}
          onBack={() => {
            setSubView("results");
            syncUrl("results", searchParams);
          }}
          onBookFlight={handleBookFlight}
          onAskAI={handleAskAI}
        />
      )}
    </div>
  );
};
