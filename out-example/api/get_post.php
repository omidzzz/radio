<?php

require_once __DIR__ . '/db.php';
// This endpoint returns JSON
header('Content-Type: application/json; charset=utf-8');

// GET parameter: slug
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
if (!$slug) {
    http_response_code(400);
    jsonResponse(["error" => "Missing slug"]);
}

try {
    // SECURITY: only the authenticated admin may read drafts. Anonymous
    // visitors are restricted to published posts.
    $sql = 'SELECT * FROM posts WHERE slug = :slug';
    $params = ['slug' => $slug];
    if (!isAdminAuthenticated()) {
        $sql .= ' AND status = :status';
        $params['status'] = 'published';
    }
    $sql .= ' LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        jsonResponse(["error" => "Post not found"]);
    }

    // Assume content stored as JSON in `content_json` column.
    //
    // `kind` (article | personal) is stored inside that same JSON blob as a
    // `__meta` key so the live cPanel database needs no ALTER TABLE. It is
    // promoted to a TOP-LEVEL field here, which is exactly where a post
    // authored in /content/posts carries it — one shape for both sources.
    $translations = json_decode($row['content_json'], true);
    if (!is_array($translations)) {
        $translations = [];
    }
    $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
    $kind = ($meta['kind'] ?? '') === 'personal' ? 'personal' : 'article';
    unset($translations['__meta']);

    $post = [
        'slug' => $row['slug'],
        'kind' => $kind,
        'status' => $row['status'] ?? 'draft',
        'title' => $row['title'] ?? '',
        // date_published is NULLABLE — coalesce to "" so the frontend never
        // sees `date: null` (the hosted `null.slice()` crash). Same net as
        // get_posts.php; normalizeApiRow() is the client-side second net.
        'date' => $row['date_published'] ?? '',
        'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
        'featuredImage' => json_decode($row['featured_image'], true) ?: ['src' => '', 'alt' => ['en' => '', 'fa' => '']],
        'translations' => $translations ?: new stdClass(),
    ];

    jsonResponse($post);
} catch (Exception $e) {
    // SECURITY: log details server-side, never echo them to the visitor.
    error_log('[sinisteroid] get_post query failed: ' . $e->getMessage());
    http_response_code(500);
    jsonResponse(["error" => "Query failed"]);
}

?>
