import { z } from "zod";

// Booking schema matching the database structure
export const BookingSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().email("Please provide a valid email address").max(200),
  phone: z.string().min(8, "Phone number must be at least 8 characters").max(20),
  session_type: z.enum([
    "initial-consultation",
    "treatment-planning",
    "radiation-therapy",
    "follow-up",
    "second-opinion",
  ]),
  preferred_date: z.string().min(1, "Preferred date is required"),
  preferred_time: z.string().min(1, "Preferred time is required"),
  notes: z.string().max(500).optional(),
});

export type BookingFormValues = z.infer<typeof BookingSchema>;

// Export validation function
export function validateBooking(
  data: unknown
): { success: true; data: BookingFormValues } | { success: false; errors: string[] } {
  const result = BookingSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err) => err.message),
  };
}