<?php
// Admin login — verifies credentials against config.php and starts a PHP session.
// POST /api/admin-login  { username, password }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($GLOBALS['configLoaded'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Admin not configured.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$username = trim((string)($input['username'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => ['Username and password are required.']], JSON_UNESCAPED_UNICODE);
    exit;
}

$userOk = hash_equals((string) ADMIN_USER, $username);
$passOk = false;
if (defined('ADMIN_PASS_HASH')) {
    $passOk = password_verify($password, (string) ADMIN_PASS_HASH);
} elseif (defined('ADMIN_PASS')) {
    $passOk = hash_equals((string) ADMIN_PASS, $password);
}

if (!$userOk || !$passOk) {
    http_response_code(401);
    echo json_encode(['error' => ['Invalid credentials.']], JSON_UNESCAPED_UNICODE);
    exit;
}

session_start();
$_SESSION['admin'] = true;
$_SESSION['admin_user'] = $username;
$_SESSION['admin_login_time'] = time();

// Regenerate session ID to prevent session fixation
session_regenerate_id(true);

http_response_code(200);
echo json_encode([
    'ok' => true,
    'message' => 'Logged in successfully.',
], JSON_UNESCAPED_UNICODE);