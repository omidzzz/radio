"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Device-capability gate for decorative ambient effects.
 *
 * Renders `children` (animated layers: morphing blobs, node networks, …)
 * only on devices that can afford them. On low-end devices — few CPU
 * cores, low device memory, or prefers-reduced-motion — the cheap static
 * `fallback` is rendered instead, saving constant blur compositing on
 * the GPU and battery.
 *
 * Server render and the first client render both output `children`, so
 * capable devices see no flash; low-end devices simply drop the layers
 * right after hydration.
 */

function isLowCapabilityDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  // Metered / data-saver connections: the animated layers are pure
  // decoration, so the static stand-in is the right call.
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType && /^(slow-2g|2g|3g)$/.test(connection.effectiveType)) {
    return true;
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

interface AmbientFxProps {
  children: ReactNode;
  /** Cheap static stand-in rendered on constrained devices */
  fallback?: ReactNode;
}

export default function AmbientFx({ children, fallback = null }: AmbientFxProps) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (isLowCapabilityDevice()) setEnabled(false);
  }, []);

  return <>{enabled ? children : fallback}</>;
}
