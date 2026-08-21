const fs = require('fs');

const replaceInFile = (file, search, replace) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
};

// AIConciergeDrawer.tsx
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'import { aiAPI, analyticsService } from "../../services";', 'import { analyticsService } from "../../services";\nimport { aiAPI } from "../../lib/api/ai";');
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'await aiAPI.chatWithConcierge(', 'await aiAPI.chat(');
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'reply: response.reply,', 'reply: response.message,');
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'suggestedActions: response.suggestedActions', 'suggestedActions: response.data?.suggestedPrompts || []');

// DealScopeDrawer.tsx
replaceInFile('src/components/shared/DealScopeDrawer.tsx', 'res.explanation', 'res.message');
replaceInFile('src/components/shared/DealScopeDrawer.tsx', 'res.pros', 'res.data?.pros || []');
replaceInFile('src/components/shared/DealScopeDrawer.tsx', 'res.cons', 'res.data?.cons || []');

// VRViewerModal.tsx
replaceInFile('src/components/shared/VRViewerModal.tsx', 'import { aiAPI, analyticsService } from "../../services";', 'import { analyticsService } from "../../services";\nimport { aiAPI } from "../../lib/api/ai";');
replaceInFile('src/components/shared/VRViewerModal.tsx', 'await aiAPI.generateVRNarration(', 'await aiAPI.chat(');
replaceInFile('src/components/shared/VRViewerModal.tsx', 'audioScript: result.audioScript', 'audioScript: result.message');
replaceInFile('src/components/shared/VRViewerModal.tsx', 'voiceActor: result.voiceActor', 'voiceActor: result.data?.voiceActor || "default"');

// AgentPortalView.tsx
replaceInFile('src/features/agent/AgentPortalView.tsx', 'import.meta.env.VITE_MOCK_MODE', 'import.meta.env?.VITE_MOCK_MODE');

// CustomersView.tsx
replaceInFile('src/features/customers/CustomersView.tsx', 'res.personalizedAdvice', 'res.message');

// LocalSenseView.tsx
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.explanation', 'res.message');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.keyTakeaways', 'res.data?.keyTakeaways || []');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.cons', 'res.data?.cons || []');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.recommendations', 'res.data?.recommendations || []');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.summary', 'res.message');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'await aiAPI.chat({ message: `Translate', 'await aiAPI.chat({ message: `Translate this to the local language of ${destination}: "${translationText}". Only provide the translation and pronunciation.`, context: { user_id: "agent", role: "agent" } })');
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.reply', 'res.message');

// HomeView.tsx
replaceInFile('src/features/home/HomeView.tsx', 'conversationHistory: [', '// conversationHistory: [');
replaceInFile('src/features/home/HomeView.tsx', 'res.reply', 'res.message');
replaceInFile('src/features/home/HomeView.tsx', 'res.suggestedPrompts', 'res.data?.suggestedPrompts || []');
replaceInFile('src/features/home/HomeView.tsx', 'await aiAPI.chat({', 'await aiAPI.chat({\n          context: { user_id: "1", role: "traveler" },');

// ItineraryView.tsx
replaceInFile('src/features/itinerary/ItineraryView.tsx', 'await aiAPI.optimizeItinerary(activeTrip!.id, activeTrip!.days)', 'await aiAPI.optimizeItinerary({ trip_id: activeTrip!.id })');
replaceInFile('src/features/itinerary/ItineraryView.tsx', 'res.optimizedDays', 'res.data?.optimizedDays || []');
replaceInFile('src/features/itinerary/ItineraryView.tsx', 'res.timeSavedMinutes', 'res.data?.timeSavedMinutes || 0');
replaceInFile('src/features/itinerary/ItineraryView.tsx', 'res.carbonSavedKg', 'res.data?.carbonSavedKg || 0');

// TravelPulseView.tsx
replaceInFile('src/features/travelpulse/TravelPulseView.tsx', 'agentPersona: "Crisis Manager"', '// agentPersona: "Crisis Manager"');
replaceInFile('src/features/travelpulse/TravelPulseView.tsx', 'res.reply', 'res.message');
replaceInFile('src/features/travelpulse/TravelPulseView.tsx', 'await aiAPI.chat({', 'await aiAPI.chat({\n        context: { user_id: "agent", role: "agent" },');

// Services index
replaceInFile('src/services/index.ts', 'export * from "./aiService";', '// export * from "./aiService";');

