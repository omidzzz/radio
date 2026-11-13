<?php
// Public blog view counter — used by ViewCounter on the frontend.
// POST /api/blog/{id}/views
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$postId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid post id.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Increment view count using a sessions table to avoid double counting per session
session_start();
$sessionKey = "blog_view_{$postId}";
if (empty($_SESSION[$sessionKey])) {
    try {
        // Ensure views column exists
        $cols = $pdo->query("SHOW COLUMNS FROM posts LIKE 'views'")->fetch();
        if (!$cols) {
            $pdo->exec("ALTER TABLE posts ADD COLUMN views INT DEFAULT 0");
        }
        $pdo->prepare("UPDATE posts SET views = COALESCE(views, 0) + 1 WHERE id = ?")->execute([$postId]);
        $_SESSION[$sessionKey] = true;
    } catch (Exception $e) {
        error_log('[sinisteroid] blog views increment failed: ' . $e->getMessage());
    }
}

// Return current view count
try {
    $row = $pdo->prepare("SELECT COALESCE(views, 0) as views FROM posts WHERE id = ?")->execute([$postId])->fetch();
    $views = $row ? (int) $row['views'] : 0;
    http_response_code(200);
    echo json_encode(['views' => $views], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(200);
    echo json_encode(['views' => 0], JSON_UNESCAPED_UNICODE);
}