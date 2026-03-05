import { cn } from "@/shared/utils/cn";

interface ButtonSelectableProps {
  active: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  active: `
    bg-primary-500/15
    text-primary-300
    border-primary-500/40
  `,
  inactive: `
    text-foreground-500
    border-divider
    hover:text-foreground-200
    hover:border-white/[0.14]
    hover:bg-white/5
  `,
};

export const ButtonSelectable = ({
  active,
  onSelect,
  children,
  className,
}: ButtonSelectableProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        "border transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40",
        active && "pointer-events-none",
        active ? variantStyles.active : variantStyles.inactive,
        className
      )}
      type="button"
      onClick={onSelect}
    >
      {children}
    </button>
  );
};
