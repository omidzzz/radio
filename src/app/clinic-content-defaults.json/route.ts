import { defaultClinicCopy } from "@/lib/clinic-copy";

// Exported alongside index.html; PHP uses exactly the same baseline as React.
export const dynamic = "force-static";
export function GET() {
  return Response.json({ fa: defaultClinicCopy("fa"), en: defaultClinicCopy("en") });
}