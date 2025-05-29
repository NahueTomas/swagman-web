import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { Code, CodeLanguage } from "@/components/request-body/code";
import { RequestBodyRow } from "@/components/request-body/request-body.row";

export const RequestBody = ({
  bodyMediaType,
  currentValues,
  updateBody,
}: {
  bodyMediaType: RequestBodyMediaType | undefined;
  currentValues:
    | { [key: string]: { value: any | any[]; included: boolean } }
    | string;
  updateBody: (
    bodyMediaType: string,
    body:
      | Record<
          string,
          {
            value: any | any[];
            included: boolean;
          }
        >
      | string
  ) => void;
}) => {
  if (!bodyMediaType) return null;

  const mediaTypeName = bodyMediaType.name;
  const mediaTypeFormat = bodyMediaType.getMediaTypeFormat();

  const handleChange = (
    name: string,
    value: any | any[],
    included: boolean
  ) => {
    if (mediaTypeFormat === "text") return updateBody(mediaTypeName, value);

    return updateBody(mediaTypeName, {
      ...(currentValues as object),
      [name]: { value, included },
    });
  };

  const getContentTypeComponent = () => {
    // NONE
    if (mediaTypeName === "none") return null;

    // FORM LIKE
    if (mediaTypeFormat === "form") {
      return (
        <div className="space-y-2">
          {bodyMediaType.getFields().map((field) => {
            return (
              <RequestBodyRow
                key={field.name}
                id={field.name}
                included={
                  typeof currentValues === "object"
                    ? currentValues[field.name]?.included
                    : undefined
                }
                name={field.name}
                required={field.required}
                schema={field.schema}
                value={
                  typeof currentValues === "object"
                    ? currentValues[field.name]?.value || ""
                    : ""
                }
                onChange={handleChange}
              />
            );
          })}
        </div>
      );
    }

    // TEXT LIKE
    return (
      <Code
        language={
          (mediaTypeName.split("/")?.[1]?.toUpperCase() as CodeLanguage) ||
          CodeLanguage.TEXT
        }
        value={
          currentValues && typeof currentValues === "object"
            ? currentValues["body"]?.value
            : (currentValues as string)
        }
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
