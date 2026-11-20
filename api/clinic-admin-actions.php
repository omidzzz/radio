<?php
// No HTTP dispatch here: admin.php authenticates all reads and guards every mutation.
require_once __DIR__ . '/clinic-content-store.php';
require_once __DIR__ . '/clinic-schedule.php';

function clinicAdminDispatch(PDO $pdo, string $action, array $input): void {
    try { jsonResponse(clinicAdminAction($pdo, $action, $input)); }
    catch (InvalidArgumentException $e) { errorResponse($e->getMessage(), 400); }
    catch (OutOfBoundsException $e) { errorResponse($e->getMessage(), 404); }
    catch (DomainException $e) { errorResponse($e->getMessage(), 409); }
    catch (Throwable $e) { error_log('[clinic admin] '.$e->getMessage()); errorResponse('Could not complete the operation.', 500); }
}

function clinicInt($v, int $min, int $max): int {
    $n = filter_var($v, FILTER_VALIDATE_INT);
    if ($n === false || $n < $min || $n > $max) throw new InvalidArgumentException('Value out of range.');
    return $n;
}
function clinicAdminAction(PDO $db, string $action, array $b): array {
    $query = static function ($sql, $args = []) use ($db) { $q=$db->prepare($sql); $q->execute($args); return $q; };
    $id = static fn() => clinicInt($b['id'] ?? 0, 1, PHP_INT_MAX);
    $text = static function ($key, $max) use ($b) {
        $s=$b[$key] ?? null;
        if (!is_string($s) || trim($s)==='' || mb_strlen($s)>$max) throw new InvalidArgumentException('Invalid '.$key.'.');
        return trim($s);
    };
    $requireRow = static function ($sql,$args) use ($query) {
        $r=$query($sql,$args)->fetch(PDO::FETCH_ASSOC);
        if (!$r) throw new OutOfBoundsException('Record not found. Refresh the list.');
        return $r;
    };
    switch ($action) {
      case 'clinic-copy':
        $loc=$b['locale'] ?? 'fa'; $published=clinicPublishedCopy($db,$loc);
        return ['copy'=>array_replace(clinicCopyDefaults()[$loc],$published['copy']), 'revisions'=>(object)$published['revisions']];
      case 'publish-copy': return clinicPublishCopy($db,$b);
      case 'schedule':
        return ['settings'=>$requireRow('SELECT first_available_date,booking_window_days,slot_duration_minutes FROM availability_settings WHERE id=1',[]),
            'week'=>array_map('clinicDaySlot',$query('SELECT * FROM availability_day_slots ORDER BY day_of_week')->fetchAll(PDO::FETCH_ASSOC)), 'policy'=>clinicSchedule(),
            'blocks'=>$query('SELECT id, `date`, `time`, reason FROM unavailable_slots ORDER BY `date`, `time`')->fetchAll(PDO::FETCH_ASSOC)];
      case 'save-schedule':
        $first=$text('first_available_date',10); if(!clinicDate($first)) throw new InvalidArgumentException('Invalid first available date.');
        $window=clinicInt($b['booking_window_days']??null,1,365); $minutes=clinicInt($b['slot_duration_minutes']??null,10,240);
        $policy=clinicSchedule(); $rows=$b['week']??null;
        if(!is_array($rows)||count($rows)!==count($policy['weekdays'])) throw new InvalidArgumentException('Supply the complete working week.');
        $clean=[];
        foreach($rows as $r){
            if(!is_array($r)) throw new InvalidArgumentException('Invalid weekly hours.');
            $day=clinicInt($r['day_of_week']??null,0,6); $enabled=clinicInt($r['is_available']??null,0,1);
            if(!in_array($day,$policy['weekdays'],true)||isset($clean[$day])) throw new InvalidArgumentException('Invalid or repeated weekday.');
            $row=clinicDaySlot($r);
            if($enabled && (!$row['is_available']||$row['start_time']!==$r['start_time']||$row['end_time']!==$r['end_time'])) throw new InvalidArgumentException('Stay within the published clinic hours.');
            $clean[$day]=$row;
        }
        $db->beginTransaction();
        try { $query('UPDATE availability_settings SET first_available_date=?,booking_window_days=?,slot_duration_minutes=? WHERE id=1',[$first,$window,$minutes]);
            foreach($clean as $day=>$r) $query('UPDATE availability_day_slots SET is_available=?,start_time=?,end_time=? WHERE day_of_week=?',[$r['is_available'],$r['start_time'],$r['end_time'],$day]);
            $db->commit();
        } catch(Throwable $e){ $db->rollBack(); throw $e; } break;
      case 'block-slot':
        $date=$text('date',10); $time=$text('time',5); $reason=$b['reason']??'';
        if(!clinicDate($date)||!is_string($reason)||mb_strlen($reason)>255) throw new InvalidArgumentException('Invalid date or reason.');
        $row=$requireRow('SELECT * FROM availability_day_slots WHERE day_of_week=?',[(int)clinicDate($date)->format('w')]);
        $settings=$requireRow('SELECT * FROM availability_settings WHERE id=1',[]);
        if(!in_array($time,clinicSlotStarts($date,$settings,$row),true)) throw new InvalidArgumentException('Choose a valid appointment start.');
        try {$query('INSERT INTO unavailable_slots (`date`,`time`,reason) VALUES (?,?,?)',[$date,$time.':00',trim($reason)]);}
        catch(PDOException $e){if($e->getCode()!=='23000')throw $e;throw new DomainException('Already blocked.');} break;
      case 'unblock-slot':
        if(!$query('DELETE FROM unavailable_slots WHERE id=?',[$id()])->rowCount())throw new OutOfBoundsException('Block not found.'); break;
      case 'booking-status':
        $status=$b['status']??''; if(!in_array($status,['pending','confirmed','cancelled','completed'],true))throw new InvalidArgumentException('Invalid booking status.');
        $record=$requireRow('SELECT * FROM bookings WHERE id=?',[$id()]);
        if($record['status']==='cancelled' && $status!=='cancelled') throw new DomainException('A cancelled appointment must be booked again through availability.');
        $query('UPDATE bookings SET status=? WHERE id=?',[$status,$id()]); break;
      case 'moderate-comment':
        $requireRow('SELECT id FROM blog_comments WHERE id=?',[$id()]);
        $query('UPDATE blog_comments SET is_approved=? WHERE id=?',[clinicInt($b['approved']??null,0,1),$id()]); break;
      case 'thread':
        return ['post'=>$requireRow('SELECT id,title,author_name,content,category FROM forum_posts WHERE id=?',[$id()]),
          'replies'=>$query('SELECT id,author_name,content,created_at,is_admin FROM forum_replies WHERE post_id=? ORDER BY id',[$id()])->fetchAll(PDO::FETCH_ASSOC)];
      case 'save-topic':
        $cat=$b['category']??''; if(!in_array($cat,['general','treatment','support','other'],true))throw new InvalidArgumentException('Invalid category.');
        $args=[$text('title',300),$text('author_name',200),$text('content',10000),$cat];
        if(!empty($b['id'])){$requireRow('SELECT id FROM forum_posts WHERE id=?',[$id()]);$args[]=$id();$query('UPDATE forum_posts SET title=?,author_name=?,content=?,category=? WHERE id=?',$args);}
        else {$query('INSERT INTO forum_posts(title,author_name,content,category) VALUES(?,?,?,?)',$args);} break;
      case 'staff-reply':
        $requireRow('SELECT id FROM forum_posts WHERE id=?',[$id()]);
        $query('INSERT INTO forum_replies(post_id,author_name,content,is_admin) VALUES(?,?,?,1)',[$id(),$text('author_name',200),$text('content',10000)]); break;
      case 'delete-reply':
        if(!$query('DELETE FROM forum_replies WHERE id=?',[$id()])->rowCount())throw new OutOfBoundsException('Reply not found.');break;
      default: throw new InvalidArgumentException('Unknown action.');
    }
    return ['ok'=>true];
}