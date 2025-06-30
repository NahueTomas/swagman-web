import { useRef } from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

import { Copy } from "./icons";

import { CodeViewerLanguage } from "@/types";

export const CodeViewer = ({
  language = CodeViewerLanguage.JSON,
  value,
  maxHeight = "100%",
}: {
  language?: CodeViewerLanguage;
  value: string;
  maxHeight?: string;
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    // Make the editor read-only
    editor.updateOptions({ readOnly: true });
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
          size="sm"
          startContent={<Copy className="size-3" />}
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
        <Editor
          beforeMount={(monaco) => {
            // Opcional: Configurar el formato para cada lenguaje
            if (language === CodeViewerLanguage.JSON) {
              monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: false,
                schemas: [],
                enableSchemaRequest: false,
              });
            }
          }}
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
          theme={"vs-dark"}
          value={value}
          onMount={handleEditorDidMount}
        />
      </Card>
    </Card>
  );
};
