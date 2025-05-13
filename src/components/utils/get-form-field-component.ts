import { FormFieldArray } from "@/components/form-fields/form-field-array";
import { FormFieldFile } from "@/components/form-fields/form-field-file";
import { FormFieldNumber } from "@/components/form-fields/form-field-number";
import { FormFieldObject } from "@/components/form-fields/form-field-object";
import { FormFieldSelect } from "@/components/form-fields/form-field-select";
import { FormFieldText } from "@/components/form-fields/form-field-text";

export const getFormFieldComponent = (schema?: any) => {
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
