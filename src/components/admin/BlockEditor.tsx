"use client";

import { useState } from "react";
import type { BlogBlock } from "@/lib/blog/schema";

interface BlockEditorProps {
  locale: "fa" | "en";
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

const BLOCK_TYPES = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "list", label: "List" },
  { type: "image", label: "Image" },
  { type: "callout", label: "Callout" },
  { type: "quote", label: "Quote" },
  { type: "table", label: "Table" },
  { type: "code", label: "Code" },
  { type: "cta", label: "CTA" },
];

export default function BlockEditor({ locale, blocks, onChange }: BlockEditorProps) {
  const [items, setItems] = useState<BlogBlock[]>(blocks);

  const addBlock = (type: string) => {
    const newBlock: any = { type: type as any, id: `block-${Date.now()}` };
    setItems((prev: any[]) => [...prev, newBlock]);
    onChange([...items, newBlock]);
  };

  const removeBlock = (id: string) => {
    setItems((prev: any[]) => prev.filter((b) => (b as any).id !== id));
    onChange(items.filter((b) => (b as any).id !== id));
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = items.findIndex((b) => (b as any).id === id);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    setItems((prev: any[]) => {
      const newItems = [...prev];
      const [block] = newItems.splice(index, 1);
      newItems.splice(newIndex, 0, block);
      return newItems;
    });
    const newItems = [...items];
    const [block] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, block);
    onChange(newItems as BlogBlock[]);
  };

  const updateBlock = (id: string, updates: Partial<BlogBlock>) => {
    setItems((prev: any[]) => prev.map((b) => ((b as any).id === id ? { ...b, ...updates } : b)));
    onChange(items.map((b) => ((b as any).id === id ? { ...b, ...updates } : b)) as BlogBlock[]);
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Content Blocks ({locale})</h3>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((bt) => (
            <button
              key={bt.type}
              onClick={() => addBlock(bt.type)}
              className="text-xs font-medium px-2 py-1 rounded border border-border bg-surface text-text-secondary hover:bg-primary hover:text-on-primary transition"
            >
              + {bt.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-text-muted">No blocks yet. Add blocks above.</p>
      ) : (
        <div className="space-y-3">
          {items.map((block, index) => (
            <BlockNode
              key={index}
              block={block}
              locale={locale}
              index={index}
              canMove={index > 0}
              onMove={moveBlock}
              onRemove={removeBlock}
              onUpdate={updateBlock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BlockNodeProps {
  block: BlogBlock;
  locale: "fa" | "en";
  index: number;
  canMove: boolean;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<BlogBlock>) => void;
}

function BlockNode({ block, locale, index, canMove, onMove, onRemove, onUpdate }: BlockNodeProps) {
  return (
    <div className="border border-border rounded-lg p-3 bg-white/50">
      <div className="flex items-center gap-2 mb-2">
        {canMove && (
          <button onClick={() => onMove((block as any).id, -1)} className="text-xs text-text-secondary hover:text-primary p-1">↑</button>
        )}
        <span className="text-xs font-mono text-text-muted">{block.type}</span>
        {canMove && (
          <button onClick={() => onMove((block as any).id, 1)} className="text-xs text-text-secondary hover:text-primary p-1">↓</button>
        )}
        <button onClick={() => onRemove((block as any).id)} className="text-xs text-text-muted hover:text-red-600 px-1">✕</button>
      </div>
      <BlockContentRenderer block={block} locale={locale} onUpdate={onUpdate} />
    </div>
  );
}


interface BlockContentRendererProps {
  block: BlogBlock;
  locale: "fa" | "en";
  onUpdate: (id: string, updates: Partial<BlogBlock>) => void;
}

function BlockContentRenderer({ block, locale, onUpdate }: BlockContentRendererProps) {
  const update = (updates: Partial<BlogBlock>) => onUpdate((block as any).id, updates);
  switch (block.type) {
    case "heading":
      return (
        <div className="flex gap-2">
          <select value={String(block.level)} onChange={(e) => update({ level: Number(e.target.value) })} className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary">
            <option value={1}>H1</option><option value={2}>H2</option><option value={3}>H3</option><option value={4}>H4</option><option value={5}>H5</option><option value={6}>H6</option>
          </select>
          <input type="text" value={block.text || ""} onChange={(e) => update({ text: e.target.value })} placeholder="Text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "paragraph":
      return (
        <div className="flex gap-2">
          <select value={block.style || "default"} onChange={(e) => update({ style: e.target.value as any })} className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary">
            <option value="default">Default</option><option value="lead">Lead</option>
          </select>
          <input type="text" value={block.text || ""} onChange={(e) => update({ text: e.target.value })} placeholder="Text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "list":
      return (
        <div className="flex gap-2">
          <select value={block.style || "bullet"} onChange={(e) => update({ style: e.target.value as any })} className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary">
            <option value="bullet">Bullet</option><option value="ordered">Ordered</option><option value="numbered">Numbered</option>
          </select>
          <input type="text" value={block.items?.[0] || ""} onChange={(e) => { const items = [...(block.items || [])]; items[0] = e.target.value; update({ items }); }} placeholder="Item text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "image":
      return (
        <div className="flex gap-2">
          <input type="text" value={block.src || ""} onChange={(e) => update({ src: e.target.value })} placeholder="Image URL" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
          <input type="text" value={block.alt || ""} onChange={(e) => update({ alt: e.target.value })} placeholder="Alt text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "callout":
      return (
        <div className="flex gap-2">
          <select value={block.tone || "info"} onChange={(e) => update({ tone: e.target.value as any })} className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary">
            <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="danger">Danger</option>
          </select>
          <input type="text" value={block.text || ""} onChange={(e) => update({ text: e.target.value })} placeholder="Text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "quote":
      return (
        <div className="flex gap-2">
          <input type="text" value={block.text || ""} onChange={(e) => update({ text: e.target.value })} placeholder="Quote text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
          <input type="text" value={block.attribution || ""} onChange={(e) => update({ attribution: e.target.value })} placeholder="Attribution" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "table":
      return (
        <div className="space-y-2">
          <input type="text" value={block.caption || ""} onChange={(e) => update({ caption: e.target.value })} placeholder="Caption" className="w-full rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={block.headers?.[0] || ""} onChange={(e) => { const headers = [...(block.headers || [])]; headers[0] = e.target.value; update({ headers }); }} placeholder="Header 1" className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary" />
            <input type="text" value={block.headers?.[1] || ""} onChange={(e) => { const headers = [...(block.headers || [])]; headers[1] = e.target.value; update({ headers }); }} placeholder="Header 2" className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary" />
          </div>
        </div>
      );
    case "code":
      return (
        <div className="flex gap-2">
          <select value={block.language || "text"} onChange={(e) => update({ language: e.target.value as any })} className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary">
            <option value="text">Text</option><option value="json">JSON</option><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="bash">Bash</option><option value="python">Python</option>
          </select>
          <input type="text" value={block.code || ""} onChange={(e) => update({ code: e.target.value })} placeholder="Code" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    case "cta":
      return (
        <div className="flex gap-2">
          <input type="text" value={block.title || ""} onChange={(e) => update({ title: e.target.value })} placeholder="Section title" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
          <input type="text" value={block.buttonText || ""} onChange={(e) => update({ buttonText: e.target.value })} placeholder="Button text" className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-primary" />
        </div>
      );
    default:
      return null;
  }
}

