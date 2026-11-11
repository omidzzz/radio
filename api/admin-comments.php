<?php
// Admin comment moderation — requires session auth.
// GET  /api/admin/comments?type=blog     -> list blog comments (with post titles)
// GET  /api/admin/comments?type=forum    -> list forum posts
// PATCH /api/admin/comments              -> { id, type, is_approved }  approve/reject blog comment
// DELETE /api/admin/comments?id=X&type=blog|forum  -> delete a comment or forum post
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

requireAdminSession();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper((string) $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

$type = isset($_GET['type']) ? (string) $_GET['type'] : 'blog';

if ($method === 'GET') {
    if ($type === 'forum') {
        try {
            $stmt = $pdo->query(
                'SELECT fp.id, fp.author_name, fp.title, fp.content, fp.category, fp.created_at,
                        (SELECT COUNT(*) FROM forum_replies fr WHERE fr.post_id = fp.id) as reply_count
                 FROM forum_posts fp ORDER BY fp.created_at DESC'
            );
            $rows = $stmt->fetchAll();
            http_response_code(200);
            echo json_encode(['posts' => $rows], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            error_log('[sinisteroid] admin forum list failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load forum posts.'], JSON_UNESCAPED_UNICODE);
        }
    } else {
        // blog comments
        try {
            $stmt = $pdo->query(
                'SELECT c.id, c.post_id, c.author_name, c.content, c.is_approved, c.created_at,
                        p.title_fa AS post_title
                 FROM blog_comments c
                 LEFT JOIN blog_posts p ON p.id = c.post_id
                 ORDER BY c.created_at DESC'
            );
            $rows = $stmt->fetchAll();
            http_response_code(200);
            echo json_encode(['comments' => $rows], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            error_log('[sinisteroid] admin comments list failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to load comments.'], JSON_UNESCAPED_UNICODE);
        }
    }
    exit;
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }
    $id = (int) ($input['id'] ?? 0);
    $is_approved = isset($input['is_approved']) ? (int) $input['is_approved'] : 0;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid comment id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('UPDATE blog_comments SET is_approved = ? WHERE id = ?');
        $stmt->execute([$is_approved, $id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Comment not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id, 'is_approved' => $is_approved], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin comment approve failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update comment.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        if ($type === 'forum') {
            $stmt = $pdo->prepare('DELETE FROM forum_posts WHERE id = ?');
        } else {
            $stmt = $pdo->prepare('DELETE FROM blog_comments WHERE id = ?');
        }
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin delete comment/post failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);