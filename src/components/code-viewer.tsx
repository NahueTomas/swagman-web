import { Editor, OnMount } from "@monaco-editor/react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { useTheme } from "@heroui/use-theme";
import { tv } from "tailwind-variants";

// Creamos un wrapper para el editor usando tailwind-variants
const editorStyles = tv({
  base: "h-full w-full overflow-hidden rounded-lg editor-gradient-wrapper",
  variants: {
    language: {
      json: "editor-json",
      xml: "editor-xml",
      text: "editor-text",
    },
    hasError: {
      true: "border-2 border-[#FF72E1]",
      false: "border border-divider",
    },
    theme: {
      light: "bg-white",
      dark: "bg-[#1E1E1E]",
    },
  },
  defaultVariants: {
    hasError: false,
    theme: "light",
    language: "json",
  },
});

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
  const { theme } = useTheme();

  const handleEditorDidMount: OnMount = (editorInstance) => {
    // Make the editor read-only
    editorInstance.updateOptions({ readOnly: true });
  };

  const getLanguage = () => {
    switch (language) {
      case CodeViewerLanguage.JSON:
        return "json";
      case CodeViewerLanguage.XML:
        return "xml";
      default:
        return "plaintext";
    }
  };

  const getLanguageClass = () => {
    switch (language) {
      case CodeViewerLanguage.JSON:
        return "json";
      case CodeViewerLanguage.XML:
        return "xml";
      default:
        return "text";
    }
  };

  const onClickCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <Card
      className="space-y-3 p-3 bg-content1/10 border border-divider"
      shadow="none"
    >
      <div className="flex gap-3 justify-between items-center">
        <h6 className="text-xs font-medium text-foreground">
          {language === CodeViewerLanguage.JSON
            ? "JSON"
            : language === CodeViewerLanguage.XML
              ? "XML"
              : "TEXT"}
        </h6>
        <Button
          className="text-xs"
          size="sm"
          variant="flat"
          onClick={onClickCopy}
        >
          Copy
        </Button>
      </div>
      <Card
        shadow="none"
        style={{
          height: "auto",
          minHeight: "200px",
          maxHeight: maxHeight,
          overflow: "auto",
          border: "none",
        }}
      >
        <div
          className={editorStyles({
            theme: theme as "light" | "dark",
            language: getLanguageClass() as "json" | "xml" | "text",
          })}
        >
          <Editor
            defaultValue={value}
            height="300px"
            language={getLanguage()}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: "on",
              renderLineHighlight: "all",
              readOnly: true,
              domReadOnly: true,
              automaticLayout: true,
              fontFamily: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
            theme={theme === "dark" ? "vs-dark" : "light"}
            onMount={handleEditorDidMount}
          />
        </div>
      </Card>
    </Card>
  );
};
