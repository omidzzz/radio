"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Client-side error boundary that catches rendering errors
 * in child components and displays a fallback UI.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="relative flex min-h-[60vh] items-center justify-center bg-bg px-4">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-3xl" />
            <div className="relative text-center">
              <div className="text-6xl font-extrabold tracking-tight text-red-500/20">
                !
              </div>
              <h2 className="mt-4 text-2xl font-bold text-text-primary">
                بخشی از صفحه با خطا مواجه شد
              </h2>
              <p className="mt-3 text-text-secondary">
                لطفاً صفحه را بازنشانی کنید یا دوباره تلاش کنید.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-primary-hover"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}