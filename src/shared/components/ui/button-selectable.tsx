import clsx from "clsx";

interface ButtonSelectableProps {
  active: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
  className?: string;
  color?: "primary" | "default";
}

const variantStyles = {
  default: {
    active: "bg-content1 order border border-divider hover:bg-divider",
    inactive: "border border-transparent hover:bg-divider ",
  },
  primary: {
    active: "bg-primary/15 text-primary-600 shadow-sm border border-primary/20",
    inactive: "bg-content2 border border-transparent",
  },
};

export const ButtonSelectable = ({
  active,
  onSelect,
  children,
  className,
  color = "default",
}: ButtonSelectableProps) => {
  const styles = variantStyles[color] || variantStyles["default"];

  return (
    <button
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-300",
        active ? styles.active : styles.inactive,
        className
      )}
      onClick={onSelect}
    >
      {children}
    </button>
  );
};
