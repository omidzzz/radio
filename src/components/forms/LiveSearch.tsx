"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { SearchResult } from "@/lib/services/search-service";

export default function LiveSearch({ locale }: { locale: Locale }) {
  const [results,setResults]=useState<SearchResult[]>([]),[status,setStatus]=useState("empty");
  const fa=locale==="fa";
  useEffect(()=>{
    const q=new URLSearchParams(location.search).get("q")?.trim();
    const field=document.querySelector<HTMLInputElement>('input[type="search"][name="q"]');
    if(field)field.value=q??"";
    if(!q || q.length<2)return;
    const c=new AbortController();setStatus("loading");
    fetch(`/api/search.php?locale=${locale}&limit=20&q=${encodeURIComponent(q)}`,{cache:"no-store",signal:c.signal})
      .then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(!c.signal.aborted){setResults(d.results);setStatus("ready");}})
      .catch(()=>{if(!c.signal.aborted)setStatus("error");});return ()=>c.abort();
  },[locale]);
  return <section className="mx-auto max-w-4xl space-y-4 px-4 py-16" aria-live="polite">
    {status==='loading'? (fa?'در حال جستجو…':'Searching…') : status==='error'?(fa?'جستجو در دسترس نیست.':'Search is unavailable.') : status==='empty'?(fa?'عبارت جستجو را وارد کنید.':'Enter a search term.') : !results.length?(fa?'نتیجه‌ای یافت نشد.':'No results found.'):null}
    {results.map(r=><a href={r.url} key={r.id} className="site-card block rounded-2xl p-5"><h2 className="text-lg font-semibold">{r.title}</h2><p className="mt-2 text-text-secondary">{r.context}</p></a>)}
  </section>;
}