<?php
// Admin blog posts list — requires session auth.
// GET /api/admin/blog
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdminSession();

try {
    // Query the legacy `posts` table which holds the user's actual blog data
    $stmt = $pdo->query(
        'SELECT id, slug, title, status, date_published AS date, tags,
                featured_image, content_json, date_published AS created_at
         FROM posts ORDER BY date_published DESC'
    );
    $rows = $stmt->fetchAll();
    // Map legacy posts table columns to frontend-expected shape
    $mapped = array_map(function ($row) {
        $translations = json_decode($row['content_json'] ?? '{}', true);
        $en = is_array($translations['en'] ?? null) ? $translations['en'] : [];
        $fa = is_array($translations['fa'] ?? null) ? $translations['fa'] : [];
        $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
        return [
            'id' => (int) $row['id'],
            'slug' => $row['slug'],
            'title_fa' => $fa['title'] ?? $row['title'] ?? '',
            'title_en' => $en['title'] ?? $row['title'] ?? '',
            'title' => $row['title'] ?? '',
            'category_fa' => $meta['category_fa'] ?? '',
            'category_en' => $meta['category_en'] ?? '',
            'excerpt_fa' => $fa['excerpt'] ?? '',
            'excerpt_en' => $en['excerpt'] ?? '',
            'is_published' => ($row['status'] ?? '') === 'published' ? 1 : 0,
            'status' => $row['status'] ?? 'draft',
            'date' => $row['date'] ?? '',
            'created_at' => $row['created_at'] ?? '',
            'featured_image' => $row['featured_image'] ?? '',
            'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
        ];
    }, $rows);
    http_response_code(200);
    echo json_encode(['posts' => $mapped], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] admin blog list failed: ' . $e->getMessage());
    http_response_code(200);
    echo json_encode(['posts' => []], JSON_UNESCAPED_UNICODE);
}