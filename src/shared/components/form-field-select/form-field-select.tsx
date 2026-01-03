import React, { useEffect, useRef, useState } from "react";

import { FormFieldActionButton } from "../form-field-action-button";

import { cn } from "@/shared/utils/cn";
import { ChevronDownIcon } from "@/shared/components/icons";
import { FormFieldProps, Primitive } from "@/shared/types/form-field";

export type SelectSize = "normal" | "small";
type Option = Primitive;

export const FormFieldSelect = ({
  id,
  onChange,
  value,
  options = [],
  required = false,
  size = "normal",
  disabled = false,
  placeholder = "Select an option",
}: FormFieldProps & { size?: SelectSize; disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedValue =
    typeof value === "string" || typeof value === "number"
      ? (value as Option)
      : undefined;

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

  const cleanOptions = (options || []).filter(
    (o): o is Option => typeof o === "string" || typeof o === "number"
  );

  const handleSelect = (opt: Option) => {
    onChange(opt);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const sizeConfig = {
    normal: {
      button: "px-3 py-1.5 text-xs h-8",
      icon: "size-3.5",
      dropdownItem: "px-3 py-1.5 text-xs",
    },
    small: {
      button: "px-2 py-1 text-[10px] h-6",
      icon: "size-3",
      dropdownItem: "px-2 py-1 text-[10px]",
    },
  };

  return (
    <div
      ref={dropdownRef}
      className="relative w-full group/select text-foreground-200"
      id={id}
    >
      {/* Trigger / Combobox */}
      <div
        aria-controls={`${id}-listbox`}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "relative flex items-center justify-between w-full rounded-md transition-all duration-200 outline-none cursor-pointer",
          sizeConfig[size].button,

          "bg-transparent border border-transparent font-mono",
          "hover:bg-background-500",
          !open && "hover:border-divider",

          // 2. FOCUS & OPEN STATES
          "focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500/20",
          open && "border-primary-500 bg-background-500",
          disabled && "opacity-50 cursor-not-allowed grayscale"
        )}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <span
          className={cn(
            "truncate text-left flex-1",
            !selectedValue && "text-foreground-500 italic font-sans"
          )}
        >
          {selectedValue !== undefined ? String(selectedValue) : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          {/* Clear Selection Button */}
          {!required && selectedValue !== undefined && !disabled && (
            <FormFieldActionButton
              action="delete"
              aria-label="Clear selection"
              onClick={handleClear}
            />
          )}

          {/* Arrow Indicator - RE-ADDED */}
          <ChevronDownIcon
            className={cn(
              "text-foreground-500 transition-transform duration-200",
              sizeConfig[size].icon,
              open && "rotate-180 text-primary-500"
            )}
          />
        </div>

        {/* Focus underline indicator (Matching FormFieldText) */}
        <div
          className={cn(
            "absolute -bottom-px left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 transition-all duration-300 opacity-50",
            open && "w-[90%]"
          )}
        />
      </div>

      {/* Dropdown Menu (Listbox) */}
      <div
        className={cn(
          "absolute z-50 mt-1 w-full min-w-[140px] overflow-hidden rounded-md border border-divider shadow-2xl transition-all duration-200 origin-top",
          open
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
        )}
        id={`${id}-listbox`}
        role="listbox"
      >
        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 bg-background-500">
          {cleanOptions.length > 0 ? (
            cleanOptions.map((opt) => (
              <button
                key={String(opt)}
                aria-selected={selectedValue === opt}
                className={cn(
                  "w-full text-left transition-colors font-mono rounded-md",
                  sizeConfig[size].dropdownItem,
                  selectedValue === opt
                    ? "bg-primary-800 text-primary-400 font-bold"
                    : "text-foreground-300 hover:text-foreground-100"
                )}
                role="option"
                type="button"
                onClick={() => handleSelect(opt)}
              >
                {String(opt)}
              </button>
            ))
          ) : (
            <div
              className={cn(
                "text-foreground-500 italic text-center py-2",
                sizeConfig[size].dropdownItem
              )}
            >
              No options available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
