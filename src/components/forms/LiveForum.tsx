"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, formatDate } from "@/lib/i18n";
import NewPostForm from "./NewPostForm";
import ReplyForm from "./ReplyForm";

interface Topic { id: number; title: string; author_name: string; content: string; excerpt: string; reply_count: number; created_at: string }
interface ResponseData { posts?: Topic[]; page?: number; pages?: number; post?: Topic; replies?: {id: number; author_name: string; content: string; is_admin: number}[] }

export default function LiveForum({ locale }: { locale: Locale }) {
  const fa = locale === "fa", dict = getDictionary(locale).forum, base = `/${locale}/forum/`;
  const [data, setData] = useState<ResponseData | null>(null), [error, setError] = useState(false), [version, setVersion] = useState(0);
  const [category, setCategory] = useState("all"), [sort, setSort] = useState("newest");
  const search = (page: number, cat = category, order = sort) => `${base}?${new URLSearchParams({page:String(page),category:cat,sort:order})}`;
  useEffect(() => {
    const q = new URLSearchParams(window.location.search), controller = new AbortController();
    setCategory(q.get("category") || "all"); setSort(q.get("sort") || "newest");
    if(q.has("topic")) q.set("id", q.get("topic")!);
    setError(false);
    fetch(`/api/forum-posts.php?${q}`, { cache:"no-store", signal:controller.signal })
      .then(r=>{if(!r.ok) throw Error();return r.json();}).then(value=>{if(!controller.signal.aborted)setData(value);})
      .catch(()=>{if(!controller.signal.aborted)setError(true);});
    return ()=>controller.abort();
  }, [version]);
  return <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6" dir={fa?"rtl":"ltr"}>
    {error ? <div role="status"><p>{fa?"بارگذاری انجمن ممکن نشد.":"This discussion could not be loaded."}</p><a href={base}>{dict.title}</a> · <button onClick={()=>setVersion(v=>v+1)}>{fa?"تلاش دوباره":"Retry"}</button></div> : !data ? <p role="status">{fa?"در حال بارگذاری…":"Loading discussions…"}</p> : data.post ? <div className="mx-auto max-w-3xl space-y-6">
      <a className="underline" href={base}>{dict.title}</a><article className="site-card rounded-2xl p-6"><h2 className="text-2xl font-bold">{data.post.title}</h2><p className="my-2 text-sm">{data.post.author_name} · {formatDate(data.post.created_at, locale)}</p><p className="whitespace-pre-line">{data.post.content}</p></article>
      {data.replies?.map(r=><article key={r.id} className="border-s-2 border-primary ps-4"><strong>{r.author_name}</strong>{Number(r.is_admin)===1 && <small> · {fa?"تیم درمان":"Clinic staff"}</small>}<p className="whitespace-pre-line">{r.content}</p></article>)}
      <ReplyForm postId={data.post.id} onReply={()=>setVersion(v=>v+1)} />
    </div> : <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"><div>
      <h2 className="text-2xl font-bold">{dict.recentQuestions}</h2><div className="my-4 flex flex-wrap gap-3">
        <select aria-label={fa?"دسته‌بندی":"Category"} value={category} onChange={e=>location.assign(search(1,e.target.value))} className="form-control"><option value="all">{fa?"همه":"All topics"}</option>{Object.entries(dict.categories).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>
        <select aria-label={fa?"مرتب‌سازی":"Sort"} value={sort} onChange={e=>location.assign(search(1,category,e.target.value))} className="form-control"><option value="newest">{fa?"جدیدترین":"Newest"}</option><option value="replies">{fa?"بیشترین پاسخ":"Most replies"}</option></select></div>
      {!data.posts?.length && <p>{fa?"هنوز پرسشی ثبت نشده است.":"No questions yet."}</p>}
      {data.posts?.map(p=><a key={p.id} href={`${base}?topic=${p.id}`} className="site-card mb-3 block rounded-2xl p-5"><h3 className="text-lg font-bold">{p.title}</h3><p className="my-2 text-text-secondary">{p.excerpt}</p><small>{p.author_name} · {p.reply_count} {fa?"پاسخ":"replies"}</small></a>)}
      <nav className="flex gap-4">{Number(data.page)>1&&<a href={search(Number(data.page)-1)}>{fa?"قبلی":"Previous"}</a>}{Number(data.page)<Number(data.pages)&&<a href={search(Number(data.page)+1)}>{fa?"بعدی":"Next"}</a>}</nav>
    </div><aside id="ask-form" className="site-card self-start rounded-2xl p-6"><NewPostForm /></aside></div>}
  </section>;
}