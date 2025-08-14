import { ButtonSelectable } from "@/shared/components/ui/button-selectable";

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
    <div className="p-3 flex gap-3 flex-col border border-divider rounded-lg">
      <span className="text-xs font-medium flex gap-2 items-center">
        {children}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <div key={option.value}>
            <ButtonSelectable
              active={option.selected}
              color="primary"
              onSelect={() => onClick(option.value)}
            >
              <span className="text-xs">{option.value}</span>
            </ButtonSelectable>
          </div>
        ))}
      </div>
    </div>
  );
};
