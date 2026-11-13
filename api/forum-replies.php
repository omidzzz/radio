<?php
// Public forum reply creation endpoint — used by ReplyForm on the frontend.
// POST /api/forum-replies.php?post_id=X  { author_name, content, website_field? }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$postId = isset($_GET['post_id']) ? (int) $_GET['post_id'] : 0;
if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid post id.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

// Honeypot
if (!empty($input['website_field'])) {
    http_response_code(200);
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$author_name = trim((string)($input['author_name'] ?? ''));
$content = trim((string)($input['content'] ?? ''));

$errors = [];
if (strlen($author_name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
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
    // Verify post exists
    $post = $pdo->prepare('SELECT id FROM forum_posts WHERE id = ?');
    $post->execute([$postId]);
    if (!$post->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Post not found.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO forum_replies (post_id, author_name, content) VALUES (?, ?, ?)'
    );
    $stmt->execute([$postId, $author_name, $content]);

    http_response_code(200);
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] forum reply create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create reply.'], JSON_UNESCAPED_UNICODE);
}