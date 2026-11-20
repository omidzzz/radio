<?php
// Plain text only. The exported defaults define every editable field and stable anchor.
function clinicCopyDefaults(): array {
    $file = dirname(__DIR__) . '/clinic-content-defaults.json';
    if (!is_file($file)) throw new RuntimeException('Deploy the static site and API together.');
    return json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
}

function clinicCheckCopy($value, $template, string $key = '') {
    if (is_string($template)) {
        if (!is_string($value) || trim($value) === '' || mb_strlen($value) > 2000 || ($key === 'id' && $value !== $template)) {
            throw new InvalidArgumentException('Invalid text or identifier: ' . $key);
        }
        return trim($value);
    }
    if (!is_array($value)) throw new InvalidArgumentException('Invalid section: ' . $key);
    if ($key === 'sites' || $key === 'codes') {
        if (count($value) < 1 || count($value) > 20 || array_keys($value) !== range(0, count($value)-1)) throw new InvalidArgumentException('Invalid list: ' . $key);
        return array_values(array_unique(array_map(static fn($v) => clinicCheckCopy($v, '', $key), $value)));
    }
    if (count($value) !== count($template) || array_diff_key($template, $value)) throw new InvalidArgumentException('Unexpected fields in ' . $key);
    $clean = [];
    foreach ($template as $k => $v) $clean[$k] = clinicCheckCopy($value[$k], $v, (string)$k);
    return $clean;
}

function clinicPublishedCopy(PDO $pdo, string $locale): array {
    if (!in_array($locale, ['en','fa'], true)) throw new InvalidArgumentException('Invalid locale.');
    $query = $pdo->prepare('SELECT section_key, content_json, revision FROM clinic_copy WHERE locale = ?');
    $query->execute([$locale]);
    $copy = $revisions = [];
    foreach ($query as $r) {
        if (!in_array($r['section_key'], ['atlas','journey','hours'], true)) continue;
        $copy[$r['section_key']] = json_decode($r['content_json'], true, 512, JSON_THROW_ON_ERROR);
        $revisions[$r['section_key']] = (int)$r['revision'];
    }
    return ['locale' => $locale, 'copy' => $copy, 'revisions' => $revisions];
}

function clinicPublishCopy(PDO $pdo, array $body): array {
    $locale = $body['locale'] ?? ''; $section = $body['section'] ?? ''; $revision = $body['revision'] ?? null;
    $defaults = clinicCopyDefaults();
    if (!is_string($locale) || !is_string($section) || !isset($defaults[$locale][$section]) || !is_int($revision) || $revision < 0) throw new InvalidArgumentException('Invalid section or revision.');
    $copy = clinicCheckCopy($body['value'] ?? null, $defaults[$locale][$section], $section);
    $json = json_encode($copy, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    if ($revision === 0) {
        $stmt = $pdo->prepare('INSERT INTO clinic_copy(locale, section_key, content_json, revision) VALUES (?,?,?,1)');
        try { $stmt->execute([$locale,$section,$json]); }
        catch (PDOException $e) { if ($e->getCode() !== '23000') throw $e; throw new DomainException('This section changed. Reload before publishing.'); }
    } else {
        $stmt = $pdo->prepare('UPDATE clinic_copy SET content_json=?, revision=revision+1 WHERE locale=? AND section_key=? AND revision=?');
        $stmt->execute([$json,$locale,$section,$revision]);
        if (!$stmt->rowCount()) throw new DomainException('This section changed. Reload before publishing.');
    }
    return ['revision' => $revision+1];
}