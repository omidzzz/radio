"use client";

import { useEffect } from "react";
import { logger } from "@/lib/core/logger";
import StateIllustration from "@/components/ui/StateIllustration";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error("Error rendering page", { error: error });
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center bg-bg px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-3xl" />
      <div className="relative flex flex-col items-center text-center">
        <StateIllustration
          variant="error"
          className="h-36 w-36 opacity-90 sm:h-44 sm:w-44"
        />
        <h1 className="mt-6 text-3xl font-bold text-text-primary">
          ╪«╪╖╪º█î█î ╪▒╪« ╪»╪º╪»┘ç ╪º╪│╪¬
        </h1>
        <p className="mt-3 text-text-secondary">
          ┘à╪¬╪ú╪│┘ü╪º┘å┘ç ┘à╪┤┌⌐┘ä█î ╪»╪▒ ╪¿╪º╪▒┌»╪░╪º╪▒█î ╪º█î┘å ╪╡┘ü╪¡┘ç ┘╛█î╪┤ ╪ó┘à╪»┘ç ╪º╪│╪¬. ┘ä╪╖┘ü╪º┘ï ╪»┘ê╪¿╪º╪▒┘ç ╪¬┘ä╪º╪┤ ┌⌐┘å█î╪».
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-fill px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors duration-300 hover:bg-primary-fill-hover"
        >
          ╪¬┘ä╪º╪┤ ┘à╪¼╪»╪»
        </button>
      </div>
    </div>
  );
}
