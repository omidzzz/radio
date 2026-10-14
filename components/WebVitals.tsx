"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackWebVital } from "@/lib/error-tracking";

/**
 * Web Vitals monitoring component.
 * Reports Core Web Vitals metrics to the tracking utility.
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    const rating =
      metric.value <= 2500
        ? "good"
        : metric.value <= 4000
          ? "needs-improvement"
          : "poor";

    trackWebVital(metric.name, metric.value, rating);
  });

  return null;
}