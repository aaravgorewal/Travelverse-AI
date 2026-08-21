import React from "react";
import { useUIStore } from "./stores/useUIStore";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { AIConciergeDrawer } from "./components/shared/AIConciergeDrawer";
import { VRViewerModal } from "./components/shared/VRViewerModal";
import { OfflineGuardian } from "./components/shared/OfflineGuardian";
import { DealScopeDrawer } from "./components/shared/DealScopeDrawer";

// Feature modules
import { HomeView } from "./features/home/HomeView";
import { SearchView } from "./features/search/SearchView";
import { FlightsView } from "./features/flights/FlightsView";
import { HotelsView } from "./features/hotels/HotelsView";
import { PackagesView } from "./features/packages/PackagesView";
import { ExperiencesView } from "./features/experiences/ExperiencesView";
import { TripsView } from "./features/trips/TripsView";
import { ItineraryView } from "./features/itinerary/ItineraryView";
import { AIPlannerView } from "./features/ai/AIPlannerView";
import { VRGalleryView } from "./features/vr/VRGalleryView";
import { BookingsView } from "./features/bookings/BookingsView";
import { PaymentsView } from "./features/payments/PaymentsView";
import { DocumentsView } from "./features/documents/DocumentsView";
import { AgentPortalView } from "./features/agent/AgentPortalView";
import { CustomersView } from "./features/customers/CustomersView";
import { SupportView } from "./features/support/SupportView";
import { NotificationsView } from "./features/notifications/NotificationsView";
import { ProfileView } from "./features/profile/ProfileView";
import { AdminDashboardView } from "./features/admin/AdminDashboardView";
import { AuthView } from "./features/auth/AuthView";
import { OnboardingView } from "./features/onboarding/OnboardingView";
import { DesignSystemView } from "./features/design-system/DesignSystemView";
import { LocalSenseView } from "./features/destinations/LocalSenseView";
import { TravelPulseView } from "./features/travelpulse/TravelPulseView";
import { ToastProvider } from "./components/ui/Toast";

export function App() {
  const { currentModule, setModule } = useUIStore();

  React.useEffect(() => {
    const path = window.location.pathname.replace(/^\//, "").toLowerCase();
    const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    const target = path || hash;
    if (target === "ai") {
      setModule("ai");
    } else if (target === "hotels") {
      setModule("hotels");
    } else if (target === "experiences") {
      setModule("experiences");
    } else if (target === "flights") {
      setModule("flights");
    } else if (target === "trips") {
      setModule("trips");
    }
  }, [setModule]);

  const renderModule = () => {
    switch (currentModule) {
      case "home":
        return <HomeView />;
      case "search":
        return <SearchView />;
      case "flights":
        return <FlightsView />;
      case "hotels":
        return <HotelsView />;
      case "packages":
        return <PackagesView />;
      case "experiences":
        return <ExperiencesView />;
      case "trips":
        return <TripsView />;
      case "itinerary":
        return <ItineraryView />;
      case "ai":
      case "tripgenie":
        return <AIPlannerView />;
      case "vr":
        return <VRGalleryView />;
      case "bookings":
        return <BookingsView />;
      case "payments":
        return <PaymentsView />;
      case "documents":
        return <DocumentsView />;
      case "agent":
        return <AgentPortalView />;
      case "customers":
        return <CustomersView />;
      case "support":
        return <SupportView />;
      case "notifications":
        return <NotificationsView />;
      case "profile":
        return <ProfileView />;
      case "admin":
        return <AdminDashboardView />;
      case "auth":
        return <AuthView />;
      case "onboarding":
        return <OnboardingView />;
      case "design-system":
        return <DesignSystemView />;
      case "destinations":
        return <LocalSenseView />;
      case "travelpulse":
        return <TravelPulseView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        {/* Top Main Navigation (Desktop & Tablet) */}
        {currentModule !== "agent" && <Navbar />}

        {/* Main Feature Viewport (Optimized for 1440px Desktop, 768px Tablet, 360px Mobile) */}
        <main className={`flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 ${currentModule === 'agent' ? 'pb-4' : 'pb-24 md:pb-12'} overflow-x-hidden min-w-0`}>
          {renderModule()}
        </main>

        {/* Mobile Bottom Navigation Bar (Home, Explore, Trips, AI, Profile, and Agent Mode) */}
        {currentModule !== "agent" && <MobileBottomNav />}

        {/* Universal Floating AI Concierge Drawer */}
        <AIConciergeDrawer />

        {/* Spatial 360 VR Viewer Overlay */}
        <VRViewerModal />

        {/* Offline Guardian PWA Monitor */}
        <OfflineGuardian />

        {/* Global DealScope Comparison Drawer */}
        <DealScopeDrawer />

        {/* Global Bottom Trust & Navigation Footer (Hidden on mobile bottom nav if wanted, or padded) */}
        {currentModule !== "agent" && <Footer />}
      </div>
    </ToastProvider>
  );
}

export default App;
