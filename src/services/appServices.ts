import { apiClient } from "./apiClient";
import {
  TripPlan,
  Booking,
  TravelDocument,
  SupportTicket,
  NotificationItem,
  CustomerLead,
  AgentQuote,
} from "../types";

export const tripService = {
  async getTrips(): Promise<TripPlan[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getTripById(id: string): Promise<TripPlan> {
    return new Promise(resolve => setTimeout(() => resolve({} as TripPlan), 800));
  },

  async createTrip(trip: Partial<TripPlan>): Promise<TripPlan> {
    return new Promise(resolve => setTimeout(() => resolve(trip as TripPlan), 800));
  },

  async updateTrip(id: string, updates: Partial<TripPlan>): Promise<TripPlan> {
    return new Promise(resolve => setTimeout(() => resolve(updates as TripPlan), 800));
  },

  async deleteTrip(id: string): Promise<{ success: boolean }> {
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
  },
};

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async getBookingById(id: string): Promise<Booking> {
    return new Promise(resolve => setTimeout(() => resolve({} as Booking), 800));
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return new Promise(resolve => setTimeout(() => resolve(bookingData as Booking), 800));
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return new Promise(resolve => setTimeout(() => resolve({ id, status: "cancelled" } as Booking), 800));
  },
};

export const paymentService = {
  async processPayment(paymentDetails: {
    amount: number;
    currency: string;
    method?: "card" | "apple_pay" | "crypto" | "split";
    paymentMethod?: string;
    cardDetails?: { number: string; exp: string; cvc: string; name: string };
    splitTravelers?: { email: string; amount: number }[];
    bookingId?: string;
  }): Promise<{
    success: boolean;
    transactionId: string;
    receiptUrl: string;
    status: "paid" | "split_pending";
    }> {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, transactionId: "txn_test", receiptUrl: "#", status: "paid" }), 2000));
  },
};

export const documentService = {
  async getDocuments(): Promise<TravelDocument[]> {
    return apiClient.get("/documents");
  },

  async uploadDocument(formData: FormData): Promise<TravelDocument> {
    return apiClient.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async generateTicketPdf(bookingId: string): Promise<{ pdfUrl: string; downloadFilename: string }> {
    return apiClient.get(`/documents/generate-pdf/${bookingId}`);
  },

  async checkVisaRequirements(passportCountry: string, destinationCountry: string): Promise<any> {
    return apiClient.post("/documents/visa-check", { passportCountry, destinationCountry });
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/documents/${id}`);
  },
};

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async createTicket(ticket: { subject: string; category: string; priority: string; initialMessage: string }): Promise<SupportTicket> {
    return new Promise(resolve => setTimeout(() => resolve({ id: "ticket-1", ...ticket } as any), 800));
  },

  async submitTicket(params: { category: string; description: string; urgency: string }): Promise<SupportTicket> {
    return new Promise(resolve => setTimeout(() => resolve({ id: "sos-1", ...params } as any), 800));
  },

  async sendTicketMessage(ticketId: string, message: string): Promise<{ ticket: SupportTicket; autoAiReply?: string }> {
    return new Promise(resolve => setTimeout(() => resolve({ ticket: {} as any }), 800));
  },
};

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
  },

  async markAllRead(): Promise<{ success: boolean }> {
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
  },
};

export const adminService = {
  async getAnalytics(): Promise<any> {
    return new Promise(resolve => setTimeout(() => resolve({
      totalRevenue: 0,
      activeBookingsCount: 0,
      conversionRate: 0,
      aiQueriesHandled: 0,
      revenueByDay: [],
      topDestinations: [],
      systemHealth: { uptime: "99.9%", apiLatencyMs: 120, geminiQuota: "Safe" }
    }), 800));
  },

  async syncGDSInventory(): Promise<{ success: boolean; updatedCount: number; timestamp: string }> {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, updatedCount: 0, timestamp: new Date().toISOString() }), 800));
  },
};

export const agentService = {
  async getCustomers(): Promise<CustomerLead[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async createCustomer(customer: Partial<CustomerLead>): Promise<CustomerLead> {
    return new Promise(resolve => setTimeout(() => resolve({ id: "cust-1", ...customer } as any), 800));
  },

  async getQuotes(): Promise<AgentQuote[]> {
    return new Promise(resolve => setTimeout(() => resolve([]), 800));
  },

  async createQuote(quote: Partial<AgentQuote>): Promise<AgentQuote> {
    return new Promise(resolve => setTimeout(() => resolve({ id: "quote-1", ...quote } as any), 800));
  },

  async createClientProposal(params: {
    clientName: string;
    destination: string;
    budget: number;
    commissionPercent: number;
  }): Promise<AgentQuote> {
    return new Promise(resolve => setTimeout(() => resolve({ id: "prop-1", ...params } as any), 800));
  },
};
