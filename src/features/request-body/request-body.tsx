import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { RequestBodyCode } from "@/features/request-body/request-body-code";
import { CodeLanguage } from "@/shared/types";
import { RequestBodyRow } from "@/features/request-body/request-body.row";

type RequestBodyValues =
  | {
      [key: string]: { value: any | any[]; included: boolean };
    }
  | string;

interface RequestBodyProps {
  bodyMediaType: RequestBodyMediaType | undefined;
  currentValues: RequestBodyValues;
  updateBody: (bodyMediaType: string, body: RequestBodyValues) => void;
}

export const RequestBody = ({
  bodyMediaType,
  currentValues,
  updateBody,
}: RequestBodyProps) => {
  if (!bodyMediaType) return null;

  const mediaTypeName = bodyMediaType.name;
  const mediaTypeFormat = bodyMediaType.getMediaTypeFormat();

  const handleChange = (
    name: string,
    value: any | any[],
    included: boolean
  ) => {
    if (mediaTypeFormat === "text") return updateBody(mediaTypeName, value);

    const updatedValues = {
      ...(currentValues as Record<string, { value: any; included: boolean }>),
      [name]: { value, included },
    };

    return updateBody(mediaTypeName, updatedValues);
  };

  const getContentTypeComponent = () => {
    // NONE
    if (mediaTypeName === "none") return null;

    // FORM LIKE
    if (mediaTypeFormat === "form") {
      const formValues = currentValues as Record<
        string,
        { value: any; included: boolean }
      >;

      return (
        <div className="border border-divider rounded-lg">
          {bodyMediaType.getFields().map((field) => {
            const fieldValue = formValues[field.name];

            return (
              <RequestBodyRow
                key={field.name}
                id={field.name}
                included={fieldValue?.included ?? false}
                name={field.name}
                required={field.required}
                schema={field.schema}
                value={fieldValue?.value ?? ""}
                onChange={handleChange}
              />
            );
          })}
        </div>
      );
    }

    // TEXT LIKE
    const textValue = currentValues as string;

    return (
      <RequestBodyCode
        language={
          (mediaTypeName.split("/")?.[1]?.toUpperCase() as CodeLanguage) ||
          CodeLanguage.TEXT
        }
        value={textValue}
        onChange={(value) => handleChange("body", value, true)}
      />
    );
  };

  return getContentTypeComponent();
};
