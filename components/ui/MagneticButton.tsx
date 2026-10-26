"use client";

import {
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent,
  type ElementType,
  type ComponentPropsWithRef,
  useState,
  type CSSProperties,
} from "react";

type Variant = "primary" | "ghost" | "secondary" | "outline" | "text";

// Custom hook that returns a ref-based state pair [value, setValue]
function useRefValue(initial: number): [number, (value: number) => void] {
  const ref = useRef<number>(initial);
  const [, setInner] = useState(0);
  const setValue = (value: number) => {
    ref.current = value;
    setInner((_) => ref.current != null ? ref.current : value);
  };
  const getValue = () => ref.current;
  return [getValue(), setValue] as [number, (value: number) => void];
}

type MagneticButtonProps<T extends ElementType = "span"> = {
  children: ReactNode;
  as?: T;
  href?: string;
  className?: string;
  strength?: number;
  variant?: Variant;
  mode?: "follow" | "attract" | "repel";
  ripple?: boolean;
  glow?: boolean;
} & Omit<ComponentPropsWithRef<T>, "children" | "className" | "href">

const VARIANTS: Record<Variant, string> = {
  // Primary — solid, clean, subtle lift
  primary: "bg-primary text-white border border-transparent hover:bg-primary-hover shadow-sm hover:shadow dark:bg-button-fill dark:text-button-text dark:hover:bg-button-fill-hover",

  // Ghost — hairline border, soft hover
  ghost: "bg-surface text-text-primary border border-border hover:border-primary hover:bg-surface dark:text-text-primary dark:border-border dark:hover:border-primary",

  // Secondary — soft tint, almost borderless feel
  secondary: "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15 hover:border-primary/50 dark:bg-primary/15 dark:text-primary-hover dark:border-primary/35 dark:hover:bg-primary/20",

  // Outline — clear fill, colored border
  outline: "bg-surface text-primary border border-primary hover:bg-primary/10 hover:text-primary shadow-sm hover:shadow dark:bg-surface dark:border-primary/50 dark:hover:bg-primary/15 dark:hover:text-primary-hover",

  // Text — minimal, almost like a link
  text: "text-primary underline-offset-4 hover:underline bg-transparent border-none shadow-none dark:text-primary-hover focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
};

const BASE =
  "group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full cursor-pointer select-none font-semibold leading-relaxed transition-all duration-[var(--animation-speed-fast,200ms)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none";

export default function MagneticButton<T extends ElementType = "span">({
  children,
  as: Tag = "span" as T,
  href,
  className = "",
  strength = 0.2,
  variant = "primary",
  ripple = false,
  ...rest
}: MagneticButtonProps<T>) {
  const Component = Tag as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [my, setMY] = useRefValue(0);
  const [scale, setScale] = useRefValue(1);

  const canMove = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(hover: none)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || !canMove()) { setMY(0); setScale(1); return; }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const damping = 0.12;
      setMY((x * strength * 25) * damping);
      const dist = Math.hypot(x, y);
      setScale(Math.max(0.92, 1 - dist / 120 * 0.08));
    },
    [strength, canMove],
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setMY(0); setScale(1);
  }, []);

  const handleMouseDown = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setScale(0.94);
  }, []);

  const handleMouseUp = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setScale(1);
  }, []);

  return (
    <Component
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      // @ts-ignore
// @ts-ignore
  style={{ '--mb-strength': strength, '--mb-scale': scale, '--gx': "50%", '--gy': "50%" } as CSSProperties}
      {...rest}
    >
      {children}
      {ripple && (
        <span
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 bg-primary/[0.1] pointer-events-none"
          style={{ transform: scale !== 1 ? "scale(1.25)" : "scale(1)" }}
        />
      )}
    </Component>
  );
}