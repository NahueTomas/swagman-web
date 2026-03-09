import type { Value } from "./parameter-value";

export type Primitive = string | number;

export interface FormFieldProps {
  id?: string;
  value?: Value;
  onChange: (value: Value | Value[]) => void;
  options?: Primitive[];
  required?: boolean;
  placeholder?: string;
}
