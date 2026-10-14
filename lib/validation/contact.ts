import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  email: z.string().email("Please provide a valid email address").max(200),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(300),
  message: z.string().min(2, "Message must be at least 2 characters").max(5000),
});

export type ContactFormValues = z.infer<typeof ContactSchema>;

export function validateContact(
  data: unknown
): { success: true; data: ContactFormValues } | { success: false; errors: string[] } {
  const result = ContactSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err) => err.message),
  };
}