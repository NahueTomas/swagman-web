import { Textarea } from "@heroui/input";
import React from "react";

export const FormFieldObject = ({
  id,
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  value?: any;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Textarea
      id={id}
      placeholder={placeholder}
      radius="sm"
      value={typeof value === "object" ? JSON.stringify(value) : value}
      variant="bordered"
      onChange={handleChange}
    />
  );
};
