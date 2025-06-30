import type { BeforeMount, OnChange } from "@monaco-editor/react";

import { memo, useMemo, useCallback } from "react";
import { Editor } from "@monaco-editor/react";

import { memoize } from "@/utils/memoize";

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

// Memoized language mapping function
const getLanguageMapping = memoize((language: string) => {
  switch (language) {
    case "json":
      return "json";
    case "xml":
      return "xml";
    case "javascript":
      return "javascript";
    case "typescript":
      return "typescript";
    case "html":
      return "html";
    case "css":
      return "css";
    case "yaml":
      return "yaml";
    case "sql":
      return "sql";
    default:
      return "plaintext";
  }
});

export const Code = memo<CodeProps>(
  ({
    value,
    language = "plaintext",
    height = "200px",
    readOnly = true,
    onChange,
    main = false,
  }) => {
    // Define custom theme using beforeMount API
    const handleEditorWillMount: BeforeMount = (monaco) => {
      // Define light theme
      monaco.editor.defineTheme("swagman-light", {
        base: "vs",
        inherit: true,
        rules: [
          // JSON specific colors - light theme
          { token: "string.key.json", foreground: "#0369a1" }, // Blue-700
          { token: "string.value.json", foreground: "#15803d" }, // Green-700
          { token: "number.json", foreground: "#c2410c" }, // Orange-700
          { token: "keyword.json", foreground: "#7c2d12" }, // Purple-700

          // General language tokens - light theme
          { token: "comment", foreground: "#6b7280", fontStyle: "italic" }, // Gray-500
          { token: "keyword", foreground: "#7c2d12" }, // Brown-800
          { token: "string", foreground: "#15803d" }, // Green-700
          { token: "number", foreground: "#c2410c" }, // Orange-700
          { token: "type", foreground: "#0369a1" }, // Blue-700
          { token: "function", foreground: "#be185d" }, // Pink-700
          { token: "variable", foreground: "#374151" }, // Gray-700
          { token: "tag", foreground: "#0369a1" }, // Blue-700
          { token: "attribute.name", foreground: "#c2410c" }, // Orange-700
          { token: "attribute.value", foreground: "#15803d" }, // Green-700
        ],
        colors: {
          // Light theme colors matching HeroUI
          "editor.background": "#ffffff",
          "editor.foreground": "#11181c", // foreground color
          "editorLineNumber.foreground": "#71717a", // zinc-500
          "editorLineNumber.activeForeground": "#52525b", // zinc-600
          "editor.selectionBackground": "#e4e4e7", // zinc-200
          "editor.inactiveSelectionBackground": "#f4f4f5", // zinc-100
          "editorCursor.foreground": "#3b82f6", // blue-500
          "editor.lineHighlightBackground": "#f9fafb", // gray-50
          "editorWhitespace.foreground": "#d4d4d8", // zinc-300
          "editorIndentGuide.background": "#e4e4e7", // zinc-200
          "editorIndentGuide.activeBackground": "#d4d4d8", // zinc-300
          "editor.findMatchBackground": "#dcfce7", // green-100
          "editor.findMatchHighlightBackground": "#bbf7d0", // green-200
          "editorBracketMatch.background": "#e0e7ff", // indigo-100
          "editorBracketMatch.border": "#3b82f6", // blue-500
          "scrollbarSlider.background": "#d1d5db", // gray-300
          "scrollbarSlider.hoverBackground": "#9ca3af", // gray-400
          "scrollbarSlider.activeBackground": "#6b7280", // gray-500
        },
      });

      // Define dark theme
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
          "editor.background": "#18181b", // zinc-900 (content1 background)
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
    };

    const handleEditorChange: OnChange = useCallback(
      (newValue) => {
        if (newValue !== undefined && onChange) {
          onChange(newValue);
        }
      },
      [onChange]
    );

    // Memoize display value to avoid re-stringifying on every render
    const displayValue = useMemo(() => {
      if (typeof value === "string") {
        return value;
      }

      return JSON.stringify(value, null, 2);
    }, [value]);

    // Memoize language mapping
    const mappedLanguage = useMemo(() => {
      return getLanguageMapping(language);
    }, [language]);

    // Memoize theme calculation
    const theme = useMemo(() => {
      const isDark = document.documentElement.classList.contains("dark");

      return isDark ? "swagman-dark" : "swagman-light";
    }, []);

    // Memoize container class
    const containerClass = useMemo(() => {
      return height === "100%"
        ? "w-full h-full border border-divider overflow-hidden bg-content1/10"
        : "w-full border border-divider overflow-hidden bg-content1/10 rounded-lg";
    }, [height]);

    return (
      <div
        className={containerClass}
        style={height !== "100%" ? { height } : undefined}
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
            wordWrap: "on",
            fontFamily:
              "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace",
            scrollbar: {
              vertical: "auto",
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
            overviewRulerLanes: 0,
            mouseWheelScrollSensitivity: 1,
          }}
          theme={theme}
          value={displayValue}
          onChange={handleEditorChange}
        />
      </div>
    );
  }
);

Code.displayName = "Code";
