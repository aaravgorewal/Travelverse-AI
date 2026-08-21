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
    return apiClient.get("/trips");
  },

  async getTripById(id: string): Promise<TripPlan> {
    return apiClient.get(`/trips/${id}`);
  },

  async createTrip(trip: Partial<TripPlan>): Promise<TripPlan> {
    return apiClient.post("/trips", trip);
  },

  async updateTrip(id: string, updates: Partial<TripPlan>): Promise<TripPlan> {
    return apiClient.put(`/trips/${id}`, updates);
  },

  async deleteTrip(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/trips/${id}`);
  },
};

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return apiClient.get("/bookings");
  },

  async getBookingById(id: string): Promise<Booking> {
    return apiClient.get(`/bookings/${id}`);
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return apiClient.post("/bookings", bookingData);
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return apiClient.post(`/bookings/${id}/cancel`, { reason });
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
    return apiClient.post("/payments/checkout", paymentDetails);
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
    return apiClient.get("/support/tickets");
  },

  async createTicket(ticket: { subject: string; category: string; priority: string; initialMessage: string }): Promise<SupportTicket> {
    return apiClient.post("/support/tickets", ticket);
  },

  async submitTicket(params: { category: string; description: string; urgency: string }): Promise<SupportTicket> {
    return apiClient.post("/support/submit-sos", params);
  },

  async sendTicketMessage(ticketId: string, message: string): Promise<{ ticket: SupportTicket; autoAiReply?: string }> {
    return apiClient.post(`/support/tickets/${ticketId}/messages`, { message });
  },
};

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return apiClient.get("/notifications");
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    return apiClient.post(`/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<{ success: boolean }> {
    return apiClient.post("/notifications/read-all", {});
  },
};

export const adminService = {
  async getAnalytics(): Promise<{
    totalRevenue: number;
    activeBookingsCount: number;
    conversionRate: number;
    aiQueriesHandled: number;
    revenueByDay: { date: string; amount: number }[];
    topDestinations: { name: string; bookings: number; growth: string }[];
    systemHealth: { uptime: string; apiLatencyMs: number; geminiQuota: string };
  }> {
    return apiClient.get("/admin/analytics");
  },

  async syncGDSInventory(): Promise<{ success: boolean; updatedCount: number; timestamp: string }> {
    return apiClient.post("/admin/gds-sync", {});
  },
};

export const agentService = {
  async getCustomers(): Promise<CustomerLead[]> {
    return apiClient.get("/agent/customers");
  },

  async createCustomer(customer: Partial<CustomerLead>): Promise<CustomerLead> {
    return apiClient.post("/agent/customers", customer);
  },

  async getQuotes(): Promise<AgentQuote[]> {
    return apiClient.get("/agent/quotes");
  },

  async createQuote(quote: Partial<AgentQuote>): Promise<AgentQuote> {
    return apiClient.post("/agent/quotes", quote);
  },

  async createClientProposal(params: {
    clientName: string;
    destination: string;
    budget: number;
    commissionPercent: number;
  }): Promise<AgentQuote> {
    return apiClient.post("/agent/generate-proposal", params);
  },
};
