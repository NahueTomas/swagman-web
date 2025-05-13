import { ClosedEyeIcon, EyeIcon, HeadersIcon } from "../icons";
import { FormFieldSelect } from "../form-fields/form-field-select";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { UrlSection } from "@/components/operation/url-section";
import { Subtitle } from "../subtitle";

export const Header = () => {
  const {
    operationFocused: operation,
    isFocusModeEnabled,
    toggleFocusMode,
  } = useStore((state) => state);
  const { forms, setFormValues } = useRequestForms((state) => state);

  if (!operation) return null;

  const currentValues = forms?.[operation?.id] || {
    parameters: operation.getParameterDefaultValues(),
    requestBody: operation.getRequestBody()?.getFieldDefaultValues(),
    contentType: operation.getRequestBody()?.getMimeTypes()?.[0] || null,
  };
  const acceptHeader = currentValues.parameters?.header?.Accept.value;
  const contentType = currentValues.contentType;

  const handleChange = (value: string, name: string) => {
    if (name === "Content-Type") currentValues.contentType = value;
    currentValues.parameters.header[name].value = value;
    setFormValues(operation.id, { ...currentValues });
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col justify-between w-full">
      <div className="w-full bg-background/50 backdrop-blur-xl px-8 py-2">
        <UrlSection />
      </div>
      <div className="flex flex-wrap items-start justify-between">
        <div className="flex grow bg-background/50 backdrop-blur-xl py-px px-8 border-b border-t border-divider">
          <button title="Focus/Unfocus" onClick={() => toggleFocusMode()}>
            {isFocusModeEnabled ? (
              <ClosedEyeIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 justify-end bg-background/50 backdrop-blur-xl pr-8 pl-6 pb-2 border-b border-l border-divider rounded-bl-3xl">
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
    </header>
  );
};
