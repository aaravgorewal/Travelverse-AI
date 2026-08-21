# AI Feature Integration Matrix

| Feature | Frontend Component | API Function | HTTP Endpoint | Backend Service | AI Service | Database Tables | External APIs | Response Schema | Test | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Copilot Chat | `AgentPortalView.tsx` | `useTravelAI().chat()` | `POST /api/v1/copilot/chat` | `TravelAIOrchestrator` | `GeminiProvider` | `Conversation`, `Message`, `AgentPreference` | RAG, TBO | `ChatResponse` | E2E `agent_journey` | Linked |
| TripGenie | `ItineraryView.tsx` | `useTravelAI().planTrip()` | `POST /api/v1/ai/plan-trip` | `TravelAIOrchestrator` | `GeminiProvider` | `Trip`, `TripDay`, `Activity` | Google Routes | `PlanTripResponse` | E2E `traveler_journey` | Linked |
| LocalSense | `LocalSenseView.tsx` | `useTravelAI().recommend()` | `POST /api/v1/ai/local-sense` | `RAGService` | `GeminiProvider` | `KnowledgeDocument` | Google Places | `RecommendResponse` | Unit Tested | Linked |
| SmartCompare | `FlightComparisonDrawer.tsx` | `useTravelAI().compare()` | `POST /api/v1/ai/compare` | `ActionGateway` | `GeminiProvider` | None (Stateless) | None | `CompareResponse` | Unit Tested | Missing UI Hook |
| Explain | `FlightCard.tsx` | `useTravelAI().explain()` | `POST /api/v1/ai/explain` | `ActionGateway` | `GeminiProvider` | None (Stateless) | None | `ExplainResponse` | Unit Tested | Linked |
| Optimize Transit | `ItineraryView.tsx` | `useTravelAI().optimize()` | `POST /api/v1/ai/optimize-itinerary` | `TravelAIOrchestrator` | `GeminiProvider` | `Trip`, `TripDay` | Google Routes | `OptimizeResponse` | Missing Tests | Linked |
| Optimize Budget | `SmartBundleBuilder.tsx` | `useTravelAI().reduceCost()` | `POST /api/v1/ai/optimize-budget` | `TravelAIOrchestrator` | `GeminiProvider` | `Booking` | None | `ReduceCostResponse` | Missing Tests | Linked |
| PackMate | `PackMateAICard.tsx` | `useTravelAI().packingList()` | `POST /api/v1/ai/packing-list` | `TravelAIOrchestrator` | `GeminiProvider` | None | OpenWeather | `PackingListResponse` | E2E `traveler_journey` | Linked |
| SafeNest Support | `SupportView.tsx` | `useTravelAI().support()` | `POST /api/v1/ai/support` | `TravelAIOrchestrator` | `GeminiProvider` | `Booking` | TBO | `SupportResponse` | Missing Tests | Missing UI Hook |
| TravelPulse | `TravelPulseView.tsx` | `useTravelAI().travelPulse()` | `GET /api/v1/ai/travel-pulse` | `TravelAIOrchestrator` | `GeminiProvider` | `Alert`, `Notification` | Weather APIs | `TravelPulseResponse` | E2E `traveler_journey` | Missing DB Link |
