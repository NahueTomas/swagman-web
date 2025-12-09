import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";

import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { FormFieldCheckbox } from "@/shared/components/ui/form-fields/form-field-checkbox";
import { RequestBodyField } from "@/models/request-body-field";

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

    // Get the form field component
    const FormFieldComponent = requestBodyField.schema
      ? getFormFieldComponent(requestBodyField.schema)
      : null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center">
        <div className="flex items-center">
          <FormFieldCheckbox
            id={`body-${id}`}
            required={requestBodyField.required}
            value={requestBodyField.included}
            onChange={(check) => requestBodyField.setIncluded(check)}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{requestBodyField.name}</span>
            {requestBodyField.required && (
              <Chip color="danger" radius="sm" size="sm" variant="flat">
                Required
              </Chip>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Chip radius="sm" size="sm" variant="flat">
              {schemaType}
              {requestBodyField.schema?.items &&
                typeof requestBodyField.schema.items === "object" &&
                "type" in requestBodyField.schema.items &&
                `<${requestBodyField.schema.items.type}>`}
              {schemaFormat && `($${schemaFormat})`}
            </Chip>
          </div>
          {requestBodyField.schema.description && (
            <p className="text-xs mt-4">
              {requestBodyField.schema.description}
            </p>
          )}
        </div>

        <div>
          {requestBodyField.included && FormFieldComponent && (
            <FormFieldComponent
              id={id}
              options={(requestBodyField.schema?.enum as string[]) || []}
              placeholder={requestBodyField.name}
              required={requestBodyField.required}
              value={requestBodyField.value}
              onChange={(v) => requestBodyField.setValue(v)}
            />
          )}
        </div>
      </div>
    );
  }
);
