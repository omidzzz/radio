<?php
// Public image upload endpoint — used by RichTextEditor on the frontend.
// POST /api/upload  { file } (multipart/form-data)
// Requires CSRF token via x-csrf-token header
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

// CSRF check
$csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
$csrfCookie = $_COOKIE['csrf_token'] ?? '';
if (!$csrfHeader || !$csrfCookie || !hash_equals($csrfHeader, $csrfCookie)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid CSRF token.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['file'];
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
if (!in_array($file['type'], $allowedTypes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$uploadDir = __DIR__ . '/uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $ext;
$destination = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Return URL relative to site root
$url = '/api/uploads/' . $filename;
http_response_code(200);
echo json_encode(['ok' => true, 'url' => $url], JSON_UNESCAPED_UNICODE);