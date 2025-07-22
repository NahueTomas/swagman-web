import { Input } from "@heroui/input";

import { FormFieldValue } from "@/shared/types/parameter";

interface FormFieldTextProps {
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string | number | FormFieldValue["value"];
  disabled?: boolean;
}

export const FormFieldText = ({
  id,
  onChange,
  placeholder,
  value,
  disabled = false,
}: FormFieldTextProps) => {
  const stringValue =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      id={id}
      isDisabled={disabled}
      placeholder={placeholder}
      radius="full"
      type="text"
      value={stringValue}
      variant="bordered"
      onChange={handleChange}
    />
  );
};
