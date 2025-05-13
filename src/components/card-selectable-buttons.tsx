import { Card } from "@heroui/card";

import { ButtonSelectable } from "@/components/button-selectable";

export const CardSelectableButtons = ({
  children,
  options,
  onClick,
}: {
  children: React.ReactNode;
  options: {
    value: string;
    selected: boolean;
  }[];
  onClick: (value: string) => void;
}) => {
  return (
    <Card
      className="p-3 flex gap-3 flex-col border border-divider bg-content1/10"
      shadow="none"
    >
      <span className="text-xs font-medium flex gap-2 items-center">
        {children}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <ButtonSelectable
            key={option.value}
            selected={option.selected}
            onClick={() => onClick(option.value)}
          >
            {option.value}
          </ButtonSelectable>
        ))}
      </div>
    </Card>
  );
};
