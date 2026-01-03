import { Code } from "@/shared/components/code";
import { CodeLanguage } from "@/shared/types";

export const RequestBodyCode = ({
  language = CodeLanguage.JSON,
  value = "",
  onChange,
}: {
  language: CodeLanguage;
  onChange: (value: string) => void;
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
        language={getLanguageType()}
        minHeight="200px"
        readOnly={false}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
