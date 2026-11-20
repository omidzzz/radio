<?php
// The JSON file is also imported by the static site and the booking calendar.
function clinicSchedule(): array {
    static $policy;
    if ($policy === null) {
        $policy = json_decode(file_get_contents(__DIR__ . '/clinic-schedule.json'), true, 512, JSON_THROW_ON_ERROR);
    }
    return $policy;
}

function clinicNow(): DateTimeImmutable {
    return new DateTimeImmutable('now', new DateTimeZone(clinicSchedule()['timeZone']));
}

function clinicDate(string $date): ?DateTimeImmutable {
    $d = DateTimeImmutable::createFromFormat('!Y-m-d', $date, new DateTimeZone(clinicSchedule()['timeZone']));
    return $d && $d->format('Y-m-d') === $date ? $d : null;
}

function clinicDaySlot(array $row): array {
    $policy = clinicSchedule();
    $day = (int) $row['day_of_week'];
    $slot = ['day_of_week' => $day, 'is_available' => 0, 'start_time' => null, 'end_time' => null];
    $start = substr((string) ($row['start_time'] ?? ''), 0, 5);
    $end = substr((string) ($row['end_time'] ?? ''), 0, 5);
    if (!in_array($day, $policy['weekdays'], true) || (int) $row['is_available'] !== 1 ||
        !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $start) || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $end)) return $slot;
    $start = max($start, $policy['opens']);
    $end = min($end, $policy['closes']);
    return $start < $end ? ['day_of_week' => $day, 'is_available' => 1, 'start_time' => $start, 'end_time' => $end] : $slot;
}

function clinicDefaultWeek(): array {
    $policy = clinicSchedule();
    return array_map(static function ($day) use ($policy) {
        return clinicDaySlot(['day_of_week' => $day, 'is_available' => 1, 'start_time' => $policy['opens'], 'end_time' => $policy['closes']]);
    }, range(0, 6));
}

/** Common to availability GET and reservation POST, including the full slot duration. */
function clinicSlotStarts(string $date, array $settings, array $row, ?DateTimeImmutable $now = null): array {
    $d = clinicDate($date);
    $today = ($now ?? clinicNow())->setTimezone(new DateTimeZone(clinicSchedule()['timeZone']));
    $window = (int) $settings['booking_window_days'];
    $duration = (int) $settings['slot_duration_minutes'];
    if (!$d || $window < 1 || $window > 365 || $duration <= 0 || $date < $today->format('Y-m-d') ||
        $date < $settings['first_available_date'] || $date > $today->modify("+$window days")->format('Y-m-d')) return [];
    $slot = clinicDaySlot($row);
    if (!$slot['is_available'] || $slot['day_of_week'] !== (int) $d->format('w')) return [];
    $minutes = static function ($time) { return (int) substr($time, 0, 2) * 60 + (int) substr($time, 3, 2); };
    $slots = [];
    $end = $minutes($slot['end_time']);
    for ($m = $minutes($slot['start_time']); $m + $duration <= $end; $m += $duration) {
        $time = sprintf('%02d:%02d', intdiv($m, 60), $m % 60);
        if ($date !== $today->format('Y-m-d') || $time > $today->format('H:i')) $slots[] = $time;
    }
    return $slots;
}