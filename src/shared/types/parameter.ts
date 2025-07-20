// Type definitions for parameter values
export interface ParameterValue {
  name: string;
  value: string | number | boolean | null;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export interface FormFieldValue {
  value: string | number | boolean | string[] | Record<string, unknown>;
  isValid?: boolean;
  error?: string;
}