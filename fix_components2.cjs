const fs = require('fs');

const replaceInFile = (file, search, replace) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
};

// AIConciergeDrawer.tsx
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'agentPersona: params.agentPersona || "Master Concierge",', '// agentPersona');
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'language: params.language,', '// language');
replaceInFile('src/components/shared/AIConciergeDrawer.tsx', 'response.reply', 'response.message');

// VRViewerModal.tsx
replaceInFile('src/components/shared/VRViewerModal.tsx', 'await aiAPI.chat(\n        sceneId,', 'await aiAPI.chat({ message: "Generate narration for " + sceneTitle, context: { user_id: "u1", role: "traveler" } }');
replaceInFile('src/components/shared/VRViewerModal.tsx', 'sceneTitle,\n        destination\n      );', ');');
replaceInFile('src/components/shared/VRViewerModal.tsx', 'result.audioScript', 'result.message');

// LocalSenseView.tsx
replaceInFile('src/features/destinations/LocalSenseView.tsx', 'res.explanation', 'res.message');

// HomeView.tsx
replaceInFile('src/features/home/HomeView.tsx', 'agentPersona: "Travel Assistant"', '// agentPersona');
replaceInFile('src/features/home/HomeView.tsx', 'res.reply', 'res.message');

// ItineraryView.tsx
replaceInFile('src/features/itinerary/ItineraryView.tsx', 'res.optimizedDays', 'res.data?.optimizedDays');

// TravelPulseView.tsx
replaceInFile('src/features/travelpulse/TravelPulseView.tsx', 'agentPersona: "Crisis Manager"', '// agentPersona');

// Imports in features
const fixPaths = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/['"]\.\.\/\.\.\/lib\/api\/ai['"]/g, '"../../../lib/api/ai"');
  fs.writeFileSync(file, content);
}
fixPaths('src/features/agent/components/AgentCopilot.tsx');
fixPaths('src/features/agent/components/SmartBundleBuilder.tsx');
fixPaths('src/features/ai/components/AITripContextPanel.tsx');
fixPaths('src/features/ai/components/TripGenieForm.tsx');
fixPaths('src/features/trips/components/PackMateAICard.tsx');

// useTravelAI.ts
replaceInFile('src/hooks/useTravelAI.ts', 'import {\n  aiService,', 'import {\n  GenerateTripPlanParams,\n  TripContextData,\n  ChatParams,\n  RecommendParams,\n  ExplainParams,\n  OptimizeParams,\n  ReduceCostParams,\n  PersonalizeParams,\n  PackingListParams,\n  SupportParams,\n  CompareParams,\n  AIRequestOptions,\n} from "../lib/api/ai";\nimport { aiAPI as aiService } from "../lib/api/ai";');

