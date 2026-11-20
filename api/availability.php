<?php
// GET /api/availability[?date=YYYY-MM-DD]. db.php bootstraps the tables.
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $settings = $pdo->query('SELECT * FROM availability_settings WHERE id = 1')->fetch();
    if (!$settings) {
        echo json_encode(['settings' => null, 'daySlots' => [], 'timeSlots' => [], 'error' => 'Availability not configured.']);
        exit;
    }
    $week = array_map('clinicDaySlot', $pdo->query('SELECT * FROM availability_day_slots ORDER BY day_of_week')->fetchAll());
    $response = [
        'settings' => [
            'first_available_date' => $settings['first_available_date'],
            'booking_window_days' => (int) $settings['booking_window_days'],
            'slot_duration_minutes' => (int) $settings['slot_duration_minutes'],
        ],
        'daySlots' => $week,
    ];
    if (isset($_GET['date'])) {
        $date = trim((string) $_GET['date']);
        $d = clinicDate($date);
        if (!$d) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid date.']);
            exit;
        }
        $byDay = array_column($week, null, 'day_of_week');
        $row = $byDay[(int) $d->format('w')] ?? null;
        $starts = $row ? clinicSlotStarts($date, $settings, $row) : [];
        if ($starts) {
            $stmt = $pdo->prepare("SELECT `time` FROM unavailable_slots WHERE `date` = ?
                UNION SELECT preferred_time FROM bookings WHERE preferred_date = ? AND status != 'cancelled'");
            $stmt->execute([$date, $date]);
            $taken = array_map(static function ($time) { return substr($time, 0, 5); }, $stmt->fetchAll(PDO::FETCH_COLUMN));
            $starts = array_values(array_diff($starts, $taken));
        }
        $response['date'] = $date;
        $response['timeSlots'] = $starts;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[sinisteroid] availability failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load availability.']);
}