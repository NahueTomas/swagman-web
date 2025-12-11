import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";

import { SecurityModel } from "@/models/security.model";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
import { InfoIcon } from "@/shared/components/ui/icons";
import { MESSAGES } from "@/shared/constants/mesagges";

export const OperationSecurityParameter = ({
  security,
}: {
  security: SecurityModel;
}) => {
  return (
    <div
      key={security.getName()}
      className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center bg-success/5"
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
          <span className="font-medium text-sm">{security.getName()}</span>
          <Chip color="success" radius="sm" size="sm" variant="flat">
            {"apiKey"}
          </Chip>
        </div>

        {security.getDescription() ? (
          <p className="text-xs mt-4">{security.getDescription()}</p>
        ) : null}
      </div>

      {/* Value display */}
      <FormFieldText disabled value="•••••••" onChange={() => null} />
    </div>
  );
};
