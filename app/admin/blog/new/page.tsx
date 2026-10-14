"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/lib/i18n/client";
import RichTextEditor from "@/components/RichTextEditor";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import { csrfHeaders } from "@/lib/csrf";

export default function NewBlogPostPage() {
  const router = useRouter();
  const dict = useDictionary();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titleFA: "",
    titleEN: "",
    excerptFA: "",
    excerptEN: "",
    bodyFA: "",
    bodyEN: "",
    authorFA: "",
    authorEN: "",
    categoryFA: "",
    categoryEN: "",
    image: "",
    readMinutes: 5,
    isFeatured: false,
    isPublished: false,
    publishedAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: csrfHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blog-dark overflow-x-hidden relative">
      {/* Celestial Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_20%_40%,rgba(6,182,212,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_80%_60%,rgba(34,211,238,0.06)_0%,transparent_55%)]" />

        <svg
          className="absolute inset-0 w-full h-full opacity-55"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="stars-admin-blog"
              x="0"
              y="0"
              width="125"
              height="125"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="30" r="1" fill="#22d3ee" />
              <circle cx="55" cy="80" r="0.8" fill="#67e8f9" />
              <circle cx="95" cy="25" r="1.2" fill="#22d3ee" />
              <circle cx="35" cy="105" r="0.7" fill="#67e8f9" />
              <circle cx="110" cy="95" r="0.9" fill="#22d3ee" />
              <circle cx="75" cy="45" r="0.6" fill="#22d3ee" />
              <circle cx="40" cy="60" r="0.5" fill="#67e8f9" />
              <circle cx="100" cy="110" r="0.7" fill="#22d3ee" />
              <circle cx="15" cy="90" r="0.8" fill="#67e8f9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars-admin-blog)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            New Blog Post
          </h1>
          <p className="mt-2 text-white/70">
            Create a new blog post
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farsi Content Section */}
          <div className="rounded-3xl bg-deep/50 border border-primary/20 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Farsi Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Title (Farsi) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleFA}
                  onChange={(e) =>
                    setFormData({ ...formData, titleFA: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Excerpt (Farsi) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerptFA}
                  onChange={(e) =>
                    setFormData({ ...formData, excerptFA: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Body (Farsi) *
                </label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.bodyFA}
                    onChange={(value) => setFormData({ ...formData, bodyFA: value })}
                    placeholder="Write your article content here..."
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90">
                    Author (Farsi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorFA}
                    onChange={(e) =>
                      setFormData({ ...formData, authorFA: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90">
                    Category (Farsi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryFA}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryFA: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* English Content Section */}
          <div className="rounded-3xl bg-deep/50 border border-primary/20 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">
              English Content (Optional)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.titleEN}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEN: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Excerpt (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.excerptEN}
                  onChange={(e) =>
                    setFormData({ ...formData, excerptEN: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Body (English)
                </label>
                <textarea
                  rows={10}
                  value={formData.bodyEN}
                  onChange={(e) =>
                    setFormData({ ...formData, bodyEN: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90">
                    Author (English)
                  </label>
                  <input
                    type="text"
                    value={formData.authorEN}
                    onChange={(e) =>
                      setFormData({ ...formData, authorEN: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90">
                    Category (English)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryEN}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryEN: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="rounded-3xl bg-deep/50 border border-primary/20 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Settings
            </h2>
            <div className="space-y-4">
              <MediaLibraryPicker
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Featured Image"
              />
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.readMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      readMinutes: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-primary/30 bg-deep/50 text-primary-hover focus:ring-primary"
                  />
                  <span className="text-sm text-white">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublished: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-primary/30 bg-deep/50 text-primary-hover focus:ring-primary"
                  />
                  <span className="text-sm text-white">Published</span>
                </label>
              </div>
              {formData.isPublished && (
                <div>
                  <label className="block text-sm font-medium text-white/90">
                    Published At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedAt: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-primary/30 bg-deep/50 px-4 py-2 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-deep transition hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Post"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-primary/30 px-6 py-3 font-semibold text-white transition hover:bg-primary-hover/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}