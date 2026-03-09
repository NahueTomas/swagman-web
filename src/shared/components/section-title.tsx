import { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export interface SectionTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const SectionTitle = ({
  children,
  className,
  ...props
}: SectionTitleProps) => {
  return (
    <h3
      className={cn(
        "text-xs font-semibold text-foreground-500 uppercase tracking-[0.12em]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};
