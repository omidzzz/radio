import SeamlessMarquee from "@/components/ui/SeamlessMarquee";

interface MarqueeProps {
  items: string[];
  className?: string;
  itemClassName?: string;
  duration?: number;
}

/**
 * Seamless infinite marquee of text items.
 * Looping/repetition is handled by SeamlessMarquee, which measures the
 * content and repeats it enough times to guarantee zero whitespace.
 */
export default function Marquee({
  items,
  className = "",
  itemClassName = "",
  duration = 36,
}: MarqueeProps) {
  return (
    <SeamlessMarquee className={`whitespace-nowrap ${className}`} duration={duration}>
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={`inline-flex items-center ${itemClassName}`}
        >
          <span>{item}</span>
          <span className="mx-6 text-primary/50">✦</span>
        </span>
      ))}
    </SeamlessMarquee>
  );
}