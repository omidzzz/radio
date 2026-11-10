<?php
// Shim for legacy Next.js image-optimizer URLs (/_next/image/?url=...).
// The static export has no optimizer, so serve the underlying file directly.
if (!isset($_GET['url'])) {
    http_response_code(400);
    exit;
}
$raw = $_GET['url'];
$decoded = urldecode($raw);
// Normalize and guard against traversal.
$path = $decoded;
if (strpos($path, '..') !== false) {
    http_response_code(400);
    exit;
}
if ($path === '' || $path[0] !== '/') {
    $path = '/' . $path;
}
// Only serve from known public asset dirs.
if (!preg_match('#^/(images|uploads)/#', $path)) {
    http_response_code(403);
    exit;
}
// Resolve against this script's directory (public/) rather than DOCUMENT_ROOT,
// which is unreliable on some shared hosts.
$docRoot = realpath(__DIR__);
if ($docRoot === false) {
    http_response_code(500);
    exit;
}
$file = $docRoot . $path;
// Fallback for renamed spaced filename.
if (!is_file($file)) {
    $alt = str_replace(' ', '-', $path);
    if ($alt !== $path) {
        $altFile = $docRoot . $alt;
        if (is_file($altFile)) {
            $file = $altFile;
            $path = $alt;
        }
    }
}
if (!is_file($file)) {
    http_response_code(404);
    exit;
}
$real = realpath($file);
$realRoot = realpath($docRoot);
if ($real === false || strpos($real, $realRoot) !== 0) {
    http_response_code(403);
    exit;
}
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$mime = [
    'webp' => 'image/webp',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'avif' => 'image/avif',
    'ico' => 'image/x-icon',
];
$type = $mime[$ext] ?? 'application/octet-stream';
header('Content-Type: ' . $type);
header('Content-Length: ' . filesize($file));
header('Cache-Control: public, max-age=31536000, immutable');
readfile($file);
exit;
