import React, { useRef, useState } from "react";
import { Button } from "@heroui/button";

import { FormFieldProps } from "@/shared/types/form-field";

export const FormFieldFile: React.FC<
  FormFieldProps & { name?: string; className?: string }
> = ({ id, name, onChange, value, required = false, className = "" }) => {
  const generatedId = id ?? `file-${Math.random().toString(36).slice(2, 9)}`;
  const inputId = id || generatedId;
  const [fileName, setFileName] = useState<string | null>(() => {
    if (value instanceof File) return value.name;

    return null;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || undefined;

    setFileName(file?.name || null);
    onChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium" htmlFor={inputId}>
        Upload file
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          className="hidden"
          id={inputId}
          name={name}
          required={required}
          type="file"
          onChange={handleFileChange}
        />
        <Button size="sm" variant="flat" onClick={handleClick}>
          Choose file
        </Button>
        <span className="text-sm">
          {fileName ? (
            <span className="text-primary underline">{fileName}</span>
          ) : (
            "No file chosen"
          )}
        </span>
      </div>
    </div>
  );
};
