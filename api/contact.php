<?php
// Public contact form endpoint — saves contact_messages to MySQL.
// POST /api/contact  { name, email, subject, message, website_field? }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

// Honeypot: silently ignore spam submissions
if (!empty($input['website_field'])) {
    http_response_code(200);
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// Basic validation
$errors = [];
$name = trim((string)($input['name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$subject = trim((string)($input['subject'] ?? ''));
$message = trim((string)($input['message'] ?? ''));

if (strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}
if (strlen($subject) < 2) {
    $errors[] = 'Subject must be at least 2 characters.';
}
if (strlen($message) < 2) {
    $errors[] = 'Message must be at least 2 characters.';
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$name, $email, $subject, $message]);
    $id = (int) $pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'id' => $id,
        'message' => 'Thank you! Your message has been received.',
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] contact insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message. Please try again.'], JSON_UNESCAPED_UNICODE);
}