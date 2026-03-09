import type { Value } from "@/shared/types/parameter-value";

import { observer } from "mobx-react-lite";

import { cn } from "@/shared/utils/cn";
import { getFormFieldComponent } from "@/features/operation/utils/get-form-field-component";
import { RequestBodyField } from "@/models/request-body-field";
import { FormFieldCheckbox } from "@/shared/components/form-field-checkbox/form-field-checkbox";
import { Chip } from "@/shared/components/chip";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";
import { resolveTypeLabel, typeChipVariant } from "@/shared/utils/openapi";
import { useCacheStore } from "@/hooks/use-cache-store";
import { useStore } from "@/hooks/use-store";

export const RequestBodyRow = observer(
  ({
    id,
    requestBodyField,
  }: {
    requestBodyField: RequestBodyField;
    id?: string;
  }) => {
    const { spec } = useStore();
    const setBodyField = useCacheStore((s) => s.setBodyField);

    const isFileField = requestBodyField.schema.format === "binary";

    const writeCache = (value: Value | Value[], included: boolean) => {
      if (!spec?.specKey || isFileField) return;
      setBodyField(
        spec.specKey,
        requestBodyField.operationId,
        requestBodyField.mimeType,
        requestBodyField.name,
        value,
        included
      );
    };

    const typeLabel = resolveTypeLabel(requestBodyField.schema);
    const schemaFormat = requestBodyField.schema.format;
    const fullTypeLabel = schemaFormat
      ? `${typeLabel}\u00B7${schemaFormat}`
      : typeLabel;

    const FormFieldComponent = requestBodyField.schema
      ? getFormFieldComponent(requestBodyField.schema)
      : null;

    return (
      <tr
        className={cn(
          "group/row transition-colors h-9 border-b border-white/[0.04] last:border-none",
          requestBodyField.included
            ? "hover:bg-white/[0.03]"
            : "opacity-50 hover:opacity-75 hover:bg-white/[0.02]"
        )}
      >
        {/* 1. Inclusion Checkbox */}
        <td className="px-2 text-center align-middle">
          <FormFieldCheckbox
            id={`body-${id}`}
            size="sm"
            value={requestBodyField.included}
            onChange={(check) => {
              requestBodyField.setIncluded(check);
              writeCache(requestBodyField.value, check);
            }}
          />
        </td>

        {/* 2. Field Name & Required Indicator */}
        <td
          className="px-2 align-middle"
          title={[
            `Type: ${fullTypeLabel}`,
            requestBodyField.schema.description
              ? `Description: ${requestBodyField.schema.description}`
              : undefined,
          ]
            .filter(Boolean)
            .join("\n")}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-mono font-medium truncate transition-colors text-foreground-200">
              {requestBodyField.name}
            </span>
            {requestBodyField.required && (
              <Chip label="*" radius="sm" size="sm" variant="nobg-danger" />
            )}
          </div>
          {/* Inline type — visible only when Type column is hidden */}
          <span className="md:hidden text-[10px] font-mono text-foreground-600">
            {fullTypeLabel}
          </span>
        </td>

        {/* 3. Dynamic Form Field (Value) */}
        <td className="px-2 align-middle">
          {requestBodyField.included && FormFieldComponent ? (
            <div className="min-w-0">
              <FormFieldComponent
                id={id}
                options={(requestBodyField.schema?.enum as string[]) || []}
                placeholder={requestBodyField.name}
                required={requestBodyField.required}
                value={requestBodyField.value}
                onChange={(v) => {
                  requestBodyField.setValue(v);
                  writeCache(v, requestBodyField.included);
                }}
              />
            </div>
          ) : (
            <span className="text-[10px] italic text-foreground-700 px-3">
              —
            </span>
          )}
        </td>

        {/* 4. Schema Type Display — hidden below md */}
        <td className="px-2 hidden md:table-cell align-middle">
          <Chip
            className="font-mono"
            label={fullTypeLabel}
            radius="sm"
            size="xxs"
            variant={typeChipVariant(typeLabel)}
          />
        </td>

        {/* 5. Description — hidden below lg */}
        <td className="px-2 hidden lg:table-cell align-baseline max-w-xs">
          {requestBodyField.schema.description ? (
            <SanitizedMarkdown
              className="w-full h-full text-xs text-foreground-500 leading-relaxed py-1.5"
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
