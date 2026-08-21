with open("src/lib/api/ai.ts", "r") as f:
    content = f.read()

# Add AIChatRequest
if "export interface AIChatRequest" not in content:
    content = content.replace(
        "export interface ChatRequest",
        "export interface AIChatRequest {\n  message: string;\n  conversation_id?: string;\n  agentPersona?: string;\n  language?: string;\n  conversationHistory?: any[];\n  context?: any;\n}\nexport interface ChatRequest"
    )
    content = content.replace("chat: async (payload: ChatRequest)", "chat: async (payload: AIChatRequest)")
    
# Fix backward compatibility types in useTravelAI
with open("src/hooks/useTravelAI.ts", "r") as f:
    useTravel = f.read()

useTravel = useTravel.replace(
"""  GenerateTripPlanParams,
  TripContextData,
  ChatParams,
  RecommendParams,
  ExplainParams,
  OptimizeParams,
  ReduceCostParams,
  PersonalizeParams,
  PackingListParams,
  SupportParams,
  CompareParams,
  AIRequestOptions,""",
"""
  OptimizeItineraryRequest,
  OptimizeBudgetRequest,
  CompareRequest,
  ExplainRequest,
  RecommendRequest,
  DestinationRequest,
  PackingListRequest,
  TravelPulseRequest,
  SupportRequest,
  PersonalizeRequest,
  AIChatRequest,"""
)
useTravel = useTravel.replace("ChatParams", "AIChatRequest")
useTravel = useTravel.replace("GenerateTripPlanParams", "any")
useTravel = useTravel.replace("RecommendParams", "RecommendRequest")
useTravel = useTravel.replace("ExplainParams", "ExplainRequest")
useTravel = useTravel.replace("OptimizeParams", "OptimizeItineraryRequest")
useTravel = useTravel.replace("ReduceCostParams", "OptimizeBudgetRequest")
useTravel = useTravel.replace("PersonalizeParams", "PersonalizeRequest")
useTravel = useTravel.replace("PackingListParams", "PackingListRequest")
useTravel = useTravel.replace("SupportParams", "SupportRequest")
useTravel = useTravel.replace("CompareParams", "CompareRequest")

useTravel = useTravel.replace("ChatResponse", "any")
useTravel = useTravel.replace("PlanTripResponse", "any")
useTravel = useTravel.replace("RecommendResponse", "any")
useTravel = useTravel.replace("ExplainResponse", "any")
useTravel = useTravel.replace("OptimizeResponse", "any")
useTravel = useTravel.replace("ReduceCostResponse", "any")
useTravel = useTravel.replace("PersonalizeResponse", "any")
useTravel = useTravel.replace("PackingListResponse", "any")
useTravel = useTravel.replace("SupportResponse", "any")
useTravel = useTravel.replace("CompareResponse", "any")
useTravel = useTravel.replace("aiService.optimize(", "aiService.optimizeItinerary(")
useTravel = useTravel.replace("aiService.reduceCost(", "aiService.optimizeBudget(")

with open("src/hooks/useTravelAI.ts", "w") as f:
    f.write(useTravel)

with open("src/lib/api/ai.ts", "w") as f:
    f.write(content)

print("Types patched")
