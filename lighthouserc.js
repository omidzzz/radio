/**
 * Lighthouse CI configuration (used by `lhci` / the CI "lighthouse" job).
 *
 * The local before/after runner (scripts/lighthouse-runner.js) shells out
 * directly to the Lighthouse CLI for self-contained, cross-platform reports,
 * so this file is the single source of truth for CI-time thresholds and
 * upload targets.
 */
module.exports = {
  ci: {
    collect: {
      // Overridden at runtime by the CI runner for the real URL and server.
      url: 'http://localhost:3000',
      numberOfRuns: 3,
      startServerCommand: 'node scripts/serve-static.js out',
      skipAudits: ['uses-web-vitals'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      settings: {
        extends: 'lighthouse:recommended',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      thresholds: {
        performance: 90,
        pwa: 60,
      },
    },
  },
};
