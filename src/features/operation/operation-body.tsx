import { observer } from "mobx-react-lite";

import { RequestBody } from "../request-body/request-body";

import { ParameterModel } from "@/models/parameter.model";
import { CardSelectableButtons } from "@/shared/components/card-selectable-buttons/card-selectable-buttons";
import { RequestBodyModel } from "@/models/request-body.model";
import { Chip } from "@/shared/components/chip";
import { cn } from "@/shared/utils/cn";
import { Subtitle } from "@/shared/components/subtitle";

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
      <div className="flex flex-col animate-in fade-in duration-300">
        {/* Compact Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Subtitle size="sm">Payload</Subtitle>
            {body.required && (
              <Chip
                label="Required"
                radius="sm"
                size="xxs"
                variant="ghost-danger"
              />
            )}
          </div>

          {/* Compact Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs mr-4 font-mono text-foreground-700 uppercase tracking-tighter">
              Encoding:
            </span>
            <div className="origin-right">
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
            </div>
          </div>
        </div>

        {/* Description - Muted and secondary */}
        {body.description && (
          <p className="text-xs text-foreground-500 italic mb-6 border-l border-divider pl-3">
            {body.description}
          </p>
        )}

        {/* Technical Separator / Encoding Display */}
        <div className="relative h-px bg-divider/20 mb-6 mt-2">
          <div className="absolute -top-2 left-0 right-0 flex justify-center">
            <span className="bg-background px-3 text-xxs font-mono text-primary-500/80 uppercase tracking-[0.2em] font-bold">
              {currentMimeType || "waiting_for_input"}
            </span>
          </div>
        </div>

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
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-divider/10 rounded-lg bg-background-950/20">
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
