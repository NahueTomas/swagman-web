import { useState } from "react";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { HeadersIcon, ServerIcon } from "@/shared/components/ui/icons";
import { FormFieldSelect } from "@/shared/components/ui/form-fields/form-field-select";
import { OperationHeaderUrlSection } from "@/features/operation/operation-header-url-section";
import { OperationServers } from "@/features/operation/operation-servers";

export const OperationHeader = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const { operationFocused: operation } = useStore((state) => state);
  const { specificationUrl, specifications, setFormValues } = useRequestForms(
    (state) => state
  );

  if (!operation) return null;

  const currentValues = specifications?.[specificationUrl || ""]?.forms?.[
    operation?.id
  ] || {
    parameters: operation.getParameterDefaultValues(),
    requestBody: operation.getRequestBody()?.getFieldDefaultValues(),
    contentType: operation.getRequestBody()?.getMimeTypes()?.[0] || null,
  };
  const acceptHeader = currentValues.parameters?.header?.Accept.value;
  const contentType = currentValues.contentType;

  const handleChange = (value: string, name: string) => {
    if (name === "Content-Type") currentValues.contentType = value;
    currentValues.parameters.header[name].value = value;
    setFormValues(specificationUrl || "", operation.id, { ...currentValues });
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col justify-between w-full">
      <div className="w-full bg-background/50 backdrop-blur-xl px-8 py-2">
        <OperationHeaderUrlSection />
      </div>
      <div className="flex flex-wrap items-start justify-between">
        <div className="flex items-center gap-2 grow bg-background/50 backdrop-blur-xl py-0.5 px-8 border-b border-t border-divider">
          <button onClick={() => setIsServerModalOpen(true)}>
            <ServerIcon className="size-5" />
          </button>
        </div>

        <div className="absolute top-21 right-0 flex flex-col gap-2 justify-end bg-background/50 backdrop-blur-xl pr-8 pl-6 pb-2 border-b border-l border-divider rounded-bl-3xl">
          <div className="flex gap-2">
            <h5 className="flex items-center gap-2 text-nowrap text-xs">
              <HeadersIcon className="size-4" /> Accept
            </h5>
            <FormFieldSelect
              id={`${operation.id}-headers-accept`}
              options={operation.getResponses().accepted}
              required={true}
              size="small"
              value={acceptHeader}
              onChange={(e) => handleChange(e, "Accept")}
            />
          </div>

          {currentValues?.parameters?.header?.["Content-Type"]?.included &&
            operation?.getRequestBody()?.getMimeTypes()?.length && (
              <div className="flex gap-2">
                <h5 className="flex items-center gap-2 text-nowrap  text-xs">
                  <HeadersIcon className="size-4" /> Content-Type
                </h5>
                <FormFieldSelect
                  id={`${operation.id}-headers-content-type`}
                  options={operation.getRequestBody()?.getMimeTypes() || []}
                  required={operation.getRequestBody()?.required}
                  size="small"
                  value={contentType}
                  onChange={(e) => handleChange(e, "Content-Type")}
                />
              </div>
            )}
        </div>
      </div>

      {isServerModalOpen && (
        <OperationServers
          isOpen={isServerModalOpen}
          onClose={() => setIsServerModalOpen(false)}
        />
      )}
    </header>
  );
};
