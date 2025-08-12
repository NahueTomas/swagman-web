import { Input } from "@heroui/input";

export const FormFieldNumber = ({
  id,
  onChange,
  placeholder,
  value,
  disabled = false,
  min,
  max,
  step,
}: {
  onChange: (value: number) => void;
  id?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const handleChange = (e: Event) =>
    onChange(Number((e.target as HTMLInputElement).value));

  return (
    <Input
      disabled={disabled}
      id={id}
      max={max}
      min={min}
      placeholder={placeholder}
      radius="sm"
      step={step}
      type="number"
      value={value}
      variant="bordered"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e.nativeEvent)
      }
    />
  );
};
