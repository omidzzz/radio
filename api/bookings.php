<?php
// Public booking endpoint — creates a booking and validates date/time availability.
// POST /api/bookings  { full_name, email, phone, session_type, preferred_date, preferred_time, notes }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

// Honeypot
if (!empty($input['website_field'])) {
    http_response_code(200);
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$full_name = trim((string)($input['full_name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$phone = trim((string)($input['phone'] ?? ''));
$session_type = trim((string)($input['session_type'] ?? 'initial-consultation'));
$preferred_date = trim((string)($input['preferred_date'] ?? ''));
$preferred_time = trim((string)($input['preferred_time'] ?? ''));
$notes = trim((string)($input['notes'] ?? ''));

$errors = [];
if (strlen($full_name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}
if (strlen($phone) < 6) {
    $errors[] = 'Phone number is required.';
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $preferred_date)) {
    $errors[] = 'Preferred date is required.';
}
if (!preg_match('/^\d{2}:\d{2}$/', $preferred_time)) {
    $errors[] = 'Preferred time is required.';
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)], JSON_UNESCAPED_UNICODE);
    exit;
}

$dateTime = clinicDate($preferred_date);
if (!$dateTime) {
    http_response_code(400);
    echo json_encode(['error' => ['Invalid date.']], JSON_UNESCAPED_UNICODE);
    exit;
}
$dayOfWeek = (int) $dateTime->format('w');

$settings = $pdo->query('SELECT * FROM availability_settings WHERE id = 1')->fetch();
if (!$settings) {
    http_response_code(500);
    echo json_encode(['error' => ['Availability not configured.']], JSON_UNESCAPED_UNICODE);
    exit;
}

$daySlot = $pdo->prepare('SELECT * FROM availability_day_slots WHERE day_of_week = ?');
$daySlot->execute([$dayOfWeek]);
$ds = $daySlot->fetch();
if (!$ds || !in_array($preferred_time, clinicSlotStarts($preferred_date, $settings, $ds), true)) {
    http_response_code(400);
    echo json_encode(['error' => ['The selected time is not a valid slot.']], JSON_UNESCAPED_UNICODE);
    exit;
}

$existing = $pdo->prepare(
    'SELECT id FROM bookings WHERE preferred_date = ? AND preferred_time = ? AND status != "cancelled" LIMIT 1'
);
$existing->execute([$preferred_date, $preferred_time . ':00']);
if ($existing->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => ['This time slot is already booked. Please choose another.']], JSON_UNESCAPED_UNICODE);
    exit;
}

$blocked = $pdo->prepare('SELECT id FROM unavailable_slots WHERE `date` = ? AND `time` = ? LIMIT 1');
$blocked->execute([$preferred_date, $preferred_time . ':00']);
if ($blocked->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => ['This time slot is blocked. Please choose another.']], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO bookings (full_name, email, phone, session_type, preferred_date, preferred_time, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $full_name,
        $email,
        $phone,
        $session_type,
        $preferred_date,
        $preferred_time . ':00',
        $notes ?: null,
    ]);
    $id = (int) $pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'booking' => [
            'id' => $id,
            'full_name' => $full_name,
            'email' => $email,
            'phone' => $phone,
            'session_type' => $session_type,
            'preferred_date' => $preferred_date,
            'preferred_time' => $preferred_time,
            'notes' => $notes,
            'status' => 'pending',
        ],
        'message' => 'Your booking request has been received.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    error_log('[sinisteroid] booking insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => ['Failed to save booking. Please try again.']], JSON_UNESCAPED_UNICODE);
    exit;
}
}  // end POST handling

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAdminSession();
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
        error_log('[sinisteroid] bookings list failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => ['Failed to load bookings.']], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);