import type { Size } from "@/shared/types/size";

import { Radius } from "@/shared/types/radius";
import { Variant } from "@/shared/types/variant";
import { RADIUSES_LITERAL } from "@/shared/styles/radiuses";
import { cn } from "@/shared/utils/cn";

interface ChipProps {
  label: string;
  size?: Size;
  variant?: Variant;
  radius?: Radius;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  xxs: "text-xxs",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const variantClasses: Partial<Record<Variant, string>> = {
  default: "bg-background-400 text-foreground",
  primary: "bg-background-400 text-primary",
  danger: "bg-background-400 text-danger",
  warning: "bg-background-400 text-warning",
  success: "bg-background-400 text-sucess",
  calm: "bg-background-400 text-calm",
  alt: "bg-background-400 text-alt",

  "ghost-default":
    "bg-background-950/10 text-foreground-400 border border-foreground-500/20",
  "ghost-primary":
    "bg-primary-500/10 text-primary-400 border border-primary-500/20",
  "ghost-danger":
    "bg-danger-500/10 text-danger-400 border border-danger-500/20",
  "ghost-warning":
    "bg-warning-500/10 text-warning-400 border border-warning-500/20",
  "ghost-success":
    "bg-success-500/10 text-success-400 border border-success-500/20",
  "ghost-calm": "bg-calm-500-500/10 text-calm-400 border border-calm-500/20",
  "ghost-alt": "bg-alt-500/10 text-alt-400 border border-alt-500/20",

  "nobg-default": "text-foreground font-bold",
  "nobg-primary": "text-primary font-bold",
  "nobg-danger": "text-danger font-bold",
  "nobg-warning": "text-warning font-bold",
  "nobg-success": "text-success font-bold",
  "nobg-calm": "text-calm font-bold",
  "nobg-alt": "text-alt font-bold",
};

const paddingsClasses: Record<Size, string> = {
  xxs: "px-1.5 py-0.5",
  xs: "px-1.5 py-0.5",
  sm: "px-2 py-0.5",
  md: "px-3 py-0.5",
  lg: "px-4 py-1",
  xl: "px-4 py-1",
};

export const Chip = ({
  label,
  size = "md",
  variant = "default",
  radius = "none",
  className = "",
}: ChipProps) => {
  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedVariant = variantClasses[variant] || variantClasses.default;
  const selectedRadius = RADIUSES_LITERAL[radius] || RADIUSES_LITERAL.md;
  const selectedPadding =
    (!variant.includes("nobg-") &&
      (paddingsClasses[size] || paddingsClasses.md)) ||
    "";

  return (
    <div
      className={cn(
        "inline-flex font-semibold",
        selectedSize,
        selectedVariant,
        selectedRadius,
        selectedPadding,
        className
      )}
    >
      {label}
    </div>
  );
};
