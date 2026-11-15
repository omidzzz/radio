"use client";

import { useState } from "react";
import JsonView from "./JsonView";

interface SeoFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SeoField({ label, value, onChange, placeholder }: SeoFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary"
      />
    </div>
  );
}

interface SeoFieldsProps {
  fa: {
    title: string;
    description: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    image: string;
    keywords: string;
    focusKeyword: string;
  };
  onChange: (seo: any) => void;
}

export default function SeoFields({ fa, onChange }: SeoFieldsProps) {
  const [showJson, setShowJson] = useState(false);

  const update = (key: string, value: string) => {
    onChange({ ...fa, [key]: value });
  };

  const renderLocale = (locale: "fa" | "en") => (
    <div>
      <h4 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
        {locale === "fa" ? "FA" : "EN"}
      </h4>
      <div className="space-y-2">
        <SeoField label="Title" value={fa.title} onChange={(v) => update("title", v)} />
        <SeoField label="Meta Description" value={fa.description} onChange={(v) => update("description", v)} />
        <SeoField label="Canonical URL" value={fa.canonical} onChange={(v) => update("canonical", v)} />
        <SeoField label="Open Graph Title" value={fa.ogTitle} onChange={(v) => update("ogTitle", v)} />
        <SeoField label="Open Graph Description" value={fa.ogDescription} onChange={(v) => update("ogDescription", v)} />
        <SeoField label="Open Graph Image" value={fa.ogImage} onChange={(v) => update("ogImage", v)} />
        <SeoField label="Twitter Title" value={fa.twitterTitle} onChange={(v) => update("twitterTitle", v)} />
        <SeoField label="Twitter Description" value={fa.twitterDescription} onChange={(v) => update("twitterDescription", v)} />
        <SeoField label="OG / Twitter Image" value={fa.image} onChange={(v) => update("image", v)} />
        <SeoField label="Keywords" value={fa.keywords} onChange={(v) => update("keywords", v)} />
        <SeoField label="Focus Keyword" value={fa.focusKeyword} onChange={(v) => update("focusKeyword", v)} />
      </div>
    </div>
  );

  return (
    <div className="border border-border rounded-xl p-4 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">SEO</h3>
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs text-primary hover:underline"
        >
          {showJson ? "Hide JSON" : "Edit JSON"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {renderLocale("fa")}
        {renderLocale("en")}
      </div>

      {showJson && (
        <div className="mt-4">
          <JsonView data={fa} title="SEO JSON" />
        </div>
      )}
    </div>
  );
}
