import React, { useState } from "react";
import {
  Sparkles,
  Plane,
  Compass,
  Building,
  Shield,
  CreditCard,
  Layers,
  Palette,
  Type,
  Grid,
  Box,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  MapPin,
  Search,
  User,
  Share2,
  Lock,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Flame,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  SearchInput,
  PasswordInput,
  Textarea,
  Select,
  Checkbox,
  Switch,
  RangeSlider,
  Tabs,
  Dropdown,
  DropdownItem,
  DropdownHeader,
  DropdownDivider,
  Modal,
  Drawer,
  Tooltip,
  Badge,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonFlightCard,
  useToast,
  Alert,
  ProgressBar,
  StepProgress,
  CircularProgress,
  Avatar,
  AvatarGroup,
  EmptyState,
} from "../../components/ui";
import { DESIGN_TOKENS } from "../../design-system/tokens";

export const DesignSystemView: React.FC = () => {
  const { showToast } = useToast();

  // Interactive Playground States
  const [activeTabSection, setActiveTabSection] = useState("all");
  const [interactivePillTab, setInteractivePillTab] = useState("flights");
  const [interactiveUnderlineTab, setInteractiveUnderlineTab] = useState("overview");
  const [interactiveSegmentedTab, setInteractiveSegmentedTab] = useState("day");

  // Form states
  const [inputText, setInputText] = useState("Elena Rostova");
  const [searchQuery, setSearchQuery] = useState("Tokyo Haneda (HND)");
  const [sliderVal, setSliderVal] = useState(1450);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [aiSwitchChecked, setAiSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [progressVal, setProgressVal] = useState(68);
  const [currentStep, setCurrentStep] = useState(1);

  // Modals & Drawers states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* Design System Hero Header */}
      <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-800/80 shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-600/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400">
                  TRAVELVERSE AERO UI SPECIFICATION
                </span>
                <p className="text-[10px] text-slate-400 font-mono">v{DESIGN_TOKENS.version} • System Core</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DESIGN_TOKENS.personality.map((trait) => (
                <span
                  key={trait}
                  className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15 backdrop-blur-md"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Original TravelVerse AI Design System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              An aerospace-grade design framework engineered for autonomous travel orchestration, live GDS flight telemetry, luxury hospitality, and seamless multimodal intelligence.
            </p>
          </div>

          {/* Quick Jump Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            {[
              { id: "all", label: "Overview All" },
              { id: "ai-language", label: "✦ AI Visual Language" },
              { id: "colors", label: "Colors & Tokens" },
              { id: "typography", label: "Typography" },
              { id: "buttons", label: "Buttons & CTAs" },
              { id: "cards", label: "Cards & Surfaces" },
              { id: "forms", label: "Form Controls" },
              { id: "navigation", label: "Tabs & Menus" },
              { id: "overlays", label: "Modals & Drawers" },
              { id: "feedback", label: "Toasts, Alerts & Skeletons" },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTabSection(section.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTabSection === section.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SPECIAL AI VISUAL LANGUAGE (✦) */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "ai-language") && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl text-purple-600 dark:text-purple-400 font-black">✦</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Special AI Visual Language
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every AI-powered action uses the unified starlight symbol <strong className="text-purple-600 dark:text-purple-400 font-mono">✦</strong>, iridescent micro-gradients, and obsidian starlight surfaces.
              </p>
            </div>
            <Badge variant="ai" size="md">✦ Standardized AI Actions</Badge>
          </div>

          {/* AI Action Buttons Grid */}
          <Card variant="ai" className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Official AI Action Button Suite
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any AI action button to test instant interaction feedback and autonomous toasts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DESIGN_TOKENS.aiActionPresets.map((preset) => (
                <div
                  key={preset.label}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-800 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-purple-600 dark:text-purple-400">
                        Intent: {preset.intent}
                      </span>
                      <Tooltip content={preset.tooltip} position="top" aiThemed>
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                      </Tooltip>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      ✦ {preset.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {preset.tooltip}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ai"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        showToast({
                          type: "ai",
                          title: `✦ ${preset.label} Triggered`,
                          message: `Autonomous intelligence engine executed "${preset.label}" calibrated to your profile.`,
                          action: { label: "View Insights", onClick: () => setIsAIModalOpen(true) },
                        })
                      }
                    >
                      {preset.label}
                    </Button>
                    <Button
                      variant="ai-outline"
                      size="sm"
                      onClick={() =>
                        showToast({
                          type: "ai",
                          title: `✦ ${preset.label} Preview`,
                          message: `AI simulated real-time optimal outcome for "${preset.label}".`,
                        })
                      }
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Visual Elements Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-200/60 dark:border-purple-900/40">
              {/* AI Badge & Chip Showcase */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Badges & Indicators</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="ai" size="sm">✦ Autonomous Plan</Badge>
                  <Badge variant="ai" size="md">✦ Smart Fare Predict</Badge>
                  <Badge variant="purple" size="sm">✦ 99.4% Accurate</Badge>
                </div>
              </div>

              {/* AI Agent Avatar */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Assistant Avatars</span>
                <div className="flex items-center gap-3">
                  <Avatar variant="ai" size="lg" status="online" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      <span>TravelVerse AI</span>
                      <span className="text-purple-500">✦</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Gemini Pro Concierge</p>
                  </div>
                </div>
              </div>

              {/* AI Micro-Alert */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Autonomous Callout</span>
                <Alert
                  variant="ai"
                  title="✦ Zero-Click Fare Drop"
                  description="Found a $140 lower First Class fare on NH105."
                />
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. COLOR PALETTES & BRAND ARCHITECTURE */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "colors") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Color System & Aviation Palette
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Precision-engineered HSL scales with WCAG AA compliance (4.5:1+ contrast) and aerospace accents.
              </p>
            </div>
            <Badge variant="outline">Aero Palette 2.0</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Celestial Azure */}
            <Card className="p-5 space-y-3">
              <div className="h-20 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-end p-3 text-white">
                <div>
                  <p className="text-xs font-bold">Celestial Azure</p>
                  <p className="text-[10px] opacity-80 font-mono">#2563EB • Brand Primary</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary flight booking CTAs, interactive anchors, and active aviation statuses.
              </p>
            </Card>

            {/* AI Starlight */}
            <Card className="p-5 space-y-3">
              <div className="h-20 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-end p-3 text-white">
                <div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <span>AI Starlight</span> ✦
                  </p>
                  <p className="text-[10px] opacity-80 font-mono">#8B5CF6 / #EC4899</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autonomous itinerary optimizer, multimodal search, and smart assistant orbs.
              </p>
            </Card>

            {/* Luxury First Class Gold */}
            <Card className="p-5 space-y-3">
              <div className="h-20 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 flex items-end p-3 text-white">
                <div>
                  <p className="text-xs font-bold">Luxe Champagne</p>
                  <p className="text-[10px] opacity-80 font-mono">#F59E0B / #D97706</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                First Class cabin perks, VIP concierge tickets, and exclusive hotel resort badges.
              </p>
            </Card>

            {/* Aero Obsidian */}
            <Card className="p-5 space-y-3">
              <div className="h-20 rounded-xl bg-slate-950 flex items-end p-3 text-white border border-slate-800">
                <div>
                  <p className="text-xs font-bold">Aero Obsidian</p>
                  <p className="text-[10px] opacity-80 font-mono">#090D16 • Dark Canvas</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deep aerospace midnight canvas for high-contrast flight cockpit clarity.
              </p>
            </Card>
          </div>

          {/* Status Color Tokens */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
              <span className="text-[10px] font-extrabold uppercase">On-Time / Confirmed</span>
              <p className="text-sm font-black">Emerald Altitude</p>
              <p className="text-[10px] font-mono opacity-80">#10B981</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 space-y-1">
              <span className="text-[10px] font-extrabold uppercase">Boarding / Warning</span>
              <p className="text-sm font-black">Amber Velocity</p>
              <p className="text-[10px] font-mono opacity-80">#F59E0B</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 space-y-1">
              <span className="text-[10px] font-extrabold uppercase">Disrupted / SOS</span>
              <p className="text-sm font-black">Signal Crimson</p>
              <p className="text-[10px] font-mono opacity-80">#EF4444</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 space-y-1">
              <span className="text-[10px] font-extrabold uppercase">Gate Info / Radar</span>
              <p className="text-sm font-black">Aero Cyan Blue</p>
              <p className="text-[10px] font-mono opacity-80">#3B82F6</p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. TYPOGRAPHY HIERARCHY */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "typography") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Typography Scale & Optical Sizing
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Low-contrast ratio scale (1.125 Major Second) optimized for dense flight tables and expansive luxury hero cards.
              </p>
            </div>
            <Badge variant="outline">Font: System Sans + Mono</Badge>
          </div>

          <Card className="p-6 sm:p-8 divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase w-32 shrink-0">Display Hero</span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex-1">
                Explore the Metaverse of Travel
              </span>
              <span className="text-[11px] font-mono text-slate-400">36px / 900</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase w-32 shrink-0">Heading 1</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white flex-1">
                Autonomous Global Flight Network
              </span>
              <span className="text-[11px] font-mono text-slate-400">24px / 800</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase w-32 shrink-0">Heading 2 / Card</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white flex-1">
                Overwater Lagoon Bungalow & Spa Suite
              </span>
              <span className="text-[11px] font-mono text-slate-400">18px / 700</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase w-32 shrink-0">Body Regular</span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                Live flight radar tracks speed, altitude, and weather corridors across 14,000 international routes with millisecond latency.
              </p>
              <span className="text-[11px] font-mono text-slate-400">14px / 400</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase w-32 shrink-0">IATA Monospace</span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 flex-1">
                SFO ➔ HND • NH105 • SEAT 02A • GATE 42B
              </span>
              <span className="text-[11px] font-mono text-slate-400">13px / Mono Bold</span>
            </div>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. BUTTONS & INTERACTION STATES */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "buttons") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Buttons & Call-To-Action Variants
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every button supports keyboard focus rings, loading state spinners, and icon adornments.
              </p>
            </div>
            <Badge variant="outline">Interactive Playground</Badge>
          </div>

          <Card className="p-6 sm:p-8 space-y-6">
            {/* Standard Variants */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Action Variants</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Flight Action</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="accent">Teal Eco Accent</Button>
                <Button variant="luxury">★ First Class Luxury</Button>
                <Button variant="danger">Cancel Booking</Button>
              </div>
            </div>

            {/* AI Variants with ✦ symbol */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  AI Action Variants (✦)
                </h4>
                <Badge variant="ai" size="xs">Special AI Language</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="ai">✦ Ask AI</Button>
                <Button variant="ai">✦ Optimize Transit</Button>
                <Button variant="ai">✦ Find Better Deal</Button>
                <Button variant="ai-outline">✦ Explain Rules</Button>
                <Button variant="ai-ghost">✦ Personalize</Button>
              </div>
            </div>

            {/* Sizes & States */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Size Scales & Loading States</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small (xs)</Button>
                <Button size="sm">Small (sm)</Button>
                <Button size="md">Medium (md)</Button>
                <Button size="lg">Large (lg)</Button>
                <Button size="xl">Hero Extra Large (xl)</Button>
                <Button isLoading>Submitting</Button>
                <Button disabled>Disabled State</Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. CARDS & SURFACES */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "cards") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Cards & Surface Materials
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Precision border radii, glassmorphic backdrops, luxury first-class cards, and airline ticket cuts.
              </p>
            </div>
            <Badge variant="outline">6 Surface Styles</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Elevated */}
            <Card variant="elevated" hoverEffect className="space-y-3">
              <Badge variant="info">Default Elevated</Badge>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Standard Flight Card</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Subtle shadow-xl drop with crisp 1px borders for clean high-contrast legibility.
              </p>
              <Button size="sm" variant="outline" className="w-full">Inspect Flight</Button>
            </Card>

            {/* AI Insight Card */}
            <Card variant="ai" hoverEffect className="space-y-3">
              <Badge variant="ai">✦ AI Neural Surface</Badge>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">✦ Smart Price Drop Signal</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Iridescent top border with gentle violet gradient backdrop for proactive AI insights.
              </p>
              <Button size="sm" variant="ai" className="w-full">✦ Lock Rate ($820 Saved)</Button>
            </Card>

            {/* Luxury First Class Card */}
            <Card variant="luxury" hoverEffect className="space-y-3">
              <Badge variant="luxury">★ First Class VIP</Badge>
              <h4 className="text-base font-bold text-amber-200">The Ritz-Carlton Reserve Suite</h4>
              <p className="text-xs text-amber-100/70">
                Gold champagne rim with dark velvet backdrop for ultra-luxury experiences.
              </p>
              <Button size="sm" variant="luxury" className="w-full">Reserve Penthouse</Button>
            </Card>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. FORMS & INPUTS */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "forms") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Form Controls & Accessible Inputs
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inputs with floating/crisp labels, search shortcut keys, AI auto-fill indicators, switches, and range sliders.
              </p>
            </div>
            <Badge variant="outline">Inputs, Sliders & Toggles</Badge>
          </div>

          <Card className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standard Input */}
              <Input
                label="Lead Traveler Full Name"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                helperText="Must match government passport exactly"
                iconLeft={<User className="w-4 h-4" />}
              />

              {/* AI Auto-filled Input */}
              <Input
                label="Destination Airport Code"
                value="HND (Tokyo Haneda, Japan)"
                readOnly
                aiSuggested
                iconLeft={<Plane className="w-4 h-4 text-purple-500" />}
              />

              {/* Password Input */}
              <PasswordInput
                label="Secure Travel Vault Passcode"
                defaultValue="TokyoSummer2026!"
                iconLeft={<Lock className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Search Input with Shortcut Badge */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Global Omni-Search
                </label>
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                  shortcut="⌘K"
                />
              </div>

              {/* Select Dropdown */}
              <Select label="Cabin Class Tier" defaultValue="business">
                <option value="economy">Economy Class (Standard)</option>
                <option value="premium">Premium Economy (Extra Legroom)</option>
                <option value="business">Business Class (Lie-Flat Suite)</option>
                <option value="first">First Class (Private Suite & Caviar)</option>
              </Select>

              {/* Range Slider */}
              <RangeSlider
                label="Flight Budget Ceiling"
                min={200}
                max={5000}
                step={50}
                value={sliderVal}
                onChange={setSliderVal}
                formatValue={(v) => `$${v.toLocaleString()}`}
              />
            </div>

            {/* Checkboxes & Switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Checkbox
                label="Carbon Offset Included"
                description="Automatically offset 100% of flight emissions."
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />

              <Switch
                label="Instant Gate Alerts"
                description="Receive push SMS on boarding delays."
                checked={switchChecked}
                onChange={setSwitchChecked}
              />

              <Switch
                label="✦ AI Autonomous Rebook"
                description="Auto-rebook flight on cancellations."
                aiBadge
                checked={aiSwitchChecked}
                onChange={setAiSwitchChecked}
              />
            </div>

            {/* Textarea */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Textarea
                label="Special Concierge Instructions & Dietary Requests"
                rows={2}
                aiSuggested
                defaultValue="Non-stop flights preferred, aisle seat with extra legroom, gluten-free gourmet catering."
              />
            </div>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. TABS, DROPDOWNS & NAVIGATION */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "navigation") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Tabs, Dropdowns & Menus
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Segmented tabs, underline tabs, pill tabs with counters, and keyboard-friendly popover menus.
              </p>
            </div>
            <Badge variant="outline">Interactive</Badge>
          </div>

          <Card className="p-6 sm:p-8 space-y-6">
            {/* Pill Tabs */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pills Tab Style</span>
              <Tabs
                variant="pills"
                tabs={[
                  { id: "flights", label: "Flights", icon: <Plane className="w-3.5 h-3.5" />, count: 18 },
                  { id: "hotels", label: "Luxury Hotels", icon: <Building className="w-3.5 h-3.5" />, count: 12 },
                  { id: "ai", label: "AI Suggestions", ai: true, count: 4 },
                ]}
                activeTab={interactivePillTab}
                onChange={setInteractivePillTab}
              />
            </div>

            {/* Underline Tabs */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Underline Tab Style</span>
              <Tabs
                variant="underline"
                tabs={[
                  { id: "overview", label: "Trip Overview" },
                  { id: "timeline", label: "Day-by-Day Itinerary", count: 7 },
                  { id: "baggage", label: "Baggage & Passes" },
                  { id: "ai-radar", label: "✦ AI Flight Radar", ai: true },
                ]}
                activeTab={interactiveUnderlineTab}
                onChange={setInteractiveUnderlineTab}
              />
            </div>

            {/* Segmented Tabs & Interactive Dropdown Menu */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Segmented Control</span>
                <Tabs
                  variant="segmented"
                  tabs={[
                    { id: "day", label: "Day View" },
                    { id: "week", label: "Week View" },
                    { id: "month", label: "Monthly GDS" },
                  ]}
                  activeTab={interactiveSegmentedTab}
                  onChange={setInteractiveSegmentedTab}
                />
              </div>

              {/* Interactive Dropdown Popover */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dropdown Menu Popover</span>
                <div>
                  <Dropdown
                    trigger={
                      <Button variant="outline" className="gap-2">
                        <span>Flight Actions</span>
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </Button>
                    }
                  >
                    <DropdownHeader title="Manage Booking" subtitle="NH105 • Seat 02A" />
                    <DropdownItem icon={<Plane className="w-3.5 h-3.5" />}>
                      Change Seat Map
                    </DropdownItem>
                    <DropdownItem aiAction icon={<Sparkles className="w-3.5 h-3.5" />}>
                      ✦ Upgrade with Miles
                    </DropdownItem>
                    <DropdownItem icon={<Share2 className="w-3.5 h-3.5" />}>
                      Share Boarding Pass
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem destructive icon={<AlertCircle className="w-3.5 h-3.5" />}>
                      Cancel Reservation
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. MODALS & DRAWERS */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "overlays") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Modals & Slide-Over Drawers
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-screen backdrop blurs, keyboard ESC listeners, right slide-overs, and mobile bottom sheets.
              </p>
            </div>
            <Badge variant="outline">Live Interactive Triggers</Badge>
          </div>

          <Card className="p-6 sm:p-8 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any trigger below to inspect interactive modal and drawer animations.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Standard Modal
              </Button>

              <Button variant="ai" onClick={() => setIsAIModalOpen(true)}>
                ✦ Open AI Supercharged Modal
              </Button>

              <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                Open Right Slide-Over Drawer
              </Button>

              <Button variant="secondary" onClick={() => setIsBottomDrawerOpen(true)}>
                Open Mobile Bottom Drawer
              </Button>
            </div>
          </Card>

          {/* Standard Modal Dialog */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Flight Confirmation & Fare Rules"
            description="United Airlines UA875 • San Francisco (SFO) to Tokyo Haneda (HND)"
            badge="Non-Stop"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Proceed to Payment
                </Button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Cabin: Business Class Polaris Suite</span>
                  <span className="text-emerald-600 font-bold">100% Refundable</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Includes 2 checked bags up to 32kg each, priority lounge access, fast-track security, and lie-flat seat selection.
                </p>
              </div>
            </div>
          </Modal>

          {/* AI Supercharged Modal */}
          <Modal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            title="✦ AI Route & Fare Optimization"
            description="Autonomous multi-GDS analyzer found 3 efficiency improvements."
            aiThemed
            footer={
              <>
                <Button variant="outline" onClick={() => setIsAIModalOpen(false)}>
                  Dismiss
                </Button>
                <Button variant="ai" onClick={() => setIsAIModalOpen(false)}>
                  ✦ Apply All Recommendations
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Alert
                variant="ai"
                title="✦ Optimal Connection Window"
                description="Swapping from flight NH105 to NH107 eliminates a 3-hour layover in Tokyo and saves $180."
              />
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                <p className="font-bold text-purple-900 dark:text-purple-200">
                  Total Autonomous Savings: $180 USD + 3h 15m transit time
                </p>
                <p className="text-slate-500">Zero additional booking fees applied.</p>
              </div>
            </div>
          </Modal>

          {/* Right Slide-Over Drawer */}
          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Flight Details & Telemetry"
            description="Real-time aircraft specs, radar path, and cabin map."
            footer={
              <Button className="w-full" onClick={() => setIsDrawerOpen(false)}>
                Confirm Selection
              </Button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Aircraft: Boeing 787-9 Dreamliner</p>
                <p className="text-slate-500">Cruising Speed: 560 knots • Altitude: 38,000 ft • Wi-Fi Onboard</p>
              </div>
              <SkeletonFlightCard />
            </div>
          </Drawer>

          {/* Bottom Drawer */}
          <Drawer
            isOpen={isBottomDrawerOpen}
            onClose={() => setIsBottomDrawerOpen(false)}
            position="bottom"
            title="Quick Action Drawer"
            description="Swipe down or tap close."
          >
            <div className="p-4 space-y-3 text-center">
              <p className="text-xs text-slate-500">Select an autonomous action to execute instantly.</p>
              <div className="flex justify-center gap-2">
                <Button variant="ai" size="sm" onClick={() => setIsBottomDrawerOpen(false)}>
                  ✦ Re-Optimize
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsBottomDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Drawer>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 9. FEEDBACK: TOASTS, ALERTS, PROGRESS & SKELETONS */}
      {/* ========================================================================= */}
      {(activeTabSection === "all" || activeTabSection === "feedback") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Feedback, Alerts, Progress & Skeletons
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant toast triggers, multi-step booking bars, flight progress gauges, and shimmer loaders.
              </p>
            </div>
            <Badge variant="outline">Full State Suite</Badge>
          </div>

          {/* Interactive Toast Emitters */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trigger Toast Notifications</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  showToast({
                    type: "success",
                    title: "Booking Confirmed",
                    message: "E-ticket #TV-98242 has been dispatched to your email.",
                  })
                }
              >
                Trigger Success Toast
              </Button>

              <Button
                size="sm"
                variant="ai"
                onClick={() =>
                  showToast({
                    type: "ai",
                    title: "✦ AI Flight Radar Update",
                    message: "Tailwind on UA875 will arrive 22 minutes ahead of schedule.",
                    action: { label: "View Live Radar", onClick: () => {} },
                  })
                }
              >
                ✦ Trigger AI Starlight Toast
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  showToast({
                    type: "warning",
                    title: "Gate Change Notice",
                    message: "Flight NH105 moved to Terminal 2, Gate 42B.",
                  })
                }
              >
                Trigger Warning Toast
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  showToast({
                    type: "error",
                    title: "Payment Auth Timeout",
                    message: "Card validation timed out. Please retry.",
                  })
                }
              >
                Trigger Error Toast
              </Button>
            </div>
          </Card>

          {/* Alerts Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert
              variant="info"
              title="Flight Schedule Confirmed"
              description="Check-in opens 24 hours prior to departure via mobile app."
            />
            <Alert
              variant="ai"
              title="✦ Proactive AI Disruption Shield"
              description="Weather delay detected in Chicago. Instant zero-fee rebooking is armed."
            />
            <Alert
              variant="warning"
              title="Passport Expiry Advisory"
              description="Destination country requires at least 6 months validity from departure date."
            />
            <Alert
              variant="success"
              title="Biometric Fast-Track Active"
              description="Clear priority lane authorized at San Francisco Terminal 3."
            />
          </div>

          {/* Progress Bars & Step Progress */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Step Booking Process</h4>
              <StepProgress
                steps={[
                  { id: 1, title: "Select Flight" },
                  { id: 2, title: "Passenger DNA" },
                  { id: 3, title: "Seat & Perks" },
                  { id: 4, title: "Instant Confirm" },
                ]}
                currentStepIndex={currentStep}
                aiThemed
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="xs"
                  variant="outline"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((c) => Math.max(c - 1, 0))}
                >
                  Previous Step
                </Button>
                <Button
                  size="xs"
                  onClick={() => setCurrentStep((c) => Math.min(c + 1, 3))}
                >
                  Next Step
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 items-center">
              {/* Linear Progress */}
              <div className="space-y-4 md:col-span-2">
                <ProgressBar
                  label="Flight Completion (SFO ➔ HND)"
                  value={progressVal}
                  showValue
                  variant="ai"
                />
                <ProgressBar
                  label="Zero-Carbon Offset Goal"
                  value={85}
                  showValue
                  variant="success"
                />
                <ProgressBar
                  label="Radar Telemetry Scan"
                  indeterminate
                  variant="brand"
                />
              </div>

              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center p-4">
                <CircularProgress value={progressVal} variant="ai" label="In-Flight" />
              </div>
            </div>
          </Card>

          {/* Skeletons & Shimmer Loaders */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shimmer Loaders & Skeletons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonFlightCard />
              <div className="space-y-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size="md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <SkeletonText lines={3} />
              </div>
            </div>
          </Card>

          {/* Empty States Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="No Active Bookings in Vault"
              description="You have no upcoming flight or hotel reservations scheduled."
              action={<Button size="sm">Browse Global Catalog</Button>}
            />

            <EmptyState
              variant="ai"
              title="✦ AI Destination Scout Ready"
              description="No matches found for your manual query. Let AI craft an autonomous custom vacation package."
              aiAction={{
                label: "✦ Generate with AI",
                onClick: () =>
                  showToast({
                    type: "ai",
                    title: "✦ Autonomous Vacation Generator",
                    message: "Synthesizing 7-day personalized itinerary...",
                  }),
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
};
