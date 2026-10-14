#!/usr/bin/env node
/**
 * Sitemap pinging script.
 * Notifies Google, Bing, and Baidu when the sitemap is updated.
 *
 * Usage:
 *   node scripts/ping-sitemap.js [your-domain]
 *
 * Example:
 *   node scripts/ping-sitemap.js https://yourdomain.com
 *
 * Can be run manually or scheduled via cron/PM2 after each deployment.
 */

const https = require("https");

const domain = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL;

if (!domain) {
  console.error("❌ Usage: node scripts/ping-sitemap.js https://yourdomain.com");
  console.error("   Or set NEXT_PUBLIC_APP_URL environment variable.");
  process.exit(1);
}

const sitemapUrl = `${domain.replace(/\/$/, "")}/sitemap.xml`;

const endpoints = [
  { name: "Google", url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
  { name: "Bing", url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
  // Baidu requires verification token (commented out by default)
  // { name: "Baidu", url: `https://ping.baidu.com/ping/RPC2` },
];

function ping(endpoint) {
  return new Promise((resolve) => {
    const req = https.get(endpoint.url, (res) => {
      const status = res.statusCode || 0;
      console.log(
        status >= 200 && status < 400
          ? `✅ ${endpoint.name}: Sitemap pinged successfully (${status})`
          : `⚠️ ${endpoint.name}: Received status ${status}`
      );
      res.resume();
      resolve();
    });

    req.on("error", (err) => {
      console.log(`❌ ${endpoint.name}: ${err.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`⚠️ ${endpoint.name}: Request timed out`);
      req.destroy();
      resolve();
    });
  });
}

async function main() {
  console.log(`🔔 Pinging sitemap: ${sitemapUrl}`);
  console.log("");

  await Promise.all(endpoints.map(ping));

  console.log("");
  console.log("✅ Sitemap ping complete!");
}

main();