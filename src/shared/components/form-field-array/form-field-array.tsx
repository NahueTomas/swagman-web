import type { Value } from "@/shared/types/parameter-value";

import { useRef } from "react";

import { FormFieldActionButton } from "../form-field-action-button";

import { cn } from "@/shared/utils/cn";
import { FormFieldProps } from "@/shared/types/form-field";
import { isArray } from "@/shared/utils/helpers";

const PRIMITIVE_TYPES = ["string", "number", "boolean"];

export const FormFieldArray = ({
  onChange,
  id,
  placeholder,
  value,
  required = false,
}: FormFieldProps) => {
  // Normalize value to an array of strings
  const items = isArray(value)
    ? (value as Value[]).map((v) =>
        PRIMITIVE_TYPES.includes(typeof v) ? String(v) : JSON.stringify(v)
      )
    : [];

  // Stable keys: monotonic counter so keys survive reordering/removal
  const keyCounterRef = useRef(0);
  const keysRef = useRef<number[]>([]);

  // Grow key array if items were added
  while (keysRef.current.length < items.length) {
    keysRef.current.push(keyCounterRef.current++);
  }
  // Shrink key array if items were removed (trim from end)
  if (keysRef.current.length > items.length) {
    keysRef.current = keysRef.current.slice(0, items.length);
  }

  const handleChange = (index: number, newValue: string) => {
    const newValues = [...items];

    newValues[index] = newValue;
    onChange(newValues);
  };

  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (index: number) => {
    const newValues = items.filter((_, i) => i !== index);

    // Remove the corresponding key so the next render maps correctly
    keysRef.current = keysRef.current.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className="flex flex-col w-full text-foreground-200" id={id}>
      {items.map((v, index) => (
        <div
          key={keysRef.current[index]}
          className="flex items-center gap-2 pt-0.5 pb-0.5 group/row border-b border-white/[0.04] first:pt-0 last:pb-0 last:border-b-0"
        >
          <div className="relative w-full group/input">
            <input
              className={cn(
                // Layout & Typography
                "w-full px-3 py-1.5 rounded-md text-xs font-mono outline-none",

                // Base
                "bg-transparent border border-transparent",

                // Transitions
                "transition-[border-color,background-color,box-shadow] duration-200 ease-out",

                // Hover
                "hover:border-white/[0.08] hover:bg-white/[0.03]",

                // Focus
                "focus:border-primary-500/40 focus:bg-white/[0.03]",
                "focus:shadow-[0_0_0_3px_rgba(190,151,110,0.06),inset_0_1px_0_rgba(190,151,110,0.04)]",

                // Placeholder
                "placeholder:text-foreground-600 placeholder:font-sans placeholder:italic placeholder:transition-opacity placeholder:duration-200",
                "focus:placeholder:opacity-50"
              )}
              placeholder={`${placeholder ?? "item"}[${index}]`}
              type="text"
              value={v}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            {/* Focus underline — slides in from center */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-[width] duration-300 ease-out group-focus-within/input:w-4/5 opacity-60" />
          </div>

          {/* Remove Button - only if not required first element */}
          <div className="flex gap-1.5">
            <FormFieldActionButton
              action="add"
              aria-label="Add item"
              onClick={handleAdd}
            />
            <FormFieldActionButton
              action="delete"
              aria-label="Remove item"
              disabled={required && items.length === 1}
              onClick={() => handleRemove(index)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
