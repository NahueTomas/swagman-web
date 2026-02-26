import { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/shared/utils/cn";

const actionButtonVariants = tv({
  base: "flex items-center justify-center gap-2 rounded-md transition-all duration-200 border font-medium relative group outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
  variants: {
    variant: {
      default:
        "bg-background-400 hover:bg-background-400 text-foreground-400 hover:text-foreground-100 border-transparent hover:border-white/10 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-white/5 text-foreground-400 hover:text-foreground-100 border-transparent active:scale-[0.98]",
      success:
        "bg-success-900/10 hover:bg-success-900/20 text-success-400 border-success-900/50 hover:border-success-500/50 active:scale-[0.98]",
      danger:
        "bg-danger-900/10 hover:bg-danger-900/20 text-danger-400 border-danger-900/50 hover:border-danger-500/50 active:scale-[0.98]",
    },
    size: {
      sm: "h-8 px-2 text-xs",
      md: "h-9 px-3 text-sm",
      lg: "h-11 px-4 text-base",
    },
    isActive: {
      true: "text-foreground-100 bg-background-400/80 border-white/5",
      false: "",
    },
    isIconOnly: {
      true: "px-0 w-8", // Overrides px for icon only buttons if sm size
    },
  },
  compoundVariants: [
    {
      size: "md",
      isIconOnly: true,
      className: "w-9 px-0",
    },
    {
      size: "lg",
      isIconOnly: true,
      className: "w-11 px-0",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "sm",
    isActive: false,
    isIconOnly: false,
  },
});

type ActionButtonVariantsParams = VariantProps<typeof actionButtonVariants>;

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    ActionButtonVariantsParams {
  icon?: ReactNode;
  label?: ReactNode;
  active?: boolean;
}

export const ActionButton = ({
  icon,
  label,
  variant,
  size,
  active = false,
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <button
      className={actionButtonVariants({
        variant,
        size,
        isActive: active,
        isIconOnly: !label,
        className,
      })}
      type="button"
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-primary-500" : "group-hover:text-primary-400/80"
          )}
        >
          {icon}
        </span>
      )}
      {label && <span className="truncate">{label}</span>}
      {children}
    </button>
  );
};
