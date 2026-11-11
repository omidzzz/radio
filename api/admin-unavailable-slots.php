<?php
// Admin blocked time slots — requires session auth.
// GET    /api/admin/unavailable-slots     -> list all blocked slots
// POST   /api/admin/unavailable-slots     -> { date, time, reason }  create a blocked slot
// DELETE /api/admin/unavailable-slots?id=X  -> delete a blocked slot
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
            'SELECT id, `date`, `time`, reason, created_at
             FROM unavailable_slots ORDER BY `date` ASC, `time` ASC'
        );
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            if ($row['time'] !== null) {
                $row['time'] = substr((string) $row['time'], 0, 5);
            }
        }
        http_response_code(200);
        echo json_encode(['slots' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin unavailable slots list failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load blocked slots.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }
    $date = trim((string) ($input['date'] ?? ''));
    $time = trim((string) ($input['time'] ?? ''));
    $reason = trim((string) ($input['reason'] ?? ''));

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid date.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid time.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO unavailable_slots (`date`, `time`, reason) VALUES (?, ?, ?)'
        );
        $stmt->execute([$date, $time . ':00', $reason ?: null]);
        $id = (int) $pdo->lastInsertId();
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin unavailable slot create failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to block slot.'], JSON_UNESCAPED_UNICODE);
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
        $stmt = $pdo->prepare('DELETE FROM unavailable_slots WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Slot not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin unavailable slot delete failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to unblock slot.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);