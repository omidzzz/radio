"use client";

import ErrorBoundary from "../feedback/ErrorBoundary";
import { ReactNode } from "react";

/**
 * Client-side wrapper for the root error boundary.
 * Since app/layout.tsx is a server component, it can't use
 * client-side error boundaries directly - this wrapper bridges that.
 */
export default function RootErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}