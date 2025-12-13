import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";

import { RequestBody } from "../request-body/request-body";

import { ParameterModel } from "@/models/parameter.model";
import { CardSelectableButtons } from "@/shared/components/ui/card-selectable-buttons";
import { HeadersIcon } from "@/shared/components/ui/icons";
import { Subtitle } from "@/shared/components/ui/subtitle";
import { RequestBodyModel } from "@/models/request-body.model";

export const OperationBody = observer(
  ({
    contentTypeParameter,
    body,
  }: {
    contentTypeParameter: ParameterModel | undefined;
    body: RequestBodyModel | null;
  }) => {
    if (!contentTypeParameter || !body) return null;

    return (
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <Subtitle>
            <div className="flex items-center gap-2">
              Body Content
              {body.required && (
                <Chip color="danger" radius="sm" size="sm" variant="flat">
                  required
                </Chip>
              )}
            </div>
          </Subtitle>

          {body.description && (
            <span className="text-tiny font-semibold text-content4">
              {body.description}
            </span>
          )}

          <CardSelectableButtons
            options={body.getMimeTypes().map((type) => ({
              value: type,
              selected: contentTypeParameter?.value === type,
            }))}
            onClick={(value) => {
              if (value !== contentTypeParameter.value)
                contentTypeParameter.setValue(value);
              else if (!body.required && value === contentTypeParameter.value)
                contentTypeParameter.setValue(undefined);
            }}
          >
            <>
              <HeadersIcon className="size-4" />
              Content-Type (Header):
            </>
          </CardSelectableButtons>
        </div>

        <div className="space-y-2">
          <RequestBody
            bodyMediaType={body?.getMimeType(
              contentTypeParameter.value as string
            )}
          />
        </div>
      </div>
    );
  }
);
