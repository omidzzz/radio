<?php
// Public availability endpoint — returns settings and available time slots for a date.
// GET  /api/availability                  -> returns settings + day slots
// GET  /api/availability?date=YYYY-MM-DD  -> returns available time slots for that date
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$requestedDate = isset($_GET['date']) ? trim((string) $_GET['date']) : null;

try {
    $settings = $pdo->query('SELECT * FROM availability_settings WHERE id = 1')->fetch();
    if (!$settings) {
        http_response_code(500);
        echo json_encode(['error' => ['Availability not configured.']], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $daySlots = [];
    $stmt = $pdo->query('SELECT * FROM availability_day_slots ORDER BY day_of_week');
    while ($row = $stmt->fetch()) {
        $daySlots[] = [
            'day_of_week' => (int) $row['day_of_week'],
            'is_available' => (int) $row['is_available'],
            'start_time' => $row['start_time'] !== null ? substr((string) $row['start_time'], 0, 5) : null,
            'end_time' => $row['end_time'] !== null ? substr((string) $row['end_time'], 0, 5) : null,
        ];
    }

    $response = [
        'settings' => [
            'first_available_date' => $settings['first_available_date'],
            'booking_window_days' => (int) $settings['booking_window_days'],
            'slot_duration_minutes' => (int) $settings['slot_duration_minutes'],
        ],
        'daySlots' => $daySlots,
    ];

    if ($requestedDate !== null) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $requestedDate)) {
            http_response_code(400);
            echo json_encode(['error' => ['Invalid date format.']], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $dateTime = DateTime::createFromFormat('Y-m-d', $requestedDate);
        if ($dateTime === false) {
            http_response_code(400);
            echo json_encode(['error' => ['Invalid date.']], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $dayOfWeek = (int) $dateTime->format('w');
        $today = new DateTime();
        $today->setTime(0, 0, 0);
        $firstDate = new DateTime($settings['first_available_date']);
        $maxDate = clone $today;
        $maxDate->modify('+' . (int) $settings['booking_window_days'] . ' days');

        $timeSlots = [];
        if ($dateTime >= $firstDate && $dateTime <= $maxDate) {
            $ds = null;
            foreach ($daySlots as $slot) {
                if ($slot['day_of_week'] === $dayOfWeek) {
                    $ds = $slot;
                    break;
                }
            }

            if ($ds && $ds['is_available'] === 1 && $ds['start_time'] && $ds['end_time']) {
                $slotDuration = (int) $settings['slot_duration_minutes'];
                $start = new DateTime($ds['start_time']);
                $end = new DateTime($ds['end_time']);
                $startMinutes = (int) $start->format('H') * 60 + (int) $start->format('i');
                $endMinutes = (int) $end->format('H') * 60 + (int) $end->format('i');

                $now = new DateTime();
                $isToday = $requestedDate === $today->format('Y-m-d');

                // Get blocked slots for this date
                $blocked = [];
                $bstmt = $pdo->prepare('SELECT `time` FROM unavailable_slots WHERE `date` = ?');
                $bstmt->execute([$requestedDate]);
                while ($brow = $bstmt->fetch()) {
                    $blocked[] = substr((string) $brow['time'], 0, 5);
                }

                // Get already booked slots for this date
                $booked = [];
                $tstmt = $pdo->prepare(
                    'SELECT preferred_time FROM bookings WHERE preferred_date = ? AND status != "cancelled"'
                );
                $tstmt->execute([$requestedDate]);
                while ($trow = $tstmt->fetch()) {
                    $booked[] = substr((string) $trow['preferred_time'], 0, 5);
                }

                for ($m = $startMinutes; $m + $slotDuration <= $endMinutes; $m += $slotDuration) {
                    $h = (int) floor($m / 60);
                    $min = $m % 60;
                    $slot = sprintf('%02d:%02d', $h, $min);

                    if ($isToday) {
                        $nowMinutes = (int) $now->format('H') * 60 + (int) $now->format('i');
                        if ($m <= $nowMinutes) {
                            continue;
                        }
                    }

                    if (in_array($slot, $blocked)) {
                        continue;
                    }
                    if (in_array($slot, $booked)) {
                        continue;
                    }

                    $timeSlots[] = $slot;
                }
            }
        }

        $response['timeSlots'] = $timeSlots;
        $response['date'] = $requestedDate;
    }

    http_response_code(200);
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] availability failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => ['Failed to load availability.']], JSON_UNESCAPED_UNICODE);
}