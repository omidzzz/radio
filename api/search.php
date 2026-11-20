<?php
require_once __DIR__.'/db.php';
require_once __DIR__.'/clinic-content-store.php';
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {http_response_code(405);exit;}
$locale=($_GET['locale']??'fa')==='en'?'en':'fa'; $fa=$locale==='fa'; $term=trim((string)($_GET['q']??''));
$groups=['page'=>[], 'blog'=>[], 'forum'=>[]];
if(mb_strlen($term)<2 || mb_strlen($term)>160) jsonResponse(['results'=>[],'grouped'=>$groups]);
$limit=max(1,min(30,(int)($_GET['limit']??10)));$like='%'.strtr($term,['!'=>'!!','%'=>'!%','_'=>'!_']).'%';
$add=static function($type,$id,$title,$context,$url) use (&$groups) { $groups[$type][]=['type'=>$type,'id'=>$type.'-'.$id,'title'=>$title,'context'=>mb_substr(trim(strip_tags($context)),0,180),'url'=>$url]; };
try {
    $copy=array_replace(clinicCopyDefaults()[$locale], clinicPublishedCopy($pdo,$locale)['copy']);
    foreach(['atlas'=>"/$locale/services/#treatment-atlas",'journey'=>"/$locale/services/#treatment-journey",'hours'=>"/$locale/contact/"] as $key=>$url){
        $part=$copy[$key]; $words=[];array_walk_recursive($part,static function($v)use(&$words){if(is_string($v))$words[]=$v;});
        if(mb_stripos(implode(' ',$words),$term)!==false)$add('page',$key,$part['title']??$part['heading'],$part['introduction']??$part['days'],$url);
    }
    foreach(['about'=>['درباره ما','About'], 'services'=>['خدمات درمانی','Services'], 'contact'=>['تماس','Contact'], 'booking'=>['رزرو نوبت','Book an appointment'], 'forum'=>['انجمن','Forum'], 'blog'=>['مقالات','Blog']] as $key=>$labels){$title=$labels[$fa?0:1];if(mb_stripos($title,$term)!==false)$add('page',$key,$title,'',"/$locale/$key/");}
    $q=$pdo->prepare("SELECT id,slug,title,content_json FROM posts WHERE status='published' AND (title LIKE ? ESCAPE '!' OR content_json LIKE ? ESCAPE '!') ORDER BY date_published DESC LIMIT $limit");$q->execute([$like,$like]);
    foreach($q as $r){$tr=json_decode($r['content_json'],true)[$locale]??[];$add('blog',$r['id'],$tr['title']??$r['title'],$tr['excerpt']??'',"/$locale/blog/".rawurlencode($r['slug']).'/');}
    $q=$pdo->prepare("SELECT id,title,content FROM forum_posts WHERE title LIKE ? ESCAPE '!' OR content LIKE ? ESCAPE '!' ORDER BY id DESC LIMIT $limit");$q->execute([$like,$like]);
    foreach($q as $r)$add('forum',$r['id'],$r['title'],$r['content'],"/$locale/forum/?topic=".(int)$r['id']);
    jsonResponse(['results'=>array_slice(array_merge(...array_values($groups)),0,$limit),'grouped'=>$groups]);
}catch(Throwable $e){error_log($e->getMessage());http_response_code(500);jsonResponse(['error'=>'Search unavailable.']);}