import { observer } from "mobx-react-lite";

import { cn } from "@/shared/utils/cn";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { RequestBodyField } from "@/models/request-body-field";
import { FormFieldCheckbox } from "@/shared/components/form-field-checkbox/form-field-checkbox";
import { Chip } from "@/shared/components/chip";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";

export const RequestBodyRow = observer(
  ({
    id,
    requestBodyField,
  }: {
    requestBodyField: RequestBodyField;
    id?: string;
  }) => {
    const schemaType = requestBodyField.schema.type || "any";
    const schemaFormat = requestBodyField.schema.format;

    const FormFieldComponent = requestBodyField.schema
      ? getFormFieldComponent(requestBodyField.schema)
      : null;

    return (
      <tr className="transition-colors h-9 border-b border-divider hover:bg-background-950/20 last:border-none">
        {/* 1. Inclusion Checkbox */}
        <td className="px-3 py-0.5 align-middle">
          <FormFieldCheckbox
            id={`body-${id}`}
            size="sm"
            value={requestBodyField.included}
            onChange={(check) => requestBodyField.setIncluded(check)}
          />
        </td>

        {/* 2. Field Name & Required Indicator */}
        <td className="px-3 py-0.5 align-middle">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-mono transition-colors",
                requestBodyField.included
                  ? "text-foreground-200"
                  : "text-foreground-500"
              )}
            >
              {requestBodyField.name}
            </span>
            {requestBodyField.required && (
              <span
                className="text-danger-500 text-[10px] font-bold"
                title="Required"
              >
                *
              </span>
            )}
          </div>
        </td>

        {/* 3. Dynamic Form Field (Value) */}
        <td className="py-0.5 align-middle">
          {requestBodyField.included && FormFieldComponent ? (
            <div className="min-w-0">
              <FormFieldComponent
                id={id}
                options={(requestBodyField.schema?.enum as string[]) || []}
                placeholder={requestBodyField.name}
                required={requestBodyField.required}
                value={requestBodyField.value}
                onChange={(v) => requestBodyField.setValue(v)}
              />
            </div>
          ) : (
            <span className="text-xs italic font-bold text-foreground-500 px-3">
              Disabled
            </span>
          )}
        </td>

        {/* 4. Schema Type Display */}
        <td className="px-3 py-0.5 align-middle">
          <div className="flex items-center">
            <Chip
              label={`${schemaType}${
                requestBodyField.schema?.items &&
                typeof requestBodyField.schema.items === "object" &&
                "type" in requestBodyField.schema.items
                  ? ` <${requestBodyField.schema.items.type}>`
                  : ""
              }`}
              radius="md"
              size="xxs"
              variant="default"
            />
          </div>
        </td>

        {/* 4. Schema Format Display */}
        <td className="px-3 py-0.5 align-middle">
          {schemaFormat ? (
            <Chip
              label={schemaFormat}
              radius="md"
              size="xxs"
              variant="default"
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>

        {/* 5. Description */}
        <td className="py-0.5 pr-3 align-baseline max-w-xs">
          {requestBodyField.schema.description ? (
            <SanitizedMarkdown
              className="w-full h-full text-xs text-foreground-500 leading-relaxed px-3 py-1.5"
              content={requestBodyField.schema.description}
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>
      </tr>
    );
  }
);
