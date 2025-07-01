import { Button } from "@heroui/button";

export const ButtonSelectable = ({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      color={selected ? "primary" : "default"}
      size="sm"
      variant="flat"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
