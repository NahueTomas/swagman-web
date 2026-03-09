import type { Value } from "@/shared/types/parameter-value";

import { observer } from "mobx-react-lite";

import { ParameterModel } from "@/models/parameter.model";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { isArray } from "@/shared/utils/helpers";
import { Primitive } from "@/shared/types/form-field";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";
import { Chip } from "@/shared/components/chip/chip";
import { FormFieldCheckbox } from "@/shared/components/form-field-checkbox/form-field-checkbox";
import { cn } from "@/shared/utils/cn";
import { resolveTypeLabel, typeChipVariant } from "@/shared/utils/openapi";
import { useCacheStore } from "@/hooks/use-cache-store";
import { useStore } from "@/hooks/use-store";

export const OperationParameter = observer(
  ({ parameter }: { parameter: ParameterModel }) => {
    const { spec } = useStore();
    const setParam = useCacheStore((s) => s.setParam);

    const writeCache = (value: Value | Value[], included: boolean) => {
      if (!spec?.specKey) return;
      setParam(
        spec.specKey,
        parameter.operationId,
        parameter.getIn(),
        parameter.name,
        value,
        included
      );
    };

    const FormFieldComponent = parameter.schema
      ? getFormFieldComponent(parameter.schema)
      : null;

    const options: Primitive[] = isArray(parameter.schema?.enum)
      ? (parameter.schema?.enum as Primitive[])
      : parameter.getType() === "boolean"
        ? ["true", "false"]
        : [];

    const included = parameter.included || parameter.required;
    const typeLabel = parameter.schema
      ? resolveTypeLabel(parameter.schema)
      : "any";

    return (
      <tr
        className={cn(
          "group/row transition-colors h-9 border-b border-white/[0.04] last:border-none",
          included
            ? "hover:bg-white/[0.03]"
            : "opacity-50 hover:opacity-75 hover:bg-white/[0.02]"
        )}
      >
        {/* 1. Included Checkbox */}
        <td className="text-center align-middle px-2">
          <FormFieldCheckbox
            id={`param-${parameter.id}`}
            required={parameter.required}
            size="sm"
            value={included}
            onChange={(val) => {
              parameter.setIncluded(val);
              writeCache(parameter.value, val);
            }}
          />
        </td>

        {/* 2. Parameter Name & Required Indicator */}
        <td
          className="px-2 align-middle"
          title={[
            `Type: ${typeLabel}`,
            parameter.description
              ? `Description: ${parameter.description}`
              : undefined,
          ]
            .filter(Boolean)
            .join("\n")}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "font-mono text-xs font-medium truncate",
                parameter.deprecated
                  ? "line-through text-foreground-600"
                  : "text-foreground-200"
              )}
            >
              {parameter.name}
            </span>
            {parameter.required && (
              <Chip label="*" radius="sm" size="sm" variant="nobg-danger" />
            )}
          </div>
          {/* Inline type — visible only when Type column is hidden */}
          <span className="md:hidden text-[10px] font-mono text-foreground-600">
            {typeLabel}
          </span>
        </td>

        {/* 3. Dynamic Field (Value Input) */}
        <td className="px-2 align-middle">
          {included && FormFieldComponent ? (
            <div className="min-w-[120px]">
              <FormFieldComponent
                id={parameter.id}
                options={options}
                placeholder={parameter.name || "Value"}
                required={parameter.required}
                value={parameter.value}
                onChange={(val) => {
                  parameter.setValue(val);
                  writeCache(val, parameter.included);
                }}
              />
            </div>
          ) : (
            <span className="text-[10px] italic text-foreground-700 px-3">
              —
            </span>
          )}
        </td>

        {/* 4. Type Info — hidden below md */}
        <td className="px-2 hidden md:table-cell align-middle">
          <Chip
            className="font-mono"
            label={typeLabel}
            radius="sm"
            size="xxs"
            variant={typeChipVariant(typeLabel)}
          />
        </td>

        {/* 5. Explode/Style Info — hidden below md */}
        <td className="px-2 hidden md:table-cell align-middle">
          {isArray(parameter.getFirstType()) ||
          parameter.getFirstType() === "object" ? (
            <Chip
              label={`${parameter.style || "default"} ${String(parameter.explode)}`}
              radius="sm"
              size="xxs"
              variant="ghost-default"
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>

        {/* 6. Description — hidden below lg */}
        <td className="px-2 hidden lg:table-cell align-baseline max-w-xs">
          {parameter.description ? (
            <SanitizedMarkdown
              className="w-full h-full text-xs text-foreground-500 leading-relaxed py-1.5"
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
