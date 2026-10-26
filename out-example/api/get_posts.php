<?php

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $params = [];
    // SECURITY: drafts are only visible to the authenticated admin. The old
    // `?admin=1` query-param shortcut required no auth at all, so ANY visitor
    // could read unpublished posts — it has been removed.
    $statusFilter = isAdminAuthenticated() ? '' : 'WHERE status = :status';
    if ($statusFilter !== '') {
        $params['status'] = 'published';
    }
    // `?limit=N` (clamped 1..50) — the home-page strip renders three cards;
    // without a limit this endpoint shipped every post's full content_json
    // (~475 KiB), and on a cold mobile connection that body landed inside the
    // PSI measurement window, competing with the LCP image for bandwidth.
    // Default (no param) stays "all posts" for the blog index sync.
    $limit = isset($_GET['limit']) ? max(1, min(50, (int) $_GET['limit'])) : 0;
    $stmt = $pdo->prepare(
        "SELECT slug, status, title, date_published AS date, tags, featured_image, content_json FROM posts $statusFilter ORDER BY date_published DESC"
        . ($limit > 0 ? " LIMIT $limit" : "")
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $posts = array_map(function ($row) {
        // `kind` lives inside content_json.__meta (no ALTER TABLE needed on
        // the live database) and is promoted to a top-level field so these
        // rows have the SAME shape as a post authored in /content/posts.
        $translations = json_decode($row['content_json'], true);
        if (!is_array($translations)) {
            $translations = [];
        }
        $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
        $kind = ($meta['kind'] ?? '') === 'personal' ? 'personal' : 'article';
        unset($translations['__meta']);

        // BODIES ARE STRIPPED HERE ON PURPOSE. Every consumer of this index
        // (blog issue grid, home strip, command palette, related-post ranking)
        // reads slug / title / excerpt / tags / cover and nothing else — the
        // article body only ever comes from get_post.php. Shipping
        // content_json here meant ~475 KiB per uncached index sync, and a
        // personal note's HTML body would have pushed that further still.
        foreach (['en', 'fa'] as $loc) {
            if (!isset($translations[$loc]) || !is_array($translations[$loc])) {
                continue;
            }
            unset($translations[$loc]['content'], $translations[$loc]['html'], $translations[$loc]['css']);
        }

        return [
            'slug' => $row['slug'],
            'kind' => $kind,
            'status' => $row['status'] ?? 'draft',
            'title' => $row['title'] ?? '',
            // date_published is NULLABLE — a dateless row would JSON-encode
            // `date: null`, and the blog grid's pre-fix `post.date.slice()`
            // threw `null.slice()` on the live host. Coalesce to "" here
            // (server net); the frontend normalizeApiRow() is the second net.
            'date' => $row['date'] ?? '',
            'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
            'featuredImage' => json_decode($row['featured_image'], true) ?: ['src' => '', 'alt' => ['en' => '', 'fa' => '']],
            'translations' => $translations ?: new stdClass(),
        ];
    }, $rows);
    echo json_encode($posts, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // SECURITY: log details server-side, never echo them to the visitor.
    error_log('[sinisteroid] get_posts query failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Query failed'], JSON_UNESCAPED_UNICODE);
}
