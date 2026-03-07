import { observer } from "mobx-react-lite";

import { Chip } from "@/shared/components/chip";
import { SecurityModel } from "@/models/security.model";
import { FormFieldText } from "@/shared/components/form-field-text";
import { InfoIcon } from "@/shared/components/icons";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";

export const OperationSecurityParameter = observer(
  ({ security }: { security: SecurityModel }) => {
    const description = security.getDescription();
    const schema = security.getSecuritySchema();
    const typeLabel = `apiKey<${security.getKey()}>`;

    return (
      <tr className="group/row transition-colors h-9 border-b border-white/[0.04] bg-success-500/[0.04] hover:bg-success-500/[0.08] last:border-none">
        {/* 1. Icon Column */}
        <td className="text-center align-middle px-2">
          <InfoIcon className="size-4 text-success-500 opacity-60 group-hover/row:opacity-100 transition-opacity" />
        </td>

        {/* 2. Security Field Name */}
        <td
          className="pl-2 align-middle"
          title={[
            `Type: ${typeLabel}`,
            description ? `Description: ${description}` : undefined,
          ]
            .filter(Boolean)
            .join("\n")}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-mono font-medium text-foreground-200 truncate">
              {schema.name || "auth"}
            </span>
            <Chip label="*" radius="sm" size="sm" variant="nobg-danger" />
          </div>
          {/* Inline type — visible only when Type column is hidden */}
          <span className="md:hidden text-[10px] font-mono text-success-500/70">
            {typeLabel}
          </span>
        </td>

        {/* 3. Masked Value Field */}
        <td className="px-2 align-middle">
          <FormFieldText
            disabled
            placeholder="Security Token"
            value="••••••••••••"
            onChange={() => null}
          />
        </td>

        {/* 4. Type Display — hidden below md */}
        <td className="px-2 hidden md:table-cell align-middle">
          <Chip
            className="font-mono"
            label={typeLabel}
            radius="sm"
            size="xxs"
            variant="ghost-default"
          />
        </td>

        {/* 5. Explode (empty) — hidden below md */}
        <td className="px-2 hidden md:table-cell align-middle">
          <span className="text-foreground-700 text-xs">—</span>
        </td>

        {/* 6. Description — hidden below lg */}
        <td className="px-2 hidden lg:table-cell align-middle max-w-xs">
          {description ? (
            <SanitizedMarkdown
              className="w-full h-full text-xs text-foreground-500 leading-relaxed py-1.5"
              content={description}
            />
          ) : (
            <span className="text-foreground-700 text-xs">—</span>
          )}
        </td>
      </tr>
    );
  }
);
