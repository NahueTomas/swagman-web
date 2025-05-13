import { useEffect, useRef } from "react";
import { EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";

export enum CodeViewerLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}

export const CodeViewer = ({
  id,
  language = CodeViewerLanguage.JSON,
  value,
  maxHeight = "100%",
}: {
  id: string;
  language?: CodeViewerLanguage;
  value: string;
  maxHeight?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    const extensions: Extension[] = [
      lineNumbers(),
      keymap.of([...defaultKeymap]),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle),
      EditorView.editable.of(false), // Set as read-only
    ];

    if (language === CodeViewerLanguage.JSON) {
      extensions.push(json());
    } else if (language === CodeViewerLanguage.XML) {
      extensions.push(xml());
    }

    extensions.push(
      EditorView.theme({
        "&": {
          fontSize: "12px",
          border: "none",
          height: "100%",
          maxHeight: "100%",
        },
        "&.cm-focused": {
          outline: "none",
        },
        ".cm-gutters": {
          backgroundColor: "#f9fafb",
          border: "none",
          borderRight: "1px solid #e5e7eb",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#f1f5f9",
        },
        ".cm-content": {
          padding: "8px",
        },
        ".cm-line": {
          padding: "0 4px",
        },
        ".cm-gutterElement": {
          padding: "0 8px 0 4px",
        },
      })
    );

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, value]);

  const onClickCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div
      className="flex flex-col p-3 border border-zinc-200 rounded-md overflow-hidden"
      id={id}
    >
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-medium">
            {language === CodeViewerLanguage.JSON
              ? "JSON"
              : language === CodeViewerLanguage.XML
                ? "XML"
                : "TEXT"}
          </div>
          <button
            onClick={onClickCopy}
            className="px-3 py-1 text-xs rounded-md transition-colors bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
          >
            Copy
          </button>
        </div>
      </div>
      <div
        className="bg-white rounded-md border border-zinc-200"
        style={{
          height: "auto",
          minHeight: "120px",
          maxHeight: maxHeight,
          overflow: "auto",
        }}
      >
        <div ref={editorRef} className="h-full" />
      </div>
    </div>
  );
};
