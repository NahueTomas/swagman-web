import { useState } from "react";

import {
  OperationCodePreview,
  SupportedLanguage,
} from "@/features/operation/operation-code-preview";
import { CardSelectableButtons } from "@/shared/components/card-selectable-buttons/card-selectable-buttons";

export const OperationCode = ({
  requestPreview,
}: {
  requestPreview: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, string>;
  };
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage>("JavaScript");

  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-2">
        {/* Language Selector */}
        <CardSelectableButtons
          options={["JavaScript", "cURL", "TypeScript", "Python", "PHP"].map(
            (lang) => ({
              value: lang,
              selected: selectedLanguage === lang,
            })
          )}
          onClick={(value: string) =>
            setSelectedLanguage(value as SupportedLanguage)
          }
        />
      </div>
      <div className="space-y-2">
        {/* Code Preview Component */}
        <OperationCodePreview
          language={selectedLanguage}
          requestPreview={requestPreview}
        />
      </div>
    </div>
  );
};
