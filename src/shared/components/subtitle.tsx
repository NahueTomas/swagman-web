import { Size } from "../types/size";

import { cn } from "@/shared/utils/cn";

// Mapping sizes to Tailwind typography classes
const sizeClasses: Record<Size, string> = {
  xxs: "text-[10px] tracking-wider font-bold text-foreground-500",
  xs: "text-xs tracking-wide font-semibold text-foreground-500",
  sm: "text-sm font-semibold text-foreground-400",
  md: "text-base font-medium text-foreground-300",
  lg: "text-lg font-medium text-foreground-200",
  xl: "text-xl font-medium text-foreground-100",
};

export const Subtitle = ({
  children,
  size = "md",
  className,
}: {
  children: React.ReactNode;
  size?: Size;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "leading-none transition-colors",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </h3>
  );
};
