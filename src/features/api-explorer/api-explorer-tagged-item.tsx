import { Chip } from "@/shared/components/chip/chip";
import { PinFilledIcon, PinIcon } from "@/shared/components/icons";
import { Variant } from "@/shared/types/variant";
import { cn } from "@/shared/utils/cn";

export const ApiExplorerTaggedItem = ({
  title,
  method,
  active,
  deprecated,
  isPinned,
  onClick,
  onTogglePin,
  className,
}: {
  title: string;
  method: string;
  active: boolean;
  deprecated: boolean;
  isPinned?: boolean;
  onClick: () => void;
  onTogglePin?: () => void;
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

  // Active background tint per method
  const methodActiveBg: Record<string, string> = {
    GET: "bg-success-500/[0.12]",
    POST: "bg-warning-500/[0.12]",
    PUT: "bg-calm-500/[0.12]",
    PATCH: "bg-alt-500/[0.12]",
    DELETE: "bg-danger-500/[0.12]",
    DEFAULT: "bg-primary-500/10",
  };

  // Left accent bar color per method
  const methodAccent: Record<string, string> = {
    GET: "bg-success-500",
    POST: "bg-warning-500",
    PUT: "bg-calm-500",
    PATCH: "bg-alt-500",
    DELETE: "bg-danger-500",
    DEFAULT: "bg-primary-500",
  };

  const selectedVariant = methodColors[methodUpper] || methodColors.DEFAULT;
  const activeBg = methodActiveBg[methodUpper] || methodActiveBg.DEFAULT;
  const accentColor = methodAccent[methodUpper] || methodAccent.DEFAULT;

  const methodToRender =
    methodUpper === "DELETE"
      ? "DEL"
      : methodUpper === "OPTIONS"
        ? "OPT"
        : methodUpper;

  return (
    <li className="list-none group/item">
      <div
        className={cn(
          "relative flex items-center rounded-md transition-all duration-200 hover:bg-white/5 hover:text-foreground-100",
          active ? cn(activeBg, "text-foreground-200") : "text-foreground-400",
          className
        )}
      >
        {/* Left accent bar */}
        {active && (
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full",
              accentColor
            )}
          />
        )}

        <button
          className="flex-1 min-w-0 pl-4 pr-1 py-2 text-left active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
          type="button"
          onClick={onClick}
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
              className={cn(
                "text-xs truncate min-w-0",
                active ? "font-semibold" : "font-medium",
                deprecated && "line-through opacity-60"
              )}
            >
              {title}
            </span>
          </div>
        </button>

        {/* Pin toggle */}
        {onTogglePin && (
          <button
            className={cn(
              "shrink-0 p-1 mr-2 rounded transition-all outline-none",
              isPinned
                ? "text-primary-500 opacity-100"
                : "text-foreground-700 opacity-0 group-hover/item:opacity-100 hover:text-primary-400"
            )}
            title={isPinned ? "Unpin operation" : "Pin operation"}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            {isPinned ? (
              <PinFilledIcon className="size-3" />
            ) : (
              <PinIcon className="size-3" />
            )}
          </button>
        )}
      </div>
    </li>
  );
};
