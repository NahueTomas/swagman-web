import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { Code, CodeLanguage } from "@/components/request-body/code";
import { RequestBodyRow } from "@/components/request-body/request-body.row";

type RequestBodyValue = {
  value: any | any[];
  included: boolean;
};

type RequestBodyValues =
  | {
      [key: string]: RequestBodyValue;
    }
  | RequestBodyValue;

interface RequestBodyProps {
  bodyMediaType: RequestBodyMediaType | undefined;
  currentValues: RequestBodyValues;
  updateBody: (
    bodyMediaType: string,
    body: Record<string, RequestBodyValue> | RequestBodyValue
  ) => void;
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
    if (mediaTypeFormat === "text")
      return updateBody(mediaTypeName, { value, included: true });

    const updatedValues = {
      ...(currentValues as Record<string, RequestBodyValue>),
      [name]: { value, included },
    };

    return updateBody(mediaTypeName, updatedValues);
  };

  const getContentTypeComponent = () => {
    // NONE
    if (mediaTypeName === "none") return null;

    // FORM LIKE
    if (mediaTypeFormat === "form") {
      const formValues = currentValues as Record<string, RequestBodyValue>;

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
    const textValue = currentValues as RequestBodyValue;

    return (
      <Code
        language={
          (mediaTypeName.split("/")?.[1]?.toUpperCase() as CodeLanguage) ||
          CodeLanguage.TEXT
        }
        value={textValue.value as string}
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
