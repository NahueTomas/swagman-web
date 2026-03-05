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

  // Active background tint per method
  const methodActiveBg: Record<string, string> = {
    GET: "bg-success-500/8",
    POST: "bg-warning-500/8",
    PUT: "bg-calm-500/8",
    PATCH: "bg-alt-500/8",
    DELETE: "bg-danger-500/8",
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
    <li className="list-none">
      <button
        className={cn(
          "relative w-full px-4 py-2 rounded-md transition-all duration-200 text-left active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          active
            ? cn(activeBg, "text-foreground-200")
            : "text-foreground-400 hover:bg-white/5 hover:text-foreground-100",
          className
        )}
        type="button"
        onClick={onClick}
      >
        {/* Left accent bar */}
        {active && (
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full",
              accentColor
            )}
          />
        )}

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
              "text-xs truncate",
              active ? "font-semibold" : "font-medium",
              deprecated && "line-through opacity-60"
            )}
          >
            {title}
          </span>
        </div>
      </button>
    </li>
  );
};
