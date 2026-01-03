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

    return (
      <tr className="group transition-colors h-9 border-b border-divider bg-success/5 hover:bg-success/10 last:border-none">
        {/* 1. Icon Column (Matching Checkbox Width) */}
        <td className="px-3 py-0.5 align-middle">
          <InfoIcon className="size-3.5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        </td>

        {/* 2. Security Field Name */}
        <td className="px-3 py-0.5 align-middle">
          <span className="text-xs font-mono text-foreground-200 truncate">
            {schema.name || "auth"}
          </span>{" "}
          <Chip label="*" radius="sm" size="sm" variant="nobg-danger" />
        </td>

        {/* 3. Masked Value Field */}
        <td className="py-0.5 align-middle">
          <FormFieldText
            disabled
            placeholder="Security Token"
            value="••••••••••••"
            onChange={() => null}
          />
        </td>

        {/* 4. Type Display */}
        <td className="px-3 py-0.5 align-middle">
          <Chip label={`apiKey<${security.getKey()}>`} radius="sm" size="xxs" />
        </td>

        {/* 5. Explode (empty) */}
        <td className="px-3 py-0.5 align-middle">
          <span className="text-foreground-700 text-xs">—</span>
        </td>

        {/* 6. Description */}
        <td className="px-3 py-0.5 align-middle">
          {description && (
            <SanitizedMarkdown className="marked-xxs" content={description} />
          )}
        </td>
      </tr>
    );
  }
);
