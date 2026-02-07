"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Crepe } from "@milkdown/crepe";
import { diagram } from "@milkdown/plugin-diagram";
import { katexOptionsCtx, math } from "@milkdown/plugin-math";
import type { Editor } from "@milkdown/kit/core";
import { editorViewCtx } from "@milkdown/kit/core";
import { insert, getMarkdown, replaceAll } from "@milkdown/utils";

interface MilkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export interface MilkdownEditorHandle {
  insertMarkdown: (markdown: string, inline?: boolean) => void;
  wrapSelection: (before: string, after?: string) => void;
}

const MilkdownEditorInner = forwardRef<MilkdownEditorHandle, MilkdownEditorProps>(
  ({ value, onChange, placeholder, className, readOnly = false }, ref) => {
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef<string>(value);
  const lastAppliedRef = useRef<string>(value);

  const { loading, get } = useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: initialValueRef.current,
      });
      crepe.setReadonly(readOnly);
      
      // Configuration pour les mathématiques
      crepe.editor
        .config((ctx) => {
          // Prevent KaTeX parse errors from crashing Milkdown rendering.
          ctx.set(katexOptionsCtx.key, {
            throwOnError: false,
            strict: "ignore",
          });
        })
        .use(diagram)
        .use(math);

      crepe.on((editorListener) => {
        editorListener.markdownUpdated((_ctx, markdown) => {
          lastEmittedRef.current = markdown;
          onChangeRef.current(markdown);
        });
      });

      // Configure Image Upload
      const uploadImage = async (file: File) => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload-subject-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const body = await response.json().catch(() => null);
            console.error("Upload Error:", body || response.statusText);
             return null;
          }

          const body = (await response.json()) as { publicUrl?: string };
          return body.publicUrl || null;
        } catch (e) {
          console.error('Upload Exception:', e);
          return null;
        }
      };

      // Try setting uploader if supported by Crepe API
      // @ts-ignore - setUploader might be dynamic or missing in types
      if (typeof crepe.setUploader === 'function') {
        // @ts-ignore
        crepe.setUploader(async (files: File[]) => {
           const uploads = await Promise.all(files.map(async (file) => {
              const url = await uploadImage(file);
              if (!url) return null;
              return { 
                src: url, 
                alt: file.name,
                title: file.name 
              };
           }));
           return uploads.filter(u => u !== null);
        });
      }

      return crepe;
    },
    [placeholder, readOnly]
  );

  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const editor = get();
    if (editor) {
      editorRef.current = editor;
    }
  }, [get, loading]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!readOnly && value === lastEmittedRef.current) return;
    if (value === lastAppliedRef.current) return;
    
    // Ajouter un délai pour éviter les conflits avec l'initialisation
    setTimeout(() => {
      try {
        editor.action((ctx) => {
          const current = getMarkdown()(ctx);
          if (current === value) return;
          replaceAll(value, true)(ctx);
          lastAppliedRef.current = value;
        });
      } catch (e) {
        console.warn("Failed to update editor content:", e);
      }
    }, readOnly ? 100 : 0);
  }, [value, readOnly]);

  useImperativeHandle(ref, () => ({
    insertMarkdown: (markdown: string, inline = false) => {
      const editor = editorRef.current;
      if (!editor) return;
      try {
        editor.action((ctx) => {
          insert(markdown, inline)(ctx);
        });
      } catch (e) {
        console.warn("Failed to insert markdown:", e);
      }
    },
    wrapSelection: (before: string, after: string = "") => {
      const editor = editorRef.current;
      if (!editor) return;
      try {
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          if (!view) return;
          const { from, to } = view.state.selection;
          const selected = from === to ? "" : getMarkdown({ from, to })(ctx);
          insert(`${before}${selected}${after}`, true)(ctx);
          view.focus();
        });
      } catch (e) {
        console.warn("Failed to wrap selection:", e);
      }
    },
  }));

  return (
    <div
      className={`milkdown-paper ${readOnly ? "milkdown-readonly" : ""} ${
        className ?? ""
      }`.trim()}
    >
      <Milkdown />
    </div>
  );
}
);
MilkdownEditorInner.displayName = "MilkdownEditorInner";

export const MilkdownEditor = forwardRef<MilkdownEditorHandle, MilkdownEditorProps>(
  (props, ref) => {
  return (
    <MilkdownProvider>
      <MilkdownEditorInner {...props} ref={ref} />
    </MilkdownProvider>
  );
}
);
MilkdownEditor.displayName = "MilkdownEditor";
