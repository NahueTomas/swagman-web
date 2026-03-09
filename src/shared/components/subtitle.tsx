import type { ElementType, ReactNode } from "react";

import { Size } from "@/shared/types/size";
import { cn } from "@/shared/utils/cn";

type ExtendedSize = Size | "micro";

// Mapping sizes to Tailwind typography classes
const sizeClasses: Record<ExtendedSize, string> = {
  micro:
    "text-[9px] tracking-[0.12em] font-semibold text-foreground-600 uppercase",
  xxs: "text-[10px] tracking-[0.12em] font-semibold text-foreground-600 uppercase",
  xs: "text-xs tracking-[0.12em] font-semibold text-foreground-600 uppercase",
  sm: "text-sm font-semibold text-foreground-600",
  md: "text-base font-medium text-foreground-600",
  lg: "text-lg font-medium text-foreground-600",
  xl: "text-xl font-medium text-foreground-600",
};

interface SubtitleProps {
  children: ReactNode;
  size?: ExtendedSize;
  as?: ElementType;
  className?: string;
  htmlFor?: string;
}

export const Subtitle = ({
  children,
  size = "md",
  as: Tag = "h3",
  className,
  ...rest
}: SubtitleProps) => {
  return (
    <Tag
      className={cn(
        "leading-none transition-colors",
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};
