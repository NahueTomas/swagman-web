import { ButtonSelectable } from "@/shared/components/button-selectable/button-selectable";

export const CardSelectableButtons = ({
  options,
  onClick,
}: {
  options: {
    value: string;
    selected: boolean;
  }[];
  onClick: (value: string) => void;
}) => {
  return (
    <div className="flex gap-3 flex-col">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <div key={option.value}>
            <ButtonSelectable
              active={option.selected}
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
