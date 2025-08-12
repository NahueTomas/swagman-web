import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { XIcon } from "@/shared/components/ui/icons";
import { isArray } from "@/shared/utils/helpers";

const PRIMITIVE_TYPES = ["string", "number", "boolean"];

export const FormFieldArray = ({
  onChange,
  id,
  placeholder,
  value,
  required = false,
}: {
  onChange: (value: string[]) => void;
  id?: string;
  placeholder?: string;
  value?: any;
  required?: boolean;
}) => {
  const comingValue = isArray(value)
    ? value.map((v) =>
        PRIMITIVE_TYPES.includes(typeof v) ? String(v) : JSON.stringify(v)
      )
    : [];

  const handleChange = (index: number, newValue: string) => {
    const newValues = [...comingValue];

    newValues[index] = newValue;
    onChange(newValues);
  };

  const handleAdd = () => {
    onChange([...comingValue, ""]);
  };

  const handleRemove = (index: number) => {
    const newValues = comingValue.filter((_, i) => i !== index);

    onChange(newValues);
  };

  return (
    <div className="space-y-4" id={id}>
      <div className="flex flex-col gap-1.5">
        {comingValue.map((v, index) => (
          <div key={index} className="flex gap-1">
            <div className="relative w-full">
              <Input
                placeholder={`${placeholder}[${index}]`}
                radius="sm"
                type="text"
                value={v}
                variant="bordered"
                onChange={(e) =>
                  handleChange(index, (e.target as HTMLInputElement).value)
                }
              />
            </div>
            {!(required && comingValue.length === 1) ? (
              <button
                className="px-2 text-danger/80"
                color="danger"
                onClick={() => handleRemove(index)}
              >
                <XIcon className="size-6" />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        color="default"
        radius="sm"
        size="sm"
        type="button"
        variant="flat"
        onClick={handleAdd}
      >
        Add item
      </Button>
    </div>
  );
};
