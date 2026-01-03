import { useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";

// Components
import { OperationResponse } from "./operation-response";
import { OperationCode } from "./operation-code";
import { OperationBody } from "./operation-body";
import { OperationParameter } from "./operation-parameter";
import { OperationParametersGrid } from "./operation-parameters-grid";
import { OperationSecurityParameter } from "./operation-security-parameter";

import { useStore } from "@/hooks/use-store";
import {
  BodyIcon,
  CodeIcon,
  DocumentTextIcon,
  HeadersIcon,
  ParametersIcon,
} from "@/shared/components/icons";
import { Tab, Tabs } from "@/shared/components/tabs";
import { Subtitle } from "@/shared/components/subtitle";

export const OperationTabs = observer(({ operation }: { operation: any }) => {
  const [selectedTab, setSelectedTab] = useState("parameters");
  const [selectedResponseTab, setSelectedResponseTab] = useState("responses");

  const { operationFocused, spec } = useStore();

  const body = operation.getRequestBody();
  const globalSecurity = spec?.getGlobalSecurity() || [];

  const apiKeySecurities = globalSecurity.filter((sec) => {
    const securities = operation.security.length
      ? operation.security
      : spec?.security;
    const isUsed = securities?.some((req: any) =>
      Object.keys(req).includes(sec.getKey())
    );

    return (
      sec.getType() === "apiKey" &&
      sec.logged &&
      (securities?.length ? isUsed : true)
    );
  });

  const querySecurities = apiKeySecurities.filter((s) => s.getIn() === "query");
  const headerSecurities = apiKeySecurities.filter(
    (s) => s.getIn() === "header"
  );

  const requestPreview = useMemo(() => {
    return operationFocused && spec
      ? spec.buildRequest(operationFocused)
      : null;
  }, [operationFocused, spec]);

  useEffect(() => {
    if (!body) setSelectedTab("parameters");
    setSelectedResponseTab("responses");
  }, [operation.id, body]);

  if (!operationFocused) return null;

  return (
    <div className="flex flex-col h-full bg-background selection:bg-primary-500/30">
      {/* SECTION 1: REQUEST CONFIGURATION */}
      <div className="flex-1 min-h-[400px] border-b border-divider/40 flex flex-col">
        <div className="px-6 py-4">
          <Subtitle className="text-foreground-700 font-black mb-4" size="xxs">
            REQUEST CONFIGURATION
          </Subtitle>

          <Tabs
            aria-label="Request configuration"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key.toString())}
          >
            <Tab
              key="parameters"
              title={
                <div className="flex items-center gap-2">
                  <ParametersIcon className="size-3" />
                  <span>Params</span>
                </div>
              }
            >
              <div className="py-6 space-y-8 animate-in fade-in slide-in-from-top-1">
                {operation.getPathParameters().length > 0 && (
                  <OperationParametersGrid title="Path Variables">
                    {operation.getPathParameters().map((p: any) => (
                      <OperationParameter key={p.id} parameter={p} />
                    ))}
                  </OperationParametersGrid>
                )}

                {(operation.getQueryParameters().length > 0 ||
                  querySecurities.length > 0) && (
                  <OperationParametersGrid title="Query Parameters">
                    {querySecurities.map((sec) => (
                      <OperationSecurityParameter
                        key={sec.getKey()}
                        security={sec}
                      />
                    ))}
                    {operation.getQueryParameters().map((p: any) => (
                      <OperationParameter key={p.id} parameter={p} />
                    ))}
                  </OperationParametersGrid>
                )}

                {/* Empty State */}
                {operation.getPathParameters().length === 0 &&
                  operation.getQueryParameters().length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-divider/20 rounded-lg text-foreground-500 text-xs font-mono italic">
                      No parameters required for this endpoint.
                    </div>
                  )}
              </div>
            </Tab>

            <Tab
              key="headers"
              title={
                <div className="flex items-center gap-2">
                  <HeadersIcon className="size-3" />
                  <span>Headers</span>
                </div>
              }
            >
              <div className="py-6 space-y-6">
                <OperationParametersGrid title="Request Headers">
                  {headerSecurities.map((sec) => (
                    <OperationSecurityParameter
                      key={sec.getKey()}
                      security={sec}
                    />
                  ))}
                  {operation.getHeaderParameters().map((p: any) => (
                    <OperationParameter key={p.id} parameter={p} />
                  ))}
                </OperationParametersGrid>
              </div>
            </Tab>

            {body && (
              <Tab
                key="body"
                title={
                  <div className="flex items-center gap-2">
                    <BodyIcon className="size-3" />
                    <span>Body</span>
                    {body.required && (
                      <span className="text-primary-500 ml-0.5">•</span>
                    )}
                  </div>
                }
              >
                <div className="mt-2">
                  <OperationBody
                    body={operation.getRequestBody()}
                    contentTypeParameter={operation.getContentType()}
                  />
                </div>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>

      {/* SECTION 2: RESPONSE */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-6 flex flex-col h-full">
          <Subtitle className="text-foreground-700 font-black mb-4" size="xxs">
            RESPONSE
          </Subtitle>

          <Tabs
            aria-label="Responses and Code"
            selectedKey={selectedResponseTab}
            onSelectionChange={(key) => setSelectedResponseTab(key.toString())}
          >
            <Tab
              key="responses"
              title={
                <div className="flex items-center gap-2 px-2">
                  <DocumentTextIcon className="size-3 text-primary-500" />
                  <span>Responses</span>
                </div>
              }
            >
              <div className="mt-4 flex-1 h-full overflow-hidden rounded-md">
                <OperationResponse
                  acceptHeader={(operation.getAccept()?.value as string) || ""}
                  operation={operation}
                />
              </div>
            </Tab>

            <Tab
              key="snippet"
              title={
                <div className="flex items-center gap-2 px-2">
                  <CodeIcon className="size-3 text-foreground-400" />
                  <span>Snippet</span>
                </div>
              }
            >
              <div className="mt-4 h-full rounded-md overflow-hidden">
                <OperationCode requestPreview={requestPreview} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
});

OperationTabs.displayName = "OperationTabs";
