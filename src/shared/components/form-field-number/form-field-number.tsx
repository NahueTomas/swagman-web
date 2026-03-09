import type { ChangeEvent } from "react";

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
  // Otherwise, we pass an empty string to the input so it shows as blank.
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" &&
          value !== "" &&
          !Number.isNaN(Number(value))
        ? Number(value)
        : "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // If input is cleared, emit 0 — the field shows empty via controlled value
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
          // Layout & Typography
          "w-full px-3 py-1.5 rounded-md text-xs font-mono outline-none",

          // Base — invisible border for layout stability
          "bg-transparent border border-transparent",

          // Transitions
          "transition-[border-color,background-color,box-shadow] duration-200 ease-out",

          // Hover
          "hover:border-white/[0.08] hover:bg-white/[0.03]",

          // Focus — primary accent with soft glow
          "focus:border-primary-500/40 focus:bg-white/[0.03]",
          "focus:shadow-[0_0_0_3px_rgba(190,151,110,0.06),inset_0_1px_0_rgba(190,151,110,0.04)]",

          // Hide browser spin buttons
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",

          // Disabled
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent",

          // Placeholder
          "placeholder:text-foreground-600 placeholder:font-sans placeholder:italic placeholder:transition-opacity placeholder:duration-200",
          "focus:placeholder:opacity-50"
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

      {/* Focus underline — slides in from center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-[width] duration-300 ease-out group-focus-within:w-4/5 opacity-60" />
    </div>
  );
};
