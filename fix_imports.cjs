const fs = require('fs');
const path = require('path');

const filesToFix = [
  "src/features/customers/CustomersView.tsx",
  "src/features/home/HomeView.tsx",
  "src/features/destinations/LocalSenseView.tsx",
  "src/features/agent/components/AgentCopilot.tsx",
  "src/features/agent/components/SmartBundleBuilder.tsx",
  "src/features/travelpulse/TravelPulseView.tsx",
  "src/features/support/SupportView.tsx",
  "src/features/ai/TripGenieView.tsx",
  "src/features/ai/AIPlannerView.tsx",
  "src/features/ai/types.ts",
  "src/features/ai/components/TripGenieForm.tsx",
  "src/features/ai/components/AITripContextPanel.tsx",
  "src/features/itinerary/ItineraryView.tsx",
  "src/features/trips/components/PackMateAICard.tsx",
  "src/components/shared/VRViewerModal.tsx",
  "src/components/shared/DealScopeDrawer.tsx",
  "src/components/shared/AIConciergeDrawer.tsx",
  "src/services/index.ts"
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace imports
  content = content.replace(/import\s+\{.*aiService.*\}\s+from\s+["'].*services(?:.*)["'];/g, 'import { aiAPI } from "../../lib/api/ai";');
  content = content.replace(/import\s+aiService\s+from\s+["'].*services\/aiService["'];/g, 'import { aiAPI } from "../../lib/api/ai";');
  content = content.replace(/import.*from\s+["'].*services\/aiService["'];/g, 'import { aiAPI } from "../../lib/api/ai";');
  
  // Replace usage
  content = content.replace(/aiService\./g, 'aiAPI.');
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
