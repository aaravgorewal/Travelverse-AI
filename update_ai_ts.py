with open("src/lib/api/ai.ts", "r") as f:
    content = f.read()

# Replace all "payload: any" with specific interfaces.
new_interfaces = """
export interface OptimizeItineraryRequest { itinerary_id: string; preferences?: any; constraints?: any; }
export interface OptimizeBudgetRequest { trip_id: string; target_budget: number; currency?: string; }
export interface CompareRequest { items: string[]; criteria?: string[]; }
export interface ExplainRequest { topic: string; context_id?: string; }
export interface RecommendRequest { preferences: any; location?: string; }
export interface DestinationRequest { destination: string; interests?: string[]; }
export interface PackingListRequest { destination: string; duration_days: number; weather?: string; }
export interface TravelPulseRequest { location: string; categories?: string[]; }
export interface SupportRequest { query: string; booking_id?: string; }
export interface PersonalizeRequest { user_id: string; context?: any; }
export interface CreatePackageRequest { destination: string; budget: number; travelers: number; preferences?: any; }
export interface GenerateQuoteRequest { package_id: string; currency?: string; }
export interface CustomerMessageRequest { customer_id: string; intent: string; context?: any; }
export interface CopilotPackageRequest { destination: string; budget: number; travelers: number; preferences?: any; }
export interface CopilotValidateRequest { package_id: string; }
export interface CopilotQuoteRequest { package_id: string; margin?: number; }
"""

# Append new interfaces to the top after imports
lines = content.split('\n')
for i, line in enumerate(lines):
    if line.startswith("export type ConfidenceLevel"):
        lines.insert(i, new_interfaces)
        break

content = '\n'.join(lines)

replacements = {
    "payload: any): Promise<AIResponse>": "payload: any): Promise<AIResponse>", # We will fix these below
    "planTrip: async (payload: any)": "planTrip: async (payload: any)", # Generic
    "optimizeItinerary: async (payload: any)": "optimizeItinerary: async (payload: OptimizeItineraryRequest)",
    "optimizeBudget: async (payload: any)": "optimizeBudget: async (payload: OptimizeBudgetRequest)",
    "recommend: async (payload: any)": "recommend: async (payload: RecommendRequest)",
    "compare: async (payload: any)": "compare: async (payload: CompareRequest)",
    "explain: async (payload: any)": "explain: async (payload: ExplainRequest)",
    "destination: async (payload: any)": "destination: async (payload: DestinationRequest)",
    "packingList: async (payload: any)": "packingList: async (payload: PackingListRequest)",
    "support: async (payload: any)": "support: async (payload: SupportRequest)",
    "travelPulse: async (payload: any)": "travelPulse: async (payload: TravelPulseRequest)",
    "personalize: async (payload: any)": "personalize: async (payload: PersonalizeRequest)",
    "createPackage: async (payload: any)": "createPackage: async (payload: CreatePackageRequest)",
    "validatePackage: async (payload: any)": "validatePackage: async (payload: CopilotValidateRequest)",
    "generateQuote: async (payload: any)": "generateQuote: async (payload: GenerateQuoteRequest)",
    "customerMessage: async (payload: any)": "customerMessage: async (payload: CustomerMessageRequest)",
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Clean up backward compatibility types
start_idx = content.find("// Backward compatibility types")
if start_idx != -1:
    content = content[:start_idx]

with open("src/lib/api/ai.ts", "w") as f:
    f.write(content)

print("Done")
