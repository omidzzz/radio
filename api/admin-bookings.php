<?php
// Admin booking management — requires session auth.
// GET  /api/admin/bookings          -> list all bookings
// PATCH /api/admin/bookings         -> { id, status }  update booking status
// DELETE /api/admin/bookings?id=X   -> delete a booking
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

requireAdminSession();

$method = $_SERVER['REQUEST_METHOD'];

// Handle method override via POST with _method header (for clients that can't send PATCH/DELETE)
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper((string) $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query(
            'SELECT id, full_name, email, phone, session_type, preferred_date, preferred_time, notes, status, created_at
             FROM bookings ORDER BY created_at DESC'
        );
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            if ($row['preferred_time'] !== null) {
                $row['preferred_time'] = substr((string) $row['preferred_time'], 0, 5);
            }
        }
        http_response_code(200);
        echo json_encode(['bookings' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin bookings list failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load bookings.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }
    $id = (int) ($input['id'] ?? 0);
    $status = trim((string) ($input['status'] ?? ''));

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid booking id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (!in_array($status, ['pending', 'confirmed', 'cancelled', 'completed'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('UPDATE bookings SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id, 'status' => $status], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin booking status update failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update booking.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid booking id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin booking delete failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete booking.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);