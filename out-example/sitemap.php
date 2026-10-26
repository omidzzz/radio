<?php
/**
 * sitemap.php — Dynamic XML sitemap backed by MySQL.
 *
 * Served via .htaccess rewrite:  sitemap.xml → sitemap.php
 * Reads ALL published posts from the `posts` table so that posts
 * added via /api/admin.php appear in the sitemap immediately without
 * a Next.js rebuild.
 *
 * Produces both /en/ and /fa/ <loc> entries with hreflang alternates.
 *
 * SOURCE OF TRUTH for the deploy pipeline: scripts/build/prepare-cpanel.mjs
 * reads this file, patches the root-URL double-slash bug, and writes the
 * result to out/sitemap.php. Do not edit the deployed copy directly.
 */

if (!file_exists(__DIR__ . '/api/config.php')) { header('Content-Type: application/xml; charset=utf-8'); readfile(__DIR__ . '/sitemap.xml'); exit; }
    require_once __DIR__ . '/api/db.php';

$hostname = 'https://sinisteroid.ir';

header('Content-Type: application/xml; charset=utf-8');

try {
    // Only published posts — drafts belong in the admin-only endpoints.
    $stmt = $pdo->query(
        "SELECT slug, date_published AS date, date_updated AS updated, featured_image, content_json
         FROM posts
         WHERE status = 'published'
         ORDER BY date_published DESC"
    );
    $posts = $stmt->fetchAll();
} catch (Throwable $e) {
    error_log('[sinisteroid] sitemap PHP query failed: ' . $e->getMessage());
    $staticSitemap = __DIR__ . '/sitemap.xml';
    if (is_file($staticSitemap) && readfile($staticSitemap) !== false) {
        http_response_code(200);
        exit;
    }
    http_response_code(500);
    echo '<!-- sitemap unavailable -->';
    exit;
}

$today = '2026-10-15';

// Static section pages (both locales).
$sections = [
    ''         => ['priority' => '1.0', 'changefreq' => 'weekly'],
    'blog'     => ['priority' => '0.9', 'changefreq' => 'daily'],
    'showcase' => ['priority' => '0.8', 'changefreq' => 'monthly'],
    'skills'   => ['priority' => '0.7', 'changefreq' => 'monthly'],
    'education'=> ['priority' => '0.6', 'changefreq' => 'monthly'],
    'work'     => ['priority' => '0.6', 'changefreq' => 'monthly'],
    'lab'      => ['priority' => '0.6', 'changefreq' => 'monthly'],
    'contact'  => ['priority' => '0.6', 'changefreq' => 'monthly'],
];

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
$xml .= '         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' . "\n";
$xml .= '         xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

// Sitemap generates both /en/ and /fa/ URLs including /en/blog/<slug>/
// and /fa/blog/<slug>/ for every published post.
// Helper to emit a <url> block for one page (both locales).
function sitemapUrl(string $hostname, string $path, string $lastmod, ?string $image = null, bool $withFa = true): string {
    // Root path:  /en/  and  /fa/   (no double slash).
    // Post path:   /en/blog/<slug>/   and   /fa/blog/<slug>/
    $normalizedPath = '/' . ltrim($path, '/');
    $loc  = rtrim($hostname . '/en' . $normalizedPath, '/') . '/';
    $locFa = rtrim($hostname . '/fa' . $normalizedPath, '/') . '/';

    $block = "  <url>\n";
    $block .= "    <loc>{$loc}</loc>\n";
    $block .= "    <lastmod>{$lastmod}</lastmod>\n";
    $block .= "    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{$loc}\" />\n";
    if ($withFa) {
        $block .= "    <xhtml:link rel=\"alternate\" hreflang=\"fa\" href=\"{$locFa}\" />\n";
    }
    $block .= "    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{$loc}\" />\n";
    if ($image) {
        $block .= "    <image:image>\n";
        $block .= "      <image:loc>{$image}</image:loc>\n";
        $block .= "    </image:image>\n";
    }
    $block .= "  </url>\n";
    return $block;
}

// Static sections.
foreach ($sections as $path => $meta) {
    $xml .= sitemapUrl($hostname, $path, $today);
}

// Blog posts from MySQL (includes DB-only posts added via admin panel).
foreach ($posts as $p) {
    $slug = $p['slug'];
    $i18n = json_decode($p['content_json'] ?? '', true);
    $hasFa = is_array($i18n) && !empty($i18n['fa']['title']);
    $date = $p['date'] ?? $today;
    $updated = $p['updated'] ?? $date;
    $lastmod = $updated > $date ? $updated : $date;
    $lastmod = substr($lastmod, 0, 10);

    $image = null;
    if (!empty($p['featured_image'])) {
        $img = json_decode($p['featured_image'], true);
        if (is_array($img) && !empty($img['src'])) {
            $src = $img['src'];
            // Absolute URL if already set; otherwise prepend hostname.
            $image = (str_starts_with($src, 'http'))
                ? $src
                : ($hostname . $src);
        }
    }

    $xml .= sitemapUrl($hostname, "/blog/{$slug}/", $lastmod, $image, $hasFa);
}

$xml .= "</urlset>\n";

echo $xml;
