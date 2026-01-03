import React from "react";

import { cn } from "@/shared/utils/cn";
import { FormFieldProps } from "@/shared/types/form-field";

// Narrow the props specifically for this component
interface FormFieldNumberProps extends Omit<FormFieldProps, "onChange"> {
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const FormFieldNumber = ({
  id,
  onChange,
  placeholder,
  value,
  disabled = false,
  min,
  max,
  step,
}: FormFieldNumberProps) => {
  // NARROWING: Only allow numbers.
  // If value is a string that looks like a number, we use it.
  // Otherwise, we pass an empty string to the input.
  const numericValue = typeof value === "number" ? value : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // If input is cleared, we default to 0 (or you could send undefined)
    if (val === "") {
      onChange(0);

      return;
    }

    const n = Number(val);

    if (!Number.isNaN(n)) {
      onChange(n);
    }
  };

  return (
    <div className="relative w-full group text-foreground-200">
      <input
        className={cn(
          "w-full px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 outline-none",
          "bg-transparent border border-transparent",
          "hover:border-divider hover:bg-background-500",
          "focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
          // Hides the browser arrows for a cleaner API-Dog look
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "placeholder:text-foreground-500 placeholder:font-sans placeholder:italic"
        )}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        placeholder={placeholder}
        step={step}
        type="number"
        value={numericValue}
        onChange={handleChange}
      />

      {/* Focus indicator bar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 transition-all duration-300 group-focus-within:w-[90%] opacity-50" />
    </div>
  );
};
