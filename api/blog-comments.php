<?php
// Public blog comment creation endpoint — used by BlogComments on the frontend.
// POST /api/blog/{id}/comments  { author_name, content }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

header('Cache-Control: no-store');

$postId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid post id.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
try {
    $published = $pdo->prepare("SELECT id FROM posts WHERE id=? AND status='published'");
    $published->execute([$postId]);
    if (!$published->fetch()) {http_response_code(404); jsonResponse(['error'=>'Article not found.']);}
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $q=$pdo->prepare('SELECT id,author_name AS authorName,content,created_at AS createdAt FROM blog_comments WHERE post_id=? AND is_approved=1 ORDER BY id');
        $q->execute([$postId]); jsonResponse(['comments'=>$q->fetchAll()]);
    }
} catch(Throwable $e) { error_log($e->getMessage()); http_response_code(500); jsonResponse(['error'=>'Comments unavailable.']); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {http_response_code(405); jsonResponse(['error'=>'Method not allowed']);}
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