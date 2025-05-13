import { useState } from "react";
import { Card } from "@heroui/card";

import { Subtitle } from "../subtitle";

import { CodePreview, SupportedLanguage } from "@/components/code-preview";
import { CardSelectableButtons } from "@/components/card-selectable-buttons";
import { LanguageIcon } from "@/components/icons";

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
        <Subtitle>Code Examples</Subtitle>

        {/* Language Selector */}
        <CardSelectableButtons
          options={["JavaScript", "Python", "cURL", "PHP"].map((lang) => ({
            value: lang,
            selected: selectedLanguage === lang,
          }))}
          onClick={(value: string) =>
            setSelectedLanguage(value as SupportedLanguage)
          }
        >
          <>
            <LanguageIcon className="size-4" />
            <span>Language</span>
          </>
        </CardSelectableButtons>
      </div>
      <div className="space-y-2">
        {/* Code Preview Component */}
        <Subtitle>Code Preview</Subtitle>
        <Card
          className="space-y-4 p-3 bg-content1/20 border border-divider"
          shadow="none"
        >
          <CodePreview
            language={selectedLanguage}
            requestPreview={requestPreview}
          />
        </Card>
      </div>
    </div>
  );
};
