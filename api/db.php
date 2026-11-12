<?php
// Simple DB connection helper. Reads `config.php` (not checked in) or falls back to sample.
// Note: do not set a global Content-Type here — callers decide their response type.
// SECURITY: no Access-Control-Allow-Origin header on purpose. The frontend is
// same-origin with the API, so CORS is unnecessary — a wildcard header would
// let any third-party website read API responses from a visitor's browser.

// Load config
$configLoaded = false;
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    $configLoaded = true;
} else {
    // Dev-only fallback: sample credentials never connect to a real DB, and
    // isAdminAuthenticated() refuses to authenticate without a real config.
    require_once __DIR__ . '/config.sample.php';
}

/**
 * Shared helper: is the requester the admin (HTTP Basic Auth against the
 * config.php credentials)? Used by the read endpoints to decide whether
 * draft posts may be exposed. Supports both a plaintext ADMIN_PASS (legacy)
 * and a bcrypt/argon ADMIN_PASS_HASH (preferred — see config.sample.php).
 */
function isAdminAuthenticated(): bool
{
    if (empty($GLOBALS['configLoaded'])) {
        return false; // no real config.php → never treat the caller as admin
    }
    $user = (string)($_SERVER['PHP_AUTH_USER'] ?? '');
    $pass = (string)($_SERVER['PHP_AUTH_PW'] ?? '');
    if (!defined('ADMIN_USER') || $user === '' || $pass === '') {
        return false;
    }
    if (!hash_equals((string)ADMIN_USER, $user)) {
        return false;
    }
    if (defined('ADMIN_PASS_HASH')) {
        return password_verify($pass, (string)ADMIN_PASS_HASH);
    }
    if (!defined('ADMIN_PASS')) {
        return false;
    }
    return hash_equals((string)ADMIN_PASS, $pass);
}

try {
    // DB_PORT is optional: without it the DSN is byte-identical to before
    // (PDO defaults to 3306), so production behaviour is unchanged. The local
    // dev stack defines it as 3307 to avoid clashing with any MySQL already
    // running on the default port.
    $port = defined('DB_PORT') ? (int) DB_PORT : 3306;
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, $port, DB_NAME),
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Exception $e) {
    // SECURITY: log the details server-side only — echoing $e->getMessage()
    // used to expose the DB host/schema to any visitor.
    error_log('[sinisteroid] DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

// Helper to output JSON and exit
function jsonResponse($data)
{
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Ensure all tables used by the public API and admin panel exist.
 * Idempotent: safe to run on every request (CREATE TABLE IF NOT EXISTS).
 */
function ensureTables()
{
    global $pdo;

    $createTable = function ($sql) use ($pdo) {
        try {
            $pdo->exec($sql);
        } catch (Exception $e) {
            error_log('[sinisteroid] ensureTables create failed: ' . $e->getMessage());
        }
    };

    $createTable("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL,
            subject VARCHAR(300) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (created_at DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS blog_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            author_name VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            is_approved TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_post (post_id),
            INDEX idx_approved (post_id, is_approved)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS forum_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author_name VARCHAR(200) NOT NULL,
            title VARCHAR(300) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'general',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created (created_at DESC),
            INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS forum_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            author_name VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            is_admin TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
            INDEX idx_post (post_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS availability_settings (
            id INT PRIMARY KEY DEFAULT 1,
            first_available_date DATE NOT NULL,
            booking_window_days INT NOT NULL DEFAULT 30,
            slot_duration_minutes INT NOT NULL DEFAULT 30,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS availability_day_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            day_of_week TINYINT NOT NULL UNIQUE,
            is_available TINYINT(1) NOT NULL DEFAULT 0,
            start_time TIME NULL,
            end_time TIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $createTable("
        CREATE TABLE IF NOT EXISTS unavailable_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            \`date\` DATE NOT NULL,
            \`time\` TIME NOT NULL,
            reason VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_slot (\`date\`, \`time\`),
            INDEX idx_date (\`date\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed default availability settings if empty (use INSERT IGNORE to avoid duplicate key errors)
    try {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM availability_settings')->fetchColumn();
        if ($count === 0) {
            $today = date('Y-m-d');
            $pdo->prepare('INSERT IGNORE INTO availability_settings (id, first_available_date, booking_window_days, slot_duration_minutes) VALUES (1, ?, 30, 30)')
                ->execute([$today]);
        }
    } catch (Exception $e) {
        error_log('[sinisteroid] ensureTables seed settings failed: ' . $e->getMessage());
    }

    // Seed default day slots if empty (Sun-Thu + Sat working, Fri closed)
    try {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM availability_day_slots')->fetchColumn();
        if ($count === 0) {
            $defaults = [
                [0, 1, '08:00:00', '17:00:00'],
                [1, 1, '08:00:00', '17:00:00'],
                [2, 1, '08:00:00', '17:00:00'],
                [3, 1, '08:00:00', '17:00:00'],
                [4, 1, '08:00:00', '17:00:00'],
                [5, 0, NULL, NULL],
                [6, 1, '08:00:00', '17:00:00'],
            ];
            $stmt = $pdo->prepare('INSERT IGNORE INTO availability_day_slots (day_of_week, is_available, start_time, end_time) VALUES (?, ?, ?, ?)');
            foreach ($defaults as $row) {
                $stmt->execute($row);
            }
        }
    } catch (Exception $e) {
        error_log('[sinisteroid] ensureTables seed day_slots failed: ' . $e->getMessage());
    }
}

try {
    ensureTables();
} catch (Exception $e) {
    error_log('[sinisteroid] ensureTables failed: ' . $e->getMessage());
}

/**
 * Check if the current request has a valid admin session.
 */
function isAdminSession(): bool
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return !empty($_SESSION['admin'] ?? false);
}

/**
 * Require a valid admin session; otherwise return 401 and exit.
 */
function requireAdminSession(): void
{
    if (!isAdminSession()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

?>

