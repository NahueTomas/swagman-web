import { useState } from "react";
import { Chip } from "@heroui/chip";

import { ParameterModel } from "../../models/parameter.model";
import { getFormFieldComponent } from "../utils/get-form-field-component";

import { FormFieldCheckbox } from "@/components/form-fields/form-field-checkbox";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border border-divider rounded-lg transition-colors items-center">
      <div className="sm:col-span-1 flex items-center">
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
      <div className="sm:col-span-4 flex flex-col">
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
          <p className="text-xs mt-1">{parameter.description}</p>
        )}
      </div>
      <div className="sm:col-span-7">
        {included && getFormFieldComponent(parameter.schema)
          ? getFormFieldComponent(parameter.schema)({
              id: parameter.id,
              onChange: handleValueChange,
              placeholder: parameter.name,
              value,
              required: parameter.required,
              options: (parameter.schema?.enum as string[]) || [],
            })
          : null}
      </div>
    </div>
  );
};
