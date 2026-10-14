"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface SeamlessMarqueeProps {
  /** Content of ONE copy of the loop. */
  children: ReactNode;
  className?: string;
  duration?: number;
}

/**
 * Truly seamless infinite marquee.
 *
 * Measures the real rendered width of a single copy, then repeats it enough
 * times per half so each half is always wider than the container. The CSS
 * animation translates the track by exactly -50% (= precisely one half),
 * so the loop point always lands on an identical frame — no whitespace,
 * ever, regardless of item count, font/image load timing, or viewport size.
 */
export default function SeamlessMarquee({
  children,
  className = "",
  duration = 36,
}: SeamlessMarqueeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const [repeats, setRepeats] = useState(1);

  useEffect(() => {
    const update = () => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const copyWidth = copyRef.current?.offsetWidth ?? 0;
      if (!containerWidth || !copyWidth) return;
      setRepeats(Math.max(1, Math.ceil(containerWidth / copyWidth)));
    };

    update();

    // Re-measure on container resizes and when the copy's own size changes
    // (fonts loading, images decoding, language toggle, etc.)
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (copyRef.current) ro.observe(copyRef.current);

    return () => ro.disconnect();
  }, []);

  const Half = ({ hidden }: { hidden?: boolean }) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0">
      {Array.from({ length: repeats }).map((_, r) => (
        <div key={r} className="flex shrink-0">
          {children}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden py-3 -my-3 ${className}`}
    >
      {/* Hidden single-copy measurer — kept in layout (invisible) so its
          width reflects real rendered content including fonts/images. */}
      <div
        ref={copyRef}
        aria-hidden
        className="pointer-events-none absolute invisible flex w-max"
      >
        {children}
      </div>

      <div
        className="marquee-track flex w-max"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <Half />
        <Half hidden />
      </div>
    </div>
  );
}