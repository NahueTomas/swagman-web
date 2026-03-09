import React, { useRef } from "react";

import { FormFieldActionButton } from "../form-field-action-button";

import { cn } from "@/shared/utils/cn";
import { DocumentTextIcon } from "@/shared/components/icons";
import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldFile: React.FC<FormFieldProps & { name?: string }> = ({
  id,
  name,
  onChange,
  value,
  required = false,
  placeholder = "Choose file...",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const file = value instanceof File ? value : null;
  const fileName = file?.name;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onChange("");
  };

  return (
    <div className="relative w-full group/file flex items-center text-foreground-200">
      <input
        ref={fileInputRef}
        className="hidden"
        id={id}
        name={name}
        required={required}
        tabIndex={-1}
        type="file"
        onChange={handleFileChange}
      />

      <div
        aria-label={fileName ? `File selected: ${fileName}` : "Upload file"}
        className={cn(
          "relative flex items-center justify-between w-full px-3 py-1.5 rounded-md cursor-pointer outline-none",
          "bg-transparent border border-transparent font-mono text-xs h-8",

          // Transitions
          "transition-[border-color,background-color,box-shadow] duration-200 ease-out",

          // Hover
          "hover:border-white/[0.08] hover:bg-white/[0.03]",

          // Focus — primary accent with soft glow
          "focus-visible:border-primary-500/40 focus-visible:bg-white/[0.03]",
          "focus-visible:shadow-[0_0_0_3px_rgba(190,151,110,0.06)]"
        )}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 truncate flex-1 pointer-events-none">
          <DocumentTextIcon
            className={cn(
              "size-3.5 shrink-0 transition-colors duration-150",
              fileName
                ? "text-primary-500"
                : "text-foreground-600 group-hover/file:text-foreground-400"
            )}
          />

          <span
            className={cn(
              "truncate transition-colors duration-150",
              fileName
                ? "text-foreground-200"
                : "text-foreground-600 font-sans italic group-hover/file:text-foreground-400"
            )}
          >
            {fileName || placeholder || "Choose a file"}
          </span>
        </div>

        {fileName && (
          <FormFieldActionButton
            action="delete"
            aria-label="Remove File"
            onClick={handleClear}
          />
        )}

        {/* Focus underline — slides in from center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-[width] duration-300 ease-out group-focus-within/file:w-4/5 opacity-60 pointer-events-none" />
      </div>
    </div>
  );
};
