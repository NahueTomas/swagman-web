import { observer } from "mobx-react-lite";

import { RequestBody } from "../request-body/request-body";

import { ParameterModel } from "@/models/parameter.model";
import { CardSelectableButtons } from "@/shared/components/card-selectable-buttons/card-selectable-buttons";
import { RequestBodyModel } from "@/models/request-body.model";
import { cn } from "@/shared/utils/cn";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";

export const OperationBody = observer(
  ({
    contentTypeParameter,
    body,
  }: {
    contentTypeParameter: ParameterModel | undefined;
    body: RequestBodyModel | null;
  }) => {
    if (!contentTypeParameter || !body) return null;

    const mimeTypes = body.getMimeTypes();
    const currentMimeType = contentTypeParameter.value as string;

    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
        {/* Description - Muted and secondary */}
        {body.description && (
          <p className="relative before:absolute before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-700/50">
            <SanitizedMarkdown
              className="ml-4 text-xs italic text-foreground-500"
              content={body.description}
            />
          </p>
        )}

        {/* Compact Header Row */}
        <CardSelectableButtons
          options={mimeTypes.map((type) => ({
            value: type,
            selected: currentMimeType === type,
          }))}
          onClick={(value) => {
            if (value !== contentTypeParameter.value) {
              contentTypeParameter.setValue(value);
            } else if (!body.required) {
              contentTypeParameter.setValue(undefined);
            }
          }}
        />

        {/* Editor Area */}
        <div
          className={cn(
            "transition-all duration-200",
            !currentMimeType && "opacity-50 grayscale pointer-events-none"
          )}
        >
          {currentMimeType ? (
            <RequestBody bodyMediaType={body?.getMimeType(currentMimeType)} />
          ) : (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-divider/10 rounded-md bg-background-950/20">
              <span className="text-xs font-mono text-foreground-700">
                STATUS: IDLE
              </span>
              <p className="text-xxs text-foreground-800 italic mt-1">
                Select a media type to define the request body
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
