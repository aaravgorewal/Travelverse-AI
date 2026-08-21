import { z } from "zod";

export const travelerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  passportId: z.string().optional(),
  frequentFlyer: z.string().optional(),
});

export const bookingFormSchema = z.object({
  // Step 1: Customer
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number required"),
  
  // Step 3: Travelers
  travelers: z.array(travelerSchema).min(1, "At least one traveler required"),
  
  // Step 5: Payment
  paymentProvider: z.enum(["stripe", "razorpay"]),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
