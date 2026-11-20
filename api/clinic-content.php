<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/clinic-content-store.php';
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); exit; }
try {
    $result = clinicPublishedCopy($pdo, (string)($_GET['locale'] ?? 'fa'));
    jsonResponse(['locale' => $result['locale'], 'copy' => (object)$result['copy']]);
} catch (InvalidArgumentException $e) { http_response_code(400); jsonResponse(['error'=>'Invalid locale.']); }
catch (Throwable $e) { error_log($e->getMessage()); http_response_code(500); jsonResponse(['error'=>'Content unavailable.']); }