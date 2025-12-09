import { useEffect, useState, useMemo } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { observer } from "mobx-react-lite";

import { OperationParameter } from "./operation-parameter";
import { OperationResponse } from "./operation-response";
import { OperationCode } from "./operation-code";
import { OperationBody } from "./operation-body";

import { Subtitle } from "@/shared/components/ui/subtitle";
import { OperationModel } from "@/models/operation.model";
import { useStore } from "@/hooks/use-store";
import {
  BodyIcon,
  CodeIcon,
  DocumentTextIcon,
  HeadersIcon,
  ParametersIcon,
} from "@/shared/components/ui/icons";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
import { FormFieldCheckbox } from "@/shared/components/ui/form-fields/form-field-checkbox";

export const OperationTabs = observer(function OperationTabs({
  operation,
}: {
  operation: OperationModel;
}) {
  const [selectedTab, setSelectedTab] = useState("parameters");
  const [selectedResponseTab, setSelectedResponseTab] = useState("responses");

  const operationFocused = useStore((state) => state.operationFocused);
  const spec = useStore((state) => state.spec);

  // Get operation data - observer will track all observable accesses
  const body = operation.getRequestBody();
  const globalSecurity = spec?.getGlobalSecurity() || [];

  // Get authorized API keys for this operation
  const apiKeySecurities = globalSecurity.filter((sec) => {
    const securities = operation.security.length
      ? operation.security
      : spec?.security;

    const isUsedByOperation = securities?.some((req) =>
      Object.keys(req).includes(sec.getName())
    );

    return (
      sec.getType() === "apiKey" &&
      sec.logged &&
      (securities?.length ? isUsedByOperation : true)
    );
  });

  // Separate API keys by location (query, header)
  const apiKeyQueryParams = apiKeySecurities.filter(
    (sec) => sec.getIn() === "query"
  );
  const apiKeyHeaderParams = apiKeySecurities.filter(
    (sec) => sec.getIn() === "header"
  );

  const operationData = {
    body,
    isBodyRequired: body?.required || false,
    bodyMimeTypes: body?.getMimeTypes() || [],
    queryParams: operation.getQueryParameters(),
    pathParams: operation.getPathParameters(),
    headerParams: operation.getHeaderParameters(),
    apiKeyQueryParams,
    apiKeyHeaderParams,
  };

  // Memoize the request preview
  const requestPreview = useMemo(() => {
    if (!operationFocused || !spec) return null;

    return spec.buildRequest(operationFocused);
  }, [operationFocused, spec]);

  // Optimized effect to reset tabs
  useEffect(() => {
    if (!operationData.body) {
      setSelectedTab("parameters");
    }
    setSelectedResponseTab("responses");
  }, [operation.id, operationData.body]);

  if (!operationFocused) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="Parameters, Headers and Body"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            panel: "p-0",
            cursor: "w-full",
            tab: "max-w-fit px-0 h-12",
          }}
          color="default"
          selectedKey={selectedTab}
          size="lg"
          variant="underlined"
          onSelectionChange={(key) => setSelectedTab(key.toString())}
        >
          <Tab
            key="parameters"
            title={
              <div className="flex items-center gap-2">
                <ParametersIcon className="size-4" />
                Parameters
              </div>
            }
          >
            <div className="flex flex-col space-y-4">
              {operationData.pathParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>Path Parameters</Subtitle>

                  <div className="border border-divider rounded-lg">
                    {operationData.pathParams.map((param) => (
                      <OperationParameter key={param.id} parameter={param} />
                    ))}
                  </div>
                </div>
              )}
              {(operationData.queryParams.length > 0 ||
                operationData.apiKeyQueryParams.length > 0) && (
                <div className="space-y-2">
                  <Subtitle>Query Parameters</Subtitle>

                  <div className="border border-divider rounded-lg">
                    {operationData.apiKeyQueryParams.map((sec) => (
                      <div
                        key={sec.getName()}
                        className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center bg-success/5"
                      >
                        {/* Checkbox column - always checked for security */}
                        <div className="flex items-center">
                          <FormFieldCheckbox
                            required
                            value={true}
                            onChange={() => null}
                          />
                        </div>

                        {/* Parameter info */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {sec.getName()}
                            </span>
                            <Chip
                              color="success"
                              radius="sm"
                              size="sm"
                              variant="flat"
                            >
                              {"security<apiKey>"}
                            </Chip>
                          </div>

                          {sec.getDescription() && (
                            <p className="text-xs mt-4">
                              {sec.getDescription()}
                            </p>
                          )}
                        </div>

                        {/* Value display */}
                        <FormFieldText
                          disabled
                          value="•••••••"
                          onChange={() => null}
                        />
                      </div>
                    ))}
                    {operationData.queryParams.map((param) => (
                      <OperationParameter key={param.id} parameter={param} />
                    ))}
                  </div>
                </div>
              )}
              {operationData.pathParams.length === 0 &&
                operationData.queryParams.length === 0 &&
                operationData.apiKeyQueryParams.length === 0 && (
                  <div className="p-3 text-sm text-center border border-divider rounded-lg">
                    No parameters defined for this operation
                  </div>
                )}
            </div>
          </Tab>

          <Tab
            key="headers"
            title={
              <div className="flex items-center gap-2">
                <HeadersIcon className="size-4" />
                Headers
              </div>
            }
          >
            <div className="flex flex-col space-y-4">
              {(operationData.headerParams.length > 0 ||
                operationData.apiKeyHeaderParams.length > 0) && (
                <div className="space-y-2">
                  <Subtitle>Header Parameters</Subtitle>

                  <div className="border border-divider rounded-lg">
                    {operationData.apiKeyHeaderParams.map((sec) => (
                      <div
                        key={sec.getName()}
                        className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1fr] gap-3 p-3 border-b border-divider last:border-b-0 transition-colors items-center bg-success/5"
                      >
                        {/* Checkbox column - always checked for security */}
                        <div className="flex items-center">
                          <FormFieldCheckbox
                            required
                            value={true}
                            onChange={() => null}
                          />
                        </div>

                        {/* Parameter info */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {sec.getName()}
                            </span>
                            <Chip
                              color="success"
                              radius="sm"
                              size="sm"
                              variant="flat"
                            >
                              {"security<apiKey>"}
                            </Chip>
                          </div>

                          {sec.getDescription() && (
                            <p className="text-xs mt-4">
                              {sec.getDescription()}
                            </p>
                          )}
                        </div>

                        {/* Value display */}
                        <FormFieldText
                          disabled
                          value="•••••••"
                          onChange={() => null}
                        />
                      </div>
                    ))}
                    {operationData.headerParams.map((param) => (
                      <OperationParameter key={param.id} parameter={param} />
                    ))}
                  </div>
                </div>
              )}
              {operationData.headerParams.length === 0 &&
                operationData.apiKeyHeaderParams.length === 0 && (
                  <div className="p-3 text-sm text-center border border-divider rounded-lg">
                    No headers defined for this operation
                  </div>
                )}
            </div>
          </Tab>

          <Tab
            key="body"
            isDisabled={!operationData.body}
            title={
              <div className="flex items-center gap-2">
                <BodyIcon className="size-4" />
                Body
              </div>
            }
          >
            <OperationBody
              body={operation.getRequestBody()}
              contentTypeParameter={operation.getContentType()}
            />
          </Tab>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="Responses and Code"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            panel: "p-0",
            cursor: "w-full",
            tab: "max-w-fit px-0 h-12",
          }}
          color="default"
          selectedKey={selectedResponseTab}
          size="lg"
          variant="underlined"
          onSelectionChange={(key) => setSelectedResponseTab(key.toString())}
        >
          <Tab
            key="responses"
            title={
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="size-4" />
                Responses
              </div>
            }
          >
            <OperationResponse
              acceptHeader={(operation.getAccept()?.value as string) || ""}
              operation={operation}
            />
          </Tab>

          <Tab
            key="code"
            title={
              <div className="flex items-center gap-2">
                <CodeIcon className="size-4" />
                Code
              </div>
            }
          >
            <OperationCode
              requestPreview={{
                url: requestPreview.url,
                method: requestPreview.method,
                headers: requestPreview.headers,
                body: requestPreview.body,
              }}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

OperationTabs.displayName = "OperationTabs";
