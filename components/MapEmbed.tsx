"use client";

import { useState } from "react";
import { MapPinIcon } from "@/components/ui/icons";

interface MapEmbedProps {
  /** Google Maps embed URL — only loaded after user interaction */
  embedUrl: string;
  /** External "open in Google Maps" link */
  directionsUrl: string;
  loadLabel: string;
  openLabel: string;
  title: string;
}

/**
 * Click-to-load Google Maps embed.
 *
 * Avoids loading ~1MB of third-party iframe content on page load;
 * the map is mounted only when the visitor asks for it. A lightweight
 * placeholder with the clinic pin and a direct directions link is
 * shown until then.
 */
export default function MapEmbed({
  embedUrl,
  directionsUrl,
  loadLabel,
  openLabel,
  title,
}: MapEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="map-embed relative min-h-[280px] flex-1 bg-soft">
      {loaded ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={loadLabel}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden"
        >
          {/* Decorative planning grid */}
          <div
            className="planning-grid pointer-events-none absolute inset-0 opacity-40 transition-opacity group-hover:opacity-70"
            aria-hidden="true"
          />

          {/* Pulsing pin */}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
            <MapPinIcon className="relative h-6 w-6" />
          </span>

          <span className="relative inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors group-hover:border-primary/50 group-hover:text-primary">
            <MapPinIcon className="h-4 w-4" />
            {loadLabel}
          </span>
        </button>
      )}

      {/* Direct directions link (always available) */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 end-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3.5 py-1.5 text-xs font-medium text-text-secondary shadow-sm backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
      >
        <MapPinIcon className="h-3.5 w-3.5" />
        {openLabel}
      </a>

      {/* Bottom fade for depth (only over loaded map) */}
      {loaded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-deep/40 to-transparent" />
      )}
    </div>
  );
}