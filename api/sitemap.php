<?php
require_once __DIR__.'/db.php';
// Keep the export's canonical origin and non-blog routes, replacing build-time posts with published MySQL rows.
$doc=new DOMDocument();$file=dirname(__DIR__).'/sitemap.xml';
try {
    if(!is_file($file)||!$doc->load($file,LIBXML_NONET))throw new RuntimeException('Missing static sitemap.');
    $ns='http://www.sitemaps.org/schemas/sitemap/0.9';$root=$doc->documentElement;$base=null;
    foreach(iterator_to_array($root->getElementsByTagNameNS($ns,'url')) as $node){
        $url=$node->getElementsByTagNameNS($ns,'loc')->item(0)->textContent;$parts=parse_url($url);
        if(!$base && isset($parts['scheme'],$parts['host']))$base=$parts['scheme'].'://'.$parts['host'].(isset($parts['port'])?':'.$parts['port']:'');
        if(preg_match('~^/(fa|en)/blog/[^/]+/?$~',$parts['path']??''))$root->removeChild($node);
    }
    if(!$base)throw new RuntimeException('Missing canonical origin.');
    foreach($pdo->query("SELECT slug FROM posts WHERE status='published' ORDER BY id") as $row){
        foreach(['fa','en']as$locale){$url=$doc->createElementNS($ns,'url');$loc=$doc->createElementNS($ns,'loc');$loc->appendChild($doc->createTextNode($base."/$locale/blog/".rawurlencode($row['slug']).'/'));$url->appendChild($loc);$root->appendChild($url);}
    }
    header('Content-Type: application/xml; charset=utf-8');echo $doc->saveXML();
}catch(Throwable $e){error_log($e->getMessage());if(is_file($file)){header('Content-Type: application/xml; charset=utf-8');readfile($file);}else http_response_code(503);}