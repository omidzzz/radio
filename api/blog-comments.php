<?php
// Public blog comment creation endpoint — used by BlogComments on the frontend.
// POST /api/blog/{id}/comments  { author_name, content }
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

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$author_name = trim((string)($input['author_name'] ?? ''));
$content = trim((string)($input['content'] ?? ''));

$errors = [];
if (strlen($author_name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (strlen($content) < 2) {
    $errors[] = 'Comment must be at least 2 characters.';
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO blog_comments (post_id, author_name, content, is_approved) VALUES (?, ?, ?, 0)'
    );
    $stmt->execute([$postId, $author_name, $content]);

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'message' => 'Comment submitted and pending moderation.',
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] blog comment create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to post comment.'], JSON_UNESCAPED_UNICODE);
}