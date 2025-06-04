import { Button } from "@heroui/button";
import { useEffect, useId, useRef, useState } from "react";

interface FormFieldFileProps {
  onChange: (file: File | string | null) => void;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

export const FormFieldFile = ({
  id,
  name,
  onChange,
  required = false,
  className = "",
}: FormFieldFileProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(inputId);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

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
