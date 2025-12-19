import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";

import { SecurityModel } from "@/models/security.model";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
import { InfoIcon } from "@/shared/components/ui/icons";
import { MESSAGES } from "@/shared/constants/mesagges";
import { SanitizedMarkdown } from "@/shared/components/ui/sanitized-markdown";

export const OperationSecurityParameter = ({
  security,
}: {
  security: SecurityModel;
}) => {
  const description = security.getDescription();

  return (
    <div
      key={security.getSecuritySchema().name || ""}
      className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] xl:grid-cols-[2rem_1fr_1fr_0.9fr] xl:gap-5 gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center bg-success/5"
    >
      {/* Empty column */}
      <Tooltip content={MESSAGES.operationSecurityParameter}>
        <div>
          <InfoIcon className="size-5 text-primary" />
        </div>
      </Tooltip>

      {/* Parameter info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {security.getSecuritySchema().name || ""}
          </span>
          <Chip color="success" radius="sm" size="sm" variant="flat">
            {`apiKey<${security.getKey()}>`}
          </Chip>
        </div>

        {description ? (
          <SanitizedMarkdown
            className="xl:hidden text-xs marked-xs mt-4"
            content={description}
          />
        ) : null}
      </div>

      {/* Value display */}
      <FormFieldText disabled value="•••••••" onChange={() => null} />

      <div className="hidden h-full xl:flex xl:items-center">
        {description && (
          <SanitizedMarkdown
            className="text-xs marked-xs"
            content={description}
          />
        )}
      </div>
    </div>
  );
};
