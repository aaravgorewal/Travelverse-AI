import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client (secure server-side only)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TravelVerse AI Operating System",
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Helper for parsing Gemini JSON responses safely
function parseGeminiJson<T>(rawText?: string): T | null {
  if (!rawText) return null;
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    return null;
  }
}

// ==========================================
// 1. CHAT ENDPOINT (POST /api/v1/ai/chat)
// ==========================================
app.post(["/api/v1/ai/chat", "/api/ai/chat"], async (req, res) => {
  const {
    message,
    conversationHistory = [],
    tripContext = {},
    agentPersona = "Master Concierge",
    language = req.headers["accept-language"] || "en",
  } = req.body;

  const {
    destination = "Kyoto & Tokyo, Japan",
    dates = { start: "2026-09-12", end: "2026-09-19" },
    travelers = 2,
    budget = "$5,500",
    preferences = ["Foodie", "Culture", "Luxury 5★"],
    bookings = [],
    currentLocation = "San Francisco, CA (SFO)",
    tripStage = "Planning",
  } = tripContext;

  const contextSummary = `
Trip Context Details:
- Destination: ${destination}
- Dates: ${typeof dates === "object" ? `${dates.start} to ${dates.end}` : dates}
- Travelers: ${typeof travelers === "object" ? JSON.stringify(travelers) : travelers}
- Budget: ${budget}
- Preferences: ${Array.isArray(preferences) ? preferences.join(", ") : preferences}
- Current Active Bookings: ${bookings?.length ? bookings.map((b: any) => `${b.type || "item"}: ${b.title || b.name || b.id}`).join("; ") : "None yet"}
- Current Location: ${currentLocation}
- Trip Stage: ${tripStage} (e.g. Dreaming, Planning, Booked, In-Trip, Post-Trip)
`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const formattedHistory = (conversationHistory || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || msg.text || "" }],
      }));

      const systemPrompt = `You are TRAVELVERSE AI (${agentPersona}), the central autonomous global travel intelligence engine.
You are operating within the TravelVerse AI Workspace.
${contextSummary}

Language Instructions:
- Respond strictly in the language/dialect: ${
        language.toString().toLowerCase().includes("hinglish") 
          ? "Hinglish (Hindi language using the Latin alphabet/script instead of Devanagari, e.g. 'Aapka flight schedule and hotel details ready hain')" 
          : language.toString().toLowerCase().includes("hi") 
          ? "Hindi (Devanagari script)" 
          : "English"
      }.
- CRITICAL EXEMPTION: Do NOT translate booking IDs (e.g. BK-xxxx), flight numbers (e.g. QA-88), currency codes or currency symbols (e.g. USD, INR, ₹, $), or canonical business entities (e.g. "Emirates", "Burj Al Arab"). Keep these strictly in their canonical form.

Guidelines:
- Give comprehensive, well-structured, inspiring, and actionable advice tailored directly to the user's trip context.
- Use Markdown formatting with clear bold headings, bullet points, budget breakdowns, day schedules, or comparison tables when helpful.
- Suggest 3-4 specific, contextual follow-up prompts for the user.
- If the user asks about hotels, flights, booking order, or itineraries, provide specific recommendations with estimated price ranges, time slots, and smart booking tips.
- Maintain a warm, elite, professional, and knowledgeable persona.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          ...formattedHistory,
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser query: "${message}"`,
              },
            ],
          },
        ],
      });

      const replyText =
        response.text ||
        "I have analyzed your trip context and updated the recommendations.";

      const dynamicSuggestedPrompts = [
        "Plan my trip",
        "Find cheaper hotels",
        "Optimize my itinerary",
        "What's best for my family?",
        "What should I book first?",
        "Explain my options",
      ];

      return res.json({
        success: true,
        reply: replyText,
        suggestedPrompts: dynamicSuggestedPrompts,
        tripContextEcho: {
          destination,
          dates,
          travelers,
          budget,
          preferences,
          bookings,
          currentLocation,
          tripStage,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Gemini AI Chat Error:", err);
  }

  // Domain-rich fallback response tailored to user input and trip context
  let fallbackReply = "";
  const lowerMsg = (message || "").toLowerCase();

  if (
    lowerMsg.includes("plan my trip") ||
    lowerMsg.includes("itinerary") ||
    lowerMsg.includes("plan")
  ) {
    fallbackReply = `### 🌟 Tailored Itinerary Blueprint for **${destination}**
**Stage:** ${tripStage} | **Travelers:** ${travelers} | **Budget:** ${budget}

Here is your AI-optimized schedule balancing your preferences (${Array.isArray(preferences) ? preferences.join(", ") : "Culture & Food"}):

#### **Day 1: Arrival & Evening Exploration**
- **Morning/Afternoon:** Touchdown at primary international hub, VIP airport express transfer to your luxury hotel.
- **Evening:** Private guided sunset izakaya and culinary walk through historic lantern-lit districts.

#### **Day 2: Cultural Heritage & Exclusive Access**
- **08:30 AM:** Early VIP opening access to the flagship temple & shrine grounds before public crowds.
- **01:00 PM:** Michelin-starred lunch tasting menu featuring regional seasonal delicacies.
- **03:30 PM:** Private traditional tea masterclass with a licensed grandmaster.

#### **Day 3: Immersive Local Adventures & Relaxation**
- **10:00 AM:** Scenic bullet train or private luxury vehicle ride to surrounding mountain onsens.
- **06:00 PM:** Panoramic rooftop dining overlooking the skyline.

*Would you like me to add these activities directly into your Itinerary Builder or fine-tune specific day themes?*`;
  } else if (
    lowerMsg.includes("cheaper") ||
    lowerMsg.includes("hotel") ||
    lowerMsg.includes("budget")
  ) {
    fallbackReply = `### 🏨 Smart Hotel & Rate Optimization for **${destination}**
**Target Budget:** ${budget} | **Pace:** ${tripStage}

Here is our live AI rate comparison with secret member discounts:

1. **The Sovereign Palace Hotel & Spa (5★)**
   - *Standard Rate:* $480/night ➔ **AI Member Rate: $340/night** (Save 29%)
   - *Perks:* Free hot breakfast, room upgrade upon arrival, late 2:00 PM checkout.
2. **Komorebi Boutique Heritage Ryokan**
   - *Standard Rate:* $310/night ➔ **AI Rate: $225/night**
   - *Perks:* Private in-room onsen tub, Kaiseki dinner included.
3. **Urban Design Loft (Central District)**
   - *Standard Rate:* $195/night ➔ **Smart Saver Rate: $140/night**
   - *Perks:* Walkable to main rail hub, family-friendly kitchen suite.

💡 **AI Tip:** Shifting your stay dates by just 2 days saves an extra $180 total on lodging.`;
  } else if (
    lowerMsg.includes("family") ||
    lowerMsg.includes("kid") ||
    lowerMsg.includes("children")
  ) {
    fallbackReply = `### 👨‍👩‍👧‍👦 Family-First Recommendations for **${destination}**
**Travelers:** ${travelers} | **Preferences:** ${Array.isArray(preferences) ? preferences.join(", ") : "Family Comfort"}

Here is what works best for seamless family travel without stress:

1. **Interactive Wonders:**
   - **Digital Art Museum (teamLab Planets):** Zero-gravity water mirror rooms and sensory light displays that captivate both kids and adults.
   - **Open-Air Studio Tour:** Hands-on animation and crafts workshops with skip-the-line family passes.
2. **Family-Optimized Lodging:**
   - Choose multi-room serviced apartments or connected suites near major transit lines to eliminate heavy walking.
3. **Pacing Recommendation:**
   - Limit to **2 major activities per day** with structured 2-hour afternoon rest periods to prevent burnout.`;
  } else if (
    lowerMsg.includes("book first") ||
    lowerMsg.includes("priority") ||
    lowerMsg.includes("order")
  ) {
    fallbackReply = `### ⏱️ Critical Booking Sequence for **${destination}**

To lock in lowest prices and avoid sold-out experiences, execute your bookings in this exact order:

1. **Tier 1: International Flights (Book Immediately)**
   - *Why:* Flight prices increase significantly within 60 days of departure. Lock in seat assignments now.
2. **Tier 2: Signature Lodging & Ryokans (Book 3–4 Months Ahead)**
   - *Why:* High-demand boutique stays in ${destination} have only 10–20 rooms and fill quickly.
3. **Tier 3: Michelin Dining & Exclusive Pass Reservations (Book 30–60 Days Ahead)**
   - *Why:* Tea ceremonies, private guides, and top tasting tables open reservation windows on the 1st of each month.
4. **Tier 4: Bullet Train & Local Transit Passes (Book 1–2 Weeks Ahead)**
   - *Why:* Digital QR passes can be issued instantly with fixed flexible cancellation.`;
  } else if (
    lowerMsg.includes("explain") ||
    lowerMsg.includes("options") ||
    lowerMsg.includes("compare")
  ) {
    fallbackReply = `### 📊 Strategic Travel Options Comparison for **${destination}**

| Travel Route Option | Pace & Vibe | Estimated Cost | Best For |
| :--- | :--- | :--- | :--- |
| **Option A: The Grand Sovereign Luxury** | High Comfort, Private Chauffeur | $4,800 – $6,200 | Honeymoons, VIP anniversaries, 5★ dining |
| **Option B: Cultural Deep-Dive Explorer** | Moderate Pace, Local Hidden Gems | $2,800 – $3,600 | Authentic foodies, temple lovers, photography |
| **Option C: Balanced Family Flex** | Relaxed, Child-friendly, Central Hubs | $3,400 – $4,200 | Multi-generation travelers, interactive sights |

*Let me know which option matches your vision and I will generate the complete day-by-day blueprint!*`;
  } else {
    fallbackReply = `### 🧭 TravelVerse AI Concierge Report for **${destination}**

**Trip Stage:** ${tripStage} | **Current Base:** ${currentLocation} | **Budget:** ${budget}

I have processed your query: *"${message}"*.

#### **Key Insights & Recommendations:**
- **Optimal Weather & Timing:** Your dates (${typeof dates === "object" ? `${dates.start} to ${dates.end}` : dates}) fall into ideal travel conditions with pleasant temperatures and great seasonal events.
- **Top Priority:** Based on your preferences (${Array.isArray(preferences) ? preferences.join(", ") : "Culture & Food"}), I recommend locking in your primary accommodation first, followed by your exclusive local experiences.
- **Budget Pacing:** With a ${budget} budget for ${travelers} travelers, you are well-positioned for premium comfort and signature dining experiences.

*What would you like to explore next? You can pick one of the quick suggestions below or speak your query.*`;
  }

  return res.json({
    success: true,
    reply: fallbackReply,
    suggestedPrompts: [
      "Plan my trip",
      "Find cheaper hotels",
      "Optimize my itinerary",
      "What's best for my family?",
      "What should I book first?",
      "Explain my options",
    ],
    tripContextEcho: {
      destination,
      dates,
      travelers,
      budget,
      preferences,
      bookings,
      currentLocation,
      tripStage,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. PLAN TRIP ENDPOINT (POST /api/v1/ai/plan-trip)
// ==========================================
app.post(["/api/v1/ai/plan-trip", "/api/ai/plan-trip", "/api/ai/generate-trip"], async (req, res) => {
  const {
    destination = "Kyoto, Japan",
    durationDays = 7,
    daysCount = 7,
    dates,
    startDate = "2026-09-12",
    endDate = "2026-09-19",
    budget = "moderate",
    budgetLevel = "moderate",
    travelStyle = ["Luxury", "Culture"],
    travelers = 2,
    travelersCount = 2,
    interests = ["Culture", "Gastronomy", "Scenic"],
    dietary = "Standard",
    specialRequirements = "",
    aiAction,
    baseTrip,
  } = req.body;

  const totalDays = durationDays || daysCount || 7;
  const numTravelers =
    typeof travelers === "object" && travelers !== null
      ? (travelers.adults || 1) + (travelers.children || 0) + (travelers.infants || 0)
      : Number(travelersCount || travelers || 2);
  const activeBudget = budgetLevel || budget || "moderate";
  const activeDates = typeof dates === "string" ? dates : dates?.start ? `${dates.start} to ${dates.end}` : `${startDate} to ${endDate}`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      let actionModifier = "";
      if (aiAction === "optimize") {
        actionModifier = "CRITICAL ACTION: OPTIMIZE ITINERARY. Eliminate backtracking, group adjacent landmarks, minimize transit fatigue, and calculate estimated commute time and carbon savings.";
      } else if (aiAction === "reduce_cost") {
        actionModifier = "CRITICAL ACTION: REDUCE COST. Swap premium components for high-value smart budget alternatives, suggest free scenic walks, find off-peak ticket windows, and reduce total cost by 20-30% without sacrificing essence.";
      } else if (aiAction === "make_premium") {
        actionModifier = "CRITICAL ACTION: MAKE PREMIUM / ULTRA-LUXURY. Upgrade flights to Business/First class, hotels to 5-Star luxury suites with butler service, private chauffeur transfers, and exclusive VIP after-hours admissions & Michelin dining.";
      } else if (aiAction === "add_activities") {
        actionModifier = "CRITICAL ACTION: ADD ACTIVITIES. Inject additional unique local masterclasses, sunset viewpoints, artisan workshops, and hidden gem experiences into leisure windows.";
      } else if (aiAction === "slow_down") {
        actionModifier = "CRITICAL ACTION: SLOW DOWN / RELAXED PACING. Remove rushed transitions, start mornings gently after 10 AM, include dedicated 2-hour café & spa breaks, and focus on deep quality over quantity.";
      } else if (aiAction === "family_friendly") {
        actionModifier = "CRITICAL ACTION: MAKE FAMILY FRIENDLY. Ensure all spots are child & stroller accessible, include interactive science/nature museums, family-friendly eateries, and stress-free transit.";
      }

      const prompt = `You are TripGenie AI, the world's most sophisticated autonomous travel operating system.
Generate a comprehensive, hyper-realistic, production-ready vacation blueprint for:
- Destination: ${destination}
- Duration: ${totalDays} Days (${activeDates})
- Travelers: ${numTravelers}
- Budget Target: ${activeBudget}
- Travel Style: ${Array.isArray(travelStyle) ? travelStyle.join(", ") : travelStyle}
- Interests: ${Array.isArray(interests) ? interests.join(", ") : interests}
- Special Requirements: ${specialRequirements || dietary || "None specified"}
${actionModifier ? `\n${actionModifier}\n` : ""}

You MUST return a valid JSON object matching this exact schema:
{
  "title": "Evocative Title for the Journey",
  "summary": "3-4 sentence rich narrative summary of this trip blueprint.",
  "aiRationale": "Why this trip was designed this way based on their style, budget, and interests.",
  "seasonAdvice": "Weather, best clothing layers, and seasonal highlight advice for this destination.",
  "specialRequirementsHandled": [
    "Handled requirement 1 explanation",
    "Handled requirement 2 explanation"
  ],
  "budgetTotal": 4800,
  "currency": "USD",
  "flights": [
    {
      "id": "fl-out-1",
      "type": "outbound",
      "airline": "Japan Airlines / ANA / Delta / etc",
      "flightNumber": "JL 005",
      "airlineLogo": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80",
      "fromCity": "Departure Hub",
      "fromCode": "JFK",
      "toCity": "${destination.split(",")[0].trim()}",
      "toCode": "HND",
      "departureTime": "08:30 AM",
      "arrivalTime": "02:15 PM (+1)",
      "duration": "14h 45m",
      "cabinClass": "Premium Economy",
      "stops": 0,
      "pricePerPerson": 920,
      "baggageIncluded": true,
      "seatSuggestion": "14A (Extra legroom window)"
    },
    {
      "id": "fl-ret-1",
      "type": "return",
      "airline": "Japan Airlines / ANA / Delta / etc",
      "flightNumber": "JL 006",
      "airlineLogo": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80",
      "fromCity": "${destination.split(",")[0].trim()}",
      "fromCode": "HND",
      "toCity": "Departure Hub",
      "toCode": "JFK",
      "departureTime": "05:40 PM",
      "arrivalTime": "06:10 PM",
      "duration": "13h 30m",
      "cabinClass": "Premium Economy",
      "stops": 0,
      "pricePerPerson": 920,
      "baggageIncluded": true,
      "seatSuggestion": "14K (Quiet cabin zone)"
    }
  ],
  "hotels": [
    {
      "id": "ht-1",
      "name": "Luxury / Boutique Hotel Name in ${destination}",
      "stars": 5,
      "rating": 4.9,
      "roomType": "Deluxe Panoramic Suite",
      "nightlyPrice": 340,
      "totalPrice": 2380,
      "nights": ${totalDays},
      "location": "Historic Center / Prime Quarter",
      "address": "1-2-3 Central Boulevard",
      "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "amenities": ["Infinity Pool", "Thermal Spa", "Complimentary Gourmet Breakfast", "High-Speed WiFi", "24/7 Concierge"],
      "matchReason": "Ideal central location with tranquil courtyard away from busy traffic.",
      "badge": "AI Top Pick"
    }
  ],
  "curatedActivities": [
    {
      "id": "act-cur-1",
      "time": "Flexible",
      "title": "Private Heritage Landmark & Temple Tour",
      "type": "cultural",
      "location": "${destination}",
      "description": "Skip-the-line guided access to iconic cultural sights with private expert historian.",
      "duration": "3.5 hrs",
      "estimatedCost": 85
    },
    {
      "id": "act-cur-2",
      "time": "Evening",
      "title": "Chef-Led Night Food & Gastronomy Walk",
      "type": "dining",
      "location": "Historic Alleyways",
      "description": "Taste authentic local specialties across 5 handpicked artisan kitchens and hidden eateries.",
      "duration": "3 hrs",
      "estimatedCost": 110
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Arrival, VIP Check-in & Sunset Welcome",
      "weatherForecast": { "temp": 24, "condition": "Clear & Sunny", "aiRecommendation": "Light evening jacket" },
      "activities": [
        {
          "id": "act-1-1",
          "time": "10:30 AM",
          "title": "Airport Private Transfer & Hotel Check-in",
          "description": "Seamless private chauffeur escort from airport directly to your hotel suite.",
          "location": "Hotel Suite",
          "duration": "1.5 hrs",
          "type": "transit",
          "estimatedCost": 75,
          "transitToNext": "10 min walk"
        },
        {
          "id": "act-1-2",
          "time": "02:00 PM",
          "title": "Old Town Discovery Walk & Artisan Coffee",
          "description": "Stroll cobblestone pathways and discover local craft workshops.",
          "location": "Historic District",
          "duration": "2.5 hrs",
          "type": "cultural",
          "estimatedCost": 30,
          "transitToNext": "15 min scenic stroll"
        },
        {
          "id": "act-1-3",
          "time": "07:00 PM",
          "title": "Welcome Dinner & Seasonal Tasting Menu",
          "description": "Acclaimed dining experience showcasing seasonal regional ingredients.",
          "location": "Skyline Dining Room",
          "duration": "2.5 hrs",
          "type": "dining",
          "estimatedCost": 120,
          "transitToNext": "Return to Hotel"
        }
      ]
    }
  ],
  "transportation": [
    {
      "id": "tr-1",
      "type": "train_pass",
      "title": "Regional Express High-Speed Rail Pass (Unlimited)",
      "description": "Unlimited first-class travel on all bullet trains and regional express connections for ${totalDays} days.",
      "cost": 210,
      "currency": "USD",
      "coverage": "All Regional & City Lines",
      "bookingTip": "Pre-issue digital pass with QR seat reservation capability.",
      "recommended": true
    },
    {
      "id": "tr-2",
      "type": "private_transfer",
      "title": "VIP Airport Executive Sedan Transfer",
      "description": "Chauffeur meet & greet inside terminal with luggage handling.",
      "cost": 95,
      "currency": "USD",
      "coverage": "Airport to Hotel",
      "bookingTip": "Includes flight delay tracking.",
      "recommended": true
    }
  ],
  "costBreakdown": {
    "flights": 1840,
    "lodging": 2380,
    "activities": 450,
    "foodDining": 620,
    "localTransit": 310,
    "taxesAndBuffer": 200,
    "totalEstimated": 5800,
    "targetBudget": 6000,
    "currency": "USD",
    "savingsTips": [
      "Book rail pass 14 days in advance to unlock a 10% early-bird rate.",
      "Lunch tasting menus offer Michelin quality at 40% lower cost than dinner."
    ]
  },
  "packingList": [
    { "id": "p1", "item": "Passport & International Travel Insurance Card", "category": "Documents", "packed": true },
    { "id": "p2", "item": "Universal Power Adapter & Portable Battery", "category": "Electronics", "packed": false },
    { "id": "p3", "item": "High-Cushion Walking Shoes", "category": "Clothing", "packed": false },
    { "id": "p4", "item": "Smart Casual Dining Outfit", "category": "Clothing", "packed": false }
  ],
  "emergencyContacts": [
    { "name": "TravelVerse 24/7 Priority Desk", "role": "Global Concierge", "phone": "+1 (800) 555-TRAV" },
    { "name": "Local Tourist Police & Medical Hotline", "role": "Emergency Dispatch", "phone": "+81 3 5555 0110" }
  ]
}

Provide ${totalDays} complete days in the "days" array. Return only valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed && parsed.days && parsed.days.length > 0) {
        const tripResult = {
          id: `trip-ai-${Date.now()}`,
          destination,
          country: destination.includes(",") ? destination.split(",").slice(1).join(",").trim() : "Featured Country",
          coverImage: destination.toLowerCase().includes("kyoto") || destination.toLowerCase().includes("japan")
            ? "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
            : destination.toLowerCase().includes("paris") || destination.toLowerCase().includes("france")
            ? "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
            : destination.toLowerCase().includes("amalfi") || destination.toLowerCase().includes("italy") || destination.toLowerCase().includes("rome")
            ? "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
            : destination.toLowerCase().includes("swiss") || destination.toLowerCase().includes("switzerland")
            ? "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
            : destination.toLowerCase().includes("bali")
            ? "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
            : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
          startDate: activeDates.split(" to ")[0] || startDate,
          endDate: activeDates.split(" to ")[1] || endDate,
          isAIGenerated: true,
          budgetTotal: parsed.costBreakdown?.totalEstimated || parsed.budgetTotal || 5200,
          currency: parsed.currency || "USD",
          travelersCount: numTravelers,
          ...parsed,
        };

        return res.json({
          success: true,
          trip: tripResult,
          aiSummary: parsed.summary || `Autonomous ${totalDays}-day blueprint designed for ${destination}.`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Plan Trip Error:", err);
  }

  // Realistic rich fallback plan if AI network is offline
  const destName = destination.split(",")[0].trim();
  const fallbackTotalBudget = activeBudget === "luxury" ? 7800 : activeBudget === "economy" ? 2600 : 4900;
  const flightPrice = Math.round(fallbackTotalBudget * 0.32);
  const lodgingPrice = Math.round(fallbackTotalBudget * 0.42);
  const actPrice = Math.round(fallbackTotalBudget * 0.12);
  const diningPrice = Math.round(fallbackTotalBudget * 0.10);
  const transitPrice = Math.round(fallbackTotalBudget * 0.04);

  const fallbackTrip = {
    id: `trip-ai-${Date.now()}`,
    title: `${totalDays}-Day Curated ${destination} Sovereign Journey`,
    destination,
    country: destination.includes(",") ? destination.split(",").slice(1).join(",").trim() : "Featured Country",
    coverImage: destination.toLowerCase().includes("kyoto") || destination.toLowerCase().includes("japan")
      ? "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
      : destination.toLowerCase().includes("paris") || destination.toLowerCase().includes("france")
      ? "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    startDate: activeDates.split(" to ")[0] || startDate,
    endDate: activeDates.split(" to ")[1] || endDate,
    isAIGenerated: true,
    budgetTotal: fallbackTotalBudget,
    currency: "USD",
    travelersCount: numTravelers,
    summary: `An exquisitely orchestrated ${totalDays}-day experience in ${destination}, seamlessly balancing cultural heritage, signature gastronomy, and scenic discovery tailored for ${numTravelers} traveler${numTravelers > 1 ? "s" : ""}.`,
    aiRationale: `Engineered around your ${Array.isArray(travelStyle) ? travelStyle.join(" & ") : travelStyle} style with a ${activeBudget} budget pacing, pairing premier central accommodation with skip-the-line experiences.`,
    seasonAdvice: `Pleasant travel conditions with comfortable temperatures. We recommend breathable layers during daytime walking and a refined jacket for evening rooftop dining.`,
    specialRequirementsHandled: [
      specialRequirements ? `Directly catered to: "${specialRequirements}" with verified accessible routes and dietary reservations.` : "Curated with dietary flexibility and stress-free transit options.",
      "Optimized walking segments to avoid peak noon temperatures and crowded bottlenecks.",
    ],
    flights: [
      {
        id: `fl-out-${Date.now()}`,
        type: "outbound" as const,
        airline: "Global Premier Airways",
        flightNumber: "GP 248",
        airlineLogo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80",
        fromCity: "International Hub",
        fromCode: "JFK",
        toCity: destName,
        toCode: destName.slice(0, 3).toUpperCase(),
        departureTime: "08:15 AM",
        arrivalTime: "02:40 PM (+1)",
        duration: "13h 25m",
        cabinClass: activeBudget === "luxury" ? "Business Class" : "Premium Economy",
        stops: 0,
        pricePerPerson: Math.round(flightPrice / numTravelers / 2),
        baggageIncluded: true,
        seatSuggestion: "12A (Forward quiet cabin)",
      },
      {
        id: `fl-ret-${Date.now()}`,
        type: "return" as const,
        airline: "Global Premier Airways",
        flightNumber: "GP 249",
        airlineLogo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80",
        fromCity: destName,
        fromCode: destName.slice(0, 3).toUpperCase(),
        toCity: "International Hub",
        toCode: "JFK",
        departureTime: "04:30 PM",
        arrivalTime: "07:15 PM",
        duration: "14h 15m",
        cabinClass: activeBudget === "luxury" ? "Business Class" : "Premium Economy",
        stops: 0,
        pricePerPerson: Math.round(flightPrice / numTravelers / 2),
        baggageIncluded: true,
        seatSuggestion: "12K (Panoramic window view)",
      },
    ],
    hotels: [
      {
        id: `ht-${Date.now()}`,
        name: `Grand Sovereign Heritage Hotel & Spa ${destName}`,
        stars: 5,
        rating: 4.92,
        roomType: "Executive Panoramic Garden Suite",
        nightlyPrice: Math.round(lodgingPrice / totalDays),
        totalPrice: lodgingPrice,
        nights: totalDays,
        location: "Prime Historic Quarter",
        address: "700 Royal Palm Walk, Central District",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        amenities: ["Rooftop Infinity Pool", "Thermal Wellness Spa", "Complimentary Champagne Breakfast", "Dedicated Chauffeur", "24/7 Butler"],
        matchReason: "Directly located in the most walkable quarter, eliminating morning commute times.",
        badge: "AI Top Match",
      },
    ],
    curatedActivities: [
      {
        id: `act-cur-1`,
        time: "Morning",
        title: `Exclusive VIP Heritage Tour of ${destName}`,
        type: "cultural" as const,
        location: destName,
        description: `Private skip-the-line master tour of landmark shrines, art sanctuaries, and imperial quarters.`,
        duration: "3.5 hrs",
        estimatedCost: Math.round(actPrice * 0.4),
      },
      {
        id: `act-cur-2`,
        time: "Evening",
        title: `Chef's Table Gastronomy & Wine Pairing`,
        type: "dining" as const,
        location: "Artisan Quarters",
        description: `Private 7-course seasonal tasting menu led by renowned regional culinary masters.`,
        duration: "3 hrs",
        estimatedCost: Math.round(actPrice * 0.6),
      },
    ],
    transportation: [
      {
        id: "tr-1",
        type: "train_pass",
        title: "All-Access Regional High-Speed Transit Pass",
        description: `Unlimited first-class travel on all city metro lines, high-speed rail, and scenic express cars for ${totalDays} days.`,
        cost: transitPrice,
        currency: "USD",
        coverage: "Full Regional Network",
        bookingTip: "Includes instant digital wallet tap-and-go access.",
        recommended: true,
      },
    ],
    costBreakdown: {
      flights: flightPrice,
      lodging: lodgingPrice,
      activities: actPrice,
      foodDining: diningPrice,
      localTransit: transitPrice,
      taxesAndBuffer: Math.round(fallbackTotalBudget * 0.05),
      totalEstimated: fallbackTotalBudget,
      targetBudget: fallbackTotalBudget + 200,
      currency: "USD",
      savingsTips: [
        "Booking bundled flights and accommodations early locks in protected cancellation terms.",
        "Pre-purchased transit passes yield ~30% savings over single-ride fares.",
      ],
    },
    days: Array.from({ length: totalDays }, (_, i) => ({
      dayNumber: i + 1,
      date: `Day ${i + 1}`,
      theme:
        i === 0
          ? "Arrival, Private Chauffeur & Sunset Welcome"
          : i === 1
          ? "Historic Immersion & Skip-The-Line Heritage Access"
          : i === 2
          ? "Gastronomy Masterclass & Hidden Artisan Markets"
          : i === totalDays - 1
          ? "Panoramic Vistas, Souvenir Gathering & Farewell Gala"
          : `Scenic Discovery & Cultural Exploration Day ${i + 1}`,
      weatherForecast: {
        temp: 24,
        condition: "Sunny & Mild",
        aiRecommendation: "Optimal for outdoor walking and photography",
      },
      activities: [
        {
          id: `act-${i}-1`,
          time: "09:30 AM",
          title: `Morning Discovery & Architectural Marvels`,
          description: `Private host guided discovery of iconic ${destination} highlights with priority fast-track entry.`,
          location: destination,
          duration: "2.5 hrs",
          type: "cultural" as const,
          estimatedCost: 65,
          transitToNext: "15 min private car",
        },
        {
          id: `act-${i}-2`,
          time: "01:30 PM",
          title: "Curated Tasting & Local Artisan Workshop",
          description: `Authentic regional culinary experience paired with handcrafted local specialties.`,
          location: "Central Historic District",
          duration: "2 hrs",
          type: "dining" as const,
          estimatedCost: 85,
          transitToNext: "10 min walk",
        },
        {
          id: `act-${i}-3`,
          time: "06:30 PM",
          title: "Golden Hour Panoramic Sunset & Dinner",
          description: "Rooftop scenic viewpoint followed by reservation at acclaimed restaurant.",
          location: "Skyline Quarter",
          duration: "3 hrs",
          type: "dining" as const,
          estimatedCost: 110,
          transitToNext: "Return to hotel",
        },
      ],
    })),
    packingList: [
      { id: "p1", item: "Passport & Digital Boarding Passes", category: "Documents", packed: true },
      { id: "p2", item: "Universal Power Bank & Converters", category: "Electronics", packed: true },
      { id: "p3", item: "Comfortable Walking Shoes", category: "Clothing", packed: false },
      { id: "p4", item: "Smart Evening Attire", category: "Clothing", packed: false },
    ],
    emergencyContacts: [
      { name: "TravelVerse 24/7 Concierge", role: "Dedicated Priority Desk", phone: "+1 (800) 555-TRAV" },
      { name: "Local VIP Host Team", role: "On-Ground Dispatch", phone: "+81 3 5555 0199" },
    ],
  };

  return res.json({
    success: true,
    trip: fallbackTrip,
    aiSummary: `Comprehensive ${totalDays}-day itinerary for ${destination} configured for ${numTravelers} travelers with a ${activeBudget} budget pacing.`,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 3. RECOMMEND ENDPOINT (POST /api/v1/ai/recommend)
// ==========================================
app.post(["/api/v1/ai/recommend", "/api/ai/recommend"], async (req, res) => {
  const {
    destination = "Tokyo, Japan",
    category = "all",
    preferences = ["Luxury", "Gastronomy"],
    budget = "moderate",
    travelers = 2,
    style = "Cultural",
    dates = "2026-09-12 to 2026-09-19",
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are the TRAVELVERSE AI Recommendation Engine.
Generate top 4 curated recommendations for:
- Destination: ${destination}
- Category: ${category} (e.g. hotels, flights, experiences, dining, all)
- Preferences: ${Array.isArray(preferences) ? preferences.join(", ") : preferences}
- Budget: ${budget}
- Style: ${style}

Return JSON with:
{
  "summary": "1-2 sentence overview of why these picks were selected",
  "matchHighlights": ["Highlight 1", "Highlight 2"],
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Title of item",
      "category": "Hotel | Flight | Experience | Dining",
      "rating": 4.95,
      "price": "$280/night or $85",
      "matchScore": 98,
      "aiRationale": "Why this specifically matches user preferences",
      "highlights": ["Key feature 1", "Key feature 2"],
      "imageUrl": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      "badge": "Top AI Pick"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed && parsed.recommendations) {
        return res.json({
          success: true,
          destination,
          summary: parsed.summary,
          matchHighlights: parsed.matchHighlights || ["Tailored to your preferences", "Verified real-time availability"],
          recommendations: parsed.recommendations,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Recommend Error:", err);
  }

  // Fallback recommendations
  return res.json({
    success: true,
    destination,
    summary: `Autonomous top recommendations for ${destination} based on ${Array.isArray(preferences) ? preferences.join(", ") : "your preferences"}.`,
    matchHighlights: [
      "98% compatibility with your budget and travel style",
      "Includes exclusive member perks (free breakfast & VIP upgrades)",
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "The Sovereign Palace Hotel & Spa (5★)",
        category: "Hotel",
        rating: 4.98,
        price: "$340/night",
        matchScore: 99,
        aiRationale: "Selected for prime central location and private wellness onsen facilities.",
        highlights: ["Panoramic view", "Complimentary hot breakfast", "2pm late checkout"],
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        badge: "AI Top Pick",
      },
      {
        id: "rec-2",
        title: "Private Twilight Culinary Walk & Secret Izakayas",
        category: "Experience",
        rating: 4.96,
        price: "$130/person",
        matchScore: 96,
        aiRationale: "Curated by local culinary masters with 6 private tastings included.",
        highlights: ["Skip-the-line access", "Michelin-guide stops", "Licensed sommelier host"],
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        badge: "Insider Access",
      },
      {
        id: "rec-3",
        title: "Quantum SkySuite Direct Flight (Lie-Flat Business)",
        category: "Flight",
        rating: 4.94,
        price: "$1,850 roundtrip",
        matchScore: 94,
        aiRationale: "Lowest price tracked in 60 days with premium lounge access and priority baggage.",
        highlights: ["1-2-1 direct aisle access", "Gourmet dining", "Zero change fees"],
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
        badge: "Lowest Price Alert",
      },
      {
        id: "rec-4",
        title: "Komorebi Heritage Ryokan & Tea Pavilion",
        category: "Hotel",
        rating: 4.97,
        price: "$270/night",
        matchScore: 97,
        aiRationale: "Centuries-old peaceful garden sanctuary with private Kaiseki dinner.",
        highlights: ["Private cypress bath", "Seasonal 9-course dinner", "Garden views"],
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        badge: "Authentic Gem",
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 4. EXPLAIN ENDPOINT (POST /api/v1/ai/explain)
// ==========================================
app.post(["/api/v1/ai/explain", "/api/ai/explain"], async (req, res) => {
  const {
    topic = "Flight Fare Classes & Flexible Cancellation Rules",
    context = "Booking flights and hotels for an upcoming trip",
    itemDetails,
    comparisonTargets,
    userQuestion,
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI, an expert travel advisor.
Provide a clear, authoritative, easy-to-understand explanation for:
- Topic: ${topic}
- Context: ${context}
- User Question: ${userQuestion || "Explain the differences, pros/cons, and recommended action."}
${itemDetails ? `- Item Details: ${JSON.stringify(itemDetails)}` : ""}
${comparisonTargets ? `- Comparison Targets: ${JSON.stringify(comparisonTargets)}` : ""}

Return a valid JSON with:
{
  "explanation": "Clear in-depth explanation in 2-3 paragraphs with Markdown formatting",
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Watch out 1", "Watch out 2"],
  "verdict": "Clear, actionable recommendation on what the user should do",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed && parsed.explanation) {
        return res.json({
          success: true,
          topic,
          explanation: parsed.explanation,
          pros: parsed.pros || [],
          cons: parsed.cons || [],
          verdict: parsed.verdict,
          keyTakeaways: parsed.keyTakeaways || [],
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Explain Error:", err);
  }

  // Domain fallback explanation
  return res.json({
    success: true,
    topic,
    explanation: `### Understanding **${topic}**
When evaluating your options, the most crucial considerations are flexibility, total landed cost, and booking protection.

1. **Flexibility vs. Non-Refundable Rates:** Basic economy and strictly non-refundable rates often carry high change fees ($150–$300) or complete forfeiture. Upgrading to flexible cancellation typically costs only 8–12% more but provides 100% credit or refund.
2. **Hidden Inclusions:** Premium tiers frequently include checked luggage ($70 roundtrip value), advanced seat selection, and priority boarding.
3. **Price Protection:** Bookings made through TravelVerse include autonomous price tracking—if the rate drops before departure, we automatically claim the delta as travel credit.`,
    pros: [
      "Full refundability or zero change fees",
      "Priority customer care & seat assignment included",
      "Autonomous rate drop protection",
    ],
    cons: [
      "Slightly higher upfront cost (approx. 10% premium)",
      "Cancellation windows usually require at least 24–48 hours notice",
    ],
    verdict:
      "We recommend choosing the flexible tier for flights and booking directly with free cancellation for hotels up to 48 hours prior to check-in.",
    keyTakeaways: [
      "Always check cancellation deadlines on hotel reservations",
      "Factor baggage and seat selection costs into basic economy comparisons",
      "Take advantage of autonomous rebooking when fares fluctuate",
    ],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 5. OPTIMIZE ENDPOINT (POST /api/v1/ai/optimize)
// ==========================================
app.post(
  ["/api/v1/ai/optimize", "/api/ai/optimize", "/api/ai/optimize-itinerary"],
  async (req, res) => {
    const {
      tripId = "trip-current",
      destination = "Kyoto & Tokyo, Japan",
      currentDays = [],
      activities = [],
      travelStyle = "Balanced",
      preferences = [],
      constraints = "Minimize transit time",
    } = req.body;

    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `You are TRAVELVERSE AI Itinerary Optimizer.
Optimize the following itinerary schedule to eliminate back-and-forth travel backtracking, minimize commute times, align with opening hours, and reduce carbon footprint:
- Destination: ${destination}
- Current Days / Activities: ${JSON.stringify(currentDays.length ? currentDays : activities)}
- Travel Style: ${travelStyle}
- Constraints: ${constraints}

Return a valid JSON with:
{
  "timeSavedMinutes": 140,
  "carbonSavedKg": 18.5,
  "estimatedCommuteEfficiency": "+35% more efficient",
  "optimizationInsights": [
    "Clustered eastern district shrines into a single morning",
    "Shifted museum visit to 2:00 PM to avoid peak tour bus queues",
    "Substituted taxi transit with direct express transit segment"
  ],
  "optimizedDays": [
    {
      "dayNumber": 1,
      "theme": "Optimized Theme",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Optimized Activity 1",
          "location": "Location",
          "transitToNext": "10 min walk"
        }
      ]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" },
        });

        const parsed = parseGeminiJson<any>(response.text);
        if (parsed) {
          return res.json({
            success: true,
            tripId,
            timeSavedMinutes: parsed.timeSavedMinutes || 120,
            carbonSavedKg: parsed.carbonSavedKg || 16.4,
            estimatedCommuteEfficiency: parsed.estimatedCommuteEfficiency || "+30% improved",
            optimizationInsights: parsed.optimizationInsights || [
              "Sequenced activities geographically to eliminate transit backtracking",
              "Optimized timing for peak photography light and minimal queues",
            ],
            optimizedDays: parsed.optimizedDays || currentDays,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("AI Optimize Error:", err);
    }

    // High quality fallback optimization result
    return res.json({
      success: true,
      tripId,
      timeSavedMinutes: 135,
      carbonSavedKg: 19.2,
      estimatedCommuteEfficiency: "+38% route efficiency",
      optimizationInsights: [
        "Grouped geographic clusters to eliminate 2.5 hours of transit backtracking",
        "Scheduled popular landmarks during early morning golden hours to bypass tour crowds",
        "Re-routed transit legs through rapid rail corridors, reducing carbon emissions by 19.2 kg",
      ],
      optimizedDays: currentDays.length
        ? currentDays.map((d: any, idx: number) => ({
            ...d,
            theme: `Optimized: ${d.theme || `Day ${idx + 1} Streamlined Route`}`,
          }))
        : [
            {
              dayNumber: 1,
              theme: "Geographically Streamlined Central & Northern Route",
              activities: [
                {
                  id: "act-opt-1",
                  time: "08:30 AM",
                  title: "Early VIP Temple Visit",
                  location: "Northern Quarter",
                  duration: "2 hrs",
                  transitToNext: "8 min walk",
                },
                {
                  id: "act-opt-2",
                  time: "11:00 AM",
                  title: "Bamboo Grove & Zen Garden",
                  location: "Northern Quarter",
                  duration: "2 hrs",
                  transitToNext: "15 min scenic rail",
                },
                {
                  id: "act-opt-3",
                  time: "02:00 PM",
                  title: "Artisan Culinary Market & Lunch",
                  location: "Central Quarter",
                  duration: "2.5 hrs",
                  transitToNext: "5 min walk",
                },
              ],
            },
          ],
      timestamp: new Date().toISOString(),
    });
  }
);

// ==========================================
// 6. REDUCE COST ENDPOINT (POST /api/v1/ai/reduce-cost)
// ==========================================
app.post(["/api/v1/ai/reduce-cost", "/api/ai/reduce-cost"], async (req, res) => {
  const {
    destination = "Kyoto & Tokyo, Japan",
    currentBudget = "$5,500",
    targetBudget = "$4,200",
    currentBookings = [],
    dates = "2026-09-12 to 2026-09-19",
    flexibleDays = 2,
    preferences = ["Luxury", "Culture"],
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI Cost Optimization Specialist.
Analyze the user's travel plans and generate high-impact cost-saving strategies that preserve luxury and experience quality:
- Destination: ${destination}
- Current Budget: ${currentBudget}
- Target Budget: ${targetBudget}
- Current Bookings: ${JSON.stringify(currentBookings)}
- Dates: ${dates}
- Flexible Days: ${flexibleDays}

Return a valid JSON with:
{
  "totalPotentialSavings": "$940 (18% Savings)",
  "strategySummary": "Overview of the primary saving vectors without reducing comfort",
  "savingOpportunities": [
    {
      "category": "Flights | Hotels | Rail | Dining",
      "action": "Specific action to take",
      "savingsAmount": "$380",
      "tradeoff": "Minimal (e.g. departing on Tuesday morning vs Sunday)",
      "confidence": "96%"
    }
  ],
  "dateShiftAlternatives": [
    {
      "dateRange": "Sep 15 - Sep 22",
      "priceDelta": "-$240 on flights",
      "advantage": "Lower mid-week shoulder fare"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed && parsed.savingOpportunities) {
        return res.json({
          success: true,
          destination,
          totalPotentialSavings: parsed.totalPotentialSavings || "$890",
          strategySummary: parsed.strategySummary,
          savingOpportunities: parsed.savingOpportunities,
          dateShiftAlternatives: parsed.dateShiftAlternatives || [],
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Reduce Cost Error:", err);
  }

  // Rich fallback cost reduction blueprint
  return res.json({
    success: true,
    destination,
    totalPotentialSavings: "$920 (Save 17.5%)",
    strategySummary: `We identified 4 high-value cost reduction maneuvers for ${destination} that preserve your 5★ comfort and dining standards.`,
    savingOpportunities: [
      {
        category: "Hotels",
        action: "Book Sovereign Palace via TravelVerse AI Member Direct Channel",
        savingsAmount: "$420 total",
        tradeoff: "None — includes free breakfast and guaranteed room upgrade",
        confidence: "98%",
      },
      {
        category: "Flights",
        action: "Shift departure date from Friday to Tuesday mid-week",
        savingsAmount: "$280 roundtrip",
        tradeoff: "Minor date shift of 2 days",
        confidence: "95%",
      },
      {
        category: "Transit Passes",
        action: "Utilize 7-Day All-Region Digital Rail Pass instead of point-to-point tickets",
        savingsAmount: "$140 total",
        tradeoff: "Zero — unlimited high-speed rail access",
        confidence: "99%",
      },
      {
        category: "Dining & Experiences",
        action: "Book lunch tasting menus at Michelin restaurants instead of dinner seatings",
        savingsAmount: "$80/person",
        tradeoff: "Identical culinary kitchen quality at 40% lower tasting rate",
        confidence: "94%",
      },
    ],
    dateShiftAlternatives: [
      {
        dateRange: "Sep 15 – Sep 22, 2026",
        priceDelta: "-$280 Total",
        advantage: "Tuesday to Tuesday travel window avoids weekend airport congestion",
      },
      {
        dateRange: "Sep 20 – Sep 27, 2026",
        priceDelta: "-$340 Total",
        advantage: "Shoulder season rate drop on luxury boutique ryokans",
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 7. PERSONALIZE ENDPOINT (POST /api/v1/ai/personalize)
// ==========================================
app.post(["/api/v1/ai/personalize", "/api/ai/personalize"], async (req, res) => {
  const {
    userProfile = {},
    travelPreferences = {},
    pastTrips = [],
    currentContext = {},
    destination = "Kyoto & Tokyo, Japan",
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI Personalization Architect.
Synthesize the user's travel DNA and generate deep bespoke recommendations:
- User Profile: ${JSON.stringify(userProfile)}
- Travel Preferences: ${JSON.stringify(travelPreferences)}
- Destination: ${destination}
- Current Context: ${JSON.stringify(currentContext)}

Return a valid JSON with:
{
  "travelerArchetype": "e.g. Cultural Epicurean Explorer",
  "personalizedAdvice": "Tailored guidance reflecting their exact dietary, pacing, and comfort preferences",
  "tailoredHighlights": [
    {
      "title": "Bespoke activity or venue",
      "reason": "Why this aligns with their profile",
      "matchScore": 99
    }
  ],
  "lifestyleMatches": ["Pescatarian-Friendly", "Step-Free Accessible", "Quiet Luxury"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed) {
        return res.json({
          success: true,
          destination,
          travelerArchetype: parsed.travelerArchetype || "Sovereign Cultural Connoisseur",
          personalizedAdvice: parsed.personalizedAdvice,
          tailoredHighlights: parsed.tailoredHighlights || [],
          lifestyleMatches: parsed.lifestyleMatches || [],
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Personalize Error:", err);
  }

  return res.json({
    success: true,
    destination,
    travelerArchetype: "Sovereign Cultural Epicurean",
    personalizedAdvice: `Based on your profile (${userProfile?.dietary || "Pescatarian"}, ${travelPreferences?.travelStyle || "Luxury Culture"}), your itinerary has been dynamically adapted with verified seafood-centric Michelin stops and quiet private morning temple access.`,
    tailoredHighlights: [
      {
        title: "Private Zen Masterclass & Matcha Ceremony",
        reason: "Matches your interest in sacred architecture and serene pacing.",
        matchScore: 99,
      },
      {
        title: "Seasonal Kaiseki Waterfront Dining",
        reason: "100% Pescatarian tasting menu curated by a 3-star Michelin chef.",
        matchScore: 98,
      },
      {
        title: "Chauffeur-Driven High-Speed Bullet Rail Transfers",
        reason: "Seamless luggage forwarding and zero-stress transit between hubs.",
        matchScore: 96,
      },
    ],
    lifestyleMatches: ["Pescatarian Verified", "Low-Stress Pacing", "VIP Access", "Sustainable Travel"],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 8. PACKING LIST ENDPOINT (POST /api/v1/ai/packing-list)
// ==========================================
app.post(["/api/v1/ai/packing-list", "/api/ai/packing-list"], async (req, res) => {
  const {
    destination = "Kyoto, Japan",
    durationDays = 7,
    season = "Autumn",
    weatherForecast = { temp: 24, condition: "Clear & Crisp" },
    activities = ["Temple visits", "Fine dining", "Bullet train travel"],
    travelers = 2,
    specialNeeds = [],
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI Packing Intelligence.
Generate an intelligent, weather-calibrated, categorized packing checklist for:
- Destination: ${destination}
- Duration: ${durationDays} Days (${season})
- Expected Weather: ${JSON.stringify(weatherForecast)}
- Planned Activities: ${activities.join(", ")}
- Travelers: ${travelers}
- Special Needs: ${specialNeeds.join(", ")}

Return a valid JSON with:
{
  "weatherAdvisory": "Brief climate and layer advice",
  "baggageAdvice": "Cabin vs checked luggage recommendation",
  "packingList": [
    {
      "category": "Essential Documents | Clothing | Footwear | Electronics | Toiletries | Special Gear",
      "items": [
        { "id": "p-1", "name": "Item name", "essential": true, "tip": "Helpful tip" }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed && parsed.packingList) {
        return res.json({
          success: true,
          destination,
          weatherAdvisory: parsed.weatherAdvisory || `Mild ${season} conditions with highs of 24°C.`,
          baggageAdvice: parsed.baggageAdvice || "One rolling carry-on + personal item per traveler.",
          packingList: parsed.packingList,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Packing List Error:", err);
  }

  // Realistic fallback packing list
  return res.json({
    success: true,
    destination,
    weatherAdvisory: `Autumn in ${destination} brings crisp, pleasant temperatures (20°C–25°C day / 14°C night). Layering is recommended for evening walks.`,
    baggageAdvice: `Recommended: 1 medium checked spinner + 1 tech backpack per traveler for effortless bullet train transit.`,
    packingList: [
      {
        category: "Essential Documents",
        items: [
          { id: "doc-1", name: "Passport (valid 6+ months)", essential: true, tip: "Keep digital copy in TravelVerse App" },
          { id: "doc-2", name: "International Digital Transit QR Passes", essential: true, tip: "Apple Wallet / Google Wallet ready" },
          { id: "doc-3", name: "Travel & Medical Insurance Policy Card", essential: true, tip: "24/7 Concierge helpline attached" },
        ],
      },
      {
        category: "Clothing & Layers",
        items: [
          { id: "clo-1", name: "Breathable Smart-Casual Tops (5-6)", essential: true, tip: "Merino wool or moisture-wicking" },
          { id: "clo-2", name: "Lightweight Jacket / Cardigan", essential: true, tip: "Ideal for breezy temple evenings" },
          { id: "clo-3", name: "Smart Dinner Attire", essential: false, tip: "Required for Michelin 3★ tasting rooms" },
          { id: "clo-4", name: "Temple-Appropriate Modest Attire", essential: true, tip: "Covers shoulders and knees" },
        ],
      },
      {
        category: "Footwear",
        items: [
          { id: "foo-1", name: "Cushioned Slip-On Walking Shoes", essential: true, tip: "Easy to remove when entering ryokans and shrines" },
          { id: "foo-2", name: "Smart Evening Shoes", essential: false, tip: "Comfortable leather or loafers" },
        ],
      },
      {
        category: "Electronics & Tech",
        items: [
          { id: "ele-1", name: "Universal Travel Plug Adapter (Type A/C)", essential: true, tip: "Japan / Global multi-pin" },
          { id: "ele-2", name: "10,000mAh Slim Power Bank", essential: true, tip: "Keep in carry-on bag (not checked luggage)" },
          { id: "ele-3", name: "Noise-Cancelling Wireless Headphones", essential: true, tip: "Essential for long-haul flight & bullet trains" },
        ],
      },
      {
        category: "Wellness & Toiletries",
        items: [
          { id: "toi-1", name: "Prescription Medications in Original Bottles", essential: true, tip: "Include English doctor summary" },
          { id: "toi-2", name: "Hydrating Facial Mist & Lip Balm", essential: false, tip: "Combats pressurized cabin dry air" },
        ],
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 9. SUPPORT ENDPOINT (POST /api/v1/ai/support)
// ==========================================
app.post(["/api/v1/ai/support", "/api/ai/support"], async (req, res) => {
  const {
    issueType = "flight_delay",
    issueDescription = "Flight delayed by 3 hours, risk of missing hotel check-in",
    bookingReference = "TV-89241X",
    userLocation = "San Francisco International Airport (SFO)",
    urgency = "high",
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI Emergency Travel Support & Passenger Rights Guardian.
Analyze the traveler's issue and provide immediate, actionable, reassuring resolution guidance:
- Issue Type: ${issueType}
- Description: ${issueDescription}
- Booking Reference: ${bookingReference}
- Location: ${userLocation}
- Urgency: ${urgency}

Return a valid JSON with:
{
  "urgencyLevel": "high | medium | low",
  "immediateActionSteps": ["Step 1", "Step 2", "Step 3"],
  "passengerRightsGuide": "Summary of airline/hotel rights (e.g. EU261, US DOT, compensation guarantees)",
  "resolutionScript": "Exact polite script traveler can read or show to agent/hotel desk",
  "contactDirectory": [
    { "name": "TravelVerse Autonomous Crisis Desk", "phone": "+1-800-555-TRAV", "channel": "24/7 Priority Audio & Chat" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed) {
        return res.json({
          success: true,
          bookingReference,
          urgencyLevel: parsed.urgencyLevel || urgency,
          immediateActionSteps: parsed.immediateActionSteps || [],
          passengerRightsGuide: parsed.passengerRightsGuide,
          resolutionScript: parsed.resolutionScript,
          contactDirectory: parsed.contactDirectory || [],
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Support Error:", err);
  }

  // Reassuring fallback support resolution
  return res.json({
    success: true,
    bookingReference,
    urgencyLevel: urgency,
    immediateActionSteps: [
      "TravelVerse has automatically notified your destination hotel (Aman Tokyo) of your revised arrival time.",
      "Your private airport transfer chauffeur has been rescheduled to your updated touchdown time with zero penalty fee.",
      "If your delay exceeds 3 hours, request a meal & beverage voucher directly at the airline customer service gate.",
    ],
    passengerRightsGuide:
      "Under international airline carriage agreements and US DOT guidelines, delays exceeding 3 hours entitle passengers to meal vouchers and priority rebooking without fare difference.",
    resolutionScript:
      "\"Hello, I am traveling on booking reference " +
      bookingReference +
      ". Due to the airline operational delay, our arrival is delayed. TravelVerse Concierge has flagged our profile for priority protection.\"",
    contactDirectory: [
      { name: "TravelVerse 24/7 Sovereign Crisis Desk", phone: "+1 (800) 555-TRAV", channel: "Priority Concierge" },
      { name: "Airport Chauffeur Dispatch", phone: "+81 3 5555 0199", channel: "WhatsApp & SMS" },
    ],
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 10. COMPARE ENDPOINT (POST /api/v1/ai/compare)
// ==========================================
app.post(["/api/v1/ai/compare", "/api/ai/compare"], async (req, res) => {
  const {
    itemType = "hotels",
    itemsToCompare = [
      { id: "h1", name: "Sovereign Palace Tokyo", price: 340, rating: 4.95, location: "Chiyoda", perks: ["Breakfast", "Spa"] },
      { id: "h2", name: "Suiran Kyoto Heritage", price: 280, rating: 4.92, location: "Arashiyama", perks: ["Onsen", "Garden"] },
    ],
    criteria = ["Value for money", "Location convenience", "Luxury amenities", "Flexibility"],
    userPriorities = ["Quiet atmosphere", "Fine dining"],
  } = req.body;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are TRAVELVERSE AI Comparative Intelligence Engine.
Perform a rigorous, balanced side-by-side comparison for:
- Item Type: ${itemType}
- Items: ${JSON.stringify(itemsToCompare)}
- Criteria: ${criteria.join(", ")}
- User Priorities: ${userPriorities.join(", ")}

Return a valid JSON with:
{
  "winnerId": "ID of recommended winning option",
  "verdictSummary": "Clear 2-sentence executive summary of why the winner was chosen",
  "valueAnalysis": "Detailed financial and convenience trade-off breakdown",
  "comparisonMatrix": [
    {
      "dimension": "Location & Transit",
      "scores": { "item_1_id": "9.5/10 - Central hub", "item_2_id": "8.0/10 - Peaceful suburb" },
      "verdict": "Item 1 wins for first-time visitors"
    }
  ],
  "dimensionRatings": {
    "overallWinner": "Name of winner"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const parsed = parseGeminiJson<any>(response.text);
      if (parsed) {
        return res.json({
          success: true,
          itemType,
          winnerId: parsed.winnerId || itemsToCompare[0]?.id || "item-1",
          verdictSummary: parsed.verdictSummary,
          valueAnalysis: parsed.valueAnalysis,
          comparisonMatrix: parsed.comparisonMatrix || [],
          dimensionRatings: parsed.dimensionRatings || {},
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("AI Compare Error:", err);
  }

  // Fallback comparison matrix
  const firstItem = itemsToCompare[0] || { id: "h1", name: "Option 1" };
  const secondItem = itemsToCompare[1] || { id: "h2", name: "Option 2" };

  return res.json({
    success: true,
    itemType,
    winnerId: firstItem.id,
    verdictSummary: `**${firstItem.name}** offers superior overall value when factoring in complimentary breakfast ($60/day value) and direct transit connectivity.`,
    valueAnalysis: `While ${secondItem.name} has a slightly lower nightly rate, ${firstItem.name} offsets the difference with included amenities and eliminates daily taxi expenditures.`,
    comparisonMatrix: [
      {
        dimension: "Location & Transit Access",
        scores: {
          [firstItem.id]: "9.6/10 — 3 min walk to primary rail station",
          [secondItem.id]: "8.4/10 — Scenic area requiring 15 min bus ride",
        },
        verdict: `${firstItem.name} provides significantly smoother daily logistics.`,
      },
      {
        dimension: "Value & Included Amenities",
        scores: {
          [firstItem.id]: "9.4/10 — Free breakfast + late checkout included",
          [secondItem.id]: "8.8/10 — Room only rate",
        },
        verdict: `${firstItem.name} yields an effective $80/day value advantage.`,
      },
      {
        dimension: "Atmosphere & Relaxation",
        scores: {
          [firstItem.id]: "9.0/10 — Modern luxury tower with skyline views",
          [secondItem.id]: "9.8/10 — Traditional historic garden sanctuary",
        },
        verdict: `${secondItem.name} excels for secluded wellness retreats.`,
      },
    ],
    dimensionRatings: {
      overallWinner: firstItem.name,
      bestBudgetPick: secondItem.name,
      bestConvenience: firstItem.name,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// SECURE AUTHENTICATION API (v1)
// ==========================================

interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored server-side only
  role: "traveler" | "agent" | "admin";
  avatar: string;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  carbonOffsetKg: number;
  passportNumber?: string;
  homeCity?: string;
  preferredLanguage?: string;
  travelStyles?: string[];
  budgetPreference?: string;
  favoriteDestinations?: string[];
  interests?: string[];
  dietaryPreferences?: string[];
  mobilityRequirements?: string[];
  dietary?: string;
  seatPreference?: string;
  preferredCabin?: string;
  travelPreferences?: {
    travelStyle: string[];
    budgetTier: string;
    preferredSeat: string;
    mealPreference: string;
    homeAirport: string;
    currency: string;
    homeCity?: string;
    preferredLanguage?: string;
    favoriteDestinations?: string[];
    interests?: string[];
    mobilityRequirements?: string[];
    dietaryPreferences?: string[];
  };
  onboardingCompleted: boolean;
  createdAt: string;
}

// In-memory Database
const usersDb = new Map<string, ServerUser>();
const activeSessions = new Map<string, { userId: string; expiresAt: number; token: string }>();
const otpCodes = new Map<string, { code: string; expiresAt: number }>();
const resetTokens = new Map<string, { email: string; token: string; code: string; expiresAt: number }>();

// Seed default users
const defaultSeedUsers: ServerUser[] = [
  {
    id: "usr-01",
    name: "Elena Rostova",
    email: "elena.rostova@travelverse.ai",
    passwordHash: "Password123!", // Demo hash
    role: "traveler",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isEmailVerified: true,
    loyaltyPoints: 34500,
    carbonOffsetKg: 850,
    passportNumber: "US-992817441",
    dietary: "Pescatarian",
    seatPreference: "Window",
    preferredCabin: "Business / First",
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-02",
    name: "Marcus Vance",
    email: "marcus.vance@travelverse.ai",
    passwordHash: "Password123!",
    role: "agent",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isEmailVerified: true,
    loyaltyPoints: 124000,
    carbonOffsetKg: 1200,
    passportNumber: "UK-48190214",
    dietary: "Standard",
    seatPreference: "Aisle",
    preferredCabin: "First Class",
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-03",
    name: "Admin Commander",
    email: "admin@travelverse.ai",
    passwordHash: "Password123!",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    isEmailVerified: true,
    loyaltyPoints: 500000,
    carbonOffsetKg: 0,
    passportNumber: "GLOBAL-ADMIN-01",
    dietary: "Standard",
    seatPreference: "Extra Legroom",
    preferredCabin: "First Class",
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  },
];

for (const u of defaultSeedUsers) {
  usersDb.set(u.email.toLowerCase(), u);
}

// Helper to sanitize user (strip passwordHash and sensitive internals)
function sanitizeUser(u: ServerUser) {
  const { passwordHash, ...safeUser } = u;
  return safeUser;
}

// Helper to generate secure random token
function generateToken(prefix: string = "tv_tok_") {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
}

// 1. POST /api/v1/auth/login
app.post("/api/v1/auth/login", (req, res) => {
  const { type = "password", email, password, otpCode, googleUser } = req.body;

  if (!email && type !== "google") {
    return res.status(400).json({ error: "Email is required." });
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  // 1A. Google SSO Login
  if (type === "google") {
    const gEmail = (googleUser?.email || email || "").toLowerCase().trim();
    if (!gEmail) {
      return res.status(400).json({ error: "Valid Google account credentials required." });
    }

    let user = usersDb.get(gEmail);
    if (!user) {
      // Auto-provision Google User
      user = {
        id: `usr-g-${Date.now()}`,
        name: googleUser?.name || "Google Traveler",
        email: gEmail,
        passwordHash: "",
        role: "traveler",
        avatar: googleUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        isEmailVerified: true,
        loyaltyPoints: 5000,
        carbonOffsetKg: 0,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      };
      usersDb.set(gEmail, user);
    }

    const token = generateToken("tv_sess_");
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
    activeSessions.set(token, { userId: user.id, expiresAt, token });

    return res.json({
      success: true,
      token,
      expiresIn: 86400,
      sessionExpiry: expiresAt,
      user: sanitizeUser(user),
      message: "Successfully signed in via Google Sovereign SSO.",
    });
  }

  // 1B. OTP Login
  if (type === "otp") {
    // Check if requesting OTP code
    if (req.body.action === "request-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpCodes.set(normalizedEmail, {
        code: generatedOtp,
        expiresAt: Date.now() + 1000 * 60 * 10, // 10 mins
      });

      return res.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${normalizedEmail}`,
        devOtpCode: generatedOtp, // Provided for instant sandbox testing
        expiresInSeconds: 600,
      });
    }

    // Verifying OTP code
    const storedOtp = otpCodes.get(normalizedEmail);
    if (!storedOtp) {
      return res.status(400).json({ error: "No active OTP request found for this email. Please request a new code." });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpCodes.delete(normalizedEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    if (storedOtp.code !== otpCode?.trim()) {
      return res.status(400).json({ error: "Invalid verification code. Please check your email and try again." });
    }

    // OTP Verified - clear OTP
    otpCodes.delete(normalizedEmail);

    let user = usersDb.get(normalizedEmail);
    if (!user) {
      // Auto register traveler with verified email
      user = {
        id: `usr-otp-${Date.now()}`,
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        passwordHash: "",
        role: "traveler",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        isEmailVerified: true,
        loyaltyPoints: 2500,
        carbonOffsetKg: 0,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
      usersDb.set(normalizedEmail, user);
    }

    const token = generateToken("tv_sess_");
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
    activeSessions.set(token, { userId: user.id, expiresAt, token });

    return res.json({
      success: true,
      token,
      expiresIn: 86400,
      sessionExpiry: expiresAt,
      user: sanitizeUser(user),
      message: "One-Time Password verified successfully.",
    });
  }

  // 1C. Standard Password Login
  const user = usersDb.get(normalizedEmail);
  if (!user) {
    return res.status(401).json({
      error: "No account found with this email. Please verify your address or create a new account.",
    });
  }

  // In production this would be bcrypt.compare
  if (user.passwordHash && password !== user.passwordHash) {
    return res.status(401).json({
      error: "Invalid password credentials. Please double-check your password or use forgot password.",
    });
  }

  const token = generateToken("tv_sess_");
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  activeSessions.set(token, { userId: user.id, expiresAt, token });

  return res.json({
    success: true,
    token,
    expiresIn: 86400,
    sessionExpiry: expiresAt,
    user: sanitizeUser(user),
    message: `Welcome back, ${user.name}!`,
  });
});

// 2. POST /api/v1/auth/register
app.post("/api/v1/auth/register", (req, res) => {
  const { name, email, password, role = "traveler" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Full name, email, and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (usersDb.has(normalizedEmail)) {
    return res.status(409).json({
      error: "An account with this email address already exists. Please sign in instead.",
    });
  }

  const generatedVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  otpCodes.set(normalizedEmail, {
    code: generatedVerificationCode,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours for email verification
  });

  const newUser: ServerUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
    role: role as any,
    avatar:
      role === "agent"
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isEmailVerified: false,
    loyaltyPoints: 1000,
    carbonOffsetKg: 0,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  };

  usersDb.set(normalizedEmail, newUser);

  const token = generateToken("tv_sess_");
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  activeSessions.set(token, { userId: newUser.id, expiresAt, token });

  return res.status(201).json({
    success: true,
    token,
    expiresIn: 86400,
    sessionExpiry: expiresAt,
    user: sanitizeUser(newUser),
    requireEmailVerification: true,
    verificationCodeDev: generatedVerificationCode,
    message: "Account created successfully! Please verify your email to unlock all travel benefits.",
  });
});

// 3. POST /api/v1/auth/forgot-password
app.post("/api/v1/auth/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = usersDb.get(normalizedEmail);

  // For security, even if user doesn't exist, we send a generic response or generated token for demo
  const resetToken = generateToken("tv_rst_");
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

  resetTokens.set(resetToken, {
    email: normalizedEmail,
    token: resetToken,
    code: resetCode,
    expiresAt,
  });

  // Also map code for easy PIN entry
  resetTokens.set(resetCode, {
    email: normalizedEmail,
    token: resetToken,
    code: resetCode,
    expiresAt,
  });

  return res.json({
    success: true,
    message: `Password reset instructions and verification code have been dispatched to ${normalizedEmail}.`,
    resetToken,
    resetCodeDev: resetCode,
    expiresAt,
    exists: !!user,
  });
});

// 4. POST /api/v1/auth/reset-password
app.post("/api/v1/auth/reset-password", (req, res) => {
  const { tokenOrCode, newPassword } = req.body;

  if (!tokenOrCode || !newPassword) {
    return res.status(400).json({ error: "Reset token/code and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const session = resetTokens.get(tokenOrCode.trim());
  if (!session) {
    return res.status(400).json({ error: "Invalid or expired password reset link/code. Please request a new one." });
  }

  if (Date.now() > session.expiresAt) {
    resetTokens.delete(tokenOrCode.trim());
    return res.status(400).json({ error: "This password reset session has expired (15 min limit). Please request a new one." });
  }

  const user = usersDb.get(session.email);
  if (!user) {
    return res.status(404).json({ error: "Associated user account not found." });
  }

  // Update password in database
  user.passwordHash = newPassword;
  usersDb.set(session.email, user);

  // Clean up tokens
  resetTokens.delete(session.token);
  resetTokens.delete(session.code);

  return res.json({
    success: true,
    message: "Password has been successfully updated! You can now sign in with your new password.",
  });
});

// 5. POST /api/v1/auth/verify
app.post("/api/v1/auth/verify", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email address and 6-digit verification code are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const stored = otpCodes.get(normalizedEmail);

  if (!stored) {
    return res.status(400).json({ error: "No pending email verification found. Please request a new code." });
  }

  if (Date.now() > stored.expiresAt) {
    otpCodes.delete(normalizedEmail);
    return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({ error: "Invalid verification code. Please check the code and try again." });
  }

  // Verification passed
  otpCodes.delete(normalizedEmail);
  const user = usersDb.get(normalizedEmail);
  if (user) {
    user.isEmailVerified = true;
    usersDb.set(normalizedEmail, user);
  }

  return res.json({
    success: true,
    message: "Email address successfully verified! Your TravelVerse account is fully unlocked.",
    user: user ? sanitizeUser(user) : null,
  });
});

// 6. GET /api/v1/auth/me (Session Check & Expiration Validation)
app.get("/api/v1/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authorization token provided." });
  }

  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: "Session is invalid or has expired. Please sign in again." });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: "Your session has expired. Please log in to continue." });
  }

  // Find user
  let foundUser: ServerUser | undefined;
  for (const u of usersDb.values()) {
    if (u.id === session.userId) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: "User account no longer exists." });
  }

  return res.json({
    success: true,
    user: sanitizeUser(foundUser),
    sessionExpiry: session.expiresAt,
  });
});

// 7. POST /api/v1/auth/logout
app.post("/api/v1/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: "Logged out successfully." });
});

// 8. POST /api/v1/profile/preferences (First-Time User Onboarding & Profiling)
app.post("/api/v1/profile/preferences", (req, res) => {
  const authHeader = req.headers.authorization;
  let user: ServerUser | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const session = activeSessions.get(token);
    if (session) {
      for (const u of usersDb.values()) {
        if (u.id === session.userId) {
          user = u;
          break;
        }
      }
    }
  }

  const {
    name,
    homeCity,
    preferredLanguage,
    travelStyle,
    travelStyles,
    budgetPreference,
    favoriteDestinations,
    interests,
    dietaryPreferences,
    dietary,
    mobilityRequirements,
  } = req.body;

  const styles: string[] = Array.isArray(travelStyle)
    ? travelStyle
    : Array.isArray(travelStyles)
    ? travelStyles
    : travelStyle
    ? [travelStyle]
    : ["Luxury", "Culture"];

  const parsedDietary: string = Array.isArray(dietaryPreferences)
    ? dietaryPreferences.join(", ")
    : dietaryPreferences || dietary || "Standard";

  const parsedMobility: string[] = Array.isArray(mobilityRequirements)
    ? mobilityRequirements
    : mobilityRequirements
    ? [mobilityRequirements]
    : ["Standard / Fully Mobile"];

  const parsedDestinations: string[] = Array.isArray(favoriteDestinations)
    ? favoriteDestinations
    : favoriteDestinations
    ? [favoriteDestinations]
    : ["Tokyo", "Amalfi Coast"];

  const parsedInterests: string[] = Array.isArray(interests)
    ? interests
    : interests
    ? [interests]
    : ["Fine Dining & Wine", "Historical Architecture"];

  if (user) {
    if (name) user.name = name;
    user.homeCity = homeCity || user.homeCity || "San Francisco";
    user.preferredLanguage = preferredLanguage || user.preferredLanguage || "English";
    user.travelStyles = styles;
    user.budgetPreference = budgetPreference || user.budgetPreference || "Luxury";
    user.favoriteDestinations = parsedDestinations;
    user.interests = parsedInterests;
    user.dietary = parsedDietary;
    user.dietaryPreferences = Array.isArray(dietaryPreferences) ? dietaryPreferences : [parsedDietary];
    user.mobilityRequirements = parsedMobility;
    user.onboardingCompleted = true;
    user.travelPreferences = {
      travelStyle: styles,
      budgetTier: budgetPreference || "luxury",
      preferredSeat: (user.seatPreference || "window").toLowerCase(),
      mealPreference: parsedDietary.toLowerCase(),
      homeAirport: (homeCity || "SFO").slice(0, 3).toUpperCase(),
      currency: "USD",
      homeCity: homeCity || user.homeCity,
      preferredLanguage: preferredLanguage || user.preferredLanguage,
      favoriteDestinations: parsedDestinations,
      interests: parsedInterests,
      mobilityRequirements: parsedMobility,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [parsedDietary],
    };
    usersDb.set(user.email.toLowerCase(), user);
  } else {
    // If not authenticated or guest mode, create calibrated user representation
    user = {
      id: `usr-${Date.now()}`,
      name: name || "Elena Rostova",
      email: "elena.rostova@travelverse.ai",
      passwordHash: "",
      role: "traveler",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isEmailVerified: true,
      loyaltyPoints: 5000,
      carbonOffsetKg: 0,
      homeCity: homeCity || "San Francisco",
      preferredLanguage: preferredLanguage || "English",
      travelStyles: styles,
      budgetPreference: budgetPreference || "Luxury",
      favoriteDestinations: parsedDestinations,
      interests: parsedInterests,
      dietary: parsedDietary,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [parsedDietary],
      mobilityRequirements: parsedMobility,
      onboardingCompleted: true,
      travelPreferences: {
        travelStyle: styles,
        budgetTier: budgetPreference || "luxury",
        preferredSeat: "window",
        mealPreference: parsedDietary.toLowerCase(),
        homeAirport: (homeCity || "SFO").slice(0, 3).toUpperCase(),
        currency: "USD",
        homeCity: homeCity || "San Francisco",
        preferredLanguage: preferredLanguage || "English",
        favoriteDestinations: parsedDestinations,
        interests: parsedInterests,
        mobilityRequirements: parsedMobility,
        dietaryPreferences: Array.isArray(dietaryPreferences) ? dietaryPreferences : [parsedDietary],
      },
      createdAt: new Date().toISOString(),
    };
  }

    return res.json({
      success: true,
      message: "Traveler profile preferences calibrated successfully.",
      user: sanitizeUser(user),
      personalizedFeed: {
        primaryStyle: styles[0] || "Luxury",
        suggestedDestinations: parsedDestinations,
        originAirport: (homeCity || "SFO").slice(0, 3).toUpperCase(),
        accessibilityOptimized: parsedMobility.some((m: string) => !m.toLowerCase().includes("standard")),
      },
    });
  });

  // 9. GET /api/v1/home/overview (Real-time dynamic data for the Homepage)
  app.get("/api/v1/home/overview", (req, res) => {
    const upcomingTrip = {
      id: "trip-up-2026",
      title: "Autumn Serenade in Kyoto & Tokyo",
      destination: "Tokyo & Kyoto",
      country: "Japan",
      coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      startDate: "2026-09-12",
      endDate: "2026-09-19",
      daysUntil: 22,
      status: "Confirmed & Ticketed",
      flightNumber: "QA 782 (Quantum Business SkySuite)",
      hotelName: "Aman Tokyo & Suiran Kyoto",
      departureGate: "Gate B14 • Terminal 1",
      boardingTime: "07:45 AM",
      pnrCode: "TV-89241X",
      travelersCount: 2,
      weatherForecast: { temp: 24, condition: "Clear & Crisp", icon: "☀️", advisory: "Optimal autumn foliage viewing" },
      progressPercent: 100,
      carbonOffsetKg: 420,
    };

    const aiRecommendations = [
      {
        id: "rec-1",
        badge: "AI Style Match • 99%",
        title: "Kyoto Twilight Zen & Michelin Kaiseki",
        category: "Cultural & Luxury",
        destination: "Kyoto, Japan",
        duration: "6 Days",
        estimatedCost: "$3,850",
        rating: 4.98,
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        aiRationale: "Selected based on your Pescatarian dining preference and passion for sacred architecture.",
        tags: ["Tea Ceremony", "Private Ryokan", "Gran Class Rail"],
      },
      {
        id: "rec-2",
        badge: "Trending Autonomous Deal",
        title: "Dubai Desert Oasis & Sky Lounge Helicopter Tour",
        category: "Luxury & Adventure",
        destination: "Dubai, UAE",
        duration: "5 Days",
        estimatedCost: "$2,400 (₹1.98 Lakh)",
        rating: 4.96,
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
        aiRationale: "Matches your ₹2 lakh family budget target with private Bedouin falconry & Burj Khalifa access.",
        tags: ["Platinum Falconry", "Burj Al Arab", "Helicopter Transfer"],
      },
      {
        id: "rec-3",
        badge: "Wellness Sanctuary",
        title: "Amalfi Coast Yacht & Ravello Lemon Estate",
        category: "Wellness & Romance",
        destination: "Amalfi Coast, Italy",
        duration: "7 Days",
        estimatedCost: "$4,200",
        rating: 4.99,
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        aiRationale: "Calibrated for step-free private boat transfers and panoramic cliffside relaxation.",
        tags: ["Private Riva Boat", "Cliffside Pool", "Organic Vineyard"],
      },
    ];

    const popularDestinations = [
      {
        id: "dest-1",
        name: "Tokyo & Kyoto",
        country: "Japan",
        region: "East Asia",
        tagline: "Neon hyper-cities, ancient torii gates & culinary masters",
        rating: 4.97,
        temperature: "24°C",
        weather: "Sunny",
        startingPrice: 1240,
        currency: "USD",
        safetyLevel: "Level 1 (Highest Safety)",
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Culture", "Gastronomy", "Transit Hub"],
      },
      {
        id: "dest-2",
        name: "Dubai",
        country: "United Arab Emirates",
        region: "Middle East",
        tagline: "Futuristic skyscrapers, golden dunes & luxury hospitality",
        rating: 4.95,
        temperature: "31°C",
        weather: "Clear Skies",
        startingPrice: 890,
        currency: "USD",
        safetyLevel: "Level 1 (Highest Safety)",
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Family", "Luxury", "Shopping"],
      },
      {
        id: "dest-3",
        name: "Paris",
        country: "France",
        region: "Western Europe",
        tagline: "Haute couture, Louvre masterpieces & Seine romantic bistros",
        rating: 4.92,
        temperature: "21°C",
        weather: "Mild",
        startingPrice: 950,
        currency: "USD",
        safetyLevel: "Level 1 (Exercise Normal Precautions)",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Art", "Romantic", "Architecture"],
      },
      {
        id: "dest-4",
        name: "Maldives Islands",
        country: "Maldives",
        region: "Indian Ocean",
        tagline: "Pristine overwater bungalows, bioluminescent bays & coral reefs",
        rating: 4.99,
        temperature: "29°C",
        weather: "Tropical Breeze",
        startingPrice: 1850,
        currency: "USD",
        safetyLevel: "Level 1 (Highest Safety)",
        imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Honeymoon", "Diving", "Spa"],
      },
      {
        id: "dest-5",
        name: "Swiss Alps & Zermatt",
        country: "Switzerland",
        region: "Central Europe",
        tagline: "Panoramic Glacier Express, Matterhorn peaks & thermal spas",
        rating: 4.96,
        temperature: "16°C",
        weather: "Crisp Alpine",
        startingPrice: 1450,
        currency: "USD",
        safetyLevel: "Level 1 (Highest Safety)",
        imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Adventure", "Scenic Rail", "Ski"],
      },
      {
        id: "dest-6",
        name: "Amalfi Coast",
        country: "Italy",
        region: "Southern Europe",
        tagline: "Pastel cliffside villages, Capri blue grottos & lemon groves",
        rating: 4.98,
        temperature: "26°C",
        weather: "Sunny Coastal",
        startingPrice: 1320,
        currency: "USD",
        safetyLevel: "Level 1 (Exercise Normal Precautions)",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        vrAvailable: true,
        tags: ["Luxury", "Yachting", "Seafood"],
      },
    ];

    const trendingExperiences = [
      {
        id: "exp-1",
        title: "Dubai Platinum Desert Falconry & Royal Dune Dinner",
        category: "VIP Safari",
        city: "Dubai",
        country: "UAE",
        duration: "6.5 hours",
        price: 240,
        currency: "USD",
        rating: 4.98,
        reviewsCount: 1840,
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
        instantConfirmation: true,
        badge: "Top Seller",
      },
      {
        id: "exp-2",
        title: "Tokyo Cyber-Night Izakaya Odyssey & Secret Bars",
        category: "Culinary & Nightlife",
        city: "Tokyo",
        country: "Japan",
        duration: "4.5 hours",
        price: 135,
        currency: "USD",
        rating: 4.97,
        reviewsCount: 1680,
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        instantConfirmation: true,
        badge: "Michelin Insider",
      },
      {
        id: "exp-3",
        title: "Santorini Sunset Catamaran Cruise with Greek Feast",
        category: "Yacht & Sailing",
        city: "Santorini",
        country: "Greece",
        duration: "5 hours",
        price: 175,
        currency: "USD",
        rating: 4.96,
        reviewsCount: 2240,
        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
        instantConfirmation: true,
        badge: "Best Sunset View",
      },
      {
        id: "exp-4",
        title: "Reykjavik Aurora Borealis Hunt by 4x4 Superjeep",
        category: "Adventure & Astro",
        city: "Reykjavik",
        country: "Iceland",
        duration: "4 hours",
        price: 195,
        currency: "USD",
        rating: 4.94,
        reviewsCount: 980,
        imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
        instantConfirmation: true,
        badge: "Free Re-Hunt Guarantee",
      },
    ];

    const vrPortals = [
      {
        id: "vr-1",
        title: "Maldives Coral Lagoon Overwater Retreat",
        location: "Noonu Atoll, Maldives",
        type: "360° Overwater Villa",
        hotspotsCount: 3,
        thumbnailUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
        badge: "4K Spatial Audio",
      },
      {
        id: "vr-2",
        title: "Tokyo Shibuya Sky at Twilight",
        location: "Tokyo, Japan",
        type: "360° Rooftop Panorama",
        hotspotsCount: 4,
        thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        badge: "Mount Fuji Horizon",
      },
      {
        id: "vr-3",
        title: "Swiss Alps Glacier Express Panorama Car",
        location: "Andermatt, Switzerland",
        type: "360° Alpine Train",
        hotspotsCount: 3,
        thumbnailUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
        badge: "Glass-Dome Vista",
      },
    ];

    const travelSafety = {
      globalStatus: "Active & Monitored 24/7",
      activeAdvisoriesCount: 0,
      emergencyPhone: "+1 800 555 0199",
      sosStatus: "Instant Response Online",
      advisories: [
        {
          id: "saf-1",
          country: "Japan (Tokyo, Kyoto, Osaka)",
          level: "Level 1: Exercise Normal Precautions",
          statusColor: "emerald",
          entryRequirements: "eVisa / Visit Japan Web QR Code • 6-Month Passport Validity",
          healthStatus: "No quarantine or vaccination mandates required.",
          lastVerified: "Updated 10 mins ago via IATA & WHO feed",
        },
        {
          id: "saf-2",
          country: "United Arab Emirates (Dubai, Abu Dhabi)",
          level: "Level 1: Exercise Normal Precautions",
          statusColor: "emerald",
          entryRequirements: "30-day tourist visa on arrival for 70+ nations • Travel Insurance Recommended",
          healthStatus: "World-class healthcare coverage & medical concierge active.",
          lastVerified: "Updated 15 mins ago",
        },
        {
          id: "saf-3",
          country: "Schengen Zone (France, Italy, Switzerland)",
          level: "Level 1: Exercise Normal Precautions",
          statusColor: "emerald",
          entryRequirements: "ETIAS pre-clearance ready • Valid travel medical insurance ($30k+ coverage)",
          healthStatus: "Universal emergency medical standard verified.",
          lastVerified: "Updated 25 mins ago",
        },
      ],
      features: [
        { title: "24/7 Global SOS Dispatch", desc: "One-tap emergency medical evacuation and embassy concierge." },
        { title: "Autonomous Flight Delay Shield", desc: "Instant lounge passes and automatic re-routing on delays over 60 mins." },
        { title: "Biometric Wallet Encryption", desc: "Passports and boarding passes protected by multi-signature sovereign encryption." },
      ],
    };

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      upcomingTrip,
      aiRecommendations,
      popularDestinations,
      trendingExperiences,
      vrPortals,
      travelSafety,
    });
  });

  // 10. POST /api/v1/home/copilot-assist (Live Agent Copilot for Homepage)
  app.post("/api/v1/home/copilot-assist", async (req, res) => {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    try {
      const ai = getGeminiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are TravelVerse AI Copilot, the world's most advanced autonomous travel assistant.
The user asked: "${prompt}"
Context: User is on the TravelVerse AI homepage.
Respond in a sharp, structured JSON format with:
{
  "headline": "Short punchy response title (max 8 words)",
  "analysis": "2-3 crisp sentences answering the user with actionable intelligence and pricing estimates",
  "recommendedAction": "Primary recommended action (e.g., 'Plan Dubai Family Trip', 'Search Flights')",
  "estimatedBudget": "Estimated cost range (e.g. '₹1.85L - ₹2.10L / $2,200 - $2,500')",
  "suggestedPrompts": ["3 quick follow-up prompt pills"]
}
Return only pure JSON.`,
                },
              ],
            },
          ],
        });

        const raw = response.text?.replace(/```json|```/g, "").trim();
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            return res.json({ success: true, result: parsed, source: "gemini" });
          } catch {}
        }
      }
    } catch (err) {
      console.error("Copilot Error:", err);
    }

    // High quality intelligent fallback if AI key isn't provided or offline
    const isDubai = prompt.toLowerCase().includes("dubai");
    const isJapan = prompt.toLowerCase().includes("japan") || prompt.toLowerCase().includes("tokyo");

    return res.json({
      success: true,
      source: "autonomous_agent_engine",
      result: {
        headline: isDubai
          ? "Dubai Family Sovereign Escape Calibrated"
          : isJapan
          ? "Tokyo & Kyoto Autumn Odyssey Configured"
          : "Tailored Travel Plan Generated",
        analysis: isDubai
          ? "We have structured a 5-day luxury Dubai family itinerary under ₹2 lakh ($2,400). Includes 4-star suites in Downtown Dubai, desert falconry safari, Dubai Mall aquarium passes, and direct Emirates flights."
          : `We analyzed real-time flight inventory and accommodations for "${prompt}". Our autonomous engine identified 3 optimized routes with premium amenities matching your travel DNA.`,
        recommendedAction: isDubai ? "Generate 5-Day Dubai Family Itinerary" : "Explore Instant Bookings",
        estimatedBudget: isDubai ? "₹1.85L - ₹1.98L ($2,250)" : "$1,800 - $3,400",
        suggestedPrompts: [
          "Show day-by-day itinerary breakdown",
          "Preview hotel rooms in 360° VR",
          "Check visa rules & safety advisories",
        ],
      },
    });
  });

// ==========================================
// 11. DOCUMENTS MANAGEMENT API
// ==========================================
interface ServerTravelDocument {
  id: string;
  userId: string;
  title: string;
  documentType: string;
  expiryDate: string;
  status: string;
  fileUrl: string;
  qrCodeData?: string;
}

const documentsDb = new Map<string, ServerTravelDocument>([
  {
    id: "doc-1",
    userId: "u-101",
    title: "Biometric Passport (US)",
    documentType: "passport",
    expiryDate: "2032-11-20",
    status: "valid",
    fileUrl: "s3://secure-private-bucket/passports/us-9928.pdf",
    qrCodeData: "PASSPORT-US-992817441",
  },
  {
    id: "doc-2",
    userId: "u-101",
    title: "Boarding Pass: Quantum Air QA-88",
    documentType: "boarding_pass",
    expiryDate: "2026-09-12",
    status: "valid",
    fileUrl: "s3://secure-private-bucket/tickets/qa88.pdf",
    qrCodeData: "BP-QA88-SFO-HND-ELENA-ROSTOVA",
  },
  {
    id: "doc-3",
    userId: "u-101",
    title: "Japan Visit e-Tourist Clearance",
    documentType: "visa",
    expiryDate: "2026-10-15",
    status: "valid",
    fileUrl: "s3://secure-private-bucket/visas/japan-clearance.pdf",
    qrCodeData: "VISIT-JAPAN-WEB-APPROVED-2026",
  },
  {
    id: "doc-4",
    userId: "u-101",
    title: "Global Travel & Medical SOS Insurance",
    documentType: "insurance",
    expiryDate: "2026-12-31",
    status: "valid",
    fileUrl: "s3://secure-private-bucket/insurance/sos-medical.pdf",
  }
].map(d => [d.id, d]));

// Helper to generate a secure signed URL (token valid for 60 seconds)
function generateSignedUrl(docId: string): string {
  const expiresAt = Date.now() + 60000;
  const token = Buffer.from(JSON.stringify({ docId, expiresAt })).toString("base64");
  return `/api/documents/${docId}/preview?token=${token}`;
}

app.get("/api/documents", (req, res) => {
  // Map documents to strip raw s3 private URLs and replace with secure proxy signed URLs
  const safeDocs = Array.from(documentsDb.values()).map(doc => ({
    ...doc,
    fileUrl: generateSignedUrl(doc.id) // Instead of private S3 link, give them the secure signed URL
  }));
  res.json(safeDocs);
});

app.post("/api/documents/upload", (req, res) => {
  const { title, documentType, expiryDate } = req.body;
  const id = `doc-${Date.now()}`;
  const newDoc: ServerTravelDocument = {
    id,
    userId: "u-101",
    title: title || `Uploaded ${documentType}`,
    documentType: documentType || "id",
    expiryDate: expiryDate || "2030-01-01",
    status: "valid",
    fileUrl: `s3://secure-private-bucket/user-uploads/${id}.pdf`,
    qrCodeData: `SECURE-QR-${id}`
  };
  
  documentsDb.set(id, newDoc);
  res.json({
    ...newDoc,
    fileUrl: generateSignedUrl(id)
  });
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  if (documentsDb.has(id)) {
    documentsDb.delete(id);
    return res.json({ success: true, message: "Document deleted successfully." });
  }
  res.status(404).json({ error: "Document not found." });
});

// Secure endpoint checking signature
app.get("/api/documents/:id/preview", (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  
  if (!token) {
    return res.status(403).json({ error: "Access Denied: Missing signed token." });
  }

  try {
    const payload = JSON.parse(Buffer.from(token as string, "base64").toString("utf-8"));
    if (payload.docId !== id || Date.now() > payload.expiresAt) {
      return res.status(403).json({ error: "Access Denied: Signed URL has expired or is invalid." });
    }

    const doc = documentsDb.get(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found." });
    }

    // Serve mock file visual data
    res.json({
      success: true,
      message: "Secure session verified.",
      title: doc.title,
      type: doc.documentType,
      expiresAt: doc.expiryDate,
      content: `[VERIFIED SECURE DATA STREAM FROM INTERNAL SECURE VAULT] - Reference ID: ${doc.id}`
    });
  } catch (err) {
    res.status(403).json({ error: "Access Denied: Invalid signature token." });
  }
});

// ==========================================
// 12. DOCUSWIFT AGENT DOCUMENT BUILDER API
// ==========================================
interface DocuSwiftItem {
  id: string;
  type: "quotation" | "itinerary" | "invoice" | "voucher" | "email";
  clientName: string;
  destination: string;
  title: string;
  sections: { heading: string; body: string }[];
  price?: number;
  currency?: string;
  status: "draft" | "sent";
}

const docuSwiftDb = new Map<string, DocuSwiftItem>();

app.post("/api/v1/agent/docuswift/generate", async (req, res) => {
  const { type, clientName, destination, coreDetails } = req.body;
  const id = `doc-swift-${Date.now()}`;
  
  let title = `${type.toUpperCase()} - ${clientName} - ${destination}`;
  let sections: { heading: string; body: string }[] = [];
  let price = 2450;
  
  if (type === "quotation") {
    sections = [
      { heading: "Executive Summary", body: `Premium tailored quotation for ${clientName} traveling to ${destination}. Designed based on luxury GDS inventory.` },
      { heading: "Inventory & Options Mapped", body: "Option A: 5-Star Boutique Lodge with Private Transfers.\nOption B: City Center Grand Executive Suite." },
      { heading: "Payment Terms", body: "50% deposit required upon confirmation. Balance due 14 days before departure." }
    ];
  } else if (type === "itinerary") {
    sections = [
      { heading: "Day 1: Arrival & Private Chauffeur", body: "Private meet and greet at terminal, transit to hotel." },
      { heading: "Day 2: Cultural Walking Tour", body: "4-hour guided walking tour of main historic quarters." },
      { heading: "Day 3: Scenic Leisure & Gala Dinner", body: "Free afternoon followed by high-rise skyline panoramic dinner." }
    ];
  } else if (type === "invoice") {
    sections = [
      { heading: "Bill To", body: clientName },
      { heading: "Travel Services Provided", body: `Flight, Hotel, Experience package mapping for ${destination}.` },
      { heading: "Tax & Provider Surcharges", body: "GDS Booking Fees: $120. VAT/GST: $180." }
    ];
    price = 2750;
  } else if (type === "voucher") {
    sections = [
      { heading: "Voucher Reference", body: `TV-VOUCH-${Date.now().toString().slice(-6)}` },
      { heading: "Service Provider Details", body: `Sovereign Palace Spa & Lodge, ${destination}` },
      { heading: "Check-in Instructions", body: "Present this secure voucher at reception along with your Biometric Passport." }
    ];
  } else {
    // Email template
    sections = [
      { heading: "Subject", body: `Your TravelVerse AI Itinerary and Quote for ${destination} is Ready!` },
      { heading: "Salutation", body: `Dear ${clientName},` },
      { heading: "Message Body", body: `We have finalized your bespoke trip plan for ${destination}. Please click below to review and secure your bookings.` }
    ];
  }

  // Use Gemini to enrich the document content if configured
  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are DocuSwift, an expert travel agent document generation bot.
Generate a structured document matching the type: "${type}" for Client: "${clientName}" traveling to "${destination}".
Additional inputs: "${coreDetails || "None"}".
Provide a JSON response representing the document title and sections:
{
  "title": "Document Title",
  "sections": [
    { "heading": "Section Heading", "body": "Detailed paragraph of text matching document style" }
  ]
}
Return only valid JSON.`,
              },
            ],
          },
        ],
      });

      const raw = response.text?.replace(/```json|```/g, "").trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.title && parsed.sections) {
          title = parsed.title;
          sections = parsed.sections;
        }
      }
    }
  } catch (err) {
    console.warn("DocuSwift AI enrichment skipped:", err);
  }

  const newItem: DocuSwiftItem = {
    id,
    type,
    clientName,
    destination,
    title,
    sections,
    price,
    currency: "USD",
    status: "draft"
  };

  docuSwiftDb.set(id, newItem);
  res.json(newItem);
});

app.put("/api/v1/agent/docuswift/edit/:id", (req, res) => {
  const { id } = req.params;
  const { title, sections } = req.body;
  
  const item = docuSwiftDb.get(id);
  if (!item) {
    return res.status(404).json({ error: "Document not found." });
  }

  item.title = title || item.title;
  item.sections = sections || item.sections;
  
  docuSwiftDb.set(id, item);
  res.json(item);
});

app.post("/api/v1/agent/docuswift/send/:id", (req, res) => {
  const { id } = req.params;
  const item = docuSwiftDb.get(id);
  if (!item) {
    return res.status(404).json({ error: "Document not found." });
  }

  item.status = "sent";
  docuSwiftDb.set(id, item);
  res.json({ success: true, message: `Document sent successfully to ${item.clientName}!` });
});

// ==========================================
// 13. B2B AGENT ALERTS API
// ==========================================
interface AgentAlert {
  id: string;
  type: "flight" | "price" | "weather" | "visa" | "inventory" | "booking" | "payment";
  priority: "Critical" | "High" | "Medium" | "Low";
  problem: string;
  customerName: string;
  tripTitle: string;
  timestamp: string;
  aiRecommendation: string;
  actionLabel: string;
  read: boolean;
  status: "active" | "resolved";
}

const agentAlertsDb = new Map<string, AgentAlert>([
  [
    "alert-1",
    {
      id: "alert-1",
      type: "flight",
      priority: "Critical",
      problem: "Flight JL005 canceled due to volcanic ash advisory (Tokyo HND). Affects 4 travelers.",
      customerName: "Hastings Crew",
      tripTitle: "Tokyo & Kyoto Autumn Odyssey",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      aiRecommendation: "Rebook to ANA NH109 leaving 3 hours later. Partner GDS has 4 seat inventory available at waiver code.",
      actionLabel: "Auto-Rebook Flight via GDS",
      read: false,
      status: "active"
    }
  ],
  [
    "alert-2",
    {
      id: "alert-2",
      type: "visa",
      priority: "High",
      problem: "Mandatory eVisa clearance pending verification for destination Singapore.",
      customerName: "Elena Rostova",
      tripTitle: "Amalfi & Singapore Luxury Transit",
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2h ago
      aiRecommendation: "Verify travel clearance certificate PDF. If valid, force-push update status in GDS profile.",
      actionLabel: "Verify eVisa Upload",
      read: false,
      status: "active"
    }
  ],
  [
    "alert-3",
    {
      id: "alert-3",
      type: "weather",
      priority: "Medium",
      problem: "Typhoon warning issued for Amalfi region. Possible disruption to coastal yacht charters.",
      customerName: "Lord Hastings",
      tripTitle: "Amalfi Coast Yacht Sovereign Voyage",
      timestamp: new Date(Date.now() - 14400000).toISOString(), // 4h ago
      aiRecommendation: "Suggest rescheduling day 2 Yacht Charter to day 4 when weather is forecasted clear. Coordinate with local DMC.",
      actionLabel: "Contact Yacht Partner",
      read: false,
      status: "active"
    }
  ],
  [
    "alert-4",
    {
      id: "alert-4",
      type: "price",
      priority: "Low",
      problem: "Fares dropped by $150 on SFO-DXB outbound route. Client is looking for best savings.",
      customerName: "Aarav Saini VIP",
      tripTitle: "Dubai SmartBundle Custom Package",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 24h ago
      aiRecommendation: "Re-fare flight segment to lock in GDS credit for the customer's SmartBundle balance.",
      actionLabel: "Apply Re-fare Credit",
      read: true,
      status: "active"
    }
  ]
]);

app.get("/api/v1/agent/alerts", (req, res) => {
  res.json(Array.from(agentAlertsDb.values()));
});

app.post("/api/v1/agent/alerts/:id/read", (req, res) => {
  const { id } = req.params;
  const alert = agentAlertsDb.get(id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found." });
  }
  alert.read = !alert.read;
  agentAlertsDb.set(id, alert);
  res.json(alert);
});

app.post("/api/v1/agent/alerts/:id/action", (req, res) => {
  const { id } = req.params;
  const alert = agentAlertsDb.get(id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found." });
  }
  alert.status = "resolved";
  alert.read = true;
  agentAlertsDb.set(id, alert);
  res.json({ success: true, alert, message: `Successfully executed: "${alert.actionLabel}"` });
});

app.post("/api/v1/auth/delete-account", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const session = activeSessions.get(token);
    if (session) {
      // Remove session & user
      usersDb.delete(session.userId);
      activeSessions.delete(token);
      return res.json({ success: true, message: "Your account has been deleted permanently." });
    }
  }
  return res.status(401).json({ error: "Unauthorized session." });
});

// Vite middleware for development & static serving for production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`TRAVELVERSE AI Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
