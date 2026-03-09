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
          "w-full px-3 py-1.5 rounded-md text-xs font-mono outline-none",

          // Base — invisible border for layout stability
          "bg-transparent text-foreground-200",
          "border border-transparent",

          // Transitions — separate properties for staggered feel
          "transition-[border-color,background-color,box-shadow] duration-200 ease-out",

          // Hover — subtle surface reveal
          "hover:border-white/[0.08] hover:bg-white/[0.03]",

          // Focus — primary accent with soft glow
          "focus:border-primary-500/40 focus:bg-white/[0.03]",
          "focus:shadow-[0_0_0_3px_rgba(190,151,110,0.06),inset_0_1px_0_rgba(190,151,110,0.04)]",

          // Disabled
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent",

          // Placeholder
          "placeholder:text-foreground-600 placeholder:font-sans placeholder:italic placeholder:transition-opacity placeholder:duration-200",
          "focus:placeholder:opacity-50"
        )}
        disabled={disabled}
        id={id}
        placeholder={placeholder}
        required={required}
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Focus underline — slides in from center */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-[width] duration-300 ease-out group-focus-within:w-4/5 opacity-60" />
    </div>
  );
};
