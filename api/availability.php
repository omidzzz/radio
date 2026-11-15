<?php
// Public availability endpoint — returns settings and available time slots for a date.
// GET  /api/availability                  -> returns settings + day slots
// GET  /api/availability?date=YYYY-MM-DD  -> returns available time slots for that date
require_once __DIR__ . '/db.php';

// ══════════════════════════════════════════════════════════════════════════════
// Defensive table bootstrap — re-run the existence checks on EVERY request.
//
// api/db.php calls ensureTables() at startup, but that function swallows
// "create failed" errors into a log so an operator can't easily notice that
// the public calendar tables were never built.  Here we make sure the four
// tables this endpoint reads exist (CREATE TABLE IF NOT EXISTS covers a
// partially-migrated / freshly-restored DB), so the endpoint can never die
// with a raw 500 "Failed to load availability." while something is missing.
// ══════════════════════════════════════════════════════════════════════════════
$ensureApiTables = function () use ($pdo) {
    $create = function ($sql) use ($pdo) {
        if (trim((string) $sql) === '') {
            return;
        }
        try {
            $pdo->exec($sql);
        } catch (Throwable $e) {
            error_log('[sinisteroid] api availability ensureTables create failed: ' . $e->getMessage());
        }
    };

    // bookings
    $create("
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            session_type VARCHAR(50) NOT NULL DEFAULT 'initial-consultation',
            preferred_date DATE NOT NULL,
            preferred_time TIME NOT NULL,
            notes TEXT,
            status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (created_at DESC),
            INDEX idx_date_time (preferred_date, preferred_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // availability_settings
    $create("
        CREATE TABLE IF NOT EXISTS availability_settings (
            id INT PRIMARY KEY DEFAULT 1,
            first_available_date DATE NOT NULL,
            booking_window_days INT NOT NULL DEFAULT 30,
            slot_duration_minutes INT NOT NULL DEFAULT 30,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // availability_day_slots
    $create("
        CREATE TABLE IF NOT EXISTS availability_day_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            day_of_week TINYINT NOT NULL UNIQUE,
            is_available TINYINT(1) NOT NULL DEFAULT 0,
            start_time TIME NULL,
            end_time TIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // unavailable_slots
    $create("
        CREATE TABLE IF NOT EXISTS unavailable_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            `date` DATE NOT NULL,
            `time` TIME NOT NULL,
            reason VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_slot (`date`, `time`),
            INDEX idx_date (`date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Seed availability_settings (id=1) if missing
    try {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM availability_settings')->fetchColumn();
        if ($count === 0) {
            $pdo->prepare('INSERT INTO availability_settings (id, first_available_date, booking_window_days, slot_duration_minutes) VALUES (1, CURDATE(), 30, 30)')->execute();
        }
    } catch (Throwable $e) {
        error_log('[sinisteroid] api availability seed settings failed: ' . $e->getMessage());
    }

    // Seed availability_day_slots defaults if empty
    try {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM availability_day_slots')->fetchColumn();
        if ($count === 0) {
            $stmt = $pdo->prepare('INSERT INTO availability_day_slots (day_of_week, is_available, start_time, end_time) VALUES (?, ?, ?, ?)');
            foreach ([
                [0, 1, '08:00:00', '17:00:00'],
                [1, 1, '08:00:00', '17:00:00'],
                [2, 1, '08:00:00', '17:00:00'],
                [3, 1, '08:00:00', '17:00:00'],
                [4, 1, '08:00:00', '17:00:00'],
                [5, 0, NULL, NULL],
                [6, 1, '08:00:00', '17:00:00'],
            ] as $row) {
                $stmt->execute($row);
            }
        }
    } catch (Throwable $e) {
        error_log('[sinisteroid] api availability seed day_slots failed: ' . $e->getMessage());
    }
};

$ensureApiTables();


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
        // No settings configured — return empty time slots instead of 500
        http_response_code(200);
        echo json_encode([
            'settings' => null,
            'daySlots' => [],
            'timeSlots' => [],
            'date' => $requestedDate,
            'error' => 'Availability not configured. Please contact the clinic.',
        ], JSON_UNESCAPED_UNICODE);
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
        $firstDate = null;
        $firstDateStr = isset($settings['first_available_date']) ? trim((string) $settings['first_available_date']) : '';
        if ($firstDateStr !== '' && $firstDateStr !== '0000-00-00' && $firstDateStr !== '1970-01-01') {
            $candidate = DateTime::createFromFormat('Y-m-d', $firstDateStr);
            if ($candidate !== false) {
                $firstDate = $candidate;
            }
        }
        if ($firstDate === null) {
            $firstDate = new DateTime();
            $firstDate->setTime(0, 0, 0);
        }

        $windowDays = isset($settings['booking_window_days']) ? (int) $settings['booking_window_days'] : 30;
        if ($windowDays <= 0 || $windowDays > 365) {
            $windowDays = 30;
        }
        $maxDate = clone $today;
        $maxDate->modify('+' . $windowDays . ' days');

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