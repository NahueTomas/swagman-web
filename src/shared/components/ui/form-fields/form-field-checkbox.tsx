import { Checkbox } from "@heroui/checkbox";

export const FormFieldCheckbox = ({
  id,
  onChange,
  value = false,
  required = false,
}: {
  onChange: (value: boolean) => void;
  id?: string;
  value?: boolean;
  required?: boolean;
}) => {
  const handleChange = (e: Event) => {
    const newValue = (e.target as HTMLInputElement).checked;

    onChange(required ? true : newValue);
  };

  return (
    <Checkbox
      defaultSelected={value}
      id={id}
      isDisabled={required}
      size="lg"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e as unknown as Event)
      }
    />
  );
};
