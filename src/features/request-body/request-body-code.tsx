import { Code } from "@/shared/components/ui/code";
import { CodeLanguage } from "@/shared/types";

export const RequestBodyCode = ({
  language = CodeLanguage.JSON,
  onChange,
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

  return (
    <div>
      <Code
        autoHeight
        language={getLanguageType()}
        readOnly={false}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
