import { cn } from "@/shared/utils/cn";
import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldText = ({
  id,
  value = "",
  onChange,
  required = false,
  placeholder,
  disabled = false,
}: FormFieldProps & { disabled?: boolean }) => {
  return (
    <div className={cn("relative w-full group")}>
      <input
        className={cn(
          // Layout & Typography
          "w-full px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 outline-none",

          // Colors & Borders (Matching your background-900/800 theme)
          "bg-transparent text-foreground-200 border border-transparent",

          // Hover State
          "hover:border-divider hover:bg-background-500",

          // Focus State (Primary Gold/Glow effect)
          "focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20",

          // Disabled State
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Placeholder Style
          "placeholder:text-foreground-500 placeholder:font-sans placeholder:italic"
        )}
        disabled={disabled}
        id={id}
        placeholder={placeholder}
        required={required}
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Optional: Subtle bottom indicator line for focus */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 transition-all duration-300 group-focus-within:w-[90%] opacity-50" />
    </div>
  );
};
