"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Crepe } from "@milkdown/crepe";
import { diagram } from "@milkdown/plugin-diagram";
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
      crepe.editor.use(diagram);

      crepe.on((editorListener) => {
        editorListener.markdownUpdated((_ctx, markdown) => {
          lastEmittedRef.current = markdown;
          onChangeRef.current(markdown);
        });
      });

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
    editor.action((ctx) => {
      const current = getMarkdown()(ctx);
      if (current === value) return;
      replaceAll(value, true)(ctx);
      lastAppliedRef.current = value;
    });
  }, [value, readOnly]);

  useImperativeHandle(ref, () => ({
    insertMarkdown: (markdown: string, inline = false) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.action((ctx) => {
        insert(markdown, inline)(ctx);
      });
    },
    wrapSelection: (before: string, after: string = "") => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { from, to } = view.state.selection;
        const selected = from === to ? "" : getMarkdown({ from, to })(ctx);
        insert(`${before}${selected}${after}`, true)(ctx);
        view.focus();
      });
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
