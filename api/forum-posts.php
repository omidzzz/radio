<?php
// Public forum post creation endpoint — used by NewPostForm on the frontend.
// POST /api/forum/posts  { author_name, title, content, category, website_field? }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

// Honeypot — silently accept bot submissions
if (!empty($input['website_field'])) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'post' => ['id' => 0]], JSON_UNESCAPED_UNICODE);
    exit;
}

$author_name = trim((string)($input['author_name'] ?? ''));
$title = trim((string)($input['title'] ?? ''));
$content = trim((string)($input['content'] ?? ''));
$category = trim((string)($input['category'] ?? 'general'));

$errors = [];
if (strlen($author_name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (strlen($title) < 2) {
    $errors[] = 'Title must be at least 2 characters.';
}
if (strlen($content) < 2) {
    $errors[] = 'Content must be at least 2 characters.';
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO forum_posts (author_name, title, content, category) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$author_name, $title, $content, $category]);
    $id = (int) $pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'post' => ['id' => $id],
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] forum post create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create post.'], JSON_UNESCAPED_UNICODE);
}