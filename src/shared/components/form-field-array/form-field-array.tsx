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
    ? (value as any[]).map((v) =>
        PRIMITIVE_TYPES.includes(typeof v) ? String(v) : JSON.stringify(v)
      )
    : [];

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

    onChange(newValues);
  };

  return (
    <div className="flex flex-col w-full text-foreground-200" id={id}>
      {items.map((v, index) => (
        <div
          key={index}
          className="flex items-center gap-2 pt-0.5 pb-0.5 group/row border-b border-b-divider first:pt-0 last:pb-0 last:border-b-0"
        >
          <div className="relative w-full group/input">
            <input
              className={cn(
                "w-full px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 outline-none",
                "bg-transparent border border-transparent",
                "hover:border-divider hover:bg-background-500",
                "focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",
                "placeholder:text-foreground-500 placeholder:font-sans placeholder:italic"
              )}
              placeholder={`${placeholder ?? "item"}[${index}]`}
              type="text"
              value={v}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            {/* Focus indicator bar */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 transition-all duration-300 group-focus-within/input:w-[90%] opacity-50" />
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
