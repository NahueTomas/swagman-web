import clsx from "clsx";

import { Chip } from "@/shared/components/chip/chip";
import { Variant } from "@/shared/types/variant";
import { cn } from "@/shared/utils/cn";

export const ApiExplorerTaggedItem = ({
  title,
  method,
  active,
  deprecated,
  onClick,
  className,
}: {
  title: string;
  method: string;
  active: boolean;
  deprecated: boolean;
  onClick: () => void;
  className?: string;
}) => {
  const methodUpper = method.toUpperCase();
  const methodColors: Record<string, Variant> = {
    GET: "nobg-success",
    POST: "nobg-warning",
    PUT: "nobg-calm",
    PATCH: "nobg-alt",
    DELETE: "nobg-danger",
    DEFAULT: "nobg-default",
  };

  const selectedVariant = methodColors[methodUpper] || methodColors.DEFAULT;

  const methodToRender =
    methodUpper === "DELETE"
      ? "DEL"
      : methodUpper === "OPTIONS"
        ? "OPT"
        : methodUpper;

  const activeClass =
    "bg-primary-500/10 text-primary-400 font-semibold shadow-sm border-primary-500/20";
  const inactiveClass =
    "text-foreground-400 font-medium border-transparent hover:text-foreground";

  return (
    <li className="list-none rounded-md bg-background-700">
      <button
        className={cn(
          "w-full px-4 py-2 rounded-md border hover:bg-background-400",
          active ? activeClass : inactiveClass,
          className
        )}
        onClick={() => onClick()}
      >
        <div className="flex gap-3 items-center flex-nowrap overflow-hidden">
          {/* Method indicator */}
          <Chip
            className="w-6"
            label={methodToRender}
            radius="sm"
            size="xxs"
            variant={selectedVariant}
          />

          {/* Operation title */}
          <span
            className={clsx(
              "text-xs font-semibold truncate",
              deprecated ? "line-through" : ""
            )}
          >
            {title}
          </span>
        </div>
      </button>
    </li>
  );
};
