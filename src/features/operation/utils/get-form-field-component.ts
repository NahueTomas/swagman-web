import { FormFieldArray } from "@/shared/components/ui/form-fields/form-field-array";
import { FormFieldFile } from "@/shared/components/ui/form-fields/form-field-file";
import { FormFieldNumber } from "@/shared/components/ui/form-fields/form-field-number";
import { FormFieldObject } from "@/shared/components/ui/form-fields/form-field-object";
import { FormFieldSelect } from "@/shared/components/ui/form-fields/form-field-select";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
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
      return FormFieldObject;
    case "array":
      return FormFieldArray;
    default:
      return FormFieldText;
  }
};
