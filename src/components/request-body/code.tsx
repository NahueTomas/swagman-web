import { useEffect, useState } from "react";
import { Editor, OnMount, OnChange } from "@monaco-editor/react";
import { editor as monacoEditor, Uri } from "monaco-editor";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTheme } from "@heroui/use-theme";
import { addToast } from "@heroui/toast";

// Add Monaco type augmentation for TypeScript
declare global {
  interface Window {
    monaco: typeof import("monaco-editor");
  }
}

export enum CodeLanguage {
  JSON = "JSON",
  XML = "XML",
  TEXT = "TEXT",
}

export const Code = ({
  language = CodeLanguage.JSON,
  onChange,
  onReset,
  value = "",
}: {
  language: CodeLanguage;
  onChange: (value: string) => void;
  onReset: () => void;
  value: string;
}) => {
  const [editor, setEditor] =
    useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const { theme } = useTheme();

  const handleClear = () => onChange("");

  const getLanguage = () => {
    switch (language) {
      case CodeLanguage.JSON:
        return "json";
      case CodeLanguage.XML:
        return "xml";
      default:
        return "plaintext";
    }
  };

  const handleEditorDidMount: OnMount = (editorInstance) => {
    setEditor(editorInstance);
    setupValidation(editorInstance);

    // Set theme and initial value
    if (theme === "dark") {
      editorInstance.updateOptions({ theme: "vs-dark" });
    }
    editorInstance.setValue(value);
  };

  const handleEditorChange: OnChange = (newValue) => {
    if (newValue !== undefined && !isFormatting) {
      onChange(newValue);
    }
  };

  const setupValidation = (
    editorInstance: monacoEditor.IStandaloneCodeEditor
  ) => {
    const monaco = window.monaco;

    if (!monaco) return;

    // Setup validation based on language
    if (language === CodeLanguage.JSON) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [],
        allowComments: false,
        trailingCommas: "error",
      });
    }

    // Listen to validation results
    monaco.editor.onDidChangeMarkers((uris: readonly Uri[]) => {
      if (!editorInstance) return;
      const editorUri = editorInstance.getModel()?.uri;

      if (!editorUri) return;

      if (uris.some((uri: Uri) => uri.toString() === editorUri.toString())) {
        const markers = monaco.editor.getModelMarkers({ resource: editorUri });

        setHasError(markers.length > 0);
      }
    });
  };

  const formatContent = () => {
    if (!editor) return;
    const content = editor.getValue();

    if (!content.trim()) return;

    try {
      setIsFormatting(true);
      let formatted = content;

      if (language === CodeLanguage.JSON) {
        formatted = JSON.stringify(JSON.parse(content), null, 2);
      } else if (language === CodeLanguage.XML) {
        formatted = formatXmlString(content);
      }

      editor.setValue(formatted);
      onChange(formatted);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Ignore formatting errors
      addToast({
        description: "Error formatting content",
        color: "danger",
      });
    } finally {
      setIsFormatting(false);
    }
  };

  // Improved XML formatter
  const formatXmlString = (xml: string): string => {
    if (!xml.trim()) return xml;

    try {
      // Preprocess XML to normalize spacing
      let content = xml
        .replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/\s+/g, " ")) // Preserve comments but normalize whitespace within them
        .replace(/>\s+</g, "><") // Remove whitespace between tags
        .replace(/\s+</g, "<") // Remove whitespace before opening tags
        .replace(/>\s+/g, ">") // Remove whitespace after closing tags
        .trim();

      let formatted = "";
      let indentLevel = 0;
      const indentChar = "  ";

      // Use a regular expression to match tags, text nodes, CDATA sections, comments, etc.
      const regex =
        /<(\/?)([^!\?><]*)(?:[^>]*?)(\/?)>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|(<!\w+)[^>]*(?:>)/g;

      let lastIndex = 0;
      let result;

      // Process each match
      while ((result = regex.exec(content)) !== null) {
        const fullMatch = result[0];
        const isClosing = result[1] === "/";
        const isSelfClosing = result[3] === "/" || fullMatch.endsWith("/>");
        const isComment = fullMatch.startsWith("<!--");
        const isCDATA = fullMatch.startsWith("<![CDATA[");
        const isDoctype =
          fullMatch.startsWith("<!DOCTYPE") ||
          fullMatch.startsWith("<!ELEMENT");
        const elementName = result[2];

        // Process text content before the current tag if any
        const textBefore = content.substring(lastIndex, result.index).trim();

        if (textBefore) {
          formatted += indentChar.repeat(indentLevel) + textBefore + "\n";
        }

        // Adjust indentation based on tag type
        if (
          isClosing &&
          !isSelfClosing &&
          !isComment &&
          !isCDATA &&
          !isDoctype
        ) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Add the tag with proper indentation
        formatted += indentChar.repeat(indentLevel) + fullMatch + "\n";

        // Increase indent level for opening tags
        if (
          !isClosing &&
          !isSelfClosing &&
          !isComment &&
          !isCDATA &&
          !isDoctype &&
          elementName
        ) {
          indentLevel++;
        }

        lastIndex = regex.lastIndex;
      }

      // Process any remaining text
      const textAfter = content.substring(lastIndex).trim();

      if (textAfter) {
        formatted += indentChar.repeat(indentLevel) + textAfter + "\n";
      }

      return formatted.trim();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // If formatting fails, return original
      // Ignore formatting errors
      addToast({
        description: "Error formatting XML",
        color: "danger",
      });

      return xml;
    }
  };

  // Update the editor when the value prop changes
  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.getValue();

    if (currentValue !== value) {
      editor.setValue(value);

      // Auto-format when value changes and has content
      if (value.trim()) {
        setTimeout(formatContent, 0);
      }
    }
  }, [value, language]);

  // Handle editor resizing
  useEffect(() => {
    if (!editor) return;

    const handleResize = () => editor.layout();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [editor]);

  return (
    <Card
      className="space-y-3 p-3 bg-content1/10 border border-divider"
      shadow="none"
    >
      <div className="flex justify-between items-center">
        <h6 className="text-xs font-medium text-foreground">
          {language === CodeLanguage.JSON
            ? "JSON"
            : language === CodeLanguage.XML
              ? "XML"
              : "TEXT"}
          {hasError && (
            <span className="ml-2 text-xs text-danger font-medium">
              Syntax error
            </span>
          )}
        </h6>

        <div className="flex gap-1">
          {(language === CodeLanguage.JSON ||
            language === CodeLanguage.XML) && (
            <Button
              className="text-xs"
              size="sm"
              variant="flat"
              onClick={formatContent}
            >
              Format
            </Button>
          )}
          <Button
            className="text-xs"
            size="sm"
            variant="flat"
            onClick={() => onReset()}
          >
            Reset
          </Button>
          <Button
            className="text-xs"
            size="sm"
            variant="flat"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>

      <Card
        className="overflow-hidden relative group"
        shadow="none"
        style={{
          height: "400px",
          minHeight: "300px",
          maxHeight: "800px",
          borderRadius: "14px",
          resize: "vertical",
        }}
      >
        <Editor
          height="100%"
          language={getLanguage()}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
          theme={"vs-dark"}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
        />
      </Card>
      <h6 className="text-xs text-foreground/50 flex justify-end">
        You can resize the editor by dragging from the bottom
      </h6>
    </Card>
  );
};
