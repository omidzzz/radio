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
    $stmt = $pdo->query(
        'SELECT id, slug, title, status, date_published AS date, category_fa, category_en,
                excerpt_fa, excerpt_en, is_published, created_at
         FROM blog_posts ORDER BY created_at DESC'
    );
    $rows = $stmt->fetchAll();
    http_response_code(200);
    echo json_encode(['posts' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // blog_posts table may not exist in older installations; return empty list
    error_log('[sinisteroid] admin blog list failed: ' . $e->getMessage());
    http_response_code(200);
    echo json_encode(['posts' => []], JSON_UNESCAPED_UNICODE);
}