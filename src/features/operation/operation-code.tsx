import { useState } from "react";
import { observer } from "mobx-react-lite";

import {
  OperationCodePreview,
  SupportedLanguage,
} from "@/features/operation/operation-code-preview";
import { CardSelectableButtons } from "@/shared/components/card-selectable-buttons/card-selectable-buttons";
import { useStore } from "@/hooks/use-store";
import { OperationModel } from "@/models/operation.model";
import { CodeIcon } from "@/shared/components/icons";

const LANGUAGES: SupportedLanguage[] = [
  "cURL",
  "TypeScript",
  "JavaScript",
  "Python",
  "PHP",
];

export const OperationCode = observer(
  ({ operation }: { operation: OperationModel }) => {
    const { spec } = useStore();
    const [selectedLanguage, setSelectedLanguage] =
      useState<SupportedLanguage>("cURL");

    // Computed directly in render so MobX observer tracks every observable
    // accessed inside buildRequest (param values, server, auth, body fields).
    // useMemo would cache against stale object references and break reactivity.
    const requestPreview = spec ? spec.buildRequest(operation) : null;

    if (!requestPreview) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-divider/30 rounded-lg">
          <CodeIcon className="size-4 text-foreground-700" />
          <p className="text-[11px] text-foreground-600 italic">
            No preview available — spec not ready.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          {/* Language Selector */}
          <CardSelectableButtons
            options={LANGUAGES.map((lang) => ({
              value: lang,
              selected: selectedLanguage === lang,
            }))}
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
  }
);
