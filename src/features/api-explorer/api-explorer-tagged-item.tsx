import { Chip } from "@heroui/chip";
import clsx from "clsx";

import { ButtonSelectable } from "@/shared/components/ui/button-selectable";

export const ApiExplorerTaggedItem = ({
  title,
  method,
  active,
  deprecated,
  onClick,
}: {
  title: string;
  method: string;
  active: boolean;
  deprecated: boolean;
  onClick: () => void;
}) => {
  const methodUpper = method.toUpperCase();

  const methodColors: Record<
    string,
    "primary" | "secondary" | "warning" | "success" | "danger" | "default"
  > = {
    GET: "primary",
    POST: "secondary",
    PUT: "warning",
    PATCH: "success",
    DELETE: "danger",
    DEFAULT: "default",
  };

  const colorSet = methodColors[methodUpper] || methodColors.DEFAULT;

  return (
    <li>
      <ButtonSelectable active={active} onSelect={() => onClick()}>
        <div className="flex gap-4 items-center flex-nowrap overflow-hidden">
          {/* Method indicator */}
          <Chip color={colorSet} radius="sm" size="sm" variant="flat">
            <span className="text-[10px] flex w-8 justify-center items-center">
              {methodUpper}
            </span>
          </Chip>

          {/* Operation title */}
          <span
            className={clsx(
              "text-xs font-medium truncate",
              deprecated ? "line-through" : ""
            )}
          >
            {title}
          </span>
        </div>
      </ButtonSelectable>
    </li>
  );
};
