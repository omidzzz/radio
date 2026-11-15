"use client";

import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqEditorProps {
  faq: FaqItem[];
  onChange: (faq: FaqItem[]) => void;
}

export default function FaqEditor({ faq, onChange }: FaqEditorProps) {
  const [items, setItems] = useState<FaqItem[]>(faq);

  const addItem = () => {
    const id = `faq-${Date.now()}`;
    const newItems = [...items, { id, question: "", answer: "" }];
    setItems(newItems);
    onChange(newItems);
  };

  const updateItem = (id: string, field: "question" | "answer", value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    onChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">FAQ</h3>
        <button
          onClick={addItem}
          className="text-xs text-primary hover:underline"
        >
          Add Question
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(item.id, "question", e.target.value)}
                placeholder="Question"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={item.answer}
                onChange={(e) => updateItem(item.id, "answer", e.target.value)}
                placeholder="Answer"
                rows={2}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-xs text-text-muted hover:text-text-primary px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-4 text-xs text-text-muted">{items.length} FAQ item(s)</div>
      )}
    </div>
  );
}
