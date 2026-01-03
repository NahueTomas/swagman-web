import { observer } from "mobx-react-lite";

import { ParameterModel } from "@/models/parameter.model";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { isArray } from "@/shared/utils/helpers";
import { Primitive } from "@/shared/types/form-field";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";
import { Chip } from "@/shared/components/chip/chip";
import { FormFieldCheckbox } from "@/shared/components/form-field-checkbox/form-field-checkbox";
import { cn } from "@/shared/utils/cn";

export const OperationParameter = observer(
  ({ parameter }: { parameter: ParameterModel }) => {
    const FormFieldComponent = parameter.schema
      ? getFormFieldComponent(parameter.schema)
      : null;

    const options: Primitive[] = isArray(parameter.schema?.enum)
      ? (parameter.schema?.enum as Primitive[])
      : parameter.getType() === "boolean"
        ? ["true", "false"]
        : [];

    return (
      <tr className="transition-colors h-9 border-b border-divider hover:bg-background-950/20 last:border-none">
        {/* 1. Included Checkbox */}
        <td className="px-3 py-0.5 text-center align-middle">
          <FormFieldCheckbox
            id={`param-${parameter.id}`}
            required={parameter.required}
            size="sm"
            value={parameter.included || parameter.required}
            onChange={(val) => parameter.setIncluded(val)}
          />
        </td>

        {/* 2. Parameter Name & Required Indicator */}
        <td className="px-3 py-0.5 align-middle">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-mono text-xs font-medium",
                parameter.deprecated
                  ? "line-through text-foreground-500"
                  : "text-foreground-200"
              )}
            >
              {parameter.name}
            </span>
            {parameter.required && (
              <Chip label="*" radius="sm" size="sm" variant="nobg-danger" />
            )}
          </div>
        </td>

        {/* 3. Dynamic Field (Value Input) */}
        <td className="py-0.5 align-middle">
          {parameter.included && FormFieldComponent ? (
            <div className="min-w-[120px]">
              <FormFieldComponent
                id={parameter.id}
                options={options}
                placeholder={parameter.name || "Value"}
                required={parameter.required}
                value={parameter.value}
                onChange={(val) => parameter.setValue(val)}
              />
            </div>
          ) : (
            <span className="text-xs italic font-bold text-foreground-500 px-3">
              Disabled
            </span>
          )}
        </td>

        {/* 4. Type Info */}
        <td className="px-3 py-0.5 align-middle">
          <Chip
            className="border-divider/50 text-foreground-400"
            label={`${parameter.getType() || "any"}${
              (parameter.schema?.items &&
                typeof parameter.schema.items === "object" &&
                "type" in parameter.schema.items &&
                `[${parameter.schema.items.type}]`) ||
              ""
            }`.trim()}
            radius="md"
            size="xxs"
            variant="default"
          />
        </td>

        {/* 5. Explode/Style Info */}
        <td className="px-3 py-0.5 align-middle">
          {isArray(parameter.getFirstType()) ||
          parameter.getFirstType() === "object" ? (
            <Chip
              className="border-divider/50 text-foreground-400"
              label={`${parameter.style || "default"} ${String(parameter.explode)}`}
              radius="md"
              size="xxs"
              variant="default"
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>

        {/* 6. Description */}
        <td className="py-0.5 pr-3 align-baseline max-w-xs">
          {parameter.description ? (
            <SanitizedMarkdown
              className="w-full h-full text-xs text-foreground-500 leading-relaxed px-3 py-1.5"
              content={parameter.description}
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>
      </tr>
    );
  }
);
