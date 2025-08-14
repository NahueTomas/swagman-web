import type { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";

import { memo, useMemo, useCallback, useRef, useState, useEffect } from "react";
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
    readOnly = true,
    onChange,
    main = false,
  }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [autoHeightState, setAutoHeightState] = useState<number | null>(null);
    const heightUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleEditorChange: OnChange = useCallback(
      (newValue) => {
        if (newValue !== undefined && onChange) {
          onChange(newValue);
        }
      },
      [onChange]
    );

    const mappedLanguage = getLanguageMapping(language);

    // Container styling based on height mode and editability
    const containerClass = useMemo(() => {
      const baseClass = "w-full overflow-hidden";
      const borderClass = readOnly
        ? "border border-divider"
        : "border border-primary/50";
      const bgClass = readOnly ? "" : "bg-primary/5";
      const roundedClass = "rounded-lg";
      const transitionClass = !height
        ? "transition-height duration-0 ease-out"
        : "";

      if (height === "100%") {
        return `${baseClass} h-full ${transitionClass}`;
      }

      return `${baseClass} ${borderClass} ${bgClass} ${roundedClass} ${transitionClass}`;
    }, [height, readOnly]);

    // Update height when content changes in auto-height mode
    useEffect(() => {
      if (!height && editorRef.current) {
        // Clear existing timeout
        if (heightUpdateTimeoutRef.current) {
          clearTimeout(heightUpdateTimeoutRef.current);
        }

        // Debounce height updates to prevent flickering
        heightUpdateTimeoutRef.current = setTimeout(() => {
          const editor = editorRef.current;

          if (editor) {
            const contentHeight = editor.getContentHeight();
            const newHeight = contentHeight + 2;

            setAutoHeightState(newHeight);
          }
        }, 50);
      }

      return () => {
        if (heightUpdateTimeoutRef.current) {
          clearTimeout(heightUpdateTimeoutRef.current);
        }
      };
    }, [value, height]);

    const handleEditorMount: OnMount = useCallback(
      (editor) => {
        editorRef.current = editor;

        if (!height) {
          const updateHeight = () => {
            // Clear existing timeout
            if (heightUpdateTimeoutRef.current) {
              clearTimeout(heightUpdateTimeoutRef.current);
            }

            // Debounce height updates
            heightUpdateTimeoutRef.current = setTimeout(() => {
              const contentHeight = editor.getContentHeight();

              setAutoHeightState(contentHeight + 2);
            }, 50);
          };

          updateHeight();
          editor.onDidContentSizeChange(updateHeight);
          editor.updateOptions({
            scrollbar: { vertical: "hidden" },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          });
        }
      },
      [height]
    );

    return (
      <div
        ref={containerRef}
        className={containerClass}
        style={height ? { height } : { height: `${autoHeightState}px` }}
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
            automaticLayout: true,
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
            overviewRulerLanes: !height ? 0 : undefined,
            overviewRulerBorder: !height ? false : undefined,
            hideCursorInOverviewRuler: !height ? true : undefined,
            mouseWheelScrollSensitivity: 1,
          }}
          theme={"swagman-dark"}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
        />
      </div>
    );
  }
);

Code.displayName = "Code";
