import { Select, SelectItem } from "@heroui/select";

import { ClosedEyeIcon, EyeIcon } from "../icons";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { UrlSection } from "@/components/operation/url-section";

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
    <header className="sticky top-0 z-10 flex flex-col justify-between w-full">
      <div className="w-full bg-background/50 backdrop-blur-xl px-8 py-2">
        <UrlSection />
      </div>
      <div className="flex flex-wrap items-start justify-between">
        <div className="flex grow bg-background/80 backdrop-blur-xl py-px px-8 border-b border-t border-divider">
          <button title="Focus/Unfocus" onClick={() => toggleFocusMode()}>
            {isFocusModeEnabled ? (
              <ClosedEyeIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 justify-end bg-background/50 backdrop-blur-xl pr-8 pl-6 pb-2 border-b border-l border-divider rounded-bl-3xl">
          <Select
            className="min-w-40"
            id={`${operation.id}-headers-accept`}
            isRequired={true}
            label="Accept"
            labelPlacement="outside-left"
            radius="full"
            selectedKeys={[acceptHeader as string]}
            size="sm"
            variant="bordered"
            onChange={(e) => handleChange(e.target.value, "Accept")}
          >
            {operation.getResponses().accepted.map((response) => (
              <SelectItem key={response} aria-label={response}>
                {response}
              </SelectItem>
            ))}
          </Select>

          {operation?.getRequestBody()?.getMimeTypes()?.length && (
            <Select
              className="min-w-40"
              color="primary"
              id={`${operation.id}-headers-content-type`}
              isRequired={operation.getRequestBody()?.required}
              label="Content-Type"
              radius="lg"
              selectedKeys={[contentType]}
              size="sm"
              variant="bordered"
              onChange={(e) => handleChange(e.target.value, "Content-Type")}
            >
              {operation
                .getRequestBody()
                ?.getMimeTypes()
                ?.map((contentType) => (
                  <SelectItem key={contentType} aria-label={contentType}>
                    {contentType}
                  </SelectItem>
                )) || []}
            </Select>
          )}
        </div>
      </div>
    </header>
  );
};
