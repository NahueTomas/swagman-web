import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

import { Code as UnifiedCode } from "@/components/code";
import { CodeLanguage } from "@/types";

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
  const getLanguageType = (): "json" | "xml" | "plaintext" => {
    switch (language) {
      case CodeLanguage.JSON:
        return "json";
      case CodeLanguage.XML:
        return "xml";
      default:
        return "plaintext";
    }
  };

  const getLanguageTitle = (): string => {
    switch (language) {
      case CodeLanguage.JSON:
        return "JSON";
      case CodeLanguage.XML:
        return "XML";
      default:
        return "TEXT";
    }
  };

  const handleClear = () => onChange("");

  const formatContent = () => {
    if (!value.trim()) return;

    try {
      if (language === CodeLanguage.JSON) {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);

        onChange(formatted);
      }
    } catch {
      // Ignore formatting errors
    }
  };

  return (
    <Card
      className="space-y-3 bg-content1/10 border border-divider"
      shadow="none"
      style={{
        height: "600px",
        minHeight: "300px",
        maxHeight: "100%",
        resize: "vertical",
        overflow: "hidden",
      }}
    >
      <div className="flex justify-between items-center px-3 pt-3">
        <h6 className="text-xs font-medium text-foreground">
          {getLanguageTitle()}
        </h6>

        <div className="flex gap-1">
          {language === CodeLanguage.JSON && (
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

      <UnifiedCode
        height="100%"
        language={getLanguageType()}
        readOnly={false}
        value={value}
        onChange={onChange}
      />

      <h6 className="text-xs px-3 pb-3 text-foreground/50 flex justify-end">
        You can resize the editor by dragging from the bottom
      </h6>
    </Card>
  );
};
