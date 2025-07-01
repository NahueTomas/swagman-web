import { useState } from "react";
import { Chip } from "@heroui/chip";

import { ParameterModel } from "@/models/parameter.model";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { FormFieldCheckbox } from "@/shared/components/ui/form-fields/form-field-checkbox";

export const OperationParameter = ({
  parameter,
  onChange,
  value,
  included: includedProp,
}: {
  parameter: ParameterModel;
  onChange?: (
    name: string,
    inType: string,
    value: any,
    included: boolean
  ) => void;
  value?: any;
  included?: boolean;
}) => {
  const [included, setIncluded] = useState(
    includedProp !== undefined ? includedProp : parameter.required || false
  );

  const handleValueChange = (value: any) => {
    if (onChange) onChange(parameter.name, parameter.getIn(), value, included);
  };

  // Get the form field component
  const FormFieldComponent = parameter.schema
    ? getFormFieldComponent(parameter.schema)
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-4 p-4 border border-divider rounded-xl bg-content1/10 transition-colors items-center">
      <div className="flex items-center">
        <FormFieldCheckbox
          id={`param-${parameter.id}`}
          required={parameter.required}
          value={included || parameter.required}
          onChange={(checkValue) => {
            setIncluded(checkValue);
            if (onChange)
              onChange(parameter.name, parameter.getIn(), value, checkValue);
          }}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium text-sm ${
              parameter.deprecated && "line-through"
            }`}
          >
            {parameter.name}
          </span>
          {parameter.required === true && (
            <Chip color="danger" size="sm" variant="flat">
              Required
            </Chip>
          )}
          {parameter.deprecated && (
            <Chip color="warning" size="sm" variant="flat">
              Deprecated
            </Chip>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Chip size="sm" variant="flat">
            {parameter.getType() || "any"}
            {parameter?.schema?.items &&
              typeof parameter.schema.items === "object" &&
              "type" in parameter.schema.items &&
              `<${parameter.schema.items.type}>`}
            {parameter.schema?.format && `($${parameter.schema?.format})`}
          </Chip>
        </div>

        {parameter.description && (
          <p className="text-xs mt-4">{parameter.description}</p>
        )}
      </div>
      <div className="">
        {included && FormFieldComponent && (
          <FormFieldComponent
            id={parameter.id}
            options={(parameter.schema?.enum as string[]) || []}
            placeholder={parameter.name}
            required={parameter.required}
            value={value}
            onChange={handleValueChange}
          />
        )}
      </div>
    </div>
  );
};
