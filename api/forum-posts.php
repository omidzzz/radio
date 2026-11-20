<?php
// Public forum post creation endpoint — used by NewPostForm on the frontend.
// POST /api/forum/posts  { author_name, title, content, category, website_field? }
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (isset($_GET['id'])) {
            $q = $pdo->prepare('SELECT id,title,author_name,content,category,created_at FROM forum_posts WHERE id=?');
            $q->execute([(int)$_GET['id']]); $topic=$q->fetch();
            if (!$topic) {http_response_code(404); jsonResponse(['error'=>'Topic not found']);}
            $q=$pdo->prepare('SELECT id,author_name,content,is_admin,created_at FROM forum_replies WHERE post_id=? ORDER BY id');
            $q->execute([$topic['id']]); jsonResponse(['post'=>$topic,'replies'=>$q->fetchAll()]);
        }
        $page=max(1,min(100000,(int)($_GET['page']??1))); $category=$_GET['category']??'all';
        $where=in_array($category,['general','treatment','support','other'],true)?' WHERE p.category=?':'';
        $args=$where?[$category]:[]; $count=$pdo->prepare('SELECT COUNT(*) FROM forum_posts p'.$where);$count->execute($args);
        $pages=max(1,(int)ceil($count->fetchColumn()/10)); $page=min($page,$pages);
        $order=($_GET['sort']??'')==='replies'?'reply_count DESC, p.id DESC':'p.id DESC';
        $q=$pdo->prepare('SELECT p.id,p.author_name,p.title,SUBSTR(p.content,1,240) AS excerpt,p.category,p.created_at,
          (SELECT COUNT(*) FROM forum_replies r WHERE r.post_id=p.id) AS reply_count FROM forum_posts p'.$where.' ORDER BY '.$order.' LIMIT 10 OFFSET '.(($page-1)*10));
        $q->execute($args); jsonResponse(['posts'=>$q->fetchAll(),'page'=>$page,'pages'=>$pages]);
    } catch(Throwable $e) { error_log($e->getMessage()); http_response_code(500); jsonResponse(['error'=>'Forum unavailable.']); }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

// Honeypot — silently accept bot submissions
if (!empty($input['website_field'])) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'post' => ['id' => 0]], JSON_UNESCAPED_UNICODE);
    exit;
}

$author_name = trim((string)($input['author_name'] ?? ''));
$title = trim((string)($input['title'] ?? ''));
$content = trim((string)($input['content'] ?? ''));
$category = trim((string)($input['category'] ?? 'general'));

$errors = [];
if (strlen($author_name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}
if (strlen($title) < 2) {
    $errors[] = 'Title must be at least 2 characters.';
}
if (strlen($content) < 2) {
    $errors[] = 'Content must be at least 2 characters.';
}

if ($errors) {
    http_response_code(400);
    echo json_encode(['error' => implode(' ', $errors)], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO forum_posts (author_name, title, content, category) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$author_name, $title, $content, $category]);
    $id = (int) $pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'post' => ['id' => $id],
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('[sinisteroid] forum post create failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create post.'], JSON_UNESCAPED_UNICODE);
}