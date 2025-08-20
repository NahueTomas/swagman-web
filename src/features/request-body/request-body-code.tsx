import { Button } from "@heroui/button";

import { Code } from "@/shared/components/ui/code";
import { CodeLanguage } from "@/shared/types";

export const RequestBodyCode = ({
  language = CodeLanguage.JSON,
  onChange,
  value = "",
  originalExample = "",
}: {
  language: CodeLanguage;
  onChange: (value: string) => void;
  value: string;
  originalExample?: string;
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

  const handleReset = () => {
    onChange(originalExample);
  };

  const handleClear = () => {
    onChange("");
  };

  const handleFormat = () => {
    try {
      if (language === CodeLanguage.JSON && value.trim()) {
        const parsed = JSON.parse(value);

        onChange(JSON.stringify(parsed, null, 2));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Invalid JSON, do nothing
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-end">
        {originalExample && (
          <Button
            isDisabled={value === originalExample}
            size="sm"
            variant="flat"
            onClick={handleReset}
          >
            Reset
          </Button>
        )}
        <Button
          isDisabled={!value.trim()}
          size="sm"
          variant="flat"
          onClick={handleClear}
        >
          Clear
        </Button>
        {language === CodeLanguage.JSON && (
          <Button
            isDisabled={!value.trim()}
            size="sm"
            variant="flat"
            onClick={handleFormat}
          >
            Format
          </Button>
        )}
      </div>
      <Code
        language={getLanguageType()}
        minHeight="200px"
        readOnly={false}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
