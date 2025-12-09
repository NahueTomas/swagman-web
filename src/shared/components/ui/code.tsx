import type { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";

import { memo, useCallback, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Define custom theme once to avoid recreating on every mount
let themeRegistered = false;
const registerTheme = (monaco: typeof import("monaco-editor")) => {
  if (themeRegistered) return;

  monaco.editor.defineTheme("swagman-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // JSON specific colors - dark theme
      { token: "string.key.json", foreground: "#7dd3fc" }, // Sky-300
      { token: "string.value.json", foreground: "#86efac" }, // Green-300
      { token: "number.json", foreground: "#fbbf24" }, // Amber-400
      { token: "keyword.json", foreground: "#c084fc" }, // Purple-400

      // General language tokens - dark theme
      { token: "comment", foreground: "#6b7280", fontStyle: "italic" }, // Gray-500
      { token: "keyword", foreground: "#c084fc" }, // Purple-400
      { token: "string", foreground: "#86efac" }, // Green-300
      { token: "number", foreground: "#fbbf24" }, // Amber-400
      { token: "type", foreground: "#7dd3fc" }, // Sky-300
      { token: "function", foreground: "#fb7185" }, // Rose-400
      { token: "variable", foreground: "#e2e8f0" }, // Slate-200
      { token: "tag", foreground: "#7dd3fc" }, // Sky-300
      { token: "attribute.name", foreground: "#fbbf24" }, // Amber-400
      { token: "attribute.value", foreground: "#86efac" }, // Green-300
    ],
    colors: {
      // Dark theme colors matching HeroUI
      focusBorder: "#ffffff00",
      "editor.background": "#ffffff00", // zinc-900 (content1 background)
      "editor.foreground": "#f4f4f5", // zinc-100 (foreground)
      "editorLineNumber.foreground": "#71717a", // zinc-500
      "editorLineNumber.activeForeground": "#a1a1aa", // zinc-400
      "editor.selectionBackground": "#3f3f46", // zinc-700
      "editor.inactiveSelectionBackground": "#27272a", // zinc-800
      "editorCursor.foreground": "#60a5fa", // blue-400
      "editor.lineHighlightBackground": "#27272a", // zinc-800
      "editorWhitespace.foreground": "#52525b", // zinc-600
      "editorIndentGuide.background": "#3f3f46", // zinc-700
      "editorIndentGuide.activeBackground": "#52525b", // zinc-600
      "editor.findMatchBackground": "#065f46", // emerald-800
      "editor.findMatchHighlightBackground": "#047857", // emerald-700
      "editorBracketMatch.background": "#3f3f46", // zinc-700
      "editorBracketMatch.border": "#60a5fa", // blue-400
      "scrollbarSlider.background": "#52525b", // zinc-600
      "scrollbarSlider.hoverBackground": "#71717a", // zinc-500
      "scrollbarSlider.activeBackground": "#a1a1aa", // zinc-400
    },
  });

  themeRegistered = true;
};

const handleEditorWillMount: BeforeMount = (monaco) => {
  registerTheme(monaco);
};

export interface CodeProps {
  value: string;
  language?:
    | "json"
    | "xml"
    | "javascript"
    | "typescript"
    | "html"
    | "css"
    | "yaml"
    | "sql"
    | "plaintext";
  height?: string;
  minHeight?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  main?: boolean;
}

// Simple language mapping - no memoization needed for this simple operation
const getLanguageMapping = (language: string) => {
  switch (language) {
    case "json":
    case "xml":
    case "javascript":
    case "typescript":
    case "html":
    case "css":
    case "yaml":
    case "sql":
      return language;
    default:
      return "plaintext";
  }
};

export const Code = memo<CodeProps>(
  ({
    value,
    language = "plaintext",
    height,
    minHeight,
    readOnly = true,
    onChange,
    main = false,
  }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [autoHeightState, setAutoHeightState] = useState<number>(100);

    const handleEditorChange: OnChange = useCallback(
      (newValue) => {
        if (newValue !== undefined && onChange) {
          onChange(newValue);
        }
      },
      [onChange]
    );

    const mappedLanguage = getLanguageMapping(language);

    const getContainerClass = () => {
      const baseClass = "w-full";
      const borderClass = readOnly
        ? "border border-divider"
        : "border border-primary/50";
      const bgClass = readOnly ? "" : "bg-primary/5 hover:shadow-md";
      const roundedClass = "rounded-lg";

      if (height === "100%") {
        return `${baseClass} h-full transition-height duration-200 ease-out`;
      }

      return `${baseClass} ${borderClass} ${bgClass} ${roundedClass}`;
    };

    const handleEditorMount: OnMount = useCallback(
      (editor) => {
        editorRef.current = editor;

        if (!height) {
          const updateHeight = () => {
            const contentHeight = editor.getContentHeight();

            setAutoHeightState(contentHeight); // Match top + bottom padding
          };

          updateHeight();
          editor.onDidContentSizeChange(updateHeight);
        }
      },
      [height]
    );

    return (
      <div
        className={getContainerClass()}
        style={
          height
            ? { height }
            : {
                minHeight: minHeight ? minHeight : undefined,
                height: `${autoHeightState + 2}px`,
                overflow: "hidden",
              }
        }
      >
        <div
          style={
            height
              ? { height }
              : {
                  height: `${autoHeightState + 20}px`,
                  minHeight: minHeight ? minHeight : undefined,
                }
          }
        >
          <Editor
            beforeMount={handleEditorWillMount}
            height="100%"
            language={mappedLanguage}
            options={{
              readOnly,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: "on",
              wordWrap: "off",
              fontFamily:
                "monospace, 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New'",
              scrollbar: {
                vertical: !height ? "hidden" : "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                alwaysConsumeMouseWheel: main,
              },
              stickyScroll: { enabled: false },
              contextmenu: false,
              folding: true,
              renderLineHighlight: "none",
              padding: { top: 8, bottom: 8 },
              ...(height
                ? {}
                : {
                    overviewRulerLanes: 0,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                  }),
              mouseWheelScrollSensitivity: 1,
            }}
            theme={"swagman-dark"}
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
          />
        </div>
      </div>
    );
  }
);

Code.displayName = "Code";
