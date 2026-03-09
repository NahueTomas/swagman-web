import { FormFieldArray } from "@/shared/components/form-field-array";
import { FormFieldNumber } from "@/shared/components/form-field-number";
import { FormFieldSelect } from "@/shared/components/form-field-select";
import { FormFieldText } from "@/shared/components/form-field-text";
import { FormFieldFile } from "@/shared/components/form-field-file";
import { FormFieldProps } from "@/shared/types/form-field";
import { OpenAPISchema } from "@/shared/types/openapi";

export const getFormFieldComponent = (
  schema?: OpenAPISchema
): React.ComponentType<FormFieldProps> | null => {
  if (schema?.enum) return FormFieldSelect;
  if (schema?.format === "binary") return FormFieldFile;

  switch (schema?.type) {
    case "string":
      return FormFieldText;
    case "number":
    case "integer":
      return FormFieldNumber;
    case "object":
      return FormFieldText;
    case "array":
      return FormFieldArray;
    case "boolean":
      return FormFieldSelect;
    default:
      return FormFieldText;
  }
};
