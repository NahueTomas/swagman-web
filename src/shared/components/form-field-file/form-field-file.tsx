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

    onChange(selectedFile);
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
          "relative flex items-center justify-between w-full px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer outline-none",
          "bg-transparent border border-transparent font-mono text-xs h-8 hover:border-divider",
          "hover:bg-background-500/50", // Added slight hover bg without border
          "focus-visible:ring-1 focus-visible:ring-primary-500/30",
          fileName && ""
        )}
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 truncate flex-1 pointer-events-none">
          <DocumentTextIcon className={cn("size-3.5 shrink-0")} />

          <span className={cn("truncate", !fileName && "font-sans")}>
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

        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-primary-500 transition-all duration-300 opacity-50 pointer-events-none",
            "w-0 group-focus-within/file:w-[90%]"
          )}
        />
      </div>
    </div>
  );
};
