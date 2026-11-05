import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Refined handset phone icon with subtle curvature */
export function PhoneIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2h2.7a1.2 1.2 0 0 1 1.14.82l1.34 4.02a1.2 1.2 0 0 1-.6 1.49l-2.16 1.08a10 10 0 0 0 4.95 4.95l1.08-2.16a1.2 1.2 0 0 1 1.49-.6l4.02 1.34A1.2 1.2 0 0 1 22.3 14.7V17.5A2.5 2.5 0 0 1 19.8 20h-1C10.6 20 4 13.4 4 5.2V4.5Z" />
    </svg>
  );
}

/** Phone with radiation-wave pulses — consultation CTA */
export function PhoneCallIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2h2.7a1.2 1.2 0 0 1 1.14.82l1.34 4.02a1.2 1.2 0 0 1-.6 1.49l-2.16 1.08a10 10 0 0 0 4.95 4.95l1.08-2.16a1.2 1.2 0 0 1 1.49-.6l4.02 1.34A1.2 1.2 0 0 1 22.3 14.7V17.5A2.5 2.5 0 0 1 19.8 20h-1C10.6 20 4 13.4 4 5.2V4.5Z" />
      <path d="M16 3a4 4 0 0 1 4 4" strokeOpacity={0.5} />
      <path d="M16 6a1 1 0 0 1 1 1" strokeOpacity={0.35} />
    </svg>
  );
}

/** Precision clock with crosshair markers — treatment timing */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" strokeOpacity={0.2} strokeDasharray="2 3" />
      <path d="M12 7.5v4.5l3 2.5" />
      <path d="M12 2.5v1.5M12 20v1.5M2.5 12h1.5M20 12h1.5" strokeOpacity={0.35} strokeWidth={1.5} />
    </svg>
  );
}

/** Map pin with pulse ring — location marker */
export function MapPinIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M12 21.5s-7.5-5.8-7.5-11.7A7.5 7.5 0 0 1 12 2.3a7.5 7.5 0 0 1 7.5 7.5c0 5.9-7.5 11.7-7.5 11.7Z" />
      <circle cx="12" cy="9.8" r="2.8" />
      <circle cx="12" cy="9.8" r="5.5" strokeOpacity={0.2} strokeDasharray="2 4" />
    </svg>
  );
}

/** Envelope with subtle depth layers */
export function MailIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m 4.2 6.8 7.16 5.37a2 2 0 0 0 2.48 0L21 6.8" />
      <path d="M3 7.5 12 13l9-5.5" strokeOpacity={0.3} />
    </svg>
  );
}

/** Speech bubble with typing indicator dots */
export function ChatIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4h-.5A2.5 2.5 0 0 1 4 13.5v-8Z" />
      <circle cx="8.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Anatomical heart with care pulse line */
export function CareIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M12 21s-7.5-5-7.5-11a4.5 4.5 0 0 1 8-3.2 4.5 4.5 0 0 1 8 3.2c0 6-7.5 11-7.5 11Z" />
      <path d="M3.5 13h3l1.5-3 2 6 2-4 1.5 2h6" strokeOpacity={0.45} />
    </svg>
  );
}

/** Arrow pointing forward — flips automatically in RTL layouts */
export function ArrowIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      {...baseProps}
      strokeWidth={2}
      aria-hidden="true"
      className={`rtl:-scale-x-100 ${className ?? ""}`}
      {...rest}
    >
      <path d="M4 12h16M14 6.5l5.5 5.5-5.5 5.5" />
    </svg>
  );
}

/** Telegram brand mark (filled) */
export function TelegramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/** WhatsApp brand mark (filled) */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Instagram glyph (outline camera) */
export function InstagramIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Arrow pointing up — back-to-top affordance */
export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={2} aria-hidden="true" {...props}>
      <path d="M12 19V5M6 10l6-5 6 5" />
    </svg>
  );
}

/** Loading spinner with gradient ring */
export function SpinnerIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`animate-spin ${className ?? ""}`}
      {...rest}
    >
      <defs>
        <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.15"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="url(#spinner-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Checkmark in circle — success/verification */
export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m 8 12 3 3 5-6" />
    </svg>
  );
}

/** Radiation trefoil — topical accent icon */
export function RadiationIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
      <path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5M4.8 4.8l3.5 3.5M15.7 15.7l3.5 3.5M19.2 4.8l-3.5 3.5M8.3 15.7l-3.5 3.5" strokeOpacity={0.5} />
    </svg>
  );
}

/** Crosshair reticle — precision targeting */
export function ReticleIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" strokeOpacity={0.4} />
      <circle cx="12" cy="12" r="5.5" strokeOpacity={0.6} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 1v3M12 20v3M1 12h3M20 12h3" strokeOpacity={0.5} />
    </svg>
  );
}

/** Star badge — ratings & featured */
export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 1.5l3.09 6.68 7.21.91-5.3 4.82 1.41 7.09L12 17.27 5.59 21l1.41-7.09-5.3-4.82 7.21-.91z" />
    </svg>
  );
}

/** Eye icon — view counter */
export function EyeIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Document with lines — blog/article */
export function DocumentIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" strokeOpacity={0.5} />
      <path d="M9 13h6M9 17h6M9 9h2" strokeOpacity={0.4} />
    </svg>
  );
}

/** Shield with checkmark — security/trust */
export function ShieldIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <path d="M12 2.5 4 6v6c0 5.5 3.4 9.5 8 11.5 4.6-2 8-6 8-11.5V6l-8-3.5Z" />
      <path d="m 8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

/** Plus/add icon */
export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={2} aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Close X icon */
export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={2.2} aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Menu hamburger icon */
export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

/** Sun icon — light theme toggle */
export function SunIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5" />
    </svg>
  );
}

/** Moon icon — dark theme toggle */
export function MoonIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.8} aria-hidden="true" {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

/** Copy/link icon */
export function CopyIcon(props: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={1.7} aria-hidden="true" {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

/** LinkedIn brand mark (filled) */
export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** X/Twitter brand mark (filled) */
export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}