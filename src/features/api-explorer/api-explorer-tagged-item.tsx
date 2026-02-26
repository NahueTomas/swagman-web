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

  const activeClass = "bg-primary-500/10 text-primary-400";
  const inactiveClass =
    "text-foreground-400 hover:bg-white/5 hover:text-foreground-100";

  return (
    <li className="list-none">
      <button
        className={cn(
          "w-full px-4 py-2 rounded-md transition-colors duration-200 text-left active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          active ? activeClass : inactiveClass,
          className
        )}
        onClick={() => onClick()}
      >
        <div className="flex gap-3 items-center flex-nowrap overflow-hidden">
          {/* Method indicator */}
          <Chip
            className="w-[34px] shrink-0 text-center"
            label={methodToRender}
            radius="sm"
            size="xxs"
            variant={selectedVariant}
          />

          {/* Operation title */}
          <span
            className={clsx(
              "text-xs truncate",
              active ? "font-semibold" : "font-medium",
              deprecated ? "line-through opacity-60" : ""
            )}
          >
            {title}
          </span>
        </div>
      </button>
    </li>
  );
};
