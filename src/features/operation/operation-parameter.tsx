import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";

import { ParameterModel } from "@/models/parameter.model";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { FormFieldCheckbox } from "@/shared/components/ui/form-fields/form-field-checkbox";
import { isArray } from "@/shared/utils/helpers";
import { Primitive } from "@/shared/types/form-field";

export const OperationParameter = observer(
  ({ parameter }: { parameter: ParameterModel }) => {
    const FormFieldComponent = parameter.schema
      ? getFormFieldComponent(parameter.schema)
      : null;

    const options: Primitive[] = isArray(parameter.schema?.enum)
      ? (parameter.schema?.enum as Primitive[])
      : [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center">
        {/* Included checkbox */}
        <div className="flex items-center">
          <FormFieldCheckbox
            id={`param-${parameter.id}`}
            required={parameter.required}
            value={parameter.included || parameter.required}
            onChange={(val) => parameter.setIncluded(val)}
          />
        </div>

        {/* Parameter info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium text-sm ${
                parameter.deprecated ? "line-through" : ""
              }`}
            >
              {parameter.name}
            </span>
            {parameter.required && (
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
              {parameter.schema?.items &&
                typeof parameter.schema.items === "object" &&
                "type" in parameter.schema.items &&
                `<${parameter.schema.items.type}>`}
              {parameter.schema?.format && `(${parameter.schema.format})`}
            </Chip>

            {(isArray(parameter.getFirstType()) ||
              parameter.getFirstType() === "object") && (
              <Chip size="sm" variant="flat">
                Explode {`<${String(parameter.explode)}:${parameter.style}>`}
              </Chip>
            )}
          </div>

          {parameter.description && (
            <p className="text-xs mt-4">{parameter.description}</p>
          )}
        </div>

        {/* Dynamic field */}
        <div>
          {parameter.included && FormFieldComponent && (
            <FormFieldComponent
              id={parameter.id}
              options={options}
              placeholder={parameter.name || "Parameter"}
              required={parameter.required}
              value={parameter.value}
              onChange={(val) => parameter.setValue(val)}
            />
          )}
        </div>
      </div>
    );
  }
);
