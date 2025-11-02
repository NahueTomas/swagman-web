import React from "react";
import { Input } from "@heroui/input";

import { FormFieldError } from "./form-field.error";

import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldText: React.FC<
  FormFieldProps & { disabled?: boolean }
> = ({ id, onChange, placeholder, value, disabled = false }) => {
  if (value !== undefined && typeof value !== "string") {
    return <FormFieldError message="This field only accepts a string" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      id={id}
      isDisabled={disabled}
      placeholder={placeholder}
      radius="sm"
      type="text"
      value={(value as string) ?? ""}
      variant="bordered"
      onChange={handleChange}
    />
  );
};
