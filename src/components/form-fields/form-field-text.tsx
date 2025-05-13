import { Input } from "@heroui/input";

export const FormFieldText = ({
  id,
  onChange,
  placeholder,
  value,
  disabled = false,
}: {
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
}) => {
  const handleChange = (e: Event) =>
    onChange((e.target as HTMLInputElement).value);

  return (
    <Input
      id={id}
      isDisabled={disabled}
      placeholder={placeholder}
      radius="full"
      type="text"
      value={typeof value === "object" ? JSON.stringify(value) : value}
      variant="bordered"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e as unknown as Event)
      }
    />
  );
};
