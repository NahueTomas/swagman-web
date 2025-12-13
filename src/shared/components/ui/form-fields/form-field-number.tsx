import React from "react";
import { Input } from "@heroui/input";

import { FormFieldError } from "./form-field.error";

import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldNumber: React.FC<
  FormFieldProps & {
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }
> = ({
  id,
  onChange,
  placeholder,
  value,
  disabled = false,
  min,
  max,
  step,
}) => {
  if (value !== undefined && typeof value !== "number") {
    return <FormFieldError message="This field only accepts a number" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value === "" ? undefined : Number(e.target.value);

    if (n !== undefined && !Number.isNaN(n)) onChange(n);
    else onChange(0);
  };

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
      value={value !== undefined ? String(value) : ""}
      variant="bordered"
      onChange={handleChange}
    />
  );
};
