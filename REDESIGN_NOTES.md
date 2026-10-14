# REDESIGN_NOTES.md — Autonomous Redesign of radiotherapist-website

Branch: `redesign/v2` (main untouched at `08865c8`).
This file documents Phase 1 (discovery), Phase 2 (design strategy), and — at the
end of the build — what changed, assumptions, and review points.

---

## PHASE 1 — DISCOVERY

### 1. Project map

| Concern | Finding |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript 5.7, `output: "standalone"` |
| Routing | `app/` — public pages: `/`, `/about`, `/services`, `/booking`, `/contact`, `/blog`, `/blog/[slug]`, `/forum`, `/forum/[id]`, `/search`, `/privacy`, `/terms`; `admin/` (login, dashboard, blog CRUD, availability, analytics, seo-audit); ~40 `api/` routes |
| Layout shell | `app/layout.tsx` — fonts (Vazirmatn + Outfit via `next/font`), JSON-LD, Analytics, WebVitals, PWA, Preloader, ScrollProgress, Navbar, Footer, StickyBookingBar, FloatingContact, BookingModal, Theme + Locale providers |
| Styling | Tailwind CSS v4 (CSS-first). Tokens in `app/globals.css` (`:root` / `[data-theme=dark]` + `@theme`), duplicated in `lib/theme.ts` (dead file — imported nowhere). ~2,450 lines of CSS with ~120 utility classes |
| Data | SQLite (`better-sqlite3`) in `data/site.db`; services layer in `lib/services/*` |
| i18n | Farsi default (RTL) + English (LTR). Dictionaries `lib/i18n/dictionaries/{fa,en}.ts`; locale cookie + `/en` prefix rewrite in `middleware.ts` |
| State | React context: `LocaleProvider`, `ThemeProvider`, `BookingModalProvider`; local component state otherwise |
| Key deps | `next`, `react`, `better-sqlite3`, `sanitize-html`, `zod`, `sharp`. No animation library installed |
| Tests | vitest — 4 files, 29 tests (auth, dates, sanitize, validation) — all passing |
| CI | `.github/workflows/ci.yml` — lint → typecheck → test → build → deploy (SSH+PM2), **only from `main`** |
| SEO | metadata API, OG/Twitter, JSON-LD (6 schemas + FAQ + breadcrumbs), sitemap, robots, RSS, `llms.txt` |

**Baseline health (before any change):** build ✅ · typecheck ✅ · tests ✅ 29/29 ·
lint ❌ — `eslint`/`eslint-config-next` were referenced by scripts/config but missing
from `package.json` (CI lint job would fail). Installed as devDependencies; the code
then showed **76 pre-existing lint issues** (50 errors / 26 warnings). Fixing them is
part of this redesign's "clean code" mandate.

### 2. What the site is

A **radiotherapy / medical-imaging clinic website** (Farsi-first, Iran market —
ParsWebServer hosting, Saturday–Thursday work week). Goal: **convert visitors into
booking requests** (`/booking` → `POST /api/bookings` with reference number),
reinforced by contact form, community forum (no-login Q&A), blog, and heavy SEO.
Secondary goals: inform (services, FAQ, blog), reassure (testimonials, certifications),
community support (forum).

### 3. Who it's for

- **Patients** (mostly Persian-speaking) researching radiotherapy and booking consultations — often anxious, seeking clarity, trust, and a fast path to an appointment.
- **Family/companions** looking for reassurance and practical steps.
- **Referring doctors** checking capabilities (SRS/SBRT/brachytherapy, equipment specs).
- CTA vocabulary ("Book Now", "Book a Consultation", "Replies within 24h", online + phone) confirms a **booking-conversion** audience, not a brand-awareness one.


### 4. Brand personality & tone (inferred)

- **Personality:** expert + compassionate + technologically advanced. Copy pairs
  precision language ("0.5 mm", "IMRT/IGRT/SBRT", "conformity index 1.02") with
  warmth ("Your Journey, Our Priority", "treated me like family").
- **Tone:** professional-reassuring; formal on legal/admin pages, warm on patient pages.
- **Classification:** *medical-technical with a humane layer* — currently expressed as
  a dark "medical HUD" (cyan glow, grids, reticles) over white/light sections.
- **Logo/identity:** radiation trefoil + circular monogram (see `public/images/icon.svg`),
  cyan-based. The trefoil is a domain symbol, not a color mandate.

### 5. Content inventory (all preserved)

- **Dictionaries (single source of truth):** `common` (18 keys), `nav` (9),
  `floating` (3), `footer` (20), `home` (hero×2 slides, 3 features, modalities ticker
  [9 items], 4 FAQ, forum CTA), `about` (mission×2, 6 values, 3 team members, 4 stats,
  4 milestones), `services` (6 services × title/desc/3 features, 4-step process,
  4 stats, 4 FAQ, CTAs), `booking` (full wizard form copy, 5 session types,
  validation + success messages), `contact` (form copy, 3 feature labels, office
  hours, map labels), `forum` (categories, forms, moderation copy), `admin` (~90 keys).
- **Inline bilingual copy (`isFa ? fa : en`):** home sections — process (3 steps),
  equipment (4 specs), precision (3 metrics + list), credibility (3 rings),
  certification band (JCI/IAEA/ISO 27001/ISO 45001), testimonials (3 quotes ×2
  languages), trust strip (DICOM/HIPAA/ACR/ISO 9001); blog/forum/search microcopy.
- **Hardcoded facts:** address lines (dictionary), contact info (`lib/seo.ts` →
  `siteConfig`), social URLs, working hours (`lib/services/working-hours.ts`).
- **Priority content for the goal:** (1) hero + Book CTA, (2) booking page/form,
  (3) services + process, (4) trust proof (stats/testimonials/certs), (5) FAQ,
  (6) contact/quick-call, (7) forum/blog as supporting depth.

### 6. Functionality that must keep working

Forms: booking (wizard + honeypot + slot API), contact, forum post/reply, admin login,
blog editor. APIs: bookings/availability, contact, forum, blog+comments+views, search,
upload/media, locale, web-vitals, health, admin CRUD. Integrations: SMTP mailer,
Google Maps embed, GA (Analytics), PWA (sw.js/manifest/offline). Infra: middleware
locale routing, ISR (`revalidate = 3600`), rate limiting, RSS/sitemap/robots, JSON-LD,
dark/light theme, RTL/LTR, `prefers-reduced-motion`. Nothing in this list may break.

Fonts: next/font Google (Vazirmatn, Outfit today).

---

## PHASE 2 — DESIGN STRATEGY

### 1. Design concept

> **"Clinical dossier" — editorial print medicine:** the website as a beautifully
> printed patient file / medical journal: warm paper stock, black ink, a single
> signal red, hairline rules, numbered index navigation, tabular ledgers, oversized
> display type. Deliberately opposite to the current cold cyan HUD, while owning the
> same truth: radiotherapy is *measured, documented, precise* — like a well-set page.

### 2. Color palette (complete break from cyan/teal)

**Light — "Paper" (default):**

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `--color-paper` | `#f4efe4` | page background (warm ivory stock) | — |
| `--color-surface` | `#fbf8f1` | raised cards/sheets | — |
| `--color-ink` | `#16130f` | primary text | 15.6:1 on paper ✅ |
| `--color-ink-2` | `#55504a` | secondary text | ~7.4:1 on paper ✅ |
| `--color-rule` | `#d9d2c4` | hairlines/borders | decorative (non-text) |
| `--color-signal` | `#c2371f` | THE accent: CTAs, links, markers | ~5.6:1 on paper ✅ |
| `--color-signal-deep` | `#9c2a16` | hover/pressed, small text | ~7.4:1 ✅ |
| `--color-highlight` | `#e8b02f` | ochre secondary highlight (rare) | non-text use only |
| `--color-deep` | `#16130f` | dark bands (ink black) | paper text on it ✅ |

**Dark — "Night edition" (`data-theme="dark"`):** base `#14120f`, surface `#1c1915`,
text `#f0eadd` (~14.9:1), secondary `#a49c8f` (~7.1:1), rule `#332d25`,
signal `#ff6b4a` (~6.1:1 on base ✅), highlight `#f0b840`.

Rationale: warm ivory + ink + signal red is a classic editorial/medical-print triad;
it inverts the current cool white/slate + cyan scheme entirely while keeping the
trefoil identity (the emblem renders in ink/signal). WCAG AA verified for all text
pairings; ochre never carries text.
scale with generous line-height for RTL legibility.

### 4. Information architecture — old → new mapping

Routes unchanged (no redirects needed). Home redistribution:

| # | Old order | New order |
| --- | --- | --- |
| 1 | modality marquee | **Dossier hero** — single (no slider): display headline + lede + Book CTA + fact rail |
| 2 | 2-slide hero slider | **Ledger strip** — modalities as ruled ticker + trust marks (DICOM/HIPAA/ACR/ISO) folded in |
| 3 | trust chips | **Numbered features** (01–03) — asymmetric: sticky title left, entries right |
| 4 | features (3 cards) | **Process** — sticky "dose rail" storytelling (signature moment) |
| 5 | process (alternating) | **Precision + Equipment** merged → one "spec sheet" (ledger table + image) |
| 6 | equipment | **Testimonials** — editorial pull-quotes, all 3 visible (autoplay carousel removed) |
| 7 | precision | **Credibility rings + certifications** merged → one ledger |
| 8 | testimonials | **FAQ** (accordion, unchanged behavior) |
| 9 | credibility + divider + certs | **CTA band** — ink black, oversized type |
| 10–11 | FAQ → CTA | |

→ 11 sections become 9; conversion leads; proof is consolidated.

Inner pages: `PageHero` (dark glass) → **`ChapterHead`** — paper header with mono
chapter index (`§ 02 / SERVICES`), display title, lede, hairline rule. Services gets
a spec-sheet table treatment; About becomes a ruled milestone ledger; Booking/Contact
use a two-column "form + file notes" layout; Blog/Forum get print-journal index
styling. Admin inherits tokens (functional restyle, no restructure).

### 5. Motion principles

- Easing: `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)` for reveals;
  `--ease-io: cubic-bezier(0.65, 0, 0.35, 1)` for in-place swaps.
- Durations: micro 150ms · base 250ms · reveal 700ms · beam 900ms.
- What animates & why: **beam-wipe** on headings (radiotherapy metaphor),
  **scroll-progress dose rail** on process (orientation), **count-ups** on ledger
  stats (draw eye to proof), **rule-draw** under titles (press feel), micro hovers
  (affordance). CSS + IntersectionObserver only — **no new runtime dependencies**;
  everything gated by `prefers-reduced-motion`.

### 6. Signature moments

1. **Beam headline reveal** — chapter/hero titles wipe in under a thin signal-red
   beam line that then parks as the section rule.
2. **Treatment-journey dose rail** — sticky numbered rail; active step fills with
   signal red on scroll; degrades to stacked cards on mobile / no-JS.
3. **Ledger stats** — stats/certs as ruled ledger rows with mono tabular numerals
   counting up, like a lab-report page.

---


### 3. Typography (no Inter/Roboto/Arial/system voice)

| Role | Font | Notes |
| --- | --- | --- |
| Latin display | **Fraunces** (`next/font`, variable, serif) | high-contrast editorial serif — headlines + big numerals |
| Latin body/UI | **Instrument Sans** | grotesque with character; body + UI |
| Data/labels | **IBM Plex Mono** | eyebrows, indices (01/02), spec tables, metadata lines |
| Persian | **Vazirmatn** (kept) | body + UI in `fa` — best RTL support, already loaded |

Fluid scale (tokens): display `clamp(2.6rem, 6.4vw, 5rem)` · h1 `clamp(2.1rem, 4.6vw, 3.4rem)` ·
h2 `clamp(1.7rem, 3.2vw, 2.5rem)` · h3 `clamp(1.25rem, 2vw, 1.5rem)` · lede 1.125rem ·
body 1rem · mono label 0.75rem (tracking 0.16em, uppercase). Persian uses the same
scale with generous line-height for RTL legibility.

### 7. Existing weaknesses (guiding the new structure)

1. **Effects compete with content** — particles, blobs, glows, grids on every page;
   the copy is visually secondary.
2. **Two disjoint systems** — white "surface-card" pages alternate with glowing
   `bg-deep` bands; the site never feels like one artifact.
3. **Flat hierarchy / long page** — home runs 10+ sections with near-identical
   rhythm (header → 3 cards); the booking CTA repeats but never *leads*.
4. **Generic display voice** — Outfit as Latin display reads template-SaaS.
5. **Hand-rolled decoration per page** — 500+-line pages dominated by inline SVG
   icon arrays and ambient layers (maintenance + byte cost).
6. **Centered-card default** — every section is a centered header over a 3-col grid;
   no editorial composition, no storytelling pacing.

### 8. Assets

`public/images/`: hero (`home-hero.webp` 59 KB, `hero-radiology machine.webp` 252 KB,
`home-radiologist.webp` 245 KB, `home-consultation-circle.webp` 156 KB,
`process-left/right.webp`, `home-parallax.webp`, `blog-default.webp`), icons
(`icon.svg` trefoil, `icon-192/512.png`, apple-touch), `public/uploads/*` (blog images).
All ≥1024 px-class webp — feature them with crop/mask; no asset needs replacing.
Fonts: next/font Google (Vazirmatn, Outfit today).
