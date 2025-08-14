import { useState, useEffect, useRef } from "react";

import { XIcon } from "../icons";

import { selectStyles } from "./utils/form-field-styles";

export type SelectSize = "normal" | "small";

export const FormFieldSelect = ({
  id,
  onChange,
  value,
  options,
  required = false,
  size = "normal",
  disabled = false,
  placeholder = "Select an option",
}: {
  onChange: (value: string) => void;
  options: string[];
  value?: any;
  id?: string;
  size?: SelectSize;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with external value when it changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggle = () => {
    if (!disabled) {
      setOpen((o: boolean) => !o);
    }
  };

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSelectedValue(opt);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the dropdown
    onChange("");
    setSelectedValue(undefined);
  };

  const arrowStyles = {
    normal: "w-4 h-4",
    small: "w-3 h-3",
  };

  const displayValue = selectedValue || "";
  const selectedOption = options.find((opt) => opt === displayValue);

  return (
    <div ref={dropdownRef} className="relative w-full" id={id}>
      <div
        aria-controls={`${id}-listbox`}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${selectStyles.button[size]} flex items-center justify-between w-full ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
        <span className="truncate">{selectedOption || placeholder}</span>
        <div className="flex items-center">
          {!required && selectedValue && (
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
            className={`${
              arrowStyles[size]
            } transform transition-transform duration-200 ease-out ${
              open ? "rotate-180" : ""
            }`}
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

      {/* Dropdown */}
      <div
        aria-labelledby={id}
        className={`${
          selectStyles.dropdown
        } transform transition-all duration-200 origin-top ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none max-h-0"
        }`}
        id={`${id}-listbox`}
        role="listbox"
      >
        {options.length > 0 ? (
          options.map((opt) => (
            <button
              key={opt}
              aria-selected={displayValue === opt}
              className={`${selectStyles.item[size]} ${
                displayValue === opt ? selectStyles.selected[size] : ""
              } cursor-pointer w-full text-left bg-content1`}
              role="option"
              type="button"
              onClick={() => handleSelect(opt)}
            >
              {opt}
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
