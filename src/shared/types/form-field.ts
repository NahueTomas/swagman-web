export type Primitive = string | number;
export type Value = string | number | File | object | undefined;

export interface FormFieldProps {
  id?: string;
  value?: Value;
  onChange: (value: Value | Value[]) => void;
  options?: Primitive[];
  required?: boolean;
  placeholder?: string;
}
