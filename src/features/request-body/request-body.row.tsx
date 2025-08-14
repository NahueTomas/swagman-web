import { useState } from "react";
import { Chip } from "@heroui/chip";

import { OpenAPISchema } from "@/shared/types/openapi";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { FormFieldCheckbox } from "@/shared/components/ui/form-fields/form-field-checkbox";

export const RequestBodyRow = ({
  id,
  name,
  required,
  schema,
  onChange,
  value,
  included: includedProp,
}: {
  name: string;
  required: boolean;
  schema: OpenAPISchema;
  onChange: (name: string, value: any, included: boolean) => void;
  included?: boolean;
  id?: string;
  value?: any;
}) => {
  const [included, setIncluded] = useState(
    includedProp !== undefined ? includedProp : required || false
  );
  const schemaType = schema.type || "any";
  const schemaFormat = schema.format;

  const handleValueChange = (value: any) => {
    onChange(name, value, included);
  };

  // Get the form field component
  const FormFieldComponent = schema ? getFormFieldComponent(schema) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center">
      <div className="flex items-center">
        <FormFieldCheckbox
          id={`body-${id}`}
          required={required}
          value={included}
          onChange={(checkValue: boolean) => {
            setIncluded(checkValue);
            if (onChange) onChange(name, value, checkValue);
          }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{name}</span>
          {required && (
            <Chip color="danger" size="sm" variant="flat">
              Required
            </Chip>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Chip size="sm" variant="flat">
            {schemaType}
            {schema?.items &&
              typeof schema.items === "object" &&
              "type" in schema.items &&
              `<${schema.items.type}>`}
            {schemaFormat && `($${schemaFormat})`}
          </Chip>
        </div>
        {schema.description && (
          <p className="text-xs mt-4">{schema.description}</p>
        )}
      </div>

      <div>
        {included && FormFieldComponent && (
          <FormFieldComponent
            id={id}
            options={(schema?.enum as string[]) || []}
            placeholder={name}
            required={required}
            value={value}
            onChange={handleValueChange}
          />
        )}
      </div>
    </div>
  );
};
