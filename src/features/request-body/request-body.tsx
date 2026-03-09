import { observer } from "mobx-react-lite";

import { RequestBodyMediaType } from "@/models/request-body-media-type";
import { RequestBodyCode } from "@/features/request-body/request-body-code";
import { CodeLanguage } from "@/shared/types";
import { RequestBodyRow } from "@/features/request-body/request-body.row";
import { Subtitle } from "@/shared/components/subtitle";
import { useCacheStore } from "@/hooks/use-cache-store";
import { useStore } from "@/hooks/use-store";

interface RequestBodyProps {
  bodyMediaType: RequestBodyMediaType | undefined;
}

export const RequestBody = observer(({ bodyMediaType }: RequestBodyProps) => {
  const { spec } = useStore();
  const setBodyText = useCacheStore((s) => s.setBodyText);

  if (!bodyMediaType) return null;

  const mediaTypeName = bodyMediaType.name;
  const mediaTypeFormat = bodyMediaType.getMediaTypeFormat();

  const getContentTypeComponent = () => {
    // NONE
    if (mediaTypeName === "none") return null;

    // FORM LIKE (multipart/form-data, application/x-www-form-urlencoded)
    if (mediaTypeFormat === "form") {
      return (
        <div className="rounded-lg border border-white/[0.05] overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse table-fixed min-w-[360px]">
            <thead>
              <tr className="border-b border-white/[0.05] h-8 bg-white/[0.02]">
                {/* Checkbox — always visible */}
                <th className="px-2 w-8" scope="col" />

                {/* Field name — always visible */}
                <th className="px-2 w-1/5 max-w-24" scope="col">
                  <Subtitle as="span" size="micro">
                    Field
                  </Subtitle>
                </th>

                {/* Value — always visible */}
                <th className="pl-5 pr-2 w-1/4" scope="col">
                  <Subtitle as="span" size="micro">
                    Value
                  </Subtitle>
                </th>

                {/* Type — hidden below md */}
                <th className="px-2 hidden md:table-cell w-24 py-1" scope="col">
                  <Subtitle as="span" size="micro">
                    Type
                  </Subtitle>
                </th>

                {/* Description — hidden below lg */}
                <th
                  className="px-2 hidden lg:table-cell w-auto py-1"
                  scope="col"
                >
                  <Subtitle as="span" size="micro">
                    Description
                  </Subtitle>
                </th>
              </tr>
            </thead>
            <tbody>
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
        onChange={(value) => {
          bodyMediaType.setValue(value);
          if (spec?.specKey) {
            setBodyText(
              spec.specKey,
              bodyMediaType.operationId,
              mediaTypeName,
              value
            );
          }
        }}
      />
    );
  };

  return <div>{getContentTypeComponent()}</div>;
});
