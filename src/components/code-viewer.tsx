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
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

export enum CodeViewerLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}

export const CodeViewer = ({
  language = CodeViewerLanguage.JSON,
  value,
  maxHeight = "100%",
}: {
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
    <Card
      className="space-y-3 p-3 bg-content1/10 border border-divider"
      shadow="none"
    >
      <div className="flex gap-3 justify-between items-center">
        <h6 className="text-xs font-medium">{language}</h6>
        <Button size="sm" variant="flat" onClick={onClickCopy}>
          Copy
        </Button>
      </div>
      <Card
        className="border border-divider"
        shadow="none"
        style={{
          height: "auto",
          minHeight: "120px",
          maxHeight: maxHeight,
          overflow: "auto",
        }}
      >
        <div ref={editorRef} className="h-full" />
      </Card>
    </Card>
  );
};
