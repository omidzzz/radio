<?php
// Admin dashboard stats — requires session auth.
// GET /api/admin/stats
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdminSession();

try {
    $totalBookings = (int) $pdo->query('SELECT COUNT(*) FROM bookings')->fetchColumn();
    $pendingBookings = (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();
    $confirmedBookings = (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'")->fetchColumn();
    $totalMessages = (int) $pdo->query('SELECT COUNT(*) FROM contact_messages')->fetchColumn();
    $totalForumPosts = (int) $pdo->query('SELECT COUNT(*) FROM forum_posts')->fetchColumn();
    $totalForumReplies = (int) $pdo->query('SELECT COUNT(*) FROM forum_replies')->fetchColumn();

    http_response_code(200);
    echo json_encode([
        'totalBookings' => $totalBookings,
        'pendingBookings' => $pendingBookings,
        'confirmedBookings' => $confirmedBookings,
        'totalMessages' => $totalMessages,
        'totalForumPosts' => $totalForumPosts,
        'totalForumReplies' => $totalForumReplies,
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] admin stats failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load stats.'], JSON_UNESCAPED_UNICODE);
}