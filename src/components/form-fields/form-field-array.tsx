import { isArray } from "../../utils/helpers";

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
    <div className="space-y-2" id={id}>
      <div className="flex flex-col gap-1">
        {comingValue.map((v, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className="relative w-full">
              <input
                className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`${placeholder}[${index}]`}
                required={required}
                type="text"
                value={v}
                onChange={(e) =>
                  handleChange(index, (e.target as HTMLInputElement).value)
                }
              />
              {!required && v && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  type="button"
                  onClick={() => handleChange(index, "")}
                >
                  <svg
                    fill="none"
                    height="14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="14"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" x2="9" y1="9" y2="15" />
                    <line x1="9" x2="15" y1="9" y2="15" />
                  </svg>
                </button>
              )}
            </div>
            <button
              className="shrink-0 p-1 text-zinc-500 hover:text-red-500 rounded-md"
              type="button"
              onClick={() => handleRemove(index)}
            >
              <svg
                fill="none"
                height="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        className="w-full px-2 py-1 text-sm bg-zinc-100 text-zinc-600 border hover:bg-zinc-200 active:text-blue-700 active:bg-blue-200 rounded transition-colors"
        type="button"
        onClick={handleAdd}
      >
        Add item
      </button>
    </div>
  );
};
