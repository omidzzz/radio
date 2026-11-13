<?php
// Admin blog posts CRUD — requires session auth.
// GET  /api/admin/blog       -> list all blog posts
// POST /api/admin/blog       -> create a blog post
// PATCH /api/admin/blog      -> update a blog post ({ id, ... })
// DELETE /api/admin/blog?id=X -> delete a blog post
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

requireAdminSession();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper((string) $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query(
            'SELECT id, slug, title, status, date_published AS date, tags,
                    featured_image, content_json, date_published AS created_at
             FROM posts ORDER BY date_published DESC'
        );
        $rows = $stmt->fetchAll();
        $mapped = array_map(function ($row) {
            $translations = json_decode($row['content_json'] ?? '{}', true);
            $en = is_array($translations['en'] ?? null) ? $translations['en'] : [];
            $fa = is_array($translations['fa'] ?? null) ? $translations['fa'] : [];
            $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
            return [
                'id' => (int) $row['id'],
                'slug' => $row['slug'],
                'title_fa' => $fa['title'] ?? $row['title'] ?? '',
                'title_en' => $en['title'] ?? $row['title'] ?? '',
                'title' => $row['title'] ?? '',
                'category_fa' => $meta['category_fa'] ?? '',
                'category_en' => $meta['category_en'] ?? '',
                'excerpt_fa' => $fa['excerpt'] ?? '',
                'excerpt_en' => $en['excerpt'] ?? '',
                'is_published' => ($row['status'] ?? '') === 'published' ? 1 : 0,
                'status' => $row['status'] ?? 'draft',
                'date' => $row['date'] ?? '',
                'created_at' => $row['created_at'] ?? '',
                'featured_image' => $row['featured_image'] ?? '',
                'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
            ];
        }, $rows);
        http_response_code(200);
        echo json_encode(['posts' => $mapped], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin blog list failed: ' . $e->getMessage());
        http_response_code(200);
        echo json_encode(['posts' => []], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// Helper: build content_json from frontend fields
function buildContentJson($input) {
    $translations = [];
    foreach (['en', 'fa'] as $lang) {
        $translations[$lang] = [
            'title' => trim((string)($input["title_$lang"] ?? '')),
            'excerpt' => trim((string)($input["excerpt_$lang"] ?? '')),
            'body' => trim((string)($input["body_$lang"] ?? '')),
            'html' => trim((string)($input["html_$lang"] ?? '')),
            'css' => trim((string)($input["css_$lang"] ?? '')),
        ];
    }
    $meta = [];
    if (!empty($input['kind'])) $meta['kind'] = $input['kind'];
    if (!empty($input['category_fa'])) $meta['category_fa'] = $input['category_fa'];
    if (!empty($input['category_en'])) $meta['category_en'] = $input['category_en'];
    $translations['__meta'] = $meta;
    return $translations;
}

// POST /api/admin/blog — create a blog post
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    $slug = trim((string)($input['slug'] ?? ''));
    $title = trim((string)($input['title'] ?? ''));
    $status = in_array($input['status'] ?? '', ['draft', 'published'], true) ? $input['status'] : 'draft';
    $tags = is_array($input['tags'] ?? null) ? implode(',', $input['tags']) : (string)($input['tags'] ?? '');
    $featuredImage = is_array($input['featured_image'] ?? null) ? json_encode($input['featured_image']) : (string)($input['featured_image'] ?? '');
    $datePub = trim((string)($input['date_published'] ?? ''));

    if ($slug === '') {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
        $slug = trim($slug, '-');
    }
    if ($slug === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Slug is required.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $contentJson = buildContentJson($input);

    try {
        $existing = $pdo->prepare('SELECT id FROM posts WHERE slug = ? LIMIT 1');
        $existing->execute([$slug]);
        if ($existing->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Slug already exists.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO posts (slug, status, title, tags, featured_image, content_json, date_published)
             VALUES (:slug, :status, :title, :tags, :featured, :content, :datePub)'
        );
        $stmt->execute([
            'slug' => $slug,
            'status' => $status,
            'title' => $title,
            'tags' => $tags,
            'featured' => $featuredImage,
            'content' => json_encode($contentJson, JSON_UNESCAPED_UNICODE),
            'datePub' => $datePub ?: null,
        ]);
        $id = (int) $pdo->lastInsertId();

        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id, 'slug' => $slug], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin blog create failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create post.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// PATCH /api/admin/blog — update a blog post
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid post id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $updates = [];
        $values = [];

        if (isset($input['title'])) {
            $updates[] = 'title = ?';
            $values[] = $input['title'];
        }
        if (isset($input['status'])) {
            $updates[] = 'status = ?';
            $values[] = in_array($input['status'], ['draft', 'published'], true) ? $input['status'] : 'draft';
        }
        if (isset($input['tags'])) {
            $updates[] = 'tags = ?';
            $values[] = is_array($input['tags']) ? implode(',', $input['tags']) : $input['tags'];
        }
        if (isset($input['featured_image'])) {
            $updates[] = 'featured_image = ?';
            $values[] = is_array($input['featured_image']) ? json_encode($input['featured_image']) : $input['featured_image'];
        }
        if (isset($input['slug'])) {
            $updates[] = 'slug = ?';
            $values[] = $input['slug'];
        }
        if (isset($input['date_published'])) {
            $updates[] = 'date_published = ?';
            $values[] = $input['date_published'] ?: null;
        }

        $hasContentFields = isset($input['title_en']) || isset($input['title_fa']) ||
            isset($input['excerpt_en']) || isset($input['excerpt_fa']) ||
            isset($input['body_en']) || isset($input['body_fa']) ||
            isset($input['kind']) || isset($input['category_fa']) || isset($input['category_en']);
        if ($hasContentFields) {
            $existing = $pdo->prepare('SELECT content_json FROM posts WHERE id = ?');
            $existing->execute([$id]);
            $row = $existing->fetch();
            $translations = $row ? json_decode($row['content_json'] ?? '{}', true) : [];
            if (!is_array($translations)) $translations = [];
            foreach (['en', 'fa'] as $lang) {
                if (!isset($translations[$lang]) || !is_array($translations[$lang])) {
                    $translations[$lang] = [];
                }
                if (isset($input["title_$lang"])) $translations[$lang]['title'] = $input["title_$lang"];
                if (isset($input["excerpt_$lang"])) $translations[$lang]['excerpt'] = $input["excerpt_$lang"];
                if (isset($input["body_$lang"])) $translations[$lang]['body'] = $input["body_$lang"];
                if (isset($input["html_$lang"])) $translations[$lang]['html'] = $input["html_$lang"];
                if (isset($input["css_$lang"])) $translations[$lang]['css'] = $input["css_$lang"];
            }
            $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
            if (isset($input['kind'])) $meta['kind'] = $input['kind'];
            if (isset($input['category_fa'])) $meta['category_fa'] = $input['category_fa'];
            if (isset($input['category_en'])) $meta['category_en'] = $input['category_en'];
            $translations['__meta'] = $meta;
            $updates[] = 'content_json = ?';
            $values[] = json_encode($translations, JSON_UNESCAPED_UNICODE);
        }

        if (!empty($updates)) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE posts SET ' . implode(', ', $updates) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin blog update failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update post.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// DELETE /api/admin/blog?id=X
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid post id.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM posts WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        http_response_code(200);
        echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        error_log('[sinisteroid] admin blog delete failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete post.'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
