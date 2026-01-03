import { observer } from "mobx-react-lite";

import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { RequestBodyCode } from "@/features/request-body/request-body-code";
import { CodeLanguage } from "@/shared/types";
import { RequestBodyRow } from "@/features/request-body/request-body.row";
import { Subtitle } from "@/shared/components/subtitle";

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

    // FORM LIKE (multipart/form-data, application/x-www-form-urlencoded)
    if (mediaTypeFormat === "form") {
      return (
        <div className="border-b border-t border-divider">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-divider h-9">
                {/* Set explicit widths for small columns, let others flex */}
                <th className="w-10 px-3 py-1" />

                <th className="w-1/5 max-w-24 px-3 py-1">
                  <Subtitle size="xs">Field</Subtitle>
                </th>

                <th className="w-1/4 px-3 py-1">
                  <Subtitle size="xs">Value</Subtitle>
                </th>

                <th className="w-24 px-3 py-1">
                  <Subtitle size="xs">Type</Subtitle>
                </th>

                <th className="w-24 px-3 py-1">
                  <Subtitle size="xs">Format</Subtitle>
                </th>

                <th className="w-auto px-3 py-1">
                  <Subtitle size="xs">Description</Subtitle>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/50">
              {bodyMediaType.fields &&
                bodyMediaType.fields.map((field) => (
                  <RequestBodyRow
                    key={field.name}
                    id={field.name}
                    requestBodyField={field}
                  />
                ))}
            </tbody>
          </table>

          {(!bodyMediaType.fields || bodyMediaType.fields.length === 0) && (
            <div className="p-8 text-center text-xs text-foreground-500 italic">
              No body fields defined for this media type.
            </div>
          )}
        </div>
      );
    }

    // TEXT LIKE (JSON, XML, HTML, etc.)
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

  return <div>{getContentTypeComponent()}</div>;
});
