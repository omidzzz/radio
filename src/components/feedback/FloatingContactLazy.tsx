"use client";

import dynamic from "next/dynamic";
import type { FloatingContactLabels } from "@/components/feedback/FloatingContact";

// Client-only, code-split: the floating contact widget is interactive
// chrome, not critical content — defer its JS until after hydration.
const FloatingContact = dynamic(() => import("@/components/feedback/FloatingContact"), {
  ssr: false,
});

export default function FloatingContactLazy({
  labels,
}: {
  labels: FloatingContactLabels;
}) {
  return <FloatingContact labels={labels} />;
}