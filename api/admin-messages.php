<?php
// Admin contact message management — requires session auth.
// GET  /api/admin/messages    -> list all contact messages
// DELETE /api/admin/messages?id=X  -> delete a message
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

requireAdminSession();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper((string) $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query(
            'SELECT id, name, email, subject, message, created_at
             FROM contact_messages ORDER BY created_at DESC'
        );
        $rows = $stmt->fetchAll();
        http_response_code(200);
        echo json_encode(['messages' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin messages list failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load messages.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid message id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM contact_messages WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Message not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin message delete failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete message.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);