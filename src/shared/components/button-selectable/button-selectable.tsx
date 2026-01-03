import { cn } from "../../utils/cn";

interface ButtonSelectableProps {
  active: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  active: `
    bg-primary-900/40
    text-primary-200
    border-primary-700
  `,
  inactive: `
    text-foreground-500
    border-divider
    hover:text-primary-300
    hover:border-primary-600
    hover:bg-primary-950/30
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
