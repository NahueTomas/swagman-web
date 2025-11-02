import React from "react";
import { Textarea } from "@heroui/input";

import { FormFieldError } from "./form-field.error";

import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldObject: React.FC<FormFieldProps> = ({
  id,
  onChange,
  placeholder,
  value,
}) => {
  if (
    value !== undefined &&
    (typeof value !== "object" || value instanceof File)
  ) {
    return <FormFieldError message="This field only accepts an object" />;
  }

  const display = value !== undefined ? JSON.stringify(value) : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;

      onChange(parsed);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // If JSON is invalid, we still propagate string so caller can show error if desired
      onChange(e.target.value);
    }
  };

  return (
    <Textarea
      id={id}
      placeholder={placeholder}
      radius="sm"
      value={display}
      variant="bordered"
      onChange={handleChange}
    />
  );
};
