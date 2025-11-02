import React, { useEffect, useRef, useState } from "react";

import { XIcon } from "../icons";

import { selectStyles } from "./utils/form-field-styles";
import { FormFieldError } from "./form-field.error";

import { FormFieldProps, Primitive } from "@/shared/types/form-field";

export type SelectSize = "normal" | "small";
type Option = Primitive;

export const FormFieldSelect: React.FC<
  FormFieldProps & { size?: SelectSize; disabled?: boolean }
> = ({
  id,
  onChange,
  value,
  options = [],
  required = false,
  size = "normal",
  disabled = false,
  placeholder = "Select an option",
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Option | undefined>(
    typeof value === "string" || typeof value === "number"
      ? (value as Option)
      : undefined
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedValue(
      typeof value === "string" || typeof value === "number"
        ? (value as Option)
        : undefined
    );
  }, [value]);

  // validate options: only string|number accepted
  if (
    Array.isArray(options) &&
    options.some((o) => typeof o !== "string" && typeof o !== "number")
  ) {
    return (
      <FormFieldError message="This field only accepts strings or numbers as options" />
    );
  }

  const cleanOptions: Option[] = (options || []).filter(
    (o): o is Option => typeof o === "string" || typeof o === "number"
  );

  const toggle = () => {
    if (!disabled) setOpen((o) => !o);
  };

  const handleSelect = (opt: Option) => {
    onChange(opt); // Value-compatible
    setSelectedValue(opt);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSelectedValue(undefined);
  };

  const arrowStyles = {
    normal: "w-4 h-4",
    small: "w-3 h-3",
  };

  const selectedOption = cleanOptions.find((opt) => opt === selectedValue);

  return (
    <div ref={dropdownRef} className="relative w-full" id={id}>
      <div
        aria-controls={`${id}-listbox`}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${selectStyles.button[size]} flex items-center justify-between w-full ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) toggle();
          }
        }}
      >
        <span className="truncate">
          {selectedOption !== undefined ? String(selectedOption) : placeholder}
        </span>
        <div className="flex items-center">
          {!required && selectedValue !== undefined && (
            <button
              aria-label="Clear selection"
              className="mr-1 p-0.5 rounded-lg"
              tabIndex={-1}
              type="button"
              onClick={handleClear}
            >
              <div className="border border-divider rounded-lg p-px">
                <XIcon className="size-2" />
              </div>
            </button>
          )}
          <svg
            aria-hidden="true"
            className={`${arrowStyles[size]} transform transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div
        aria-labelledby={id}
        className={`${selectStyles.dropdown} transform transition-all duration-200 origin-top ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none max-h-0"
        }`}
        id={`${id}-listbox`}
        role="listbox"
      >
        {cleanOptions.length > 0 ? (
          cleanOptions.map((opt) => (
            <button
              key={String(opt)}
              aria-selected={selectedValue === opt}
              className={`${selectStyles.item[size]} ${selectedValue === opt ? selectStyles.selected[size] : ""} cursor-pointer w-full text-left bg-content1`}
              role="option"
              type="button"
              onClick={() => handleSelect(opt)}
            >
              {String(opt)}
            </button>
          ))
        ) : (
          <div className={`${selectStyles.item[size]}`}>
            No options available
          </div>
        )}
      </div>
    </div>
  );
};
