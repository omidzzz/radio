<?php
// Full admin UI for blog posts with list, edit, delete, duplicate, JSON sync, uploads, and SEO fields.
require_once __DIR__ . '/db.php';
header('Content-Type: text/html; charset=utf-8');

// Load config for admin creds and uploads dir (config.sample.php used when config.php missing)
if (defined('ADMIN_USER')) {
  $ADMIN_USER = ADMIN_USER;
} else {
  $ADMIN_USER = 'admin';
}

if (!defined('UPLOADS_DIR')) {
  define('UPLOADS_DIR', __DIR__ . '/uploads');
}
if (!is_dir(UPLOADS_DIR)) {
  mkdir(UPLOADS_DIR, 0755, true);
}

// SECURITY: never leak PHP errors as HTML to visitors; fatals are turned
// into parseable JSON for the admin UI (see shutdown handler below).
ini_set('display_errors', '0');
error_reporting(E_ALL);

function adminAuthFailure() {
  header('WWW-Authenticate: Basic realm="Blog Admin"');
  header('HTTP/1.0 401 Unauthorized');
  echo 'Authentication required.';
  exit;
}

// SECURITY: refuse to run on a misconfigured deployment. The fallback sample
// credentials (admin / change_me) must never grant admin access.
if (empty($GLOBALS['configLoaded'])) {
  http_response_code(500);
  echo 'Configuration error: api/config.php is missing.';
  exit;
}

// ── Basic auth — hardened ─────────────────────────────────────────────
//  * hash_equals() / password_verify() instead of !== (timing-safe)
//  * ADMIN_PASS_HASH (bcrypt/argon) supported — see config.sample.php
//  * brute-force lockout: 5 failed attempts per IP → 15 minute cooldown
$passOk = false;
if (isset($_SERVER['PHP_AUTH_PW'])) {
  if (defined('ADMIN_PASS_HASH')) {
    $passOk = password_verify((string)$_SERVER['PHP_AUTH_PW'], (string)ADMIN_PASS_HASH);
  } elseif (defined('ADMIN_PASS')) {
    $passOk = hash_equals((string)ADMIN_PASS, (string)$_SERVER['PHP_AUTH_PW']);
  }
}
$userOk = isset($_SERVER['PHP_AUTH_USER']) && hash_equals($ADMIN_USER, (string)$_SERVER['PHP_AUTH_USER']);

$lockFile   = sys_get_temp_dir() . '/sinisteroid-admin-failures.json';
$failIp     = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$failNow    = time();
$failWindow = 900;   // 15 minutes
$failMax    = 5;
$failures   = [];
if (is_file($lockFile)) {
  $failures = json_decode((string)@file_get_contents($lockFile), true);
  if (!is_array($failures)) {
    $failures = [];
  }
}
foreach ($failures as $k => $ts) {
  $failures[$k] = array_values(array_filter((array)$ts, static fn($t) => ($failNow - (int)$t) < $failWindow));
  if (!$failures[$k]) {
    unset($failures[$k]);
  }
}
if (count($failures[$failIp] ?? []) >= $failMax) {
  http_response_code(429);
  header('Retry-After: ' . $failWindow);
  echo 'Too many failed attempts. Try again later.';
  exit;
}
if (!$userOk || !$passOk) {
  $failures[$failIp][] = $failNow;
  @file_put_contents($lockFile, json_encode($failures), LOCK_EX);
  adminAuthFailure();
}
if (isset($failures[$failIp])) {
  unset($failures[$failIp]);
  @file_put_contents($lockFile, json_encode($failures), LOCK_EX);
}

/**
 * Fatal-error guard: if the request dies mid-action (e.g. a missing PHP
 * extension on the host), return a parseable JSON error for AJAX calls
 * instead of the HTML 500 page the admin UI reports as "Invalid JSON".
 */
register_shutdown_function(static function () {
  $err = error_get_last();
  if ($err === null || !in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
    return;
  }
  error_log('[sinisteroid] admin fatal: ' . $err['message'] . ' in ' . $err['file'] . ':' . $err['line']);
  if (!headers_sent()) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
  }
  echo json_encode([
    'error' => 'Server error: ' . $err['message'] . ' (' . basename($err['file']) . ':' . $err['line'] . ')',
  ]);
});

/**
 * CSRF defence for state-changing actions. HTTP Basic-Auth credentials are
 * attached by the browser AUTOMATICALLY, so a malicious third-party page
 * could otherwise fire authenticated mutations (save/delete/upload) while
 * the admin is logged in. Mutating actions therefore require:
 *   1. POST (no more state changes over GET), and
 *   2. a same-origin request — validated via Sec-Fetch-Site, Origin, and
 *      Referer when the browser sends them.
 */
function assertSameOriginMutation() {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    errorResponse('Mutating actions require POST', 405);
  }
  $site = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? null;
  if ($site !== null && $site !== 'same-origin' && $site !== 'none') {
    errorResponse('Cross-site request blocked', 403);
  }
  $host = $_SERVER['HTTP_HOST'] ?? '';
  if ($host !== '') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
    if ($origin !== null && $origin !== '') {
      if (strcasecmp((string)parse_url($origin, PHP_URL_HOST), $host) !== 0) {
        errorResponse('Cross-origin request blocked', 403);
      }
    } else {
      $refHost = parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST);
      if ($refHost !== null && strcasecmp((string)$refHost, $host) !== 0) {
        errorResponse('Cross-origin request blocked', 403);
      }
    }
  }
}

if (!function_exists('jsonResponse')) {
  function jsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
  }
}

if (!function_exists('errorResponse')) {
  function errorResponse($message, $code = 400) {
    http_response_code($code);
    jsonResponse(['error' => $message]);
  }
}

function sanitizeSlug($slug) {
  return preg_replace('/[^a-z0-9-_]/', '-', strtolower(trim($slug)));
}

/**
 * Normalise an authored post date to MySQL's DATETIME shape, or null when
 * there is nothing usable to store.
 *
 * Accepts "Y-m-d", "Y-m-d H:i:s" and the ISO "Y-m-d\TH:i:s" a JS
 * toISOString() produces; rejects overflow values (2026-02-30, hour 25)
 * by round-tripping through DateTime instead of trusting the regex alone.
 */
function normalizePostDate($value) {
  $value = trim(str_replace('T', ' ', (string)$value));
  if ($value === '') {
    return null;
  }
  if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
    $value .= ' 00:00:00';
  }
  if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value)) {
    return null;
  }
  $dt = DateTime::createFromFormat('Y-m-d H:i:s', $value);
  return ($dt !== false && $dt->format('Y-m-d H:i:s') === $value) ? $value : null;
}

/**
 * Allow-list scrub of a personal note's authored HTML body.
 *
 * Personal posts store raw HTML instead of content blocks, so THIS is the
 * trust boundary: it runs on every save, inside the authenticated +
 * same-origin-guarded POST branch, before anything reaches MySQL. The
 * render-time scrub in src/lib/blog/html.ts is a second, independent net.
 *
 * Element allow-list keeps real prose markup (headings, lists, quotes,
 * code, tables, links, figures) and unwraps anything outside it; a short
 * hard-drop list removes things that are never legitimate in a body.
 * Attributes are allow-listed too, with an explicit scheme check on
 * href/src so `javascript:` cannot survive an encoding trick.
 */
function sanitizePostHtml($html) {
  $html = (string)$html;
  if (trim($html) === '') return '';
  // No libxml on this host: hand back what we were given — the renderer
  // still applies its own conservative scrub on the client.
  if (!class_exists('DOMDocument')) return $html;

  $drop     = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta', 'base', 'input', 'button', 'textarea', 'select', 'noscript', 'template'];
  $allowed  = ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'em', 'strong', 'b', 'i', 'u', 's', 'del', 'ins', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col', 'span', 'div', 'small', 'sup', 'sub', 'mark', 'abbr', 'cite', 'q', 'kbd', 'samp', 'var', 'dl', 'dt', 'dd', 'details', 'summary'];
  $okAttrs  = ['href', 'src', 'alt', 'title', 'class', 'id', 'colspan', 'rowspan', 'scope', 'lang', 'dir', 'datetime', 'loading', 'decoding', 'width', 'height', 'target', 'rel', 'start', 'type', 'cite'];

  $prev = libxml_use_internal_errors(true);
  $doc  = new DOMDocument('1.0', 'UTF-8');
  $ok   = $doc->loadHTML(
    '<?xml encoding="utf-8" ?><div id="__post_root">' . $html . '</div>',
    LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
  );
  libxml_clear_errors();
  libxml_use_internal_errors($prev);
  if (!$ok) return $html;

  $root = $doc->getElementById('__post_root');
  if (!$root) return $html;

  $walk = function ($node) use (&$walk, $drop, $allowed, $okAttrs) {
    $kids = [];
    for ($i = 0; $i < $node->childNodes->length; $i++) $kids[] = $node->childNodes->item($i);
    foreach ($kids as $child) {
      if ($child->nodeType === XML_COMMENT_NODE || $child->nodeType === XML_PI_NODE) {
        $node->removeChild($child);
        continue;
      }
      if ($child->nodeType !== XML_ELEMENT_NODE) continue;
      $tag = strtolower($child->nodeName);

      if (in_array($tag, $drop, true)) {
        $node->removeChild($child);
        continue;
      }

      if ($child->hasAttributes()) {
        $names = [];
        for ($i = 0; $i < $child->attributes->length; $i++) {
          $names[] = $child->attributes->item($i)->name;
        }
        foreach ($names as $name) {
          $ln = strtolower($name);
          if (!in_array($ln, $okAttrs, true)) {
            $child->removeAttribute($name);
            continue;
          }
          if ($ln === 'href' || $ln === 'src') {
            $v = strtolower(preg_replace('/[\s\x00-\x1f]+/', '', (string)$child->getAttribute($name)));
            if (preg_match('~^(?:javascript|vbscript|data:text/html)~', $v)) {
              $child->removeAttribute($name);
            }
          }
          // target="_blank" without rel is a tabnabbing vector; normalise it.
          if ($ln === 'target' && strtolower(trim($child->getAttribute('target'))) === '_blank') {
            $child->setAttribute('rel', 'noopener noreferrer');
          }
        }
      }

      if (!in_array($tag, $allowed, true)) {
        // Unwrap: keep the children, drop the wrapper element.
        while ($child->firstChild) $node->insertBefore($child->firstChild, $child);
        $node->removeChild($child);
        continue;
      }
      $walk($child);
    }
  };
  $walk($root);

  $out = '';
  for ($i = 0; $i < $root->childNodes->length; $i++) {
    $out .= $doc->saveHTML($root->childNodes->item($i));
  }
  return $out;
}

/**
 * Save-time scrub for a personal note's per-locale scoped CSS (`css` field).
 *
 * This is the trust boundary for post paint, mirroring sanitizePostHtml():
 * it runs on every save, inside the authenticated + same-origin-guarded POST
 * branch, before anything reaches MySQL. The render-time scopePostCss() in
 * src/lib/blog/html.ts is the second, independent net (and the ONLY net for
 * file-based content/posts JSON, which never passes through here).
 *
 * What survives: plain selectors + declarations (including @media/@supports
 * and @keyframes — scoping/passthrough happens at render time so the stored
 * value stays author-readable). What dies: the `</style` breakout that would
 * escape the rendering <style> element, @import/@charset (remote stylesheets),
 * executable CSS (expression/behavior/-moz-binding, javascript: URLs) and any
 * HTML tags. Capped at 20KB per locale — punkzine-scale paint is ~8KB.
 */
function sanitizePostCss($css) {
  $css = (string)$css;
  if (trim($css) === '') return '';
  if (strlen($css) > 20000) $css = substr($css, 0, 20000);
  // Embedded script/style BLOCKS first — their text content is code, not
  // paint, and a bare tag-strip would leave e.g. `alert(1)` behind as a
  // bogus selector. Then the `</style` breakout that would escape the
  // rendering <style> element.
  $css = preg_replace('/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/i', '', $css);
  $css = preg_replace('/<\/style/i', '', $css);
  $css = preg_replace('/@import[^;]+;?/i', '', $css);
  $css = preg_replace('/@charset[^;]+;?/i', '', $css);
  $css = preg_replace('/expression\s*\(/i', '(', $css);
  $css = preg_replace('/behavior\s*:/i', ':', $css);
  $css = preg_replace('/-moz-binding\s*:/i', ':', $css);
  $css = preg_replace('/url\s*\(\s*["\']?\s*(javascript|vbscript|data\s*:\s*text\/html)[^)]*\)/i', 'url()', $css);
  // HTML tags are never legitimate inside CSS — strip them, but keep a lone
  // `>` (the child combinator is valid CSS). Tags WITH inner text are removed
  // whole, and a leading combinator left dangling by a removed block is dead.
  $css = preg_replace('/<\s*[a-zA-Z][^<>]*>[\s\S]*?<\s*\/\s*[a-zA-Z][^<>]*>/', '', $css);
  $css = preg_replace('/<\s*\/?\s*[a-zA-Z][^>]*>/', '', $css);
  $css = preg_replace('/(^|[{};])\s*[>+~]\s*/', '$1', $css);
  $css = str_replace("\0", '', $css);
  return trim($css);
}

function getWebPath($path) {
  $real    = realpath($path);
  $docRoot = realpath($_SERVER['DOCUMENT_ROOT']);
  if ($real && $docRoot && strpos($real, $docRoot) === 0) {
    return str_replace(DIRECTORY_SEPARATOR, '/', substr($real, strlen($docRoot)));
  }
  return '/api/uploads/' . basename($path);
}

function loadPostRow($slug) {
  global $pdo;
  $stmt = $pdo->prepare('SELECT * FROM posts WHERE slug = :slug LIMIT 1');
  $stmt->execute(['slug' => $slug]);
  $row = $stmt->fetch();
  if (!$row) {
    return null;
  }
  $translations = json_decode($row['content_json'], true);
  if (!is_array($translations)) {
    $translations = [];
  }
  // `kind` is stored inside content_json.__meta so the live database needs
  // no extra column; it is surfaced here at the TOP level, matching the
  // shape of a post authored in /content/posts.
  $meta = is_array($translations['__meta'] ?? null) ? $translations['__meta'] : [];
  $kind = ($meta['kind'] ?? '') === 'personal' ? 'personal' : 'article';
  unset($translations['__meta']);
  if (!$translations) {
    $translations = [
      'en' => ['title' => '', 'excerpt' => '', 'content' => [], 'html' => '', 'css' => '', 'faq' => [], 'seo' => []],
      'fa' => ['title' => '', 'excerpt' => '', 'content' => [], 'html' => '', 'css' => '', 'faq' => [], 'seo' => []],
    ];
  }
  return [
    'slug' => $row['slug'],
    'kind' => $kind,
    'status' => $row['status'] ?? 'draft',
    'title' => $row['title'] ?? '',
    // date_published is NULLABLE — coalesce so callers (duplicatePost,
    // admin UI, live endpoints) never see `date: null`, the value that
    // crashed the hosted blog grid (`null.slice()`).
    'date' => $row['date_published'] ?? '',
    'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
    'featuredImage' => json_decode($row['featured_image'], true) ?: ['src' => '', 'alt' => ['en' => '', 'fa' => '']],
    'translations' => $translations,
  ];
}

function listPosts() {
  global $pdo;
  $stmt = $pdo->query('SELECT slug, status, title, date_published AS date, tags, featured_image, content_json FROM posts ORDER BY date_published DESC');
  $rows = $stmt->fetchAll();
  return array_map(function ($row) {
    // `kind` lives inside content_json.__meta — read it straight out of the
    // blob so the admin list can badge personal notes without a schema change.
    $kind = 'article';
    $raw = (string)($row['content_json'] ?? '');
    if ($raw !== '' && strpos($raw, '__meta') !== false) {
      $decoded = json_decode($raw, true);
      $meta = is_array($decoded['__meta'] ?? null) ? $decoded['__meta'] : [];
      if (($meta['kind'] ?? '') === 'personal') $kind = 'personal';
    }
    return [
      'slug' => $row['slug'],
      'kind' => $kind,
      'status' => $row['status'] ?? 'draft',
      'title' => $row['title'] ?? '',
      // date_published is NULLABLE — the admin list must never surface null.
      'date' => $row['date'] ?? '',
      'tags' => $row['tags'] ? explode(',', $row['tags']) : [],
      'featuredImage' => json_decode($row['featured_image'], true) ?: ['src' => ''],
    ];
  }, $rows);
}

function savePost(array $payload) {
  global $pdo;
  if (empty($payload['slug'])) {
    errorResponse('Missing slug');
  }
  $slug = sanitizeSlug($payload['slug']);
  if (!$slug) {
    errorResponse('Invalid slug');
  }
  $title = trim($payload['title'] ?? '');
  $tags = $payload['tags'] ?? [];
  if (!is_array($tags)) {
    $tags = array_filter(array_map('trim', explode(',', (string)$tags)));
  }
  $featured = $payload['featuredImage'] ?? ['src' => '', 'alt' => ['en' => '', 'fa' => '']];
  $translations = $payload['translations'] ?? [
    'en' => ['title' => '', 'excerpt' => '', 'content' => [], 'faq' => [], 'seo' => []],
    'fa' => ['title' => '', 'excerpt' => '', 'content' => [], 'faq' => [], 'seo' => []],
  ];
  if (!is_array($translations)) {
    $translations = [];
  }
  // Never trust a round-tripped/ imported `__meta` — it is rebuilt below.
  unset($translations['__meta']);

  // Post kind: "article" (block-built) or "personal" (raw HTML body).
  // Anything unexpected falls back to article so a malformed import can
  // never publish a post the renderer does not know how to draw.
  $kind = ($payload['kind'] ?? '') === 'personal' ? 'personal' : 'article';

  // Personal notes store raw HTML — scrub it HERE, at the trust boundary.
  foreach (['en', 'fa'] as $loc) {
    if (!isset($translations[$loc]) || !is_array($translations[$loc])) continue;
    if (isset($translations[$loc]['html'])) {
      $translations[$loc]['html'] = sanitizePostHtml($translations[$loc]['html']);
    }
    // Per-post paint travels beside the body — scrubbed at the same boundary.
    if (array_key_exists('css', $translations[$loc])) {
      $translations[$loc]['css'] = sanitizePostCss($translations[$loc]['css']);
    }
    // `content` must always be an array — an empty one is valid and is what
    // the blog index serializes for every post.
    if (!isset($translations[$loc]['content']) || !is_array($translations[$loc]['content'])) {
      $translations[$loc]['content'] = [];
    }
  }

  // The stored blob is `__meta` + the per-locale payloads; every reader
  // (get_post, get_posts, blog-post-template) lifts `__meta.kind` back to a
  // top-level `kind`, which is where /content/posts JSON keeps it too.
  $contentJson = ['__meta' => ['kind' => $kind]] + $translations;

  $stmt = $pdo->prepare('SELECT id FROM posts WHERE slug = :slug LIMIT 1');
  $stmt->execute(['slug' => $slug]);
  $exists = $stmt->fetch();

  $status = $payload['status'] ?? 'draft';
  $datePublished = null;
  if ($status === 'published') {
    // Root-cause fix for the hosted `null.slice()` crash: a draft carries
    // date_published = NULL, and the old UPDATE kept it via
    // COALESCE(date_published, :datePub) with :datePub = NULL on every
    // non-publish save — so flipping that draft to published later stored a
    // PUBLISHED row that was still dateless. Always stamp "now" when the
    // incoming status is published and the row has no date yet.
    $datePublished = date('Y-m-d H:i:s');
  }

  if ($exists) {
    $update = $pdo->prepare('UPDATE posts SET status = :status, title = :title, tags = :tags, featured_image = :featured, content_json = :content, date_published = COALESCE(date_published, :datePub), date_updated = NOW() WHERE slug = :slug');
    $update->execute([
      'status' => $status,
      'title' => $title,
      'tags' => implode(',', $tags),
      'featured' => json_encode($featured, JSON_UNESCAPED_UNICODE),
      'content' => json_encode($contentJson, JSON_UNESCAPED_UNICODE),
      'datePub' => $datePublished,
      'slug' => $slug,
    ]);
  } else {
    $insert = $pdo->prepare('INSERT INTO posts (slug, status, title, tags, featured_image, content_json, date_published) VALUES (:slug, :status, :title, :tags, :featured, :content, :datePub)');
    $insert->execute([
      'slug' => $slug,
      'status' => $status,
      'title' => $title,
      'tags' => implode(',', $tags),
      'featured' => json_encode($featured, JSON_UNESCAPED_UNICODE),
      'content' => json_encode($contentJson, JSON_UNESCAPED_UNICODE),
      'datePub' => $datePublished,
    ]);
  }
  return ['success' => true, 'slug' => $slug, 'status' => $status, 'kind' => $kind];
}

function deletePost($slug) {
  global $pdo;
  $stmt = $pdo->prepare('DELETE FROM posts WHERE slug = :slug');
  $stmt->execute(['slug' => $slug]);
  return ['success' => true];
}

function duplicatePost($slug) {
  $post = loadPostRow($slug);
  if (!$post) {
    errorResponse('Post not found', 404);
  }
  $base = $slug . '-copy';
  $newSlug = $base;
  $i = 1;
  while (loadPostRow($newSlug)) {
    $newSlug = $base . '-' . $i;
    $i++;
  }
  $post['slug'] = $newSlug;
  $post['title'] = ($post['title'] ?? '') . ' (Copy)';
  // A duplicated draft must start dateless so publishing it later stamps a
  // fresh date; a duplicated PUBLISHED post keeps the original's date.
  // Either way the value reaching savePost() is a string, never null.
  if (($post['status'] ?? 'draft') !== 'published') {
    $post['date'] = '';
  }
  savePost($post);
  return ['success' => true, 'slug' => $newSlug];
}

function uploadImageFile($fileFieldName) {
  if (empty($_FILES[$fileFieldName]) || !is_uploaded_file($_FILES[$fileFieldName]['tmp_name'])) {
    errorResponse('No file uploaded', 400);
  }
  // SECURITY: whitelist by extension AND by sniffed content (MIME), then
  // store under a random name. The old regex-based rename kept the original
  // extension, so an "image" named shell.php would have been saved as an
  // executable PHP file inside a web-served folder (remote code execution).
  $allowedExt = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
  ];
  $ext = strtolower(pathinfo($_FILES[$fileFieldName]['name'], PATHINFO_EXTENSION));
  if (!isset($allowedExt[$ext])) {
    errorResponse('Only JPG, PNG, WebP or GIF images are allowed', 415);
  }
  // SECURITY: verify the real content is an image. Uses getimagesize()
  // (PHP core, no extension needed) instead of finfo/Fileinfo, which is
  // disabled on some shared hosts and previously caused a fatal 500.
  $info = @getimagesize($_FILES[$fileFieldName]['tmp_name']);
  if ($info === false || ($info['mime'] ?? '') !== $allowedExt[$ext]) {
    errorResponse('File content does not match a valid image', 415);
  }
  $targetName = date('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
  $targetPath = rtrim(UPLOADS_DIR, '/') . '/' . $targetName;
  if (!move_uploaded_file($_FILES[$fileFieldName]['tmp_name'], $targetPath)) {
    errorResponse('Failed to save uploaded file', 500);
  }
  return ['src' => getWebPath($targetPath), 'filename' => $targetName];
}

if (isset($_GET['action'])) {
  $action = $_GET['action'];
  switch ($action) {
    case 'list':
      jsonResponse(listPosts());
      break;
    case 'get':
      $slug = trim($_GET['slug'] ?? '');
      if (!$slug) {
        errorResponse('Missing slug', 400);
      }
      $post = loadPostRow($slug);
      if (!$post) {
        errorResponse('Post not found', 404);
      }
      jsonResponse($post);
      break;
    // SECURITY: `delete` was removed from the GET dispatch — deleting (or
    // any other mutation) over GET is trivially CSRF-able. It now lives in
    // the POST branch below, guarded by assertSameOriginMutation().
    default:
      errorResponse('Unknown action', 400);
  }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
  // All mutations (save / delete / duplicate / uploadImage) share the
  // same-origin + POST requirement.
  assertSameOriginMutation();
  $action = $_POST['action'];
  switch ($action) {
    case 'save':
      $payload = json_decode($_POST['post_json'] ?? '', true);
      if (!is_array($payload)) {
        errorResponse('Invalid JSON payload', 400);
      }
      jsonResponse(savePost($payload));
      break;
    case 'delete':
      $slug = trim($_POST['slug'] ?? '');
      if (!$slug) {
        errorResponse('Missing slug', 400);
      }
      jsonResponse(deletePost($slug));
      break;
    case 'duplicate':
      $slug = trim($_POST['slug'] ?? '');
      if (!$slug) {
        errorResponse('Missing slug', 400);
      }
      jsonResponse(duplicatePost($slug));
      break;
    case 'uploadImage':
      $result = uploadImageFile('image_file');
      jsonResponse($result);
      break;
    default:
      errorResponse('Unknown action', 400);
  }
}

function getDefaultPost() {
  return [
    'slug' => '',
    'kind' => 'article',
    'title' => '',
    'date' => '',
    'tags' => [],
    'featuredImage' => ['src' => '', 'alt' => ['en' => '', 'fa' => '']],
    'translations' => [
      'en' => ['title' => '', 'excerpt' => '', 'content' => [], 'html' => '', 'css' => '', 'faq' => [], 'seo' => ['title' => '', 'metaDescription' => '', 'canonical' => '', 'openGraph' => ['image' => ''], 'twitter' => ['image' => ''], 'keywords' => '', 'focusKeyword' => '']],
      'fa' => ['title' => '', 'excerpt' => '', 'content' => [], 'html' => '', 'css' => '', 'faq' => [], 'seo' => ['title' => '', 'metaDescription' => '', 'canonical' => '', 'openGraph' => ['image' => ''], 'twitter' => ['image' => ''], 'keywords' => '', 'focusKeyword' => '']],
    ],
  ];
}
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <!-- admin.php v3.0-personal — if you can NOT see this comment in the
         page source on the server, the deployed file is out of date. -->
    <title>Blog Admin</title>
    <style>
/* ============================================================
   BLOG ADMIN — design system
   ------------------------------------------------------------
   Restyled to the site's own "Code & Craft" language (see
   src/styles/craft/tokens.css): charcoal ground, hairline glass
   panels, mono micro labels, yellow accent for the one primary
   action and teal for "this is a personal note".

   The previous skin carried the legacy crimson (#da1b4c) brand of
   the pre-redesign site. Nothing about behaviour changed with the
   palette: every id, data-attribute and class the script touches is
   still present in the markup.
   ============================================================ */

:root {
  color-scheme: dark;
  --bg: #212124;
  --bg-deep: #1a1a1c;
  --panel: #2f2f31;
  --raise: #37373b;
  --surface: #eff1f3;

  --ink: #eff1f3;
  --ink-dim: #a1a0ab;
  --muted: #7d7b87;

  --line: rgba(239, 241, 243, 0.13);
  --line-strong: rgba(239, 241, 243, 0.26);

  --accent: #fed766;
  --accent-ink: #212124;
  --accent-soft: rgba(254, 215, 102, 0.14);
  --teal: #4fc9dc;
  --teal-soft: rgba(0, 159, 183, 0.14);
  --teal-line: rgba(0, 159, 183, 0.42);
  --danger: #ff6b6b;
  --danger-soft: rgba(255, 107, 107, 0.13);
  --ok: #7ee0a3;
  --warn: #f4b942;

  --r-sm: 6px;
  --r: 12px;
  --r-lg: 20px;
  --pill: 999px;

  --sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas,
    monospace;

  --dur: 160ms;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --elev: 0 10px 30px rgba(0, 0, 0, 0.34);
}

* { box-sizing: border-box; }
html, body { height: 100%; }

body {
  margin: 0;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(0, 159, 183, 0.08), transparent 60%),
    radial-gradient(900px 500px at -10% 10%, rgba(254, 215, 102, 0.06), transparent 55%),
    var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(239, 241, 243, 0.14);
  border-radius: var(--pill);
  border: 3px solid transparent;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(239, 241, 243, 0.26);
  background-clip: content-box;
}

/* Micro-label — the typographic signature shared with the site */
.section-title > span:first-child,
.rail-title,
.inspector h3 {
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── Shell ──────────────────────────────────────────────────────── */

.page {
  display: grid;
  grid-template-columns: 304px minmax(0, 1fr) 336px;
  height: 100vh;
  overflow: hidden;
}

.panel {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* ── Left rail ──────────────────────────────────────────────────── */

.rail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-inline-end: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(239, 241, 243, 0.035), transparent 240px),
    var(--bg-deep);
}

.rail-head {
  padding: 18px 18px 14px;
  border-block-end: 1px solid var(--line);
}
.rail-brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 4px;
  font-family: var(--mono);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.rail-brand b { color: var(--accent); font-weight: 700; }
.rail-sub { margin: 0; color: var(--muted); font-size: 0.76rem; }
.rail-actions { display: flex; gap: 8px; margin-block-start: 14px; }
.rail-actions .button { flex: 1; }

.rail-search { padding: 12px 14px; border-block-end: 1px solid var(--line); }

/* Section index — replaces the old floating right-edge side nav */
.side-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 14px;
  border-block-end: 1px solid var(--line);
}
.side-nav button {
  border: 1px solid var(--line);
  background: rgba(239, 241, 243, 0.04);
  color: var(--ink-dim);
  border-radius: var(--pill);
  padding: 5px 11px;
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}
.side-nav button:hover {
  background: var(--accent-soft);
  border-color: rgba(254, 215, 102, 0.5);
  color: var(--accent);
}

.rail-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 6px;
}
.post-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 10px 20px;
}

/* ── Post rows ──────────────────────────────────────────────────── */

.post-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  margin-block-end: 4px;
  border: 1px solid transparent;
  border-radius: var(--r);
  background: rgba(239, 241, 243, 0.03);
  transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.post-row:hover { background: rgba(239, 241, 243, 0.06); border-color: var(--line); }
.post-row.active {
  background: var(--accent-soft);
  border-color: rgba(254, 215, 102, 0.5);
}
.post-row.is-personal.active {
  background: var(--teal-soft);
  border-color: var(--teal-line);
}
.post-thumb-sm {
  width: 38px;
  height: 30px;
  border-radius: var(--r-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(239, 241, 243, 0.07);
}
.post-row-main { flex: 1; min-width: 0; }
.post-row-title {
  display: block;
  width: 100%;
  text-align: start;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.post-row:hover .post-row-title { color: var(--accent); }
.post-row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-block-start: 2px;
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--muted);
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: var(--pill);
  border: 1px solid var(--line);
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.badge-personal { border-color: var(--teal-line); color: var(--teal); background: var(--teal-soft); }
.badge-published { border-color: rgba(126, 224, 163, 0.45); color: var(--ok); background: rgba(126, 224, 163, 0.1); }
.badge-draft { border-color: rgba(254, 215, 102, 0.4); color: var(--accent); background: var(--accent-soft); }
.actions { display: flex; gap: 4px; flex-shrink: 0; }

/* ── Buttons ────────────────────────────────────────────────────── */

.button,
button {
  border: 1px solid transparent;
  border-radius: var(--pill);
  padding: 8px 14px;
  font-family: var(--sans);
  font-weight: 600;
  font-size: 0.84rem;
  line-height: 1.2;
  cursor: pointer;
  color: var(--ink);
  background: rgba(239, 241, 243, 0.07);
  transition: background var(--dur) var(--ease), color var(--dur) var(--ease),
    border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.button:hover, button:hover { background: rgba(239, 241, 243, 0.13); }
.button:active, button:active { transform: translateY(1px); }
.button:disabled { opacity: 0.5; cursor: not-allowed; }

.button-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.button-primary:hover { background: #ffe08a; color: var(--accent-ink); }

.button-secondary {
  background: transparent;
  border-color: var(--line-strong);
  color: var(--ink-dim);
}
.button-secondary:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

.button-danger {
  background: transparent;
  border-color: rgba(255, 107, 107, 0.4);
  color: var(--danger);
}
.button-danger:hover { background: var(--danger-soft); color: var(--danger); }

.button-ghost { background: transparent; color: var(--ink-dim); border-color: transparent; }
.button-ghost:hover { color: var(--ink); background: rgba(239, 241, 243, 0.08); }

.button-sm { padding: 5px 10px; font-size: 0.72rem; }

/* ── Canvas ─────────────────────────────────────────────────────── */

.canvas {
  min-width: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.command-bar {
  position: sticky;
  inset-block-start: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 22px;
  border-block-end: 1px solid var(--line);
  background: rgba(33, 33, 36, 0.88);
  backdrop-filter: blur(14px);
}
.command-title { min-width: 0; }
.command-title h2 {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.98rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.command-title p {
  margin: 3px 0 0;
  font-family: var(--mono);
  font-size: 0.66rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.command-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }

.canvas-inner { padding: 20px 22px 64px; }

/* Segmented controls (Editor/JSON tabs, EN/FA, post kind) */
.seg {
  display: inline-flex;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--line);
  border-radius: var(--pill);
  background: rgba(0, 0, 0, 0.24);
}
.seg button,
.tab {
  border: 0;
  background: transparent;
  color: var(--ink-dim);
  border-radius: var(--pill);
  padding: 6px 14px;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}
.seg button:hover, .tab:hover { color: var(--ink); background: rgba(239, 241, 243, 0.07); }
.seg button.active, .tab.active { background: var(--accent); color: var(--accent-ink); }
.seg.seg-teal button.active { background: var(--teal); color: var(--accent-ink); }

/* Global language bar */
.global-lang {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-block-end: 16px;
  padding: 9px 14px;
  background: rgba(239, 241, 243, 0.035);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.global-lang label {
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── Section panels ─────────────────────────────────────────────── */

.section,
.block-section {
  background: linear-gradient(180deg, rgba(239, 241, 243, 0.045), rgba(239, 241, 243, 0.02));
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 15px 18px;
  margin-block-end: 14px;
  box-shadow: inset 0 1px 0 rgba(239, 241, 243, 0.05);
  scroll-margin-block-start: 96px;
}
.block-section[hidden] { display: none; }

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-block-end: 10px;
}
.section-title > span:first-child { color: var(--ink); }

.divider { height: 1px; background: var(--line); margin: 6px 0 16px; }

/* Collapsibles */
.collapsible-header {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  color: var(--ink);
}
.collapsible-header:hover { color: var(--accent); }
.collapsible-header .arrow {
  font-size: 0.68rem;
  color: var(--accent);
  transition: transform var(--dur) var(--ease);
  display: inline-block;
}
.collapsible-header.collapsed .arrow { transform: rotate(-90deg); }
.collapsible-body {
  overflow: hidden;
  transition: max-height var(--dur) var(--ease), opacity var(--dur) var(--ease);
}
.collapsible-body.collapsed { max-height: 0 !important; padding: 0 !important; opacity: 0; }

/* ── Fields ─────────────────────────────────────────────────────── */

.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-block-end: 10px;
}
.field-row.full { grid-template-columns: 1fr; }

label {
  display: block;
  font-family: var(--mono);
  font-size: 0.63rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.input {
  display: block;
  width: 100%;
  margin-block-start: 5px;
  padding: 9px 11px;
  color: var(--ink);
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-family: var(--sans);
  font-size: 0.88rem;
  letter-spacing: normal;
  text-transform: none;
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.input:focus {
  outline: none;
  border-color: rgba(254, 215, 102, 0.65);
  box-shadow: 0 0 0 3px rgba(254, 215, 102, 0.14);
}
textarea.input { resize: vertical; min-height: 76px; line-height: 1.6; }
select.input { color-scheme: dark; cursor: pointer; }
select.input option { background: var(--bg-deep); color: var(--ink); }

.flex { display: flex; gap: 8px; align-items: flex-end; }
.flex-wrap { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; }
.muted { color: var(--muted); }

.error {
  min-height: 1.1em;
  margin-block-start: 6px;
  color: var(--danger);
  font-family: var(--mono);
  font-size: 0.7rem;
}

.upload-preview { margin-block-start: 10px; }
.upload-preview img {
  max-width: 100%;
  border-radius: var(--r);
  border: 1px solid var(--line);
}

/* ── Language tabs & content panes ──────────────────────────────── */

.lang-tabs { display: flex; gap: 5px; margin-block-end: 10px; }
.lang-tab {
  padding: 4px 13px;
  border: 1px solid var(--line);
  border-radius: var(--pill);
  background: transparent;
  color: var(--ink-dim);
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}
.lang-tab:hover { border-color: var(--line-strong); color: var(--ink); }
.lang-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}
.lang-content { display: none; }
.lang-content.active { display: block; }

/* ── Quick-add + blocks ─────────────────────────────────────────── */

.quick-add { display: flex; gap: 6px; flex-wrap: wrap; }
.quick-add button {
  padding: 5px 11px;
  border: 1px dashed var(--line-strong);
  background: transparent;
  color: var(--ink-dim);
  border-radius: var(--pill);
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.quick-add button:hover {
  border-style: solid;
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.list-item {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: rgba(0, 0, 0, 0.2);
  margin-block-end: 9px;
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}
.list-item:hover { border-color: var(--line-strong); }
.list-item.drag-over { border-color: var(--accent); background: var(--accent-soft); }
.list-item.dragging { opacity: 0.55; }
.list-item > label { display: block; margin-block-end: 8px; }

.drag-handle {
  cursor: grab;
  color: var(--muted);
  padding: 0 6px;
  font-size: 0.9rem;
  user-select: none;
}
.drag-handle:hover { color: var(--accent); }

/* ── HTML editor (personal posts) ───────────────────────────────── */

.note-hint {
  margin: 0 0 12px;
  padding: 9px 12px;
  border-inline-start: 2px solid var(--teal-line);
  background: var(--teal-soft);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  color: var(--ink-dim);
  font-size: 0.8rem;
}

.html-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  padding: 7px;
  border: 1px solid var(--line);
  border-block-end: 0;
  border-radius: var(--r-sm) var(--r-sm) 0 0;
  background: rgba(239, 241, 243, 0.04);
}
.html-toolbar button {
  padding: 4px 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-dim);
  border-radius: var(--r-sm);
  font-family: var(--mono);
  font-size: 0.7rem;
}
.html-toolbar button:hover {
  background: var(--teal-soft);
  border-color: var(--teal-line);
  color: var(--teal);
}
.html-sep { width: 1px; height: 16px; background: var(--line-strong); margin: 0 3px; }

.html-editor {
  display: block;
  width: 100%;
  min-height: 340px;
  margin: 0;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 0 0 var(--r-sm) var(--r-sm);
  background: #16161a;
  color: #e6e6ea;
  font-family: var(--mono);
  font-size: 0.8rem;
  line-height: 1.75;
  tab-size: 2;
  resize: vertical;
}
.html-editor:focus {
  outline: none;
  border-color: var(--teal-line);
  box-shadow: 0 0 0 3px rgba(0, 159, 183, 0.16);
}
[dir="rtl"] .html-editor { direction: rtl; text-align: right; }
/* Per-post paint editor: same surface as the HTML editor, but a shorter
   well and forced LTR — CSS never follows the content direction. */
.css-editor { min-height: 180px; }
.css-editor[dir="ltr"] { direction: ltr; text-align: left; }

.html-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-block-start: 8px;
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.html-stats b { color: var(--teal); font-weight: 600; }

/* ── JSON view ──────────────────────────────────────────────────── */

.json-area {
  min-height: 420px;
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.7;
  tab-size: 2;
}

/* ── Right inspector (wide viewports) ────────────────────────────── */

.inspector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 18px 40px;
  border-inline-start: 1px solid var(--line);
  background: linear-gradient(0deg, rgba(239, 241, 243, 0.03), transparent 300px),
    var(--bg-deep);
}
.inspector h3 { margin: 0 0 10px; }

/* Google-shaped result snippet built from the real SEO fields */
.serp {
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: rgba(0, 0, 0, 0.26);
}
.serp-url {
  display: block;
  margin-block-end: 3px;
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--ok);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.serp-title {
  margin: 0 0 4px;
  font-size: 0.95rem;
  line-height: 1.35;
  color: #8ab4f8;
}
.serp-desc {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--ink-dim);
}

.meter {
  height: 4px;
  margin-block-start: 7px;
  border-radius: var(--pill);
  background: rgba(239, 241, 243, 0.1);
  overflow: hidden;
}
.meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width var(--dur) var(--ease);
}
.meter.good i { background: var(--ok); }
.meter.warn i { background: var(--warn); }
.meter.bad i { background: var(--danger); }

/* Stat grid — word count, headings, FAQ, kind */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.stat {
  padding: 10px 11px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: rgba(239, 241, 243, 0.03);
}
.stat b {
  display: block;
  font-family: var(--mono);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
}
.stat span {
  display: block;
  margin-block-start: 2px;
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--muted);
}
.stat.is-personal b { color: var(--teal); }

.chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  padding: 2px 8px;
  border: 1px solid var(--line-strong);
  border-radius: var(--pill);
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--ink-dim);
}
.chip.is-focus { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

.save-state {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.save-state::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}
.save-state.dirty { color: var(--warn); }
.save-state.dirty::before { background: var(--warn); }
.save-state.saved { color: var(--ok); }
.save-state.saved::before { background: var(--ok); }

/* ── Preview modal ──────────────────────────────────────────────── */

.preview-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(10px);
}
.preview-modal[hidden] { display: none; }
.preview-toolbar {
  position: absolute;
  inset-block-start: 12px;
  inset-inline-end: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  flex-wrap: wrap;
}
.preview-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 96px 20px 40px;
  display: flex;
  justify-content: center;
}
.preview-inner {
  width: 100%;
  color: var(--ink);
  transition: max-width 0.3s var(--ease);
}
.preview-body :is(h2, h3, h4) { margin: 24px 0 8px; color: var(--ink); line-height: 1.25; }
.preview-body p { margin: 12px 0; line-height: 1.75; color: var(--ink-dim); }
.preview-body :is(ul, ol) { margin: 12px 0; padding-inline-start: 22px; color: var(--ink-dim); line-height: 1.8; }
.preview-body blockquote {
  margin: 16px 0;
  padding-inline-start: 14px;
  border-inline-start: 2px solid var(--accent);
  color: var(--ink-dim);
  font-style: italic;
}
.preview-body pre {
  margin: 16px 0;
  padding: 14px;
  border-radius: var(--r-sm);
  background: #16161a;
  border: 1px solid var(--line);
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 0.78rem;
}
.preview-body table { width: 100%; border-collapse: collapse; margin: 16px 0; }
.preview-body :is(th, td) { border: 1px solid var(--line); padding: 7px 10px; text-align: start; }

/* ── Toasts ─────────────────────────────────────────────────────── */

.toast-host {
  position: fixed;
  inset-block-end: 18px;
  inset-inline-end: 18px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  padding: 10px 15px;
  border: 1px solid var(--line-strong);
  border-radius: var(--pill);
  background: var(--raise);
  color: var(--ink);
  font-size: 0.8rem;
  box-shadow: var(--elev);
  animation: toast-in 200ms var(--ease);
}
.toast.ok { border-color: rgba(126, 224, 163, 0.5); }
.toast.err { border-color: rgba(255, 107, 107, 0.55); color: var(--danger); }
@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

/* ── Responsive: inspector folds below, rail becomes a drawer ───── */

@media (max-width: 1240px) {
  .page { grid-template-columns: 288px minmax(0, 1fr); }
  .inspector {
    grid-column: 1 / -1;
    border-inline-start: 0;
    border-block-start: 1px solid var(--line);
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .inspector > * { flex: 1 1 280px; }
}

@media (max-width: 1024px) {
  .page { grid-template-columns: minmax(0, 1fr); height: auto; overflow: visible; }
  .rail {
    border-inline-end: 0;
    border-block-end: 1px solid var(--line);
    max-height: 62vh;
  }
  .canvas { overflow: visible; }
  .command-bar { position: static; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
    </style>
  </head>
<body>
    <div class="page">

      <!-- Left rail: brand, actions, search, section index, post list -->
      <aside class="rail panel">
        <div class="rail-head">
          <p class="rail-brand">BLOG <b>ADMIN</b></p>
          <p class="rail-sub">Manage posts, SEO, images, structure.</p>
          <div class="rail-actions">
            <button id="new-post" class="button button-primary">+ New</button>
            <button id="export-all" class="button button-secondary button-sm">Export All JSON</button>
          </div>
        </div>

        <div class="rail-search">
          <input id="search-posts" class="input" placeholder="Search posts..." />
        </div>

        <!-- Section index. Same data-scroll behaviour as the old floating
             side nav: expands a collapsed section, then scrolls to it. -->
        <div class="side-nav" id="side-nav">
          <button data-scroll="identity-section">Identity</button>
          <button data-scroll="general-section">Image</button>
          <button data-scroll="content-section">Content</button>
          <button data-scroll="blocks-section">Blocks</button>
          <button data-scroll="html-section" hidden>HTML</button>
          <button data-scroll="faq-section">FAQ</button>
          <button data-scroll="seo-section">SEO</button>
        </div>

        <div class="rail-list-head">
          <span class="rail-title">Posts</span>
          <span class="muted" id="post-count"></span>
        </div>
        <div id="post-list" class="post-list"></div>
      </aside>

      <!-- Centre canvas -->
      <main class="canvas panel">
        <div class="command-bar">
          <div class="command-title">
            <h2 id="editor-title">Loading...</h2>
            <p id="editor-subtitle">Select a post to edit or create a new one.</p>
          </div>
          <div class="command-actions">
            <div class="seg" id="view-tabs">
              <button class="tab active" data-view="editor">Editor</button>
              <button class="tab" data-view="json">JSON</button>
            </div>
            <button id="preview-post" class="button button-secondary">Preview</button>
            <button id="save-post" class="button button-primary">Save</button>
            <button id="duplicate-post" class="button button-secondary button-sm">Duplicate</button>
            <button id="delete-post" class="button button-danger button-sm">Delete</button>
          </div>
        </div>

        <div class="canvas-inner">
          <div id="editor-view">
            <!-- Global language toggle drives every section's tabs at once -->
            <div class="global-lang" id="global-lang-bar">
              <label>Global Language</label>
              <div class="seg">
                <button class="lang-tab active" data-global-lang="en">English</button>
                <button class="lang-tab" data-global-lang="fa">فارسی</button>
              </div>
            </div>

            <!-- 01 Identity -->
<!-- 01 Identity -->
<!-- 01 Identity -->
            <div id="identity-section" class="section">
              <div class="section-title"><span>Identity</span></div>
              <div class="field-row">
                <label>Slug<input id="field-slug" class="input" data-path="slug" /></label>
                <label>Title<input id="field-title" class="input" data-path="title" /></label>
              </div>
              <div class="field-row">
                <label>Status
                  <select id="field-status" class="input" data-path="status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label>Post type
                  <div class="seg seg-teal" id="kind-seg" style="margin-top:5px;display:inline-flex;">
                    <button type="button" data-kind="article" class="active">Article</button>
                    <button type="button" data-kind="personal">Personal</button>
                  </div>
                </label>
              </div>
              <div class="field-row full">
                <label>Tags (comma separated)<input id="field-tags" class="input" data-path="tags" /></label>
              </div>
              <p class="muted" id="kind-note"></p>
            </div>

            <!-- 02 Featured image -->
            <div id="general-section" class="block-section">
              <div class="collapsible-header" data-collapse="featured">
                <span class="arrow">▼</span><strong>Featured Image</strong>
              </div>
              <div id="collapse-featured" class="collapsible-body">
                <div class="field-row" style="margin-top:8px;">
                  <label>Image URL<input id="field-featured-src" class="input" data-path="featuredImage.src" /></label>
                  <label>Upload<input id="upload-featured" class="input" type="file" accept="image/*" /></label>
                </div>
                <div class="field-row">
                  <label>Alt (EN)<input id="field-featured-alt-en" class="input" data-path="featuredImage.alt.en" /></label>
                  <label>Alt (FA)<input id="field-featured-alt-fa" class="input" data-path="featuredImage.alt.fa" /></label>
                </div>
                <div class="upload-preview" id="featured-preview"></div>
              </div>
            </div>

            <!-- 03 Per-language title + excerpt -->
            <div id="content-section" class="block-section">
              <div class="section-title"><span>Title &amp; Excerpt</span></div>
              <div class="lang-tabs" id="content-lang-tabs"></div>
              <div id="content-en" class="lang-content active">
                <div class="field-row">
                  <label>Post title<input id="field-title-en" class="input" data-path-lang="en" data-field="title" /></label>
                  <label>Excerpt<textarea id="field-excerpt-en" class="input" data-path-lang="en" data-field="excerpt"></textarea></label>
                </div>
              </div>
              <div id="content-fa" class="lang-content">
                <div class="field-row">
                  <label>Post title<input id="field-title-fa" class="input" data-path-lang="fa" data-field="title" /></label>
                  <label>Excerpt<textarea id="field-excerpt-fa" class="input" data-path-lang="fa" data-field="excerpt"></textarea></label>
                </div>
              </div>
            </div>
<!-- 04 Body: blocks for articles -->
            <div id="blocks-section" class="block-section">
              <div class="section-title">
                <span>Content Blocks</span>
                <div class="quick-add">
                  <button data-add-block="heading">+ Heading</button>
                  <button data-add-block="paragraph">+ Paragraph</button>
                  <button data-add-block="list">+ List</button>
                  <button data-add-block="image">+ Image</button>
                </div>
              </div>
              <div class="lang-tabs" id="blocks-lang-tabs"></div>
              <div id="blocks-en" class="lang-content active"></div>
              <div id="blocks-fa" class="lang-content"></div>
            </div>

            <!-- 04b Body: raw HTML for personal notes -->
            <div id="html-section" class="block-section" hidden>
              <div class="section-title">
                <span>HTML Body</span>
                <span class="muted" id="html-lang-label">English</span>
              </div>
              <p class="note-hint">
                This post is a <b>personal note</b>: its body is raw HTML, not blocks.
                Tags, FAQ and SEO behave exactly as they do for articles.
              </p>
              <div class="lang-tabs" id="html-lang-tabs"></div>
              <div id="html-en" class="lang-content active">
                <div class="html-toolbar">
                  <button type="button" data-wrap="&lt;strong&gt;|&lt;/strong&gt;"><b>B</b></button>
                  <button type="button" data-wrap="&lt;em&gt;|&lt;/em&gt;"><i>I</i></button>
                  <button type="button" data-wrap="[text](https://)">Link</button>
                  <span class="html-sep"></span>
                  <button type="button" data-line="&lt;h2&gt;Heading&lt;/h2&gt;">H2</button>
                  <button type="button" data-line="&lt;h3&gt;Heading&lt;/h3&gt;">H3</button>
                  <button type="button" data-line="&lt;ul&gt;&#10;  &lt;li&gt;Item&lt;/li&gt;&#10;&lt;/ul&gt;">List</button>
                  <button type="button" data-line="&lt;blockquote&gt;Quote&lt;/blockquote&gt;">Quote</button>
                  <button type="button" data-line="&lt;pre&gt;&lt;code&gt;code&lt;/code&gt;&lt;/pre&gt;">Code</button>
                </div>
                <textarea id="html-editor-en" class="html-editor" spellcheck="false" dir="ltr"
                  placeholder="&lt;p&gt;Write the note here...&lt;/p&gt;"></textarea>
                <div class="html-stats" id="html-stats-en"></div>
                <div class="section-title" style="margin-top:14px;">
                  <span>Post CSS</span>
                  <span class="muted">scoped to this post</span>
                </div>
                <p class="note-hint">
                  Optional paint for THIS note only — saved with the post, live on publish,
                  no redeploy. Selectors are auto-scoped to this post on render.
                </p>
                <textarea id="css-editor-en" class="html-editor css-editor" spellcheck="false" dir="ltr"
                  placeholder=".note-card { background: #eff1f3; }"></textarea>
              </div>
              <div id="html-fa" class="lang-content">
                <div class="html-toolbar">
                  <button type="button" data-wrap="&lt;strong&gt;|&lt;/strong&gt;"><b>B</b></button>
                  <button type="button" data-wrap="&lt;em&gt;|&lt;/em&gt;"><i>I</i></button>
                  <button type="button" data-wrap="[متن](https://)">Link</button>
                  <span class="html-sep"></span>
                  <button type="button" data-line="&lt;h2&gt;عنوان&lt;/h2&gt;">H2</button>
                  <button type="button" data-line="&lt;h3&gt;عنوان&lt;/h3&gt;">H3</button>
                  <button type="button" data-line="&lt;ul&gt;&#10;  &lt;li&gt;مورد&lt;/li&gt;&#10;&lt;/ul&gt;">List</button>
                  <button type="button" data-line="&lt;blockquote&gt;نقل قول&lt;/blockquote&gt;">Quote</button>
                  <button type="button" data-line="&lt;pre&gt;&lt;code&gt;کد&lt;/code&gt;&lt;/pre&gt;">Code</button>
                </div>
                <textarea id="html-editor-fa" class="html-editor" spellcheck="false" dir="rtl"
                  placeholder="&lt;p&gt;یادداشت را اینجا بنویسید...&lt;/p&gt;"></textarea>
                <div class="html-stats" id="html-stats-fa"></div>
                <div class="section-title" style="margin-top:14px;">
                  <span>Post CSS</span>
                  <span class="muted">scoped to this post</span>
                </div>
                <p class="note-hint">
                  Optional paint for THIS note only — saved with the post, live on publish,
                  no redeploy. Selectors are auto-scoped to this post on render.
                </p>
                <textarea id="css-editor-fa" class="html-editor css-editor" spellcheck="false" dir="ltr"
                  placeholder=".note-card { background: #eff1f3; }"></textarea>
              </div>
            </div>
<!-- 05 FAQ -->
            <div id="faq-section" class="block-section">
              <div class="section-title">
                <span>FAQ</span>
                <button id="add-faq" class="button button-secondary button-sm">+ Add FAQ</button>
              </div>
              <div class="lang-tabs" id="faq-lang-tabs"></div>
              <div id="faq-en" class="lang-content active"></div>
              <div id="faq-fa" class="lang-content"></div>
            </div>

            <!-- 06 SEO -->
            <div id="seo-section" class="block-section">
              <div class="collapsible-header collapsed" data-collapse="seo">
                <span class="arrow">▼</span><strong>SEO Settings</strong>
              </div>
              <div id="collapse-seo" class="collapsible-body collapsed">
                <div class="lang-tabs" id="seo-lang-tabs" style="margin-top:8px;"></div>
                <div id="seo-en" class="lang-content active"></div>
                <div id="seo-fa" class="lang-content"></div>
              </div>
            </div>
          </div>

          <!-- JSON view -->
          <div id="json-view" hidden>
            <div class="section">
              <div class="section-title">
                <span>Post JSON</span>
                <div class="flex-wrap">
                  <button id="export-json" class="button button-secondary button-sm">Download</button>
                  <button id="import-json" class="button button-secondary button-sm">Import</button>
                  <input id="import-file" type="file" accept=".json" hidden />
                </div>
              </div>
              <textarea id="json-editor" class="input json-area" spellcheck="false"></textarea>
              <div id="json-error" class="error"></div>
            </div>
          </div>
        </div>
      </main>

      <!-- Right inspector -->
      <aside class="inspector panel">
        <div>
          <h3>Search preview</h3>
          <div class="serp">
            <span class="serp-url" id="serp-url"></span>
            <p class="serp-title" id="serp-title"></p>
            <p class="serp-desc" id="serp-desc"></p>
            <div class="meter" id="serp-meter"><i style="width:0%"></i></div>
          </div>
        </div>
        <div>
          <h3>Post</h3>
          <div class="stat-grid" id="stat-grid"></div>
        </div>
        <div>
          <h3>Keywords</h3>
          <div class="chips" id="seo-chips"></div>
        </div>
        <div>
          <h3>State</h3>
          <div class="save-state" id="save-state">Unsaved changes</div>
        </div>
      </aside>
    </div>

    <!-- Preview modal -->
    <div class="preview-modal" id="preview-modal" hidden onclick="if(event.target===this)closePreview()">
      <div class="preview-toolbar">
        <div class="seg">
          <button id="preview-lang-en" class="button button-sm" onclick="previewLang('en')">English</button>
          <button id="preview-lang-fa" class="button button-sm" onclick="previewLang('fa')">فارسی</button>
        </div>
        <span class="html-sep"></span>
        <div class="seg">
          <button id="preview-viewport-desktop" class="button button-sm" onclick="previewViewport('desktop')">Desktop</button>
          <button id="preview-viewport-mobile" class="button button-sm" onclick="previewViewport('mobile')">Mobile</button>
        </div>
        <button class="button button-ghost button-sm" onclick="closePreview()">Close</button>
      </div>
      <div class="preview-scroll">
        <div class="preview-inner" id="preview-inner"></div>
      </div>
    </div>

    <div class="toast-host" id="toast-host" aria-live="polite"></div>
    <script>
      // Preview state
      let previewLangState = 'en';
      let previewViewportState = 'desktop';

      function renderPreviewContent(data, lang) {
        const tr = data.translations?.[lang] || {};
        const faq = tr.faq || [];
        const content = tr.content || [];
        const featured = data.featuredImage?.src || '';
        const tags = Array.isArray(data.tags) ? data.tags : [];
        const date = data.date || '';

        let html = `<div style="font-family:Inter,system-ui,sans-serif;" dir="${lang==='fa'?'rtl':'ltr'}">`;
        html += `<h1 style="font-size:32px;font-weight:700;margin:0 0 8px;color:#fff;">${escapeHtml(tr.title||'')}</h1>`;
        html += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">`;
        if (date) html += `<span style="font-size:12px;text-transform:uppercase;letter-spacing:0.3em;color:#FFB3C0;">${escapeHtml(date)}</span>`;
        tags.forEach(t => { html += `<span style="font-size:11px;background:rgba(218,0,55,0.15);padding:2px 10px;border-radius:999px;color:#eef2f7;">${escapeHtml(t)}</span>`; });
        html += `</div>`;
        html += `<p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.75);margin-bottom:24px;text-align:justify;">${escapeHtml(tr.excerpt||'')}</p>`;
        if (featured) html += `<div style="border-radius:16px;overflow:hidden;margin-bottom:24px;"><img src="${escapeHtml(featured)}" alt="" style="width:100%;max-height:350px;object-fit:cover;border-radius:16px;" /></div>`;

        // Render content blocks (simplified preview)
        content.forEach((block, idx) => {
          if (block.type === 'heading') {
            html += `<h2 style="font-size:22px;font-weight:600;margin:24px 0 8px;color:#fff;">${escapeHtml(block.text||'')}</h2>`;
          } else if (block.type === 'paragraph') {
            const cls = block.style === 'lead' ? 'font-size:18px;font-weight:500;color:#fff;' : '';
            html += `<p style="font-size:15px;line-height:1.7;margin:12px 0;color:rgba(255,255,255,0.85);text-align:justify;${cls}">${escapeHtml(block.text||'')}</p>`;
          } else if (block.type === 'list') {
            const items = block.items||[];
            const tag = block.style === 'ordered' ? 'ol' : 'ul';
            html += `<${tag} style="margin:12px 0 12px 20px;color:rgba(255,255,255,0.85);line-height:1.8;">`;
            items.forEach(item => { html += `<li>${escapeHtml(item)}</li>`; });
            html += `</${tag}>`;
          } else if (block.type === 'image') {
            html += `<div style="margin:20px 0;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);padding:8px;background:rgba(255,255,255,0.03);">`;
            html += `<img src="${escapeHtml(block.src||'')}" alt="${escapeHtml(block.alt||'')}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;" />`;
            if (block.caption) html += `<p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:8px;">${escapeHtml(block.caption)}</p>`;
            html += `</div>`;
          } else if (block.type === 'cta') {
            html += `<div style="margin:24px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,rgba(30,15,20,1),rgba(20,27,34,1));border:1px solid rgba(218,0,55,0.4);text-align:center;">`;
            if (block.title) html += `<h3 style="font-size:20px;color:#fff;margin:0 0 8px;">${escapeHtml(block.title)}</h3>`;
            if (block.text) html += `<p style="color:rgba(255,255,255,0.8);margin:0 0 16px;">${escapeHtml(block.text)}</p>`;
            if (block.buttonText) html += `<a href="${escapeHtml(block.buttonUrl||'#')}" style="display:inline-block;background:#DA0037;color:white;padding:10px 24px;border-radius:999px;font-weight:600;text-decoration:none;">${escapeHtml(block.buttonText)}</a>`;
            html += `</div>`;
          } else if (block.type === 'highlight') {
            html += `<div style="margin:16px 0;padding:16px;border-left:4px solid rgba(218,0,55,0.5);background:rgba(26,21,32,0.8);border-radius:12px;">`;
            if (block.label) html += `<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#DA0037;font-weight:600;">${escapeHtml(block.label)}</span>`;
            html += `<p style="margin:4px 0 0;color:rgba(255,255,255,0.9);">${escapeHtml(block.text)}</p></div>`;
          } else if (block.type === 'quote') {
            html += `<blockquote style="margin:20px 0;padding:16px;border-left:4px solid rgba(52,152,219,0.6);background:rgba(15,20,25,0.8);border-radius:12px;font-style:italic;">`;
            html += `<p style="margin:0;color:rgba(255,255,255,0.9);">${escapeHtml(block.text)}</p>`;
            if (block.author) html += `<footer style="margin-top:8px;font-size:13px;color:rgba(52,152,219,0.7);font-style:normal;">— ${escapeHtml(block.author)}</footer>`;
            html += `</blockquote>`;
          } else if (block.type === 'alert') {
            html += `<div style="margin:16px 0;padding:12px 16px;border-radius:12px;border:1px solid rgba(52,152,219,0.4);background:rgba(52,152,219,0.06);display:flex;gap:10px;align-items:flex-start;">`;
            html += `<span style="font-size:18px;flex-shrink:0;">ℹ</span><div>`;
            if (block.title) html += `<strong style="font-size:13px;display:block;margin-bottom:2px;">${escapeHtml(block.title)}</strong>`;
            html += `<p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);">${escapeHtml(block.text)}</p></div></div>`;
          } else if (block.type === 'code') {
            html += `<pre style="margin:16px 0;padding:16px;background:#0a0d12;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow-x:auto;font-family:monospace;font-size:13px;color:#e2e8f0;"><code>${escapeHtml(block.code||block.text||'')}</code></pre>`;
          } else if (block.type === 'stats') {
            html += `<div style="margin:20px 0;padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);background:rgba(15,20,25,0.9);">`;
            html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;text-align:center;">`;
            (block.items||[]).forEach(s => {
              html += `<div><div style="font-size:28px;font-weight:700;color:#DA0037;">${escapeHtml(s.value||'')}</div>`;
              html += `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.5);margin-top:4px;">${escapeHtml(s.label||'')}</div></div>`;
            });
            html += `</div></div>`;
          }
        });

        // FAQ section
        if (faq.length > 0) {
          html += `<div style="margin:32px 0;padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);background:rgba(15,20,25,0.8);">`;
          html += `<h3 style="font-size:18px;color:#fff;margin:0 0 16px;">${lang==='fa'?'پرسش‌های متداول':'Frequently Asked Questions'}</h3>`;
          faq.forEach((item, idx) => {
            html += `<div style="margin-bottom:8px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">`;
            html += `<div style="padding:12px 16px;font-weight:600;color:#fff;background:rgba(255,255,255,0.03);">${escapeHtml(item.question)}</div>`;
            html += `<div style="padding:12px 16px;color:rgba(255,255,255,0.8);font-size:14px;border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(item.answer)}</div>`;
            html += `</div>`;
          });
          html += `</div>`;
        }

        html += `</div>`;
        return html;
      }

      function closePreview() {
        byId('preview-modal').style.display = 'none';
      }

      function previewLang(lang) {
        previewLangState = lang;
        // Update button styles
        ['en','fa'].forEach(l => {
          byId('preview-lang-'+l)?.classList.toggle('active', l === lang);
        });
        byId('preview-inner').innerHTML = renderPreviewContent(state.current, lang);
      }

      function previewViewport(viewport) {
        previewViewportState = viewport;
        const inner = byId('preview-inner');
        ['desktop','mobile'].forEach(v => {
          byId('preview-viewport-'+v)?.classList.toggle('active', v === viewport);
        });
        inner.style.maxWidth = viewport === 'mobile' ? '375px' : '800px';
        inner.style.transition = 'max-width 0.3s ease';
      }

      const LANGUAGES = ['en', 'fa'];
      const apiBase = window.location.pathname;
      const state = {posts: [], current: null, view: 'editor', contentLang: 'en'};

      const defaultPost = () => ({
        slug: '', title: '', date: '', tags: [], status: 'draft',
        featuredImage: {src: '', alt: {en: '', fa: ''}},
        translations: {
          en: {title: '', excerpt: '', content: [], html: '', css: '', faq: [], seo: {title: '', metaDescription: '', canonical: '', openGraph: {image: ''}, twitter: {image: ''}, keywords: '', focusKeyword: ''}},
          fa: {title: '', excerpt: '', content: [], html: '', css: '', faq: [], seo: {title: '', metaDescription: '', canonical: '', openGraph: {image: ''}, twitter: {image: ''}, keywords: '', focusKeyword: ''}},
        },
      });

      function byId(id) { return document.getElementById(id); }
      function escapeHtml(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

      /**
       * Sync image source across both locales when an image block URL changes.
       * This ensures an image added in EN is mirrored in FA (same src, different alt).
       */
      function syncImageAcrossLocales(path, value) {
        // Example path: "translations.en.content.3.src"
        const parts = path.split('.');
        if (parts.length < 4 || parts[2] !== 'content') return;
        const lang = parts[1]; // "en" or "fa"
        const blockIdx = parseInt(parts[3], 10);
        const otherLang = lang === 'en' ? 'fa' : 'en';
        const otherBlocks = state.current.translations[otherLang]?.content;
        if (!otherBlocks || otherBlocks.length <= blockIdx) return;
        // Only sync if the other locale's block at same index is also an image
        if (otherBlocks[blockIdx]?.type === 'image') {
          otherBlocks[blockIdx].src = value;
        }
      }

      function setField(path, value) {
        const keys = path.split('.');
        let t = state.current;
        while (keys.length > 1) { const k = keys.shift(); if (t[k] === undefined) t[k] = {}; t = t[k]; }
        t[keys[0]] = value;
        if (path === 'tags') state.current.tags = value.split(',').map(v=>v.trim()).filter(Boolean);
      }

      function fetchJson(url, opts={}) {
        return fetch(url, opts).then(async r => { const t = await r.text(); try { return JSON.parse(t); } catch(e) { throw new Error('Invalid JSON'); } });
      }

      function syncToJson() {
        byId('json-editor').value = JSON.stringify(state.current, null, 2);
        byId('json-error').textContent = '';
      }

      function renderLangTabs(containerId, lang, callback) {
        const container = byId(containerId);
        container.innerHTML = LANGUAGES.map(l => `<button class="lang-tab ${l===lang?'active':''}" data-lang="${l}">${l==='en'?'English':'فارسی'}</button>`).join('');
        container.querySelectorAll('.lang-tab').forEach(btn => btn.addEventListener('click', () => {
          container.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          callback(btn.dataset.lang);
        }));
      }

      function renderSeo(lang) {
        const tr = state.current.translations[lang]?.seo || {};
        const container = byId('seo-'+lang);
        container.innerHTML = `
          <div class="field-row"><label>SEO Title<input class="input" data-seo="${lang}.title" value="${escapeHtml(tr.title||'')}" /></label>
          <label>Canonical URL<input class="input" data-seo="${lang}.canonical" value="${escapeHtml(tr.canonical||'')}" /></label></div>
          <div class="field-row full"><label>Meta description<textarea class="input" data-seo="${lang}.metaDescription">${escapeHtml(tr.metaDescription||'')}</textarea></label></div>
          <div class="field-row"><label>OG Image<input class="input" data-seo="${lang}.openGraph.image" value="${escapeHtml(tr.openGraph?.image||'')}" /></label>
          <label>Twitter Image<input class="input" data-seo="${lang}.twitter.image" value="${escapeHtml(tr.twitter?.image||'')}" /></label></div>
          <div class="field-row"><label>Keywords<input class="input" data-seo="${lang}.keywords" value="${escapeHtml(tr.keywords||'')}" /></label>
          <label>Focus Keyword<input class="input" data-seo="${lang}.focusKeyword" value="${escapeHtml(tr.focusKeyword||'')}" /></label></div>
        `;
        container.querySelectorAll('[data-seo]').forEach(el => el.addEventListener('input', () => {
          const [l, ...rest] = el.dataset.seo.split('.');
          setField('translations.'+l+'.seo.'+rest.join('.'), el.value);
        }));
      }

      function renderBlocks(lang) {
        const blocks = state.current.translations[lang]?.content || [];
        const container = byId('blocks-'+lang);
        container.innerHTML = blocks.map((block, i) => {
          const drag = '<span class="drag-handle" title="Drag">☰</span>';
          const allTypes = ['heading','paragraph','list','image','cta','highlight','stats','quote','alert','code'];
          const typeSel = `<select class="input" style="font-size:0.82rem;padding:4px 8px;width:auto;display:inline-block;" data-block-type="${lang}-${i}">`+
            allTypes.map(t => `<option value="${t}" ${block.type===t?'selected':''}>${t}</option>`).join('')+'</select>';
          const rm = `<button class="button button-danger button-sm" data-rm-block="${lang}-${i}">×</button>`;
          let body = '';
          if (block.type === 'heading') {
            const lvl = block.level||2;
            body = `<div class="flex"><label style="flex:1">Level<select class="input" data-path="translations.${lang}.content.${i}.level">
              ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${n===lvl?'selected':''}>H${n}</option>`).join('')}</select></label></div>
              <label>Text<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="2">${escapeHtml(block.text||'')}</textarea></label>`;
          } else if (block.type === 'paragraph') {
            const style = block.style||'normal';
            body = `<div class="flex"><label style="flex:1">Style<select class="input" data-path="translations.${lang}.content.${i}.style">
              <option value="normal" ${style==='normal'?'selected':''}>Normal</option>
              <option value="lead" ${style==='lead'?'selected':''}>Lead</option>
              <option value="small" ${style==='small'?'selected':''}>Small</option></select></label></div>
              <label>Text<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="2">${escapeHtml(block.text||'')}</textarea></label>`;
          } else if (block.type === 'list') {
            const items = block.items||[];
            body = `<div class="flex"><label style="flex:1">Type<select class="input" data-path="translations.${lang}.content.${i}.style">
              <option value="bullet" ${(block.style||'bullet')==='bullet'?'selected':''}>Bullet</option>
              <option value="ordered" ${block.style==='ordered'?'selected':''}>Ordered</option></select></label></div>
              ${items.map((item, ii) => `<div class="flex" style="margin:4px 0"><input class="input" style="flex:1" data-path="translations.${lang}.content.${i}.items.${ii}" value="${escapeHtml(item||'')}" />
              <button class="button button-danger button-sm" data-rm-li="${lang}-${i}-${ii}">×</button></div>`).join('')}
              <button class="button button-secondary button-sm" data-add-li="${lang}-${i}" style="margin-top:4px">+ Item</button>`;
          } else if (block.type === 'image') {
            const imgSrc = block.src || '';
            body = `<label>URL<input class="input" data-path="translations.${lang}.content.${i}.src" value="${escapeHtml(imgSrc)}" oninput="syncImageAcrossLocales(this.dataset.path, this.value)" data-path="translations.${lang}.content.${i}.src" /></label>
              ${imgSrc ? `<div style="margin:8px 0;border-radius:8px;overflow:hidden;"><img src="${escapeHtml(imgSrc)}" alt="" style="max-width:100%;max-height:150px;border-radius:8px;object-fit:cover;" /></div>` : ''}
              <div class="flex"><label style="flex:1">Alt text<input class="input" data-path="translations.${lang}.content.${i}.alt" value="${escapeHtml(block.alt||'')}" placeholder="Alternative text for SEO" /></label>
              <label>Upload<input type="file" class="input" accept="image/*" data-upload-img="${lang}-${i}" /></label></div>
              <label>Caption<textarea class="input" data-path="translations.${lang}.content.${i}.caption" rows="1">${escapeHtml(block.caption||'')}</textarea></label>`;
          } else if (block.type === 'cta') {
            body = `<div style="padding:8px;border:1px solid rgba(218,0,55,0.3);border-radius:10px;background:rgba(218,0,55,0.06);">
              <label>Title<input class="input" data-path="translations.${lang}.content.${i}.title" value="${escapeHtml(block.title||'')}" placeholder="Call to action heading" /></label>
              <label>Description<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="2" placeholder="Supporting text">${escapeHtml(block.text||'')}</textarea></label>
              <div class="flex"><label style="flex:1">Button text<input class="input" data-path="translations.${lang}.content.${i}.buttonText" value="${escapeHtml(block.buttonText||'')}" placeholder="e.g. Get Started" /></label>
              <label style="flex:1">Button URL<input class="input" data-path="translations.${lang}.content.${i}.buttonUrl" value="${escapeHtml(block.buttonUrl||'')}" placeholder="https://..." /></label></div>
            </div>`;
          } else if (block.type === 'highlight') {
            body = `<div style="padding:8px;border-left:4px solid rgba(218,0,55,0.5);border-radius:8px;background:rgba(218,0,55,0.04);">
              <label>Label <span class="muted">(optional)</span><input class="input" data-path="translations.${lang}.content.${i}.label" value="${escapeHtml(block.label||'')}" placeholder="e.g. KEY INSIGHT" /></label>
              <label>Text<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="3">${escapeHtml(block.text||'')}</textarea></label>
            </div>`;
          } else if (block.type === 'stats') {
            const items = block.items||[{value:'',label:''}];
            body = `<div style="padding:8px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
              ${items.map((s, si) => `<div class="flex" style="margin-bottom:4px"><input class="input" style="flex:1" data-path="translations.${lang}.content.${i}.items.${si}.value" value="${escapeHtml(s.value||'')}" placeholder="Value" />
              <input class="input" style="flex:2" data-path="translations.${lang}.content.${i}.items.${si}.label" value="${escapeHtml(s.label||'')}" placeholder="Label" />
              <button class="button button-danger button-sm" data-rm-stat="${lang}-${i}-${si}">×</button></div>`).join('')}
              <button class="button button-secondary button-sm" data-add-stat="${lang}-${i}" style="margin-top:4px">+ Add stat</button>
            </div>`;
          } else if (block.type === 'quote') {
            body = `<div style="padding:8px;border-left:4px solid rgba(52,152,219,0.5);border-radius:8px;background:rgba(52,152,219,0.04);">
              <label>Quote text<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="3">${escapeHtml(block.text||'')}</textarea></label>
              <label>Author <span class="muted">(optional)</span><input class="input" data-path="translations.${lang}.content.${i}.author" value="${escapeHtml(block.author||'')}" /></label>
            </div>`;
          } else if (block.type === 'alert') {
            const style = block.alertStyle||'info';
            body = `<div style="padding:8px;border:1px solid rgba(52,152,219,0.3);border-radius:10px;background:rgba(52,152,219,0.06);">
              <div class="flex"><label style="flex:1">Style<select class="input" data-path="translations.${lang}.content.${i}.alertStyle">
                <option value="info" ${style==='info'?'selected':''}>Info ℹ</option>
                <option value="warning" ${style==='warning'?'selected':''}>Warning ⚠</option>
                <option value="tip" ${style==='tip'?'selected':''}>Tip 💡</option>
                <option value="danger" ${style==='danger'?'selected':''}>Danger ✕</option></select></label></div>
              <label>Title <span class="muted">(optional)</span><input class="input" data-path="translations.${lang}.content.${i}.title" value="${escapeHtml(block.title||'')}" /></label>
              <label>Text<textarea class="input" data-path="translations.${lang}.content.${i}.text" rows="2">${escapeHtml(block.text||'')}</textarea></label>
            </div>`;
          } else if (block.type === 'code') {
            body = `<div style="padding:8px;background:#0a0d12;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
              <label>Code<textarea class="input" data-path="translations.${lang}.content.${i}.code" rows="5" style="font-family:monospace;font-size:0.85rem;">${escapeHtml(block.code||'')}</textarea></label>
            </div>`;
          } else {
            body = '<div class="muted">Select a block type above</div>';
          }
          return `<div class="list-item" draggable="true" data-drag="${lang}-${i}">
            <div class="flex" style="align-items:center;margin-bottom:6px">${drag}<strong style="flex:1;font-size:0.85rem">Block ${i+1}</strong>${typeSel}${rm}</div>
            <div class="block-body">${body}</div></div>`;
        }).join('');
        // Bind inputs
        container.querySelectorAll('[data-path]').forEach(el => el.addEventListener('input', () => { setField(el.dataset.path, el.value); }));
        container.querySelectorAll('[data-block-type]').forEach(sel => sel.addEventListener('change', () => {
          const [l, idx] = sel.dataset.blockType.split('-');
          state.current.translations[l].content[Number(idx)].type = sel.value;
          renderBlocks(l);
        }));
        container.querySelectorAll('[data-rm-block]').forEach(btn => btn.addEventListener('click', () => {
          const [l, idx] = btn.dataset.rmBlock.split('-');
          state.current.translations[l].content.splice(Number(idx), 1);
          renderBlocks(l); syncToJson();
        }));
        container.querySelectorAll('[data-rm-li]').forEach(btn => btn.addEventListener('click', () => {
          const [l, bi, ii] = btn.dataset.rmLi.split('-');
          state.current.translations[l].content[Number(bi)].items.splice(Number(ii), 1);
          renderBlocks(l); syncToJson();
        }));
        container.querySelectorAll('[data-add-li]').forEach(btn => btn.addEventListener('click', () => {
          const [l, bi] = btn.dataset.addLi.split('-');
          if (!state.current.translations[l].content[Number(bi)].items) state.current.translations[l].content[Number(bi)].items = [];
          state.current.translations[l].content[Number(bi)].items.push('');
          renderBlocks(l); syncToJson();
        }));
        container.querySelectorAll('[data-rm-stat]').forEach(btn => btn.addEventListener('click', () => {
          const [l, bi, si] = btn.dataset.rmStat.split('-');
          state.current.translations[l].content[Number(bi)].items.splice(Number(si), 1);
          renderBlocks(l); syncToJson();
        }));
        container.querySelectorAll('[data-add-stat]').forEach(btn => btn.addEventListener('click', () => {
          const [l, bi] = btn.dataset.addStat.split('-');
          if (!state.current.translations[l].content[Number(bi)].items) state.current.translations[l].content[Number(bi)].items = [];
          state.current.translations[l].content[Number(bi)].items.push({value:'', label:''});
          renderBlocks(l); syncToJson();
        }));
        container.querySelectorAll('[data-upload-img]').forEach(input => input.addEventListener('change', async () => {
          if (!input.files.length) return;
          const [l, bi] = input.dataset.uploadImg.split('-');
          const fd = new FormData(); fd.append('action','uploadImage'); fd.append('image_file', input.files[0]);
          const result = await fetchJson(apiBase, {method:'POST', body:fd});
          state.current.translations[l].content[Number(bi)].src = result.src;
          renderBlocks(l); syncToJson(); input.value='';
        }));
        // Drag & drop
        container.querySelectorAll('.list-item[draggable]').forEach(item => {
          item.addEventListener('dragstart', e => {
            const [l, i] = item.dataset.drag.split('-');
            e.dataTransfer.setData('text/plain', JSON.stringify({locale:l, index:Number(i)}));
            item.classList.add('dragging');
          });
          item.addEventListener('dragend', () => item.classList.remove('dragging'));
          item.addEventListener('dragover', e => { e.preventDefault(); item.classList.add('drag-over'); });
          item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
          item.addEventListener('drop', e => {
            e.preventDefault(); item.classList.remove('drag-over');
            const src = JSON.parse(e.dataTransfer.getData('text/plain'));
            const tgt = item.dataset.drag.split('-');
            if (src.locale !== tgt[0]) return;
            const blocks = state.current.translations[src.locale].content;
            const [moved] = blocks.splice(src.index, 1);
            const insertAt = Number(tgt[1]) > src.index ? Number(tgt[1]) - 1 : Number(tgt[1]);
            blocks.splice(insertAt, 0, moved);
            renderBlocks(src.locale); syncToJson();
          });
        });
      }

      function renderFaq(lang) {
        const faq = state.current.translations[lang]?.faq || [];
        const container = byId('faq-'+lang);
        container.innerHTML = faq.map((item, i) => `
          <div class="list-item" style="padding:8px">
            <div class="flex" style="align-items:center;margin-bottom:4px">
              <strong style="flex:1;font-size:0.85rem">FAQ ${i+1}</strong>
              <button class="button button-danger button-sm" data-rm-faq="${lang}-${i}">×</button>
            </div>
            <label>Question<input class="input" data-path="translations.${lang}.faq.${i}.question" value="${escapeHtml(item.question||'')}" /></label>
            <label>Answer<textarea class="input" data-path="translations.${lang}.faq.${i}.answer" rows="2">${escapeHtml(item.answer||'')}</textarea></label>
          </div>
        `).join('');
        container.querySelectorAll('[data-path]').forEach(el => el.addEventListener('input', () => setField(el.dataset.path, el.value)));
        container.querySelectorAll('[data-rm-faq]').forEach(btn => btn.addEventListener('click', () => {
          const [l, i] = btn.dataset.rmFaq.split('-');
          state.current.translations[l].faq.splice(Number(i), 1);
          renderFaq(l); syncToJson();
        }));
      }

      function renderAllContent() {
        LANGUAGES.forEach(l => { renderSeo(l); renderBlocks(l); renderFaq(l); });
        // Sync content title/excerpt fields
        LANGUAGES.forEach(l => {
          const tr = state.current.translations[l] || {};
          const titleEl = byId('field-title-'+l);
          const excerptEl = byId('field-excerpt-'+l);
          if (titleEl) titleEl.value = tr.title || '';
          if (excerptEl) excerptEl.value = tr.excerpt || '';
        });
      }

      function render() {
        if (!state.current) state.current = defaultPost();
        byId('editor-title').textContent = state.current.title || 'New post';
        byId('editor-subtitle').textContent = state.current.slug ? state.current.slug : 'Create or select a post.';
        byId('field-slug').value = state.current.slug || '';
        byId('field-title').value = state.current.title || '';
        byId('field-status').value = state.current.status || 'draft';
        byId('field-tags').value = (state.current.tags||[]).join(', ');
        byId('field-featured-src').value = state.current.featuredImage?.src || '';
        byId('field-featured-alt-en').value = state.current.featuredImage?.alt?.en || '';
        byId('field-featured-alt-fa').value = state.current.featuredImage?.alt?.fa || '';
        byId('featured-preview').innerHTML = state.current.featuredImage?.src ? `<img src="${escapeHtml(state.current.featuredImage.src)}" alt="" style="max-width:100%;border-radius:var(--r);" />` : '';
        renderAllContent();
        syncToJson();
        renderPostList();
      }

      function renderPostList() {
        const term = byId('search-posts').value.toLowerCase();
        const rows = state.posts.filter(p => p.slug.includes(term) || (p.title||'').toLowerCase().includes(term));
        byId('post-list').innerHTML = rows.map(p => {
          const personal = p.kind === 'personal';
          const imgSrc = p.featuredImage?.src || '';
          const thumb = imgSrc
            ? `<img class="post-thumb-sm" src="${escapeHtml(imgSrc)}" alt="" />`
            : '<div class="post-thumb-sm"></div>';
          const titleText = (p.title||p.slug).length > 34 ? (p.title||p.slug).substring(0,31)+'…' : (p.title||p.slug);
          const status = p.status === 'published' ? 'published' : 'draft';
          return `<div class="post-row ${state.current?.slug===p.slug?'active':''} ${personal?'is-personal':''}">
            ${thumb}
            <div class="post-row-main">
              <button class="post-row-title" data-select="${escapeHtml(p.slug)}">${escapeHtml(titleText)}</button>
              <div class="post-row-meta">
                <span class="badge badge-${status}">${status}</span>
                ${personal ? '<span class="badge badge-personal">note</span>' : ''}
                <span>${escapeHtml(p.date||'')}</span>
              </div>
            </div>
            <div class="actions">
              <button class="button button-secondary button-sm" data-edit="${escapeHtml(p.slug)}">Edit</button>
              <button class="button button-danger button-sm" data-del="${escapeHtml(p.slug)}">Del</button>
            </div>
          </div>`;
        }).join('');
        // The list lands asynchronously (loadPosts), independently of render(),
        // so the inspector post-count is refreshed here, where the data actually arrives.
        const loadedCount = byId('post-count');
        if (loadedCount) loadedCount.textContent = rows.length ? rows.length + ' total' : '';
      }

      document.addEventListener('DOMContentLoaded', async () => {
        // Collapsible sections
        document.querySelectorAll('.collapsible-header').forEach(h => h.addEventListener('click', () => {
          const id = h.dataset.collapse;
          const body = byId('collapse-'+id);
          h.classList.toggle('collapsed');
          body.classList.toggle('collapsed');
        }));

        // Content language tabs
        function switchContentLang(lang) {
          state.contentLang = lang;
          document.querySelectorAll('#content-lang-tabs .lang-tab').forEach(b => b.classList.toggle('active', b.dataset.lang===lang));
          document.querySelectorAll('#content-en, #content-fa').forEach(el => el.classList.toggle('active', el.id==='content-'+lang));
          document.querySelectorAll('#blocks-en, #blocks-fa').forEach(el => el.classList.toggle('active', el.id==='blocks-'+lang));
          document.querySelectorAll('#faq-en, #faq-fa').forEach(el => el.classList.toggle('active', el.id==='faq-'+lang));
        }
        renderLangTabs('content-lang-tabs', 'en', switchContentLang);
        renderLangTabs('blocks-lang-tabs', 'en', switchContentLang);
        renderLangTabs('faq-lang-tabs', 'en', switchContentLang);
        renderLangTabs('seo-lang-tabs', 'en', (lang) => {
          document.querySelectorAll('#seo-lang-tabs .lang-tab').forEach(b => b.classList.toggle('active', b.dataset.lang===lang));
          document.querySelectorAll('#seo-en, #seo-fa').forEach(el => el.classList.toggle('active', el.id==='seo-'+lang));
        });

        // Content fields sync
        LANGUAGES.forEach(l => {
          const titleEl = byId('field-title-'+l);
          const excerptEl = byId('field-excerpt-'+l);
          if (titleEl) titleEl.addEventListener('input', () => { setField('translations.'+l+'.title', titleEl.value); });
          if (excerptEl) excerptEl.addEventListener('input', () => { setField('translations.'+l+'.excerpt', excerptEl.value); });
        });

        // Quick-add blocks
        document.querySelectorAll('[data-add-block]').forEach(btn => btn.addEventListener('click', () => {
          const type = btn.dataset.addBlock;
          const lang = state.contentLang;
          state.current.translations[lang].content.push({type, text:''});
          renderBlocks(lang); syncToJson();
        }));

        // FAQ add
        byId('add-faq').addEventListener('click', () => {
          const lang = state.contentLang;
          state.current.translations[lang].faq.push({question:'', answer:''});
          renderFaq(lang); syncToJson();
        });

        // Main field sync
        byId('field-slug').addEventListener('input', () => { setField('slug', byId('field-slug').value); });
        byId('field-title').addEventListener('input', () => { setField('title', byId('field-title').value); });
        byId('field-tags').addEventListener('input', () => { setField('tags', byId('field-tags').value); });
        byId('field-status').addEventListener('change', () => { setField('status', byId('field-status').value); });
        byId('field-featured-src').addEventListener('input', () => { setField('featuredImage.src', byId('field-featured-src').value); render(); });
        byId('field-featured-alt-en').addEventListener('input', () => { setField('featuredImage.alt.en', byId('field-featured-alt-en').value); });
        byId('field-featured-alt-fa').addEventListener('input', () => { setField('featuredImage.alt.fa', byId('field-featured-alt-fa').value); });

        // Preview button
        byId('preview-post').addEventListener('click', () => {
          if (!state.current) return;
          previewLang('en');
          byId('preview-modal').style.display = 'block';
          document.body.style.overflow = 'hidden';
        });

        // Save / Delete / Duplicate / New
        byId('save-post').addEventListener('click', async () => {
          if (!state.current) return;
          const fd = new FormData(); fd.append('action','save'); fd.append('post_json', JSON.stringify(state.current));
          await fetchJson(apiBase, {method:'POST', body:fd});
          await loadPosts();
          markSaved(); toast('Saved.', 'ok');
        });
        byId('delete-post').addEventListener('click', async () => {
          if (!state.current?.slug || !confirm('Delete?')) return;
          await fetchJson(apiBase, { method: 'POST', body: new URLSearchParams({ action: 'delete', slug: state.current.slug }) });
          state.current = null; render(); await loadPosts();
        });
        byId('duplicate-post').addEventListener('click', async () => {
          if (!state.current?.slug) return;
          const fd = new FormData(); fd.append('action','duplicate'); fd.append('slug', state.current.slug);
          const r = await fetchJson(apiBase, {method:'POST', body:fd});
          if (r?.slug) { await loadPosts(); state.current = null; await loadPost(r.slug); toast('Duplicated.', 'ok'); }
        });
        byId('new-post').addEventListener('click', () => { state.current = normalizePost(defaultPost()); state.current.slug = 'new-post'; syncToJson(); render(); });

        // Post list actions
        document.body.addEventListener('click', async (e) => {
          const t = e.target;
          if (t.dataset.select || t.dataset.edit) await loadPost(t.dataset.select||t.dataset.edit);
          if (t.dataset.del && confirm('Delete?')) {
            await fetchJson(apiBase, { method: 'POST', body: new URLSearchParams({ action: 'delete', slug: t.dataset.del }) });
            if (state.current?.slug === t.dataset.del) state.current = null;
            render(); await loadPosts();
          }
        });

        // Search
        byId('search-posts').addEventListener('input', renderPostList);

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
          const v = tab.dataset.view;
          byId('editor-view').hidden = v !== 'editor';
          byId('json-view').hidden = v !== 'json';
          state.view = v;
        }));

        // Upload featured
        byId('upload-featured').addEventListener('change', async () => {
          if (!byId('upload-featured').files.length) return;
          const fd = new FormData(); fd.append('action','uploadImage'); fd.append('image_file', byId('upload-featured').files[0]);
          const r = await fetchJson(apiBase, {method:'POST', body:fd});
          state.current.featuredImage.src = r.src; syncToJson(); render();
        });

        // JSON editor
        byId('json-editor').addEventListener('input', () => {
          clearTimeout(window._jsonTimer);
          window._jsonTimer = setTimeout(() => {
            try { state.current = normalizePost(JSON.parse(byId('json-editor').value)); byId('json-error').textContent = ''; render(); }
            catch(e) { byId('json-error').textContent = e.message; }
          }, 500);
        });
        byId('export-json').addEventListener('click', () => {
          const blob = new Blob([JSON.stringify(state.current,null,2)], {type:'application/json'});
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (state.current.slug||'post')+'.json'; a.click();
        });
        byId('export-all').addEventListener('click', async () => {
          if (!confirm('Export all posts as JSON? This will include all posts with their URLs.')) return;
          const allPosts = await fetchJson(apiBase+'?action=list');
          const exportData = allPosts.map(p => ({
            slug: p.slug,
            title: p.title,
            url: window.location.origin + '/blog/' + p.slug,
            date: p.date,
            tags: p.tags,
            featuredImage: p.featuredImage
          }));
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {type:'application/json'});
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'all-posts.json'; a.click();
        });
        byId('import-json').addEventListener('click', () => byId('import-file').click());
        byId('import-file').addEventListener('change', async (e) => {
          const file = e.target.files[0]; if (!file) return;
          try { state.current = normalizePost(JSON.parse(await file.text())); syncToJson(); render(); toast('Imported', 'ok'); } catch(err) { byId('json-error').textContent = 'Invalid JSON'; }
        });

        // Side nav — scroll to sections
        document.querySelectorAll('#side-nav button').forEach(btn => btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.scroll);
          if (target) {
            // Expand collapsed section if needed
            const header = target.querySelector('.collapsible-header');
            const body = target.querySelector('.collapsible-body');
            if (header && body && header.classList.contains('collapsed')) {
              header.classList.remove('collapsed');
              body.classList.remove('collapsed');
            }
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }));

        // Global language toggle — switches ALL language tabs at once
        document.querySelectorAll('[data-global-lang]').forEach(btn => btn.addEventListener('click', () => {
          const lang = btn.dataset.globalLang;
          // Update global bar buttons
          document.querySelectorAll('[data-global-lang]').forEach(b => b.classList.toggle('active', b.dataset.globalLang === lang));
          // Trigger all section lang tabs
          document.querySelectorAll('.lang-tab').forEach(tab => {
            if (tab.dataset.lang === lang) {
              tab.click();
            }
          });
          state.contentLang = lang;
        }));

        // Init
        state.current = normalizePost(defaultPost()); render();
        async function loadPosts() { state.posts = await fetchJson(apiBase+'?action=list'); renderPostList(); }
        async function loadPost(slug) { state.current = normalizePost(await fetchJson(apiBase+'?action=get&slug='+encodeURIComponent(slug))); render(); }
        await loadPosts();
      });

/* ================================================================
         Personal-note support, layered onto the existing editor.
         Appended rather than rewritten: every original function above
         keeps its behaviour, and the blocks flow gains an HTML sibling.
         ================================================================ */

      function isPersonalPost() {
        return (state.current?.kind || 'article') === 'personal';
      }

      /** Ensures both locales carry every key the renderer and PHP expect. */
      function normalizePost(p) {
        const post = Object.assign(defaultPost(), p || {});
        post.kind = post.kind === 'personal' ? 'personal' : 'article';
        post.featuredImage = Object.assign({ src: '', alt: { en: '', fa: '' } }, post.featuredImage || {});
        post.featuredImage.alt = Object.assign({ en: '', fa: '' }, post.featuredImage.alt || {});
        post.tags = Array.isArray(post.tags) ? post.tags : [];
        post.translations = post.translations || {};
        LANGUAGES.forEach(l => {
          const tr = Object.assign(
            { title: '', excerpt: '', content: [], html: '', css: '', faq: [] },
            post.translations[l] || {}
          );
          tr.content = Array.isArray(tr.content) ? tr.content : [];
          tr.faq = Array.isArray(tr.faq) ? tr.faq : [];
          if (typeof tr.html !== 'string') tr.html = '';
          if (typeof tr.css !== 'string') tr.css = '';
          tr.seo = Object.assign(
            { title: '', metaDescription: '', canonical: '', openGraph: { image: '' }, twitter: { image: '' }, keywords: '', focusKeyword: '' },
            tr.seo || {}
          );
          post.translations[l] = tr;
        });
        return post;
      }

      function toast(message, kind) {
        const host = byId('toast-host');
        if (!host) return;
        const el = document.createElement('div');
        el.className = 'toast' + (kind ? ' ' + kind : '');
        el.textContent = message;
        host.appendChild(el);
        setTimeout(() => el.remove(), 3200);
      }

      function markDirty() {
        state.dirty = true;
        const el = byId('save-state');
        if (el) { el.className = 'save-state dirty'; el.textContent = 'Unsaved changes'; }
      }

      function markSaved() {
        state.dirty = false;
        const el = byId('save-state');
        if (el) { el.className = 'save-state saved'; el.textContent = 'Saved'; }
      }

      /** Word/heading counts for the HTML editor's live stats line. */
      function htmlStats(html) {
        const text = String(html || '')
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&[a-z]+;|&#\d+;/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const words = text ? text.split(' ').length : 0;
        const h2 = (String(html || '').match(/<h2\b/gi) || []).length;
        const h3 = (String(html || '').match(/<h3\b/gi) || []).length;
        return { words, chars: String(html || '').length, h2, h3 };
      }

      function renderHtmlStats(lang) {
        const el = byId('html-stats-' + lang);
        if (!el) return;
        const html = state.current.translations[lang]?.html || '';
        const s = htmlStats(html);
        el.innerHTML =
          `<span>words <b>${s.words}</b></span>` +
          `<span>chars <b>${s.chars}</b></span>` +
          `<span>h2 <b>${s.h2}</b></span>` +
          `<span>h3 <b>${s.h3}</b></span>`;
      }

      /** Pushes state into both HTML + CSS textareas. */
      function syncHtmlEditors() {
        LANGUAGES.forEach(l => {
          const ta = byId('html-editor-' + l);
          if (ta) {
            const val = state.current.translations[l]?.html || '';
            if (ta.value !== val) ta.value = val;
            renderHtmlStats(l);
          }
          const ca = byId('css-editor-' + l);
          if (ca) {
            const cval = state.current.translations[l]?.css || '';
            if (ca.value !== cval) ca.value = cval;
          }
        });
      }
/* Swaps blocks UI for HTML UI and keeps the kind control honest. The two
         editors coexist in state; only one is shown, so flipping the type
         back and forth never destroys authored work. */
      function applyKindVisibility() {
        const personal = isPersonalPost();
        const blocks = byId('blocks-section');
        const html = byId('html-section');
        if (blocks) blocks.hidden = personal;
        if (html) html.hidden = !personal;
        const note = byId('kind-note');
        if (note) {
          note.textContent = personal
            ? 'Personal note: authored as HTML per language, and rendered with its own layout on the blog.'
            : 'Article: built from content blocks.';
        }
        document.querySelectorAll('#kind-seg button').forEach(b => {
          b.classList.toggle('active', (b.dataset.kind || 'article') === (state.current?.kind || 'article'));
        });
        // The section index offers both; hide whichever is not in play.
        document.querySelectorAll('#side-nav button').forEach(b => {
          if (b.dataset.scroll === 'blocks-section') b.hidden = personal;
          if (b.dataset.scroll === 'html-section') b.hidden = !personal;
        });
        if (!personal) syncHtmlEditors();
      }

      function renderHtmlTabs() {
        renderLangTabs('html-lang-tabs', state.contentLang, (lang) => {
          document.querySelectorAll('#html-lang-tabs .lang-tab').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
          document.querySelectorAll('#html-en, #html-fa').forEach(el => el.classList.toggle('active', el.id === 'html-' + lang));
          const label = byId('html-lang-label');
          if (label) label.textContent = lang === 'fa' ? 'فارسی' : 'English';
          syncHtmlEditors();
        });
      }

      /** Applies a toolbar template to the active textarea's selection. */
      function wrapSelection(ta, before, after) {
        const s = ta.selectionStart, en = ta.selectionEnd;
        const selected = ta.value.slice(s, en);
        const placeholder = (before.match(/\[([^\]]+)\]/) || [, 'text'])[1];
        const inner = selected || placeholder;
        const open = before.replace(/\|.*$/, '').replace(/\[[^\]]*\]/, inner);
        const close = after.replace(/^[^|]*\|/, '');
        ta.value = ta.value.slice(0, s) + open + inner + close + ta.value.slice(en);
        ta.focus();
        ta.selectionStart = s + open.length;
        ta.selectionEnd = s + open.length + inner.length;
        ta.dispatchEvent(new Event('input'));
      }

      /** Toolbar + keyboard behaviour for the raw-HTML + CSS textareas. */
      function wireHtmlEditor(lang) {
        const ta = byId('html-editor-' + lang);
        const ca = byId('css-editor-' + lang);
        if (ca && state.current.translations[lang]) {
          // Per-post paint: plain CSS text, Tab-aware like the HTML editor.
          ca.addEventListener('input', () => {
            state.current.translations[lang].css = ca.value;
            syncToJson();
            markDirty();
          });
          ca.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            e.preventDefault();
            const s = ca.selectionStart;
            ca.value = ca.value.slice(0, s) + '  ' + ca.value.slice(ca.selectionEnd);
            ca.selectionStart = ca.selectionEnd = s + 2;
            ca.dispatchEvent(new Event('input'));
          });
        }
        if (!ta) return;
        ta.addEventListener('input', () => {
          state.current.translations[lang].html = ta.value;
          renderHtmlStats(lang);
          markDirty();
        });
        // Tab inserts two spaces; Shift+Tab dedents. Keyboard users are never
        // trapped in the editor the way a naive preventDefault would trap them.
        ta.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab') return;
          e.preventDefault();
          const s = ta.selectionStart;
          if (e.shiftKey) {
            const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
            if (ta.value.slice(lineStart, lineStart + 2) === '  ') {
              ta.value = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + 2);
              ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - 2);
            }
          } else {
            ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd);
            ta.selectionStart = ta.selectionEnd = s + 2;
          }
          ta.dispatchEvent(new Event('input'));
        });
        const pane = byId('html-' + lang);
        if (!pane) return;
        pane.querySelectorAll('.html-toolbar button').forEach(btn => btn.addEventListener('click', () => {
          if (btn.dataset.line != null) {
            const s = ta.selectionStart;
            const prefix = s > 0 && ta.value[s - 1] !== '\n' ? '\n' : '';
            ta.value = ta.value.slice(0, s) + prefix + btn.dataset.line + '\n' + ta.value.slice(ta.selectionEnd);
            ta.focus();
            ta.selectionStart = ta.selectionEnd = s + prefix.length + btn.dataset.line.length + 1;
            ta.dispatchEvent(new Event('input'));
          } else if (btn.dataset.wrap != null) {
            wrapSelection(ta, btn.dataset.wrap, btn.dataset.wrap);
          }
        }));
      }
/* Right inspector: a live search-result preview plus real counts. */
      function renderInspector() {
        const p = state.current;
        const lang = state.contentLang;
        const tr = p.translations[lang] || {};
        const seo = tr.seo || {};
        const title = seo.title || tr.title || p.title || 'Untitled post';
        const desc = seo.metaDescription || tr.excerpt || '';
        const slug = p.slug || 'new-post';

        byId('serp-url').textContent = 'sinisteroid.ir/' + lang + '/blog/' + slug + '/';
        byId('serp-title').textContent = title;
        byId('serp-desc').textContent = desc || 'No meta description yet.';

        // 60 chars is the practical title budget; ~155 the description's.
        const meter = byId('serp-meter');
        const bar = meter.querySelector('i');
        const ratio = Math.min(1, (desc.length || 0) / 155);
        bar.style.width = Math.round(ratio * 100) + '%';
        meter.className = 'meter ' + (desc.length === 0 ? 'bad' : desc.length > 165 ? 'warn' : 'good');

        const personal = isPersonalPost();
        const html = tr.html || '';
        const words = personal
          ? htmlStats(html).words
          : (tr.content || []).reduce((n, b) => n + ((b.text || '').split(/\s+/).filter(Boolean).length), 0);
        const headings = personal
          ? (html.match(/<h[23]\b/gi) || []).length
          : (tr.content || []).filter(b => b.type === 'heading').length;

        byId('stat-grid').innerHTML =
          `<div class="stat ${personal ? 'is-personal' : ''}"><b>${personal ? 'Note' : 'Article'}</b><span>Type</span></div>` +
          `<div class="stat"><b>${words}</b><span>Words</span></div>` +
          `<div class="stat"><b>${headings}</b><span>Headings</span></div>` +
          `<div class="stat"><b>${(tr.faq || []).length}</b><span>FAQ</span></div>`;

        const focus = (seo.focusKeyword || '').trim();
        const kws = (seo.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
        byId('seo-chips').innerHTML =
          (focus ? `<span class="chip is-focus">${escapeHtml(focus)}</span>` : '') +
          kws.filter(k => k !== focus).map(k => `<span class="chip">${escapeHtml(k)}</span>`).join('') ||
          '<span class="muted">No keywords set</span>';
        const count = byId('post-count');
        if (count) count.textContent = state.posts.length ? state.posts.length + ' total' : '';
      }
/* Preview-only scrub. The real trust boundary is sanitizePostHtml() in
         admin.php, which runs on save inside the authenticated POST branch;
         this is the independent client-side net for the preview surface. */
      function sanitizePreviewHtml(html) {
        return String(html || '')
          .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
          .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)\b[^>]*\/?>/gi, '')
          .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
          .replace(/(href|src)\s*=\s*("|')\s*(javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1="#"');
      }

      /** Block fallback for a note that still carries blocks (mid-switch). */
      function renderBlocksPreview(blocks) {
        return blocks.map(b => {
          const t = (v) => escapeHtml(v == null ? '' : v);
          if (b.type === 'heading') {
            const lvl = Math.min(4, Math.max(2, b.level || 2));
            return `<h${lvl}>${t(b.text)}</h${lvl}>`;
          }
          if (b.type === 'paragraph') return `<p>${t(b.text)}</p>`;
          if (b.type === 'list') {
            const tag = b.style === 'ordered' ? 'ol' : 'ul';
            return `<${tag}>${(b.items || []).map(i => `<li>${t(i)}</li>`).join('')}</${tag}>`;
          }
          if (b.type === 'image') {
            return (b.src ? `<figure><img src="${t(b.src)}" alt="${t(b.alt)}" style="width:100%;border-radius:8px;" /></figure>` : '') +
              (b.caption ? `<p class="muted">${t(b.caption)}</p>` : '');
          }
          if (b.type === 'quote') return `<blockquote>${t(b.text)}${b.author ? ' — ' + t(b.author) : ''}</blockquote>`;
          if (b.type === 'code') return `<pre>${t(b.code || b.text)}</pre>`;
          if (b.type === 'stats') {
            return `<div class="stat-grid">${(b.items || []).map(s => `<div class="stat"><b>${t(s.value)}</b><span>${t(s.label)}</span></div>`).join('')}</div>`;
          }
          if (b.type === 'alert') return `<p><strong>${t(b.title || '')}</strong> ${t(b.text)}</p>`;
          if (b.type === 'highlight') return `<p><strong>${t(b.label || '')}</strong> ${t(b.text)}</p>`;
          if (b.type === 'cta') {
            return `<div class="stat"><b>${t(b.title)}</b><span>${t(b.text)}</span></div>`;
          }
          return '';
        }).join('');
      }

      /* FAQ accordion markup, shared by the preview for both post kinds. */
      function renderPreviewFaq(faq, lang) {
        if (!faq || !faq.length) return '';
        return '<div style="margin:32px 0;">' +
          '<h3>' + (lang === 'fa' ? 'پرسش‌های متداول' : 'Frequently Asked Questions') + '</h3>' +
          faq.map(item =>
            '<div class="stat" style="margin-bottom:8px;"><b style="font-size:0.9rem;">' + escapeHtml(item.question || '') + '</b>' +
            '<span style="text-transform:none;letter-spacing:0;font-size:0.85rem;color:var(--ink-dim);">' + escapeHtml(item.answer || '') + '</span></div>'
          ).join('') +
          '</div>';
      }
      /* Personal notes render their authored HTML (plus scoped per-post paint);
         articles keep the existing block-by-block preview. */
      function personalPreviewHtml(tr, slug) {
        const css = String(tr.css || '');
        const scoped = css.trim() ? scopePreviewCss(css, slug || 'post') : '';
        const styleTag = scoped ? '<style>' + scoped + '</style>' : '';
        const html = tr.html || '';
        if (html.trim()) return styleTag + sanitizePreviewHtml(html);
        if (!(tr.content || []).length && !scoped) return '<p class="muted">No body yet.</p>';
        if (!(tr.content || []).length) return styleTag + '<p class="muted">No body yet — CSS only.</p>';
        // A note that still holds blocks (mid-switch) previews as blocks.
        return styleTag + renderBlocksPreview(tr.content || []);
      }

      /** Preview-side twin of scopePostCss() in src/lib/blog/html.ts: prefix
       *  every selector with a preview scope hook so authored paint styles the
       *  preview body without leaking into the admin chrome. Plain-text CSS
       *  only — the save-time sanitizePostCss() already ran before this. */
      function scopePreviewCss(css, slug) {
        const src = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
        const safeSlug = String(slug || 'post').replace(/[^a-z0-9-_]/gi, '-');
        const scope = '[data-preview-css="' + safeSlug + '"]';
        const scopeSelectors = (sels) => sels.split(',').map((raw) => {
          const s = raw.trim();
          if (!s) return '';
          if (s.indexOf(scope) === 0) return s;
          if (/^:root\b/i.test(s)) return s.replace(/^:root\b/i, scope);
          if (/^(html|body)\b/i.test(s)) {
            const rest = s.replace(/^(html|body)\b/i, '').trim();
            return rest ? scope + ' ' + rest : scope;
          }
          return scope + ' ' + s;
        }).filter(Boolean).join(', ');
        const findEnd = (text, from) => {
          let depth = 0;
          for (let k = from; k < text.length; k++) {
            if (text[k] === '{') depth++;
            else if (text[k] === '}') { depth--; if (depth === 0) return k; }
          }
          return -1;
        };
        const walk = (text, depth) => {
          if (depth > 4 || !text) return '';
          let out = '';
          let i = 0;
          while (i < text.length) {
            while (i < text.length && /\s/.test(text[i])) i++;
            if (i >= text.length || text[i] === '}') break;
            if (text[i] === '@') {
              let j = i;
              while (j < text.length && text[j] !== '{' && text[j] !== ';') j++;
              const header = text.slice(i, j).trim();
              if (text[j] === ';') { out += header + ';'; i = j + 1; continue; }
              if (j >= text.length) break;
              const end = findEnd(text, j);
              if (end === -1) break;
              const inner = text.slice(j + 1, end);
              out += /^@(media|supports|container|layer)\b/i.test(header)
                ? header + '{' + walk(inner, depth + 1) + '}'
                : header + '{' + inner + '}';
              i = end + 1;
              continue;
            }
            let j = i;
            while (j < text.length && text[j] !== '{') j++;
            if (j >= text.length) break;
            const sels = text.slice(i, j).trim();
            const end = findEnd(text, j);
            if (end === -1) break;
            if (sels) out += scopeSelectors(sels) + '{' + text.slice(j + 1, end) + '}';
            i = end + 1;
          }
          return out;
        };
        return walk(src, 0);
      }
/* ---- Overrides -------------------------------------------------------
         These wrap the original functions rather than replacing them, so
         the block flow, FAQ, SEO and JSON panes keep their exact behaviour
         and only gain the personal-note branch. */

      const _render = render;
      render = function () {
        state.current = normalizePost(state.current);
        _render();
        applyKindVisibility();
        syncHtmlEditors();
        renderHtmlTabs();
        renderInspector();
        markSaved();
      };

      renderPreviewContent = function (data, lang) {
        const tr = (data.translations || {})[lang] || {};
        const personal = (data.kind || 'article') === 'personal';
        const previewSlug = String(data.slug || 'post').replace(/[^a-z0-9-_]/gi, '-');
        let html =
          '<div class="preview-body" data-preview-css="' + escapeHtml(previewSlug) + '" dir="' + (lang === 'fa' ? 'rtl' : 'ltr') + '">' +
          '<h1 style="font-size:30px;font-weight:700;margin:0 0 10px;">' + escapeHtml(tr.title || '') + '</h1>' +
          '<div class="flex-wrap" style="margin-bottom:14px;">' +
          (data.date ? '<span class="muted">' + escapeHtml(data.date) + '</span>' : '') +
          (Array.isArray(data.tags) ? data.tags.map(t => '<span class="chip">' + escapeHtml(t) + '</span>').join('') : '') +
          '</div>';
        if (tr.excerpt) html += '<p style="font-size:1.05rem;">' + escapeHtml(tr.excerpt) + '</p>';
        if (data.featuredImage && data.featuredImage.src) {
          html += '<figure><img src="' + escapeHtml(data.featuredImage.src) + '" alt="" style="width:100%;border-radius:12px;margin:18px 0;" /></figure>';
        }
        html += personal
          ? personalPreviewHtml(tr, previewSlug)
          : renderBlocksPreview(tr.content || []);
        html += renderPreviewFaq(tr.faq, lang);
        return html + '</div>';
      };
      document.addEventListener('DOMContentLoaded', () => {
        // Post type switch
        document.querySelectorAll('#kind-seg button').forEach(btn => btn.addEventListener('click', () => {
          state.current.kind = btn.dataset.kind || 'article';
          applyKindVisibility();
          syncHtmlEditors();
          renderInspector();
          syncToJson();
          markDirty();
        }));

        LANGUAGES.forEach(l => wireHtmlEditor(l));

        // Keyboard: Ctrl/Cmd+S saves, Ctrl/Cmd+P previews, Esc closes.
        document.addEventListener('keydown', (e) => {
          const mod = e.ctrlKey || e.metaKey;
          if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); byId('save-post').click(); }
          else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); byId('preview-post').click(); }
          else if (e.key === 'Escape') {
            const modal = byId('preview-modal');
            if (modal && !modal.hidden) closePreview();
          }
        });

        // Warn before losing unsaved edits on navigation.
        window.addEventListener('beforeunload', (e) => {
          if (!state.dirty) return;
          e.preventDefault();
          e.returnValue = '';
        });
      });
    </script>
  </body>
</html>
