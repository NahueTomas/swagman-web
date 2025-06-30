import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { Code } from "@/components/request-body/code";
import { CodeLanguage } from "@/types";
import { RequestBodyRow } from "@/components/request-body/request-body.row";

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
        <div className="space-y-2">
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
      <Code
        language={
          (mediaTypeName.split("/")?.[1]?.toUpperCase() as CodeLanguage) ||
          CodeLanguage.TEXT
        }
        value={textValue}
        onChange={(value) => handleChange("body", value, true)}
        onReset={() =>
          handleChange(
            "body",
            bodyMediaType.getFullExample()?.toString() || "",
            false
          )
        }
      />
    );
  };

  return <div className="space-y-4">{getContentTypeComponent()}</div>;
};
