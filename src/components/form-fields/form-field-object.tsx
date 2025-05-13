export const FormFieldObject = ({
  id,
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  value?: any;
}) => {
  const handleChange = (e: Event) => {
    onChange((e.target as HTMLInputElement).value);
  };

  return (
    <textarea
      id={id}
      onChange={handleChange}
      value={typeof value === 'object' ? JSON.stringify(value) : value}
      placeholder={placeholder}
      className="w-full h-60 px-2 py-1 text-sm border border-zinc-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px] max-h-[500px]"
    />
  );
};
