import { cn } from "@/shared/utils/cn";

export const MainButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-lg",
        "disabled:opacity-25 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/35",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
