"use client";

import { type HTMLAttributes } from "react";
import mriSvgSource from "../../mri-machine-animated-forest-gold-transparent.svg?raw";

/**
 * Identifiers used by the SVG's embedded <style> (classes and @keyframes).
 * They are prefixed with `mri-` so the inlined stylesheet can never collide
 * with the site's global animation API — globals.css already ships its own
 * `.scan-beam` / `@keyframes scan-beam` / `@keyframes status-pulse` etc.
 */
const NAMESPACED_IDS = [
  "ambient-ring",
  "scanner-glow",
  "scan-beam",
  "scan-line",
  "status-light",
  "control-screen",
  "floor-reflection",
  "ring-breathe",
  "glow-breathe",
  "scan-pass",
  "status-pulse",
  "screen-pulse",
  "reflection-pulse",
] as const;

/**
 * The artwork declares `:root` / `[data-theme="dark"]` blocks that merely
 * redeclare palette custom properties the global stylesheet already provides
 * with identical values. Re-injecting them would re-target the document root
 * (a latent leak / footgun), so they are stripped and the SVG inherits the
 * active theme via `var(--color-*, <fallback>)`. The authored 740x740 box is
 * normalised to `100%` so the SVG scales with its wrapper.
 */
const cleanSource = (src: string): string => {
  let next = src;
  // Drop redundant theme declarations (page theme already defines them).
  next = next.replace(/:root\s*\{[^}]*\}/gi, "");
  next = next.replace(/\[data-theme="dark"\]\s*\{[^}]*\}/gi, "");
  // Namespace every class/keyframe to avoid global collisions.
  NAMESPACED_IDS.forEach((id) => {
    next = next.split(id).join(`mri-${id}`);
  });
  // Responsive fill instead of the authored 740px box.
  next = next.replace(
    /width="740"\s+height="740"/,
    'width="100%" height="100%"'
  );
  return next;
};

/**
 * The ?raw import may resolve to either the string content directly
 * (webpack `asset/source` output) or a module object whose `default`
 * property holds the string (es-module interop). Normalise to string.
 */
const svgSource: string =
  typeof mriSvgSource === "string"
    ? mriSvgSource
    : typeof (mriSvgSource as unknown as { default?: string }).default === "string"
    ? (mriSvgSource as { default: string }).default
    : "";

const CLEANED_SVG = cleanSource(svgSource);

export type MriMachineIllustrationProps = HTMLAttributes<HTMLDivElement>;

/**
 * Animated, theme-aware MRI scanner illustration.
 *
 * Inlines `mri-machine-animated-forest-gold-transparent.svg` (slow scan beam,
 * breathing glow rings, status lights) so its CSS animations run and its
 * `var(--color-*)` tokens follow the active light/dark theme. Intended as a
 * decorative hero element and therefore rendered `aria-hidden`.
 */
export default function MriMachineIllustration({
  className = "",
  ...rest
}: MriMachineIllustrationProps) {
  return (
    <div
      className={`mri-illustration ${className}`}
      aria-hidden="true"
      {...rest}
      dangerouslySetInnerHTML={{ __html: CLEANED_SVG }}
    />
  );
}
