import { useState } from "react";
import { Chip } from "@heroui/chip";

import { OpenAPISchema } from "@/types/openapi";
import { getFormFieldComponent } from "@/components/utils/get-form-field-component";
import { FormFieldCheckbox } from "@/components/form-fields/form-field-checkbox";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border border-divider rounded-lg transition-colors items-center">
      <div className="sm:col-span-1 flex items-center">
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
      <div className="sm:col-span-4 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{name}</span>
          {required && <Chip color="danger">Required</Chip>}
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
          <p className="text-xs mt-1">{schema.description}</p>
        )}
      </div>

      <div className="sm:col-span-7">
        {included && getFormFieldComponent(schema)
          ? getFormFieldComponent(schema)({
              id,
              onChange: handleValueChange,
              placeholder: name,
              value,
              options: (schema.enum as string[]) || [],
            })
          : null}
      </div>
    </div>
  );
};
