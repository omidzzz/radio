# Bilingual JSON blog imports

All commands below run from `C:\Users\ghada\Desktop\Projects\radiotherapist-website`.

## Requirements and safe workflow

- Node 22.18+ (verified with Node 22.23.1), installed dependencies, and an initialized `C:\Users\ghada\Desktop\Projects\radiotherapist-website\data\site.db`.
- Validate before importing. Check mode does **not** open or modify SQLite, write source files, or create backups.
- Imports never delete posts. A slug match updates that row; a new slug creates a new row. IDs, comments, views and `created_at` survive repeated imports. Do not change a slug to rename an existing post: that creates another row.
- Every write run first makes a WAL-aware SQLite backup in `C:\Users\ghada\Desktop\Projects\radiotherapist-website\data\backups`. Treat backups as private: the database also contains site submissions.

```powershell
# Validate all committed documents
npm run blog:check

# Validate one document (no writes)
npm run blog:import -- 'C:\Users\ghada\Desktop\Projects\radiotherapist-website\content\blog\neuro-oncology-demo.json' --check

# Import/update one file, or sync all documents
npm run blog:import -- 'C:\Users\ghada\Desktop\Projects\radiotherapist-website\content\blog\neuro-oncology-demo.json'
npm run blog:sync

# Verify, then regenerate the production static site
npm test
npm run typecheck
npm run build
```

Restart the development server after imports to clear process caches. Deployment uses a static export: importing alone does not update deployed HTML. Build **after** syncing and publish the regenerated export. Existing comments/view components still need a separate working API host; static hosting does not implement SQLite writes or form endpoints.

To verify without overwriting an active dev server's `.next` directory:

```powershell
npm run blog:verify-build
```

This builds a temporary source copy with a SQLite online backup and explicit production environment. It isolates `.next`, `out`, generated types, and the database from the running development app. The result location is recorded in `C:\Users\ghada\Desktop\Projects\radiotherapist-website\data\blog-build-verification.json`. The temporary copy contains `.env` and a database snapshot: remove that exact temporary directory after inspection. A custom `distDir` alone does not isolate compilation in Next 15 static-export mode. Stop the development server before running a normal in-place production build.

If your local `.env` sets `NODE_ENV=development`, explicitly set `$env:NODE_ENV = 'production'` for a production build, then remove the shell variable afterward. The verification command does this automatically without editing `.env`.

## Document contract

The complete validated example is `C:\Users\ghada\Desktop\Projects\radiotherapist-website\content\blog\neuro-oncology-demo.json`. The authoritative executable schema is `C:\Users\ghada\Desktop\Projects\radiotherapist-website\src\lib\blog\schema.ts`.

Required fields: `slug`, `date`, and `translations.fa` **and** `translations.en`. Each translation requires `title`, `excerpt`, and a nonempty `content` array. Unknown properties and unknown block types are rejected, rather than silently discarded.

- Slugs are lowercase ASCII, begin with a letter, and use single hyphens between segments. Numeric slugs are reserved for legacy post links.
- `status` is `draft` (default) or `published`. Drafts are excluded from public lookup, static routes, listings, search, sitemap and RSS. Rebuild after status changes, removing old deployed files so formerly published pages are not left online.
- Dates accept `YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`, or ISO timestamps with seconds and an optional offset. Offsetless dates mean UTC. Invalid calendar dates and times are rejected.
- `author` and `category` accept a string or `{ "fa": "…", "en": "…" }`. `featuredImage` accepts a safe `src` and localized `alt`.
- Optional `tags`, `featured`, `demo`, `updatedAt`, and `kind: "article"` are supported.
- Each translation can supply `faq` and `seo`: `title`, `metaDescription`, `canonical`, `keywords`, `focusKeyword`, and `openGraph`/`twitter` title, description and image overrides. `focusKeyword` is editorial metadata, not a ranking promise.
- `html` and `css` must be absent or exactly empty strings. No per-post executable HTML, JavaScript or CSS is accepted. Text is escaped; markup written in a text field is displayed literally.
- Links must be root-relative or HTTP(S). Script/data/protocol-relative URLs, credentials, control characters, backslashes and encoded relative traversal are rejected. Imported URLs are not fetched or copied; editors must supply trustworthy sources and assets.

## Blocks

| Type | Main fields |
|---|---|
| `heading` | `level` (1–6), `text`; duplicate title h1 suppressed, other h1 rendered as h2 |
| `paragraph` | `text`, optional `style: "lead"` |
| `list` | `items` strings, `style: "bullet"`, `"ordered"`, or `"numbered"` |
| `stats` | `items: [{ value, label }]`; do not invent clinical outcomes |
| `image` | `src`, required `alt`, optional `caption`, `width`, `height` |
| `cta` | `title`, `text`, `buttonText`, `buttonUrl` |
| `callout` | `text`, optional `title`, `tone: "info" / "success" / "warning" / "danger"` |
| `quote` | `text`, optional `attribution`, `sourceUrl` |
| `table` | `caption`, `headers`, `rows`; every row matches header count |
| `timeline` | optional `title`, `items: [{ title, text, label? }]` |
| `checklist` | optional `title`, `items` strings |
| `accordion` | optional `title`, `items: [{ question, answer }]` |
| `glossary` | optional `title`, `items: [{ term, definition }]` |
| `references` | optional `title`, `items: [{ title, url, publisher? }]` |
| `divider` | no extra fields |
| `code` | `code`, optional `caption`, language: text/json/javascript/typescript/bash/python; displayed only, never executed |

Headings have stable position-based `block-N` anchors. Moving blocks changes their anchors; editing a heading's wording in place does not. h2/h3 headings populate the TOC. Tables scroll within their own keyboard-focusable region, and native accordions remain operable without JavaScript. Shared CSS uses existing theme tokens, logical RTL spacing and restrained shadows, without logos or decorative section numbering.

## Persistence and compatibility

Migration 7 adds nullable `slug`, `document_json`, and a unique non-null slug index. The standalone importer can add those columns idempotently too; the normal migration still records its own application later. Original rows stay unchanged.

Canonical article paths are `/fa/blog/<slug>` and `/en/blog/<slug>`. Numeric aliases remain generated for legacy content and are not created for newly imported posts. Metadata points aliases to the localized canonical path. Legacy posts render sanitized stored HTML; English falls back to Persian when no English legacy translation exists. JSON content projects to plain-text database fields for search and reading time, while lists avoid loading document JSON.

All source files in a batch are validated before SQLite opens; the database batch is transactional. Normalized JSON is then saved atomically per file to `C:\Users\ghada\Desktop\Projects\radiotherapist-website\content\blog\<slug>.json`. SQLite and filesystem writes are **not** a distributed transaction: if saving JSON fails after commit, fix file permissions and rerun, or restore the backup while the app is stopped. Removing a JSON file does not delete/unpublish its database post.

## Demo safety

The neuro-oncology sample is `published` for visual testing, but has `demo: true`, visible not-clinician-reviewed notices, a demo author, and `noindex` metadata. Its article JSON-LD does not claim clinic publication or clinician review. Illustrations are original abstract concept art, not real MRI or dose plans. Clinical sources are linked and numbered in each language. The statistics only count guide features.

Do not treat this as medically approved publication. Have a qualified clinician review, correct, date and approve the content before removing demo labeling. The site's pre-existing global layout also emits review/accreditation schema unrelated to this importer; audit those site-wide claims separately before public deployment.

## Tests

Tests cover bilingual validation, unsafe URLs and dates, all renderers, escaped text/JSON-LD, deterministic TOC IDs, text extraction, numeric legacy compatibility, SQLite upsert preservation, drafts, FTS updates, and standalone Node validation. Database tests use isolated in-memory databases, not the site's data.