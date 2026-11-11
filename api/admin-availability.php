<?php
// Admin availability settings — requires session auth.
// GET  /api/admin/availability    -> returns settings + day slots
// PATCH /api/admin/availability   -> updates settings and/or day slots
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

requireAdminSession();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper((string) $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

if ($method === 'GET') {
    try {
        $settings = $pdo->query('SELECT * FROM availability_settings WHERE id = 1')->fetch();
        if (!$settings) {
            http_response_code(500);
            echo json_encode(['error' => 'Availability not configured.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $daySlots = [];
        $stmt = $pdo->query('SELECT * FROM availability_day_slots ORDER BY day_of_week');
        while ($row = $stmt->fetch()) {
            $daySlots[] = [
                'id' => (int) $row['id'],
                'day_of_week' => (int) $row['day_of_week'],
                'is_available' => (int) $row['is_available'],
                'start_time' => $row['start_time'] !== null ? substr((string) $row['start_time'], 0, 5) : null,
                'end_time' => $row['end_time'] !== null ? substr((string) $row['end_time'], 0, 5) : null,
            ];
        }
        http_response_code(200);
        echo json_encode([
            'settings' => [
                'id' => (int) $settings['id'],
                'first_available_date' => $settings['first_available_date'],
                'booking_window_days' => (int) $settings['booking_window_days'],
                'slot_duration_minutes' => (int) $settings['slot_duration_minutes'],
            ],
            'daySlots' => $daySlots,
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin availability get failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load availability.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    try {
        // Update global settings
        if (isset($input['first_available_date']) || isset($input['booking_window_days']) || isset($input['slot_duration_minutes'])) {
            $updates = [];
            $values = [];
            if (isset($input['first_available_date'])) {
                $updates[] = 'first_available_date = ?';
                $values[] = $input['first_available_date'];
            }
            if (isset($input['booking_window_days'])) {
                $updates[] = 'booking_window_days = ?';
                $values[] = (int) $input['booking_window_days'];
            }
            if (isset($input['slot_duration_minutes'])) {
                $updates[] = 'slot_duration_minutes = ?';
                $values[] = (int) $input['slot_duration_minutes'];
            }
            if (!empty($updates)) {
                $values[] = 1;
                $stmt = $pdo->prepare('UPDATE availability_settings SET ' . implode(', ', $updates) . ', updated_at = CURRENT_TIMESTAMP WHERE id = ?');
                $stmt->execute($values);
            }
        }

        // Update day slots
        if (isset($input['daySlots']) && is_array($input['daySlots'])) {
            $stmt = $pdo->prepare(
                'UPDATE availability_day_slots
                 SET is_available = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE day_of_week = ?'
            );
            foreach ($input['daySlots'] as $slot) {
                $stmt->execute([
                    (int) ($slot['is_available'] ?? 0),
                    $slot['start_time'] ?? null,
                    $slot['end_time'] ?? null,
                    (int) $slot['day_of_week'],
                ]);
            }
        }

        http_response_code(200);
        echo json_encode(['ok' => true, 'message' => 'Availability settings saved.'], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin availability patch failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save availability.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);