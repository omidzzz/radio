"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { getCsrfToken } from "@/lib/http/csrf";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  dir = "ltr",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [isClient, value]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-csrf-token": getCsrfToken() },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        console.error("Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleImageClick = useCallback(async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const url = await handleImageUpload(file);
        if (url) {
          execCommand("insertImage", url);
        }
      }
    };
  }, [handleImageUpload, execCommand]);

  const alignImage = useCallback((align: "left" | "center" | "right") => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let img: HTMLImageElement | null = null;

    // Check if selection is inside an image
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
      const el = range.startContainer as HTMLElement;
      img = el.closest("img");
    }
    // Check if an image is selected directly
    if (!img && range.startContainer.parentElement) {
      img = range.startContainer.parentElement.closest("img");
    }
    // Fallback: find the image nearest to the caret
    if (!img) {
      const imgs = editor.querySelectorAll("img");
      for (const i of imgs) {
        const rect = i.getBoundingClientRect();
        const caretRect = range.getBoundingClientRect();
        if (caretRect && rect.left <= caretRect.left && caretRect.left <= rect.right) {
          img = i as HTMLImageElement;
          break;
        }
      }
    }

    if (img) {
      img.classList.remove("align-left", "align-center", "align-right");
      if (align !== "center") img.classList.add(`align-${align}`);
      onChange(editor.innerHTML);
    }
  }, [onChange]);

  if (!isClient) {
    // Render a consistent placeholder that matches what the editor renders after mount,
    // to avoid hydration mismatches.
    return (
      <div className={`rich-text-editor ${dir === "rtl" ? "rtl" : "ltr"}`}>
        <div className="editor-toolbar">
          <select defaultValue="" disabled>
            <option value="" disabled>Paragraph</option>
          </select>
        </div>
        <div className="editor-content" style={{ direction: dir }}>
          {value ? <div dangerouslySetInnerHTML={{ __html: value }} /> : placeholder}
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${dir === "rtl" ? "rtl" : "ltr"}`}>
      <style jsx global>{`
        .rich-text-editor {
          direction: ${dir};
        }
        .rich-text-editor .ql-toolbar {
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-radius: 0.5rem 0.5rem 0 0;
          background: rgba(15, 23, 42, 0.8);
        }
        .rich-text-editor .ql-container {
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          min-height: 200px;
          font-family: "Vazirmatn", sans-serif;
          font-size: 16px;
        }
        .rich-text-editor .ql-editor {
          color: #fff;
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.5);
          font-style: normal;
        }
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          display: inline-block;
          vertical-align: middle;
          margin: 0.25rem 0.5rem;
        }
        .rich-text-editor img.align-left {
          float: left;
          margin: 0.5rem 1rem 0.5rem 0;
          max-width: 50%;
        }
        .rich-text-editor img.align-right {
          float: right;
          margin: 0.5rem 0 0.5rem 1rem;
          max-width: 50%;
        }
        .rich-text-editor img.align-center {
          display: block;
          margin: 1rem auto;
          max-width: 100%;
        }
        .rich-text-editor a {
          color: #4c9b7a;
        }
        .rich-text-editor h1,
        .rich-text-editor h2,
        .rich-text-editor h3 {
          color: #fff;
          font-weight: 600;
        }
        .rich-text-editor p {
          color: rgba(255, 255, 255, 0.9);
        }
        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px;
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-radius: 0.5rem 0.5rem 0 0;
          background: rgba(15, 23, 42, 0.8);
        }
        .editor-toolbar button {
          padding: 6px 10px;
          background: rgba(26, 115, 82, 0.1);
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          font-size: 14px;
          min-width: 32px;
          transition: all 0.2s;
        }
        .editor-toolbar button:hover {
          background: rgba(26, 115, 82, 0.3);
          color: #4c9b7a;
        }
        .editor-toolbar button.active {
          background: rgba(26, 115, 82, 0.4);
          color: #4c9b7a;
        }
        .editor-toolbar select {
          padding: 6px 10px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          font-size: 14px;
        }
        .editor-content {
          border: 1px solid rgba(26, 115, 82, 0.3);
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          min-height: 200px;
          padding: 16px;
          color: #fff;
          font-size: 16px;
          line-height: 1.6;
        }
        .editor-content:focus {
          outline: none;
        }
        .editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          display: inline-block;
          vertical-align: middle;
          margin: 0.25rem 0.5rem;
        }
        .editor-content img.align-left {
          float: left;
          margin: 0.5rem 1rem 0.5rem 0;
          max-width: 50%;
        }
        .editor-content img.align-right {
          float: right;
          margin: 0.5rem 0 0.5rem 1rem;
          max-width: 50%;
        }
        .editor-content img.align-center {
          display: block;
          margin: 1rem auto;
          max-width: 100%;
        }
        .editor-content a {
          color: #4c9b7a;
        }
        .editor-content h1,
        .editor-content h2,
        .editor-content h3 {
          color: #fff;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        .editor-content p {
          margin: 0.5rem 0;
        }
        .editor-content ul,
        .editor-content ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
      `}</style>
      <div className="editor-toolbar">
        <select
          onChange={(e) => execCommand("formatBlock", e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <button
          type="button"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => execCommand("strikeThrough")}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        >
          →
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          title="Insert Image"
        >
          🖼️
        </button>
        <button
          type="button"
          onClick={() => alignImage("left")}
          title="Align Image Left"
        >
          ⬅️
        </button>
        <button
          type="button"
          onClick={() => alignImage("center")}
          title="Align Image Center"
        >
          ⬆️
        </button>
        <button
          type="button"
          onClick={() => alignImage("right")}
          title="Align Image Right"
        >
          ➡️
        </button>
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          title="Clear Formatting"
        >
          ✕
        </button>
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => {
          const target = e.target as HTMLDivElement;
          onChange(target.innerHTML);
        }}
        onBlur={(e) => {
          const target = e.target as HTMLDivElement;
          onChange(target.innerHTML);
        }}
        data-placeholder={placeholder}
        style={{ direction: dir }}
      />
    </div>
  );
}
