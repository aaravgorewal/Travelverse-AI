import React from "react";
import { useUIStore } from "./stores/useUIStore";
import { useAuthStore } from "./stores/useAuthStore";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { AIConciergeDrawer } from "./components/shared/AIConciergeDrawer";
import { VRViewerModal } from "./components/shared/VRViewerModal";
import { OfflineGuardian } from "./components/shared/OfflineGuardian";
import { DealScopeDrawer } from "./components/shared/DealScopeDrawer";
import { GlobalSearchOverlay } from "./components/shared/GlobalSearchOverlay";

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
import { Modal, Button } from "./components/ui";
import { ShieldAlert, LogIn, Lock } from "lucide-react";

export function App() {
  const { currentModule, setModule } = useUIStore();
  const { isAuthenticated, user, isSessionExpired, clearSessionExpired, logout } = useAuthStore();

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

  // Protected View list for travelers
  const protectedModules = ["trips", "itinerary", "bookings", "payments", "documents", "profile"];

  const renderModule = () => {
    // 1. Session Expiry Lockout: if session is expired, force Auth View
    if (isSessionExpired) {
      return <AuthView />;
    }

    // 2. Unauthenticated Guard
    if (!isAuthenticated && protectedModules.includes(currentModule)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-900">
            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Authentication Required</h2>
          <p className="text-xs text-slate-500">Please sign in to access your digital travel wallet, booking schedules, and profile preferences.</p>
          <Button onClick={() => setModule("auth")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <LogIn className="w-4 h-4 mr-2" /> Log In
          </Button>
        </div>
      );
    }

    // 3. Role-Based Agent/Admin Portal Guard
    const isAgentModule = ["agent", "customers", "admin"].includes(currentModule);
    if (isAgentModule && user?.role !== "agent" && user?.role !== "admin") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full border border-red-200 dark:border-red-900">
            <ShieldAlert className="w-10 h-10 text-red-650 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Denied (B2B Only)</h2>
          <p className="text-xs text-slate-500">
            This module is reserved exclusively for registered travel advisors and B2B agents. Your account is flagged as standard traveler.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setModule("home")}>Back to Home</Button>
            <Button onClick={() => setModule("auth")} className="bg-indigo-650 hover:bg-indigo-700 text-white">Switch Accounts</Button>
          </div>
        </div>
      );
    }

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

  const isB2BPortalActive = (currentModule === "agent" || currentModule === "customers") && (user?.role === "agent" || user?.role === "admin");

  return (
    <ToastProvider>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
        {/* Top Main Navigation (Desktop & Tablet) */}
        {!isB2BPortalActive && <Navbar />}

        {/* Main Feature Viewport (Optimized for 1440px Desktop, 768px Tablet, 360px Mobile) */}
        <main className={`flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 ${isB2BPortalActive ? 'pb-4' : 'pb-24 md:pb-12'} overflow-x-hidden min-w-0`}>
          {renderModule()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        {!isB2BPortalActive && <MobileBottomNav />}

        {/* Universal Floating AI Concierge Drawer */}
        <AIConciergeDrawer />

        {/* Spatial 360 VR Viewer Overlay */}
        <VRViewerModal />

        {/* Offline Guardian PWA Monitor */}
        <OfflineGuardian />

        {/* Global DealScope Comparison Drawer */}
        <DealScopeDrawer />

        {/* Universal Global Search Palette */}
        <GlobalSearchOverlay />

        {/* Global Bottom Trust & Navigation Footer */}
        {!isB2BPortalActive && <Footer />}

        {/* Expired Session Lockout Modal Prompt */}
        {isSessionExpired && (
          <Modal
            isOpen={isSessionExpired}
            onClose={() => {
              clearSessionExpired();
              logout();
              setModule("auth");
            }}
            title="Session Expired"
            description="Your GDS authorization session has expired for safety. Please re-authenticate."
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                To guard private visa files and payment vaults, sessions automatically expire after inactivity.
              </p>
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    clearSessionExpired();
                    logout();
                    setModule("auth");
                  }}
                  className="bg-indigo-600 text-white font-bold"
                >
                  Log In Again
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
