import type { BeforeMount, OnChange } from "@monaco-editor/react";

import { memo, useMemo, useCallback } from "react";
import { Editor } from "@monaco-editor/react";

import { memoize } from "@/shared/utils/memoize";

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
  autoHeight?: boolean;
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
    autoHeight = false,
  }) => {
    // Define custom theme using beforeMount API
    const handleEditorWillMount: BeforeMount = (monaco) => {
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
          "editor.background": "#111113", // zinc-900 (content1 background)
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
      let result: string;

      if (typeof value === "string") result = value;
      else result = JSON.stringify(value, null, 2);

      // Normalize line endings: convert \r\n and \r to \n
      return result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }, [value]);

    // Memoize language mapping
    const mappedLanguage = useMemo(() => {
      return getLanguageMapping(language);
    }, [language]);

    // Memoize container class
    const containerClass = useMemo(() => {
      if (autoHeight) {
        return "w-full border border-divider overflow-hidden rounded-lg";
      }

      return height === "100%"
        ? "w-full h-full overflow-hidden"
        : "w-full border border-divider overflow-hidden rounded-lg";
    }, [height, autoHeight]);

    // Calculate height for autoHeight mode
    const editorHeight = useMemo(() => {
      if (autoHeight) {
        const lineCount = displayValue.split("\n").length;
        const lineHeight = 16; // Monaco's default line height
        const padding = 18; // top and bottom padding

        return Math.max(lineCount * lineHeight + padding, 40); // minimum 40px height
      }

      return "100%";
    }, [autoHeight, displayValue]);

    return (
      <div
        className={containerClass}
        style={
          autoHeight
            ? { height: `${editorHeight}px` }
            : height !== "100%"
              ? { height }
              : undefined
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
            automaticLayout: true,
            wordWrap: "off",
            fontFamily:
              "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace",
            scrollbar: {
              vertical: autoHeight ? "hidden" : "auto",
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
          theme={"swagman-dark"}
          value={displayValue}
          onChange={handleEditorChange}
        />
      </div>
    );
  }
);

Code.displayName = "Code";
