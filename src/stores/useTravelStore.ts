import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FlightOffer,
  HotelOffer,
  TravelPackage,
  TravelExperience,
  TransferOffer,
  CarRentalOffer,
  NotificationItem,
  TripPlan,
  Booking,
} from "../types";
import { SEED_NOTIFICATIONS, SEED_TRIPS, SEED_BOOKINGS } from "../config/constants";

interface TravelStoreState {
  currency: string;
  exchangeRates: Record<string, number>;
  selectedFlight: FlightOffer | null;
  selectedHotel: HotelOffer | null;
  selectedPackage: TravelPackage | null;
  selectedExperience: TravelExperience | null;
  selectedTransfer: TransferOffer | null;
  selectedCar: CarRentalOffer | null;
  bookings: Booking[];
  checkoutItem: {
    type: "flight" | "hotel" | "package" | "experience" | "transfer" | "car";
    item: FlightOffer | HotelOffer | TravelPackage | TravelExperience | TransferOffer | CarRentalOffer;
    travelers: number;
    dates: { start: string; end?: string };
    totalPrice: number;
  } | null;

  setCurrency: (currency: string) => void;
  setSelectedFlight: (flight: FlightOffer | null) => void;
  setSelectedHotel: (hotel: HotelOffer | null) => void;
  setSelectedPackage: (pkg: TravelPackage | null) => void;
  setSelectedExperience: (exp: TravelExperience | null) => void;
  setSelectedTransfer: (transfer: TransferOffer | null) => void;
  setSelectedCar: (car: CarRentalOffer | null) => void;
  setCheckoutItem: (item: any) => void;
  clearCheckout: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
}

export const useTravelStore = create<TravelStoreState>()(
  persist(
    (set) => ({
  currency: "USD",
  exchangeRates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 154.5,
    CAD: 1.37,
    AUD: 1.52,
  },
  selectedFlight: null,
  selectedHotel: null,
  selectedPackage: null,
  selectedExperience: null,
  selectedTransfer: null,
  selectedCar: null,
  checkoutItem: null,
  bookings: (SEED_BOOKINGS as unknown as Booking[]) || [],

  setCurrency: (currency) => set({ currency }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  setSelectedExperience: (exp) => set({ selectedExperience: exp }),
  setSelectedTransfer: (transfer) => set({ selectedTransfer: transfer }),
  setSelectedCar: (car) => set({ selectedCar: car }),
  setCheckoutItem: (item) => set({ checkoutItem: item }),
  clearCheckout: () => set({ checkoutItem: null }),
  addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    })),
  }),
  { name: "travelverse-travel-storage" }
));

interface TripStoreState {
  trips: TripPlan[];
  activeTrip: TripPlan | null;
  setTrips: (trips: TripPlan[]) => void;
  addTrip: (trip: TripPlan) => void;
  updateTrip: (trip: TripPlan) => void;
  setActiveTrip: (trip: TripPlan | null) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  addActivityToTrip: (tripId: string, dayNumber: number, activity: any) => void;
}

export const useTripStore = create<TripStoreState>()(
  persist(
    (set) => ({
  trips: SEED_TRIPS as unknown as TripPlan[],
  activeTrip: (SEED_TRIPS[0] as unknown as TripPlan) || null,

  setTrips: (trips) => set({ trips }),
  addTrip: (trip) =>
    set((state) => {
      const exists = state.trips.some((t) => t.id === trip.id);
      return {
        trips: exists ? state.trips.map((t) => (t.id === trip.id ? trip : t)) : [trip, ...state.trips],
        activeTrip: trip,
      };
    }),
  updateTrip: (trip) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === trip.id ? trip : t)),
      activeTrip: state.activeTrip?.id === trip.id ? trip : state.activeTrip,
    })),
  setActiveTrip: (trip) => set({ activeTrip: trip }),

  togglePackingItem: (tripId, itemId) =>
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              packingList: t.packingList.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)),
            }
          : t
      ),
      activeTrip:
        state.activeTrip?.id === tripId
          ? {
              ...state.activeTrip,
              packingList: state.activeTrip.packingList.map((p) => (p.id === itemId ? { ...p, packed: !p.packed } : p)),
            }
          : state.activeTrip,
    })),

  addActivityToTrip: (tripId, dayNumber, activity) =>
    set((state) => {
      const updateTrip = (t: TripPlan) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          days: t.days.map((d) => (d.dayNumber === dayNumber ? { ...d, activities: [...d.activities, activity] } : d)),
        };
      };
      return {
        trips: state.trips.map(updateTrip),
        activeTrip: state.activeTrip ? updateTrip(state.activeTrip) : null,
      };
    }),
  }),
  { name: "travelverse-trips-storage" }
));

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (notifs: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "time" | "read">) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: SEED_NOTIFICATIONS as unknown as NotificationItem[],
  unreadCount: SEED_NOTIFICATIONS.filter((n) => !n.read).length,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (item) =>
    set((state) => {
      const newNotif: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        time: "Just now",
        read: false,
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
}));
