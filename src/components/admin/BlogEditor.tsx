
import { useCallback, useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/client";
import BlockEditor from "./BlockEditor";
import FaqEditor from "./FaqEditor";
import SeoFields from "./SeoFields";
import type { BlogBlock } from "@/lib/blog/schema";

interface BlogEditorProps {
  post: any;
  loading: boolean;
  onSave: (data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDuplicate: (id: number) => Promise<void>;
  onReset: () => void;
}

export default function BlogEditor({ post, loading, onSave, onDelete, onDuplicate, onReset }: BlogEditorProps) {
  const dict = useDictionary();
  const [blocksFA, setBlocksFA] = useState<BlogBlock[]>([]);
  const [blocksEN, setBlocksEN] = useState<BlogBlock[]>([]);
  const [faqFA, setFaqFA] = useState<any[]>([]);
  const [faqEN, setFaqEN] = useState<any[]>([]);
  const [seoFA, setSeoFA] = useState({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogImage: "", twitterTitle: "", twitterDescription: "", image: "", keywords: "", focusKeyword: "" });
  const [seoEN, setSeoEN] = useState({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogImage: "", twitterTitle: "", twitterDescription: "", image: "", keywords: "", focusKeyword: "" });
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [formTitleFA, setFormTitleFA] = useState("");
  const [formTitleEN, setFormTitleEN] = useState("");
  const [slug, setSlug] = useState("");
  const [excerptFA, setExcerptFA] = useState("");
  const [excerptEN, setExcerptEN] = useState("");
  const [categoryFA, setCategoryFA] = useState("");
  const [categoryEN, setCategoryEN] = useState("");
  const [authorFA, setAuthorFA] = useState("");
  const [authorEN, setAuthorEN] = useState("");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [readMinutes, setReadMinutes] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");
  const buildDocumentJson = () => {
    return JSON.stringify({
      fa: { title: formTitleFA, excerpt: excerptFA, content: blocksFA, author: authorFA, faq: faqFA, seo: seoFA },
      en: { title: formTitleEN, excerpt: excerptEN, content: blocksEN, author: authorEN, faq: faqEN, seo: seoEN },
      __meta: { category_fa: categoryFA, category_en: categoryEN, is_published: status === "published" ? 1 : 0 },
    }, null, 0);
  };

  const extractBodyFA = () => blocksFA.filter((b) => b.type === "paragraph").map((b) => b.text || "").join("\n\n");
  const extractBodyEN = () => blocksEN.filter((b) => b.type === "paragraph").map((b) => b.text || "").join("\n\n");
  const [error, setError] = useState("");
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    setSavingMessage("");

    try {
      const documentJson = buildDocumentJson();

      await onSave({
        slug,
        titleFA: formTitleFA,
        titleEN: formTitleEN,
        excerptFA,
        excerptEN,
        bodyFA: extractBodyFA(),
        bodyEN: extractBodyEN(),
        authorFA,
        authorEN,
        categoryFA,
        categoryEN,
        image,
        tags,
        readMinutes,
        isFeatured,
        isPublished: status === "published",
        publishedAt,
        documentJson,
      });

      setSavingMessage("Post saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save post.");
    } finally {
      setSaving(false);
    }
  }, [
    formTitleFA,
    formTitleEN,
    blocksFA,
    blocksEN,
    faqFA,
    faqEN,
    seoFA,
    seoEN,
    slug,
    categoryFA,
    categoryEN,
    image,
    tags,
    readMinutes,
    isFeatured,
    status,
    publishedAt,
    excerptFA,
    excerptEN,
    authorFA,
    authorEN,
    onSave,
  ]);

  useEffect(() => {
    if (!post) return;
    const document = post.document;
    const fa = document?.fa || {};
    const en = document?.en || {};
    const meta = document?.__meta || {};
    setFormTitleFA(fa.title || post.titleFA || "");
    setFormTitleEN(en.title || post.titleEN || "");
    setSlug(post.slug || "");
    setExcerptFA(fa.excerpt || post.excerptFA || "");
    setExcerptEN(en.excerpt || post.excerptEN || "");
    setCategoryFA(meta.category_fa || post.categoryFA || "");
    setCategoryEN(meta.category_en || post.categoryEN || "");
    setAuthorFA(fa.author || post.authorFA || "");
    setAuthorEN(en.author || post.authorEN || "");
    setImage(post.image || "");
    setTags("");
    setReadMinutes(post.readMinutes || 0);
    setIsFeatured(post.isFeatured);
    setStatus(post.isPublished ? "published" : "draft");
    setPublishedAt(post.publishedAt || "");
    setBlocksFA(fa.content || []);
    setBlocksEN(en.content || []);
    setFaqFA(fa.faq || []);
    setFaqEN(en.faq || []);
    setSeoFA(fa.seo || {});
    setSeoEN(en.seo || {});
  }, [post]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {savingMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{savingMessage}</div>
      )}

      {loading ? (
        <p className="text-text-muted">Loading post...</p>
      ) : post ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Title (FA)</label>
              <input type="text" value={formTitleFA} onChange={(e) => setFormTitleFA(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Title (EN)</label>
              <input type="text" value={formTitleEN} onChange={(e) => setFormTitleEN(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-post-slug" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select value={categoryFA || "general"} onChange={(e) => setCategoryFA(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary">
                <option value="general">General</option>
                <option value="treatment">Treatment</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Publish Date</label>
              <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Excerpt (FA)</label>
              <textarea rows={2} value={excerptFA} onChange={(e) => setExcerptFA(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Excerpt (EN)</label>
              <textarea rows={2} value={excerptEN} onChange={(e) => setExcerptEN(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Featured Image URL</label>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" />
            </div>
          </div>

          <BlockEditor locale="fa" blocks={blocksFA} onChange={setBlocksFA} />
          <BlockEditor locale="en" blocks={blocksEN} onChange={setBlocksEN} />
          <FaqEditor faq={faqFA} onChange={setFaqFA} />
          <FaqEditor faq={faqEN} onChange={setFaqEN} />
          <SeoFields fa={seoFA} onChange={setSeoFA} />
          <SeoFields fa={seoEN} onChange={setSeoEN} />

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary-fill px-6 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-fill-hover transition disabled:opacity-70"
            >
              {saving ? "Saving..." : (post.id ? "Update Post" : "Create Post")}
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm text-text-secondary hover:bg-accent transition"
            >
              Reset
            </button>
            {post.id && (
              <button
                onClick={() => onDuplicate(post.id)}
                disabled={saving}
                className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm text-text-secondary hover:bg-accent hover:text-text-primary transition disabled:opacity-70"
              >
                Duplicate
              </button>
            )}
            {post.id && (
              <button
                onClick={() => onDelete(post.id)}
                className="rounded-lg border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-text-muted">Select a post or create a new one.</p>
      )}
    </div>
  );
}

