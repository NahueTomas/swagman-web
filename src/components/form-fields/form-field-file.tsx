import { Button } from "@heroui/button";
import { useState } from "react";

interface FormFieldFileProps {
  onChange: (file: File | null) => void;
  id?: string;
  label?: string;
  required?: boolean;
  accept?: string;
  className?: string;
}

export const FormFieldFile = ({
  id,
  onChange,
  label = "Upload file",
  required = false,
  accept,
  className = "",
}: FormFieldFileProps) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    setFileName(file?.name || null);
    onChange(file);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} id={id}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          accept={accept}
          className="hidden"
          id="file-upload"
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFileChange(e.nativeEvent)
          }
        />
        <Button
          size="sm"
          variant="flat"
          onClick={() => {
            const input = document.getElementById(
              "file-upload"
            ) as HTMLInputElement;

            if (input) input.click();
          }}
        >
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
