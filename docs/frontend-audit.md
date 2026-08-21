# TRAVELVERSE AI - Frontend Audit

## 1. System Overview
- **Framework**: Vite + React
- **Package Manager**: NPM (`package-lock.json` present) & Bun (`bun.lock` present)
- **Routing System**: Global Zustand Store (`useUIStore.ts` utilizing a `setModule` pattern) rather than file-based routing.
- **Authentication**: `useAuthStore.ts` mapping to `authService.ts` (JWT/Bearer pattern).
- **State Management**: Zustand (`useUIStore.ts`, `useTravelStore.ts`, `useAuthStore.ts`, `useI18nStore.ts`).
- **API Layer**: Centralized via `src/services/apiClient.ts` (wrapped Axios with exponential retry logic via `axios-retry`).
- **TypeScript Types**: `src/types/index.ts` containing schemas like `UserProfile`, `FlightOffer`, `HotelOffer`, `TripData`.

## 2. Core Modules
- **Dashboards**: `AgentPortalView.tsx`, `AdminDashboardView.tsx`, `HomeView.tsx`
- **Traveler Pages**: `HomeView.tsx`, `ProfileView.tsx`, `TripsView.tsx`
- **Agent Pages**: `AgentPortalView.tsx`, `CustomersView.tsx`, `AgentAlerts.tsx`, `DocuSwift.tsx`, `SmartBundleBuilder.tsx`, `AgentCopilot.tsx`
- **Trip Pages**: `ItineraryView.tsx`, `TripGenieDisplay.tsx`, `AIPlannerView.tsx`
- **Booking Pages**: `PaymentsView.tsx`, `PackagesView.tsx`
- **Forms**: `TripGenieForm.tsx`, `FlightSearchForm.tsx`, `HotelSearchForm.tsx`
- **Maps**: Handled within `ItineraryView.tsx` and specific search pages.
- **Chat**: `AIConciergeDrawer.tsx`, `AIChatMessage.tsx`
- **Notifications**: `NotificationsView.tsx`, globally integrated `Toast` UI.
- **Profile/Customer Components**: `ProfileView.tsx`, `CustomersView.tsx`

---

## 3. AI Component Audit

### 3.1 TripGenie (Plan Trip)
- **Component**: `TripGenieForm.tsx` -> `AIPlannerView.tsx`
- **File Path**: `src/features/ai/components/TripGenieForm.tsx`
- **Current Behavior**: Submits destination/budget/dates to generate a full multi-day itinerary.
- **Expected AI Behavior**: Context-aware orchestration parsing dates and preferences into a structured JSON `TripData` response.
- **Required Endpoint**: `POST /api/v1/ai/plan-trip`
- **Request Payload**: `{ destination, dates, budget, travelers, style, origin, preferences }`
- **Response Payload**: `TripData` (Array of days, activities, cost estimates).
- **Loading State**: Handled natively in `AIPlannerView.tsx` via `isGenerating` flag.
- **Error State**: Surfaces network/LLM errors via `useToast` (Error notification).
- **Empty State**: Renders default input form.

### 3.2 AI Concierge (Chat)
- **Component**: `AIConciergeDrawer.tsx`
- **File Path**: `src/components/shared/AIConciergeDrawer.tsx`
- **Current Behavior**: Global slide-out conversational interface for travelers.
- **Expected AI Behavior**: Conversational multi-turn RAG retrieval and itinerary modification.
- **Required Endpoint**: `POST /api/v1/ai/chat` (Also `chatWithConcierge`)
- **Request Payload**: `{ message, conversationHistory, agentPersona }`
- **Response Payload**: `{ reply, suggestedPrompts }`
- **Loading State**: Typing indicator skeleton inside chat window.
- **Error State**: Appends a styled system error message in the chat history bubble.
- **Empty State**: Renders a "How can I help you today?" welcome screen.

### 3.3 DealScope (Compare)
- **Component**: `DealScopeDrawer.tsx`
- **File Path**: `src/components/shared/DealScopeDrawer.tsx`
- **Current Behavior**: Compares 2-3 hotels/flights via AI matrix.
- **Expected AI Behavior**: LLM evaluates JSON parameters of items and returns a comparative analysis highlighting the best value.
- **Required Endpoint**: `POST /api/v1/ai/compare` / `explain`
- **Request Payload**: `{ topic, context }` (Serialized items)
- **Response Payload**: `{ explanation, pros, cons }`
- **Loading State**: Spinners over the comparison table.
- **Error State**: Toast notification + fallback to standard table view without AI insights.
- **Empty State**: Prompt to "Add another item to compare".

### 3.4 PackMate (Packing List)
- **Component**: `PackMateAICard.tsx`
- **File Path**: `src/features/trips/components/PackMateAICard.tsx`
- **Current Behavior**: Generates contextual packing list based on destination weather.
- **Expected AI Behavior**: LLM processes weather, length of stay, and activities to suggest necessary items.
- **Required Endpoint**: `POST /api/v1/ai/packing-list`
- **Request Payload**: `{ destination, duration, weather, style }`
- **Response Payload**: `{ categories: [{ name, items }] }`
- **Loading State**: Skeleton list items.
- **Error State**: Error Toast indicating generation failure.
- **Empty State**: "Click to generate your custom packing list".

### 3.5 Agent Copilot (B2B Assist)
- **Component**: `AgentCopilot.tsx`
- **File Path**: `src/features/agent/components/AgentCopilot.tsx`
- **Current Behavior**: Floating assistant for B2B travel agents to generate quotes/drafts.
- **Expected AI Behavior**: CRM-aware AI that validates packages and drafts communications.
- **Required Endpoint**: `POST /api/v1/ai/plan-trip` (and personalize/support)
- **Request Payload**: `{ clientContext, destination, margin }`
- **Response Payload**: `{ packageProposal, draftEmail }`
- **Loading State**: Skeleton blocks within the copilot modal.
- **Error State**: Error Toast surfacing API rejection.
- **Empty State**: Initial prompt input field for the agent.

### 3.6 Itinerary Optimizer
- **Component**: `ItineraryView.tsx`
- **File Path**: `src/features/itinerary/ItineraryView.tsx`
- **Current Behavior**: "Optimize Route" button recalculates daily activities for efficiency.
- **Expected AI Behavior**: Deterministic + Semantic rerouting of activities to minimize transit time and carbon output.
- **Required Endpoint**: `POST /api/v1/ai/optimize`
- **Request Payload**: `{ tripId, days: DayPlan[] }`
- **Response Payload**: `{ optimizedDays, timeSavedMinutes, carbonSavedKg }`
- **Loading State**: Disable button + spinner.
- **Error State**: Toast notification on failure.
- **Empty State**: N/A (Only active when itinerary exists).

### 3.7 VR Narration (Spatial)
- **Component**: `VRViewerModal.tsx`
- **File Path**: `src/components/shared/VRViewerModal.tsx`
- **Current Behavior**: Generates spatial audio script for 360 images.
- **Expected AI Behavior**: LLM generates a short, engaging voiceover script based on the scene metadata.
- **Required Endpoint**: `POST /api/v1/ai/vr-narration` (Currently stubbed on frontend due to backend absence)
- **Request Payload**: `{ sceneId, title, context }`
- **Response Payload**: `{ audioUrl, transcript }`
- **Loading State**: Pulsing indicator on the VR AI button.
- **Error State**: Silently fails/defaults to no audio.
- **Empty State**: N/A.

---

## 4. Integration Gaps & Missing Backend Dependencies

1. **VR Narration & Visa Check APIs**: The frontend expects `/api/v1/ai/vr-narration` and `/api/v1/ai/visa-check`, which do not exist in the current backend contract. The frontend currently stubs these with manual delays.
2. **Payment Processing Integration**: `PaymentsView.tsx` simulates Stripe/Razorpay locally. The backend requires a real payment intent gateway (e.g., `POST /api/v1/payments/intent`).
3. **SSE (Server-Sent Events) for AI Chat**: The current implementation for AI chat uses standard REST (`POST /api/v1/ai/chat`) and waits for the entire response. A proper LLM implementation should utilize streaming (SSE) to update the UI iteratively. The frontend `AIChatMessage` does not currently handle streaming tokens natively.
4. **Agent CRM Linkage**: `CustomersView.tsx` and `SmartBundleBuilder.tsx` attempt to link CRM profiles with generated packages, but the backend lacks relational integrity for these mock datasets.
5. **Weather & Geocoding Adapters**: The frontend expects dynamic weather data in itineraries, but the backend is currently serving hardcoded seed data for `weatherForecast`. A live API adapter (e.g., OpenWeather) is required on the backend.
