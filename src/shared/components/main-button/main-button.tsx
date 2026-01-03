import { cn } from "../../utils/cn";

export const MainButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "h-14 px-6",
        "rounded-lg",
        "text-md font-medium",

        // Visual
        "bg-primary-500/35",
        "text-foreground-100",
        "border border-primary-500/45",

        // Interaction
        "hover:bg-primary-500/45",
        "active:bg-primary-500/50",
        "disabled:opacity-25 disabled:cursor-not-allowed",
        "transition-colors duration-150",

        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/35",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
