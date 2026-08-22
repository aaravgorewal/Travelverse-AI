<div
  style={{
    position: "fixed",
    top: 100,
    left: 20,
    zIndex: 99999,
    background: "red",
    color: "white",
    padding: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  }}
>
  CURRENT HOMEVIEW TEST 987
</div>
import React from "react";
import { ArrowRight, Sparkles, Navigation, Activity, CheckCircle2, ChevronRight, MapPin, Calendar, Bot, SlidersHorizontal, Compass } from "lucide-react";
import { useUIStore } from "../../stores/useUIStore";
import { Button } from "../../components/ui";
import { PageHeader, DataList, DataListItem, StatusBadge, AIActionButton } from "../../components/ui/SaaSCore";

export const HomeView: React.FC = () => {
  const { setModule } = useUIStore();

  return (
    <div id="travelverse-home" className="min-h-screen bg-[var(--landing-bg-primary)] pt-24 pb-20 overflow-x-hidden w-full max-w-[100vw]">

      {/* 1. HERO SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Product Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="landing-label text-indigo-700 dark:text-indigo-300">AI-Powered Travel Planning</span>
        </div>

        {/* Headline */}
        <h1 className="landing-display max-w-4xl">
          The operating system for modern travel management.
        </h1>

        {/* Supporting Copy */}
        <p className="landing-body text-lg sm:text-xl max-w-2xl mx-auto">
          Consolidate itineraries, automate intelligence, and deploy AI copilot workflows
          to orchestrate complex global travel flawlessly.
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center gap-4 pt-4">
          <Button
            size="lg"
            onClick={() => setModule('ai')}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold px-8"
          >
            Start Planning
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setModule('search')}
            className="w-full sm:w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-8"
          >
            Explore How It Works
          </Button>
        </div>

        {/* Product Visual Mockup */}
        <div className="w-full mt-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent dark:from-slate-950/80 pointer-events-none z-10" />
          {/* We use a generated workspace interface image */}
          <img
            src="/Users/aaravsaini/.gemini/antigravity-ide/brain/42b30b6d-b3d4-435f-af59-67fe27c5c7df/travelverse_app_workspace_1787362371343.jpg"
            alt="TravelVerse Workspace Interface Preview"
            className="w-full object-cover object-top h-[600px] border-b border-slate-200 dark:border-slate-800 opacity-95 transition-opacity group-hover:opacity-100"
          />
        </div>

      </section>

      {/* 1.5 VALUE STRIP */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:justify-between text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold">AI Trip Planning</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold">Smart Itineraries</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold">Destination Intelligence</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold">Travel Safety Insights</span>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT DEMONSTRATION SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 mt-20 sm:mt-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="landing-h2">A complete operating system for travel.</h2>
          <p className="landing-body text-lg max-w-2xl mx-auto">
            TravelVerse replaces fragmented booking tools with a single, highly-dense workspace.
            Manage itineraries, monitor travel intelligence, and leverage our autonomous AI planner.
          </p>
        </div>

        {/* The Product UI Preview Container */}
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-md overflow-hidden relative">

          {/* Subtle Browser/Window Framing */}
          <div className="h-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="ml-4 h-6 flex-1 max-w-sm bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center px-2">
              <span className="text-[10px] text-slate-400 font-mono">travelverse.ai/workspace/tokyo-q4</span>
            </div>
          </div>

          {/* Real Component Composition (Mocking the Workspace) */}
          <div className="p-6 md:p-10 space-y-8 bg-white dark:bg-slate-950">

            <PageHeader
              title="Q4 Executive Summit (Tokyo)"
              description="Managing active itineraries and travel intelligence."
              action={
                <StatusBadge status="success">Active Trip</StatusBadge>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Central Itinerary List */}
              <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Itinerary</h3>
                </div>
                <DataList className="border-y-0">
                  <DataListItem
                    label={<span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Day 1: Arrivals & Transfers</span>}
                    value={<span className="text-sm text-slate-600 dark:text-slate-400">JAL Flight 001 • Narita Express to Hotel</span>}
                  />
                  <DataListItem
                    label={<span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Day 2: Executive Meetings</span>}
                    value={<span className="text-sm text-slate-600 dark:text-slate-400">Marunouchi Financial District • 09:00 AM JST</span>}
                  />
                  <DataListItem
                    label={<span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Day 3: Client Dinner</span>}
                    value={<span className="text-sm text-slate-600 dark:text-slate-400">Kyubey Ginza • Reservation Confirmed</span>}
                  />
                </DataList>
              </div>

              {/* Right Sidebar Intelligence */}
              <div className="md:col-span-1 space-y-6">

                {/* AI Recommendations */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-950/20 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Copilot Insight</h3>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      We detected a 45-minute delay on your inbound Narita Express transfer. I have automatically alerted the hotel concierge.
                    </p>
                    <AIActionButton className="w-full justify-center">Acknowledge</AIActionButton>
                  </div>
                </div>

                {/* System Alerts */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">TravelPulse</h3>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 flex flex-col items-center text-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">0</span>
                    <span className="text-xs text-slate-500">Active Disruptions</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKFLOW SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 mt-32 border-t border-slate-200 dark:border-slate-800 pt-20">

        <div className="mb-16 max-w-2xl">
          <h2 className="landing-h2 mb-4">How TravelVerse works.</h2>
          <p className="landing-body text-lg">
            A linear progression from intent to execution. We replace traditional search engines
            with a continuous workflow for managing complex itineraries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Step 1 */}
          <div className="space-y-4">
            <div className="h-px w-12 bg-indigo-600 dark:bg-indigo-500 mb-6" />
            <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">01</span>
            <h3 className="landing-h3">Input your parameters</h3>
            <p className="landing-body">
              Specify your destination, dates, and strict budget constraints.
              Our system instantly queries global inventory and flight routing graphs.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="h-px w-12 bg-indigo-600 dark:bg-indigo-500 mb-6" />
            <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">02</span>
            <h3 className="landing-h3">Let AI build the structure</h3>
            <p className="landing-body">
              The Agent Copilot automatically constructs a continuous timeline,
              booking optimal flights, reserving hotels, and scheduling critical meetings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="h-px w-12 bg-indigo-600 dark:bg-indigo-500 mb-6" />
            <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">03</span>
            <h3 className="landing-h3">Manage and adapt in transit</h3>
            <p className="landing-body">
              Deploy TravelPulse to monitor live disruptions. If a flight is delayed,
              the system automatically alerts downstream hotel and transfer bookings.
            </p>
          </div>

        </div>

      </section>

      {/* 4. PRODUCT CAPABILITIES (Alternating Editorial) */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 mt-32 space-y-32">

        {/* Feature 1: AI Trip Planner (Text Left, UI Right) */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <h3 className="landing-h2">AI Trip Planner</h3>
            <p className="landing-body text-lg">
              Generate highly complex, multi-city itineraries in seconds. The Copilot queries live airline
              and hotel graphs to ensure every segment respects your strict budget and policy requirements.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Benefit: Eliminates 90% of manual scheduling.</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded flex items-center px-4 gap-3 shadow-sm">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Plan a 4-day tech summit in London under $3k...</span>
              </div>
              <div className="space-y-2">
                <div className="h-24 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 rounded p-4 border-l-4 border-l-indigo-500 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Proposed: London Tech Week Itinerary</span>
                    <StatusBadge status="success">Ready</StatusBadge>
                  </div>
                  <span className="text-xs text-slate-500">Includes BA Flight 204 & The Hoxton Holborn.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Smart Itinerary Management (UI Left, Text Right) */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
              <DataList className="border-y-0">
                <DataListItem
                  label={<span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Flight UA 89</span>}
                  value={<span className="text-sm text-slate-600 dark:text-slate-400">Boarding 14:00 • Gate E4</span>}
                />
                <DataListItem
                  label={<span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Transfer</span>}
                  value={<span className="text-sm text-slate-600 dark:text-slate-400">Blacklane Chauffeur confirmed</span>}
                />
                <DataListItem
                  label={<span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Hotel</span>}
                  value={<span className="text-sm text-slate-600 dark:text-slate-400">Check-in at 16:30</span>}
                />
              </DataList>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="landing-h2">Smart Itinerary Management</h3>
            <p className="landing-body text-lg">
              A unified, chronological feed of every booking segment. We connect flights, transfers, and hotels into a single
              dependency graph so you never miss a connection.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Benefit: Single source of truth for all bookings.</span>
            </div>
          </div>
        </div>

        {/* Feature 3: Destination Intelligence (Text Left, UI Right) */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <h3 className="landing-h2">Destination Intelligence</h3>
            <p className="landing-body text-lg">
              Pre-travel deep dives powered by local data nodes. Analyze weather patterns, local exchange rates,
              and transit reliability before you even board the plane.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Benefit: No surprises upon arrival.</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
                <span className="text-xs text-slate-500 uppercase font-bold">Exchange Rate</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1 USD = 148 JPY</div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
                <span className="text-xs text-slate-500 uppercase font-bold">Transit Health</span>
                <div className="text-xl font-bold text-emerald-600 mt-1">99.8% On-Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Travel Safety and Insights (UI Left, Text Right) */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Active Advisory</span>
                <StatusBadge status="warning">Monitor</StatusBadge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Heavy rainfall expected in destination region over the next 48 hours. Flights may experience ATC delays.
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <h3 className="landing-h2">Travel Safety & Insights</h3>
            <p className="landing-body text-lg">
              Continuous monitoring of geopolitical, weather, and health advisories. TravelPulse actively alerts
              you to disruptions that could impact your upcoming operations.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30">
              <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Benefit: Proactive risk mitigation.</span>
            </div>
          </div>
        </div>

      </section>

      {/* 5. AI COPILOT WORKFLOW */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 mt-32 border-t border-slate-200 dark:border-slate-800 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Bot className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span className="landing-label text-slate-700 dark:text-slate-300">Agent Copilot</span>
            </div>
            <h2 className="landing-h2">Conversational intent. Structural output.</h2>
            <p className="landing-body text-lg">
              Unlike generic chatbots, the TravelVerse Copilot doesn't just respond with text.
              It natively hooks into the booking engine to generate deterministic, bookable structures
              that you can immediately insert into your itinerary.
            </p>
            <div className="pt-4 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-city routing
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Budget strictness
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-4 shadow-sm">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col">

              {/* User Prompt */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-end">
                <div className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-xl rounded-tr-sm max-w-[85%] shadow-sm">
                  Plan a 5-day trip to Jaipur under ₹40,000.
                </div>
              </div>

              {/* AI Structured Response */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-4 w-full">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      I've constructed a 5-day itinerary optimized for your ₹40,000 budget, maintaining a cultural focus.
                    </p>

                    {/* Structured Result Block */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm w-full space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Jaipur Cultural Sprint</h4>
                          <span className="text-xs text-slate-500">5 Days • Estimated: ₹38,500</span>
                        </div>
                        <StatusBadge status="success">In Budget</StatusBadge>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                      <div className="flex flex-wrap gap-2">
                        <button className="flex-1 min-w-[120px] justify-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                          <Navigation className="w-3.5 h-3.5" /> Add to Itinerary
                        </button>
                        <button className="flex-1 min-w-[120px] justify-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Budget
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. INTELLIGENCE LAYER */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-12 mt-32 border-t border-slate-200 dark:border-slate-800 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Data Block 1: Safety Index */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Index</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Level 1</div>
                  <span className="text-xs text-slate-500">Exercise Normal Precautions</span>
                </div>
              </div>

              {/* Data Block 2: Live Weather / Microclimate */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">7-Day Forecast</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Optimal</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">24°</div>
                  <span className="text-xs text-slate-500 pb-1">Clear & Crisp</span>
                </div>
              </div>

              {/* Data Block 3: Travel Alerts List */}
              <div className="sm:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Intel Feed</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-4 py-3 flex items-start gap-3">
                    <StatusBadge status="warning">Transit</StatusBadge>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Kyoto Station Track Maintenance</p>
                      <p className="text-xs text-slate-500">Minor delays expected on local Shinkansen lines between 10:00 - 14:00 JST.</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-start gap-3">
                    <StatusBadge status="success">Visa</StatusBadge>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">e-Visa Requirements Satisfied</p>
                      <p className="text-xs text-slate-500">No further documentation required for entry based on current passport.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="landing-h2">Travel intelligence. Operationalized.</h2>
            <p className="landing-body text-lg">
              We ingest global data feeds—weather APIs, diplomatic safety indexes, and live transit grids—and
              transform them into structured intelligence directly attached to your destination.
            </p>
            <p className="landing-body text-lg">
              Make confident routing decisions backed by raw data, not marketing copy.
            </p>
          </div>

        </div>
      </section>

      {/* 7. FINAL CTA BLOCK */}
      <section className="mt-32 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-[800px] mx-auto px-6 py-24 text-center space-y-8">
          <h2 className="landing-h2">Ready to deploy TravelVerse?</h2>
          <p className="landing-body text-lg">
            Standardize your travel operations, eliminate manual itinerary planning, and monitor global intelligence from a single workspace.
          </p>
          <div className="pt-4 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => setModule('ai')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-10 py-4 text-base"
            >
              Start Planning
            </Button>
          </div>
        </div>
      </section>

      {/* 8. SAAS FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setModule("home")}>
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Compass className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">TravelVerse</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                The operating system for modern travel management. Consolidate itineraries, monitor intelligence, and deploy AI copilot workflows.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Product</h4>
              <ul className="space-y-3">
                <li><button onClick={() => setModule('ai')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">AI Planner</button></li>
                <li><button onClick={() => setModule('trips')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">My Trips</button></li>
                <li><button onClick={() => setModule('destinations')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Explore</button></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Resources</h4>
              <ul className="space-y-3">
                <li><button onClick={() => setModule('home')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</button></li>
                <li><button onClick={() => setModule('travelpulse')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Travel Intelligence</button></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Company</h4>
              <ul className="space-y-3">
                <li><button onClick={() => setModule('support')} className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Support</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">© 2026 TravelVerse AI. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <button className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</button>
              <button className="text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
