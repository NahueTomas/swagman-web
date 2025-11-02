import { observer } from "mobx-react-lite";

import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { RequestBodyCode } from "@/features/request-body/request-body-code";
import { CodeLanguage } from "@/shared/types";
import { RequestBodyRow } from "@/features/request-body/request-body.row";

interface RequestBodyProps {
  bodyMediaType: RequestBodyMediaType | undefined;
}

export const RequestBody = observer(({ bodyMediaType }: RequestBodyProps) => {
  if (!bodyMediaType) return null;

  const mediaTypeName = bodyMediaType.name;
  const mediaTypeFormat = bodyMediaType.getMediaTypeFormat();

  const getContentTypeComponent = () => {
    // NONE
    if (mediaTypeName === "none") return null;

    // FORM LIKE
    if (mediaTypeFormat === "form") {
      return (
        <div className="border border-divider rounded-lg">
          {bodyMediaType.fields &&
            bodyMediaType.fields.map((field) => {
              return (
                <RequestBodyRow
                  key={field.name}
                  id={field.name}
                  requestBodyField={field}
                />
              );
            })}
        </div>
      );
    }

    // TEXT LIKE
    return (
      <RequestBodyCode
        language={
          (mediaTypeName.split("/")?.[1]?.toUpperCase() as CodeLanguage) ||
          CodeLanguage.TEXT
        }
        value={bodyMediaType.value || ""}
        onChange={(value) => bodyMediaType.setValue(value)}
      />
    );
  };

  return getContentTypeComponent();
});
