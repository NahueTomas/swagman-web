import { useState, useEffect } from "react";

import { CheckIcon } from "../icons";

import { cn } from "@/shared/utils/cn";
import { Size } from "@/shared/types/size";

interface FormFieldCheckboxProps {
  onChange: (value: boolean) => void;
  id?: string;
  value?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: Size;
}

const sizeClasses: Record<"checkIcon" | "checkBox", Record<Size, string>> = {
  checkBox: {
    xxs: "size-3",
    xs: "size-3.5",
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    xl: "size-8",
  },
  checkIcon: {
    xxs: "size-2 stroke-[4]",
    xs: "size-2.5 stroke-[4]",
    sm: "size-3 stroke-[3]",
    md: "size-3.5 stroke-[3]",
    lg: "size-4 stroke-[2.5]",
    xl: "size-5 stroke-[2]",
  },
};

export const FormFieldCheckbox = ({
  id,
  onChange,
  value = false,
  disabled = false,
  required = false,
  size = "md",
}: FormFieldCheckboxProps) => {
  const [checked, setChecked] = useState(value);

  // Keep internal state in sync if prop changes externally
  useEffect(() => {
    setChecked(value);
  }, [value]);

  const handleChange = () => {
    if (disabled || required) return;

    const newState = !checked;

    setChecked(newState);
    onChange(newState);
  };

  return (
    <div className="flex items-center">
      <button
        aria-checked={checked}
        aria-required={required}
        className={cn(
          "relative flex items-center justify-center border border-primary-500 transition-colors duration-200 rounded-full",
          sizeClasses.checkBox[size],
          // Disabled State
          (disabled || required) && "cursor-not-allowed",
          disabled && "grayscale",
          // Focus Ring
          "focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-950"
        )}
        disabled={disabled}
        id={id}
        role="checkbox"
        type="button"
        onClick={handleChange}
      >
        {/* Checkmark Icon */}
        <CheckIcon
          className={cn(
            "text-primary-500 transition-transform duration-200 ease-out",
            // Apply dynamic icon size/stroke
            sizeClasses.checkIcon[size],
            checked ? "scale-100" : "scale-0"
          )}
        />
      </button>

      {/* Hidden input for form accessibility */}
      <input
        readOnly
        checked={checked}
        className="sr-only"
        required={required}
        type="checkbox"
      />
    </div>
  );
};
