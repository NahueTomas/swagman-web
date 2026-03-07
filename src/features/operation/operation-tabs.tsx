import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

// Components
import { OperationResponse } from "./operation-response";
import { OperationCode } from "./operation-code";
import { OperationBody } from "./operation-body";
import { OperationParameter } from "./operation-parameter";
import { OperationParametersGrid } from "./operation-parameters-grid";
import { OperationSecurityParameter } from "./operation-security-parameter";

import { OperationModel } from "@/models/operation.model";
import { useStore } from "@/hooks/use-store";
import {
  BodyIcon,
  CodeIcon,
  DocumentTextIcon,
  HeadersIcon,
  ParametersIcon,
} from "@/shared/components/icons";
import { Tab, Tabs } from "@/shared/components/tabs";
import { Chip } from "@/shared/components/chip";
import { SanitizedMarkdown } from "@/shared/components/sanitized-markdown";

export const OperationTabs = observer(
  ({ operation }: { operation: OperationModel }) => {
    const [selectedTab, setSelectedTab] = useState("parameters");
    const [selectedResponseTab, setSelectedResponseTab] = useState("responses");

    const { operationFocused, spec } = useStore();

    const body = operation.getRequestBody();
    const globalSecurity = spec?.getGlobalSecurity() || [];

    const apiKeySecurities = globalSecurity.filter((sec) => {
      const securities = operation.security.length
        ? operation.security
        : spec?.security;
      const isUsed = securities?.some((req) =>
        Object.keys(req).includes(sec.getKey())
      );

      return (
        sec.getType() === "apiKey" &&
        sec.logged &&
        (securities?.length ? isUsed : true)
      );
    });

    const querySecurities = apiKeySecurities.filter(
      (s) => s.getIn() === "query"
    );
    const headerSecurities = apiKeySecurities.filter(
      (s) => s.getIn() === "header"
    );

    useEffect(() => {
      if (!body) setSelectedTab("parameters");
      setSelectedResponseTab("responses");
    }, [operation.id, body]);

    if (!operationFocused) return null;

    return (
      <div className="flex flex-col h-full p-6 gap-6 bg-background selection:bg-primary-500/30">
        {/* OPERATION SUMMARY & DESCRIPTION */}
        {(operation.summary || operation.description) && (
          <div className="flex flex-col gap-3 max-w-4xl">
            {operation.summary && (
              <h2 className="text-sm font-semibold text-foreground-400 italic">
                {operation.summary}
              </h2>
            )}
            {operation.description && (
              <div className="relative before:absolute before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-700/50">
                <SanitizedMarkdown
                  className="ml-4 text-xs text-foreground-500"
                  content={operation.description}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: REQUEST CONFIGURATION */}
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
            <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-top-1">
              {operation.getPathParameters().length > 0 && (
                <OperationParametersGrid title="Path Parameters">
                  {operation.getPathParameters().map((p) => (
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
                  {operation.getQueryParameters().map((p) => (
                    <OperationParameter key={p.id} parameter={p} />
                  ))}
                </OperationParametersGrid>
              )}

              {/* Empty State */}
              {operation.getPathParameters().length === 0 &&
                operation.getQueryParameters().length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-divider rounded-lg">
                    <ParametersIcon className="size-4 text-foreground-700" />
                    <p className="text-[11px] text-foreground-600 italic">
                      No parameters required for this endpoint.
                    </p>
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
            <div className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-1">
              {headerSecurities.length > 0 ||
              operation.getHeaderParameters().length > 0 ? (
                <OperationParametersGrid title="Request Headers">
                  {headerSecurities.map((sec) => (
                    <OperationSecurityParameter
                      key={sec.getKey()}
                      security={sec}
                    />
                  ))}
                  {operation.getHeaderParameters().map((p) => (
                    <OperationParameter key={p.id} parameter={p} />
                  ))}
                </OperationParametersGrid>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-divider/30 rounded-lg">
                  <HeadersIcon className="size-4 text-foreground-700" />
                  <p className="text-[11px] text-foreground-600 italic">
                    No custom headers defined for this endpoint.
                  </p>
                </div>
              )}
            </div>
          </Tab>

          {body && (
            <Tab
              key="body"
              title={
                <div className="flex items-center gap-2">
                  <BodyIcon className="size-3" />
                  <span>Body</span>
                  {body.required && <Chip label="*" variant="nobg-danger" />}
                </div>
              }
            >
              <div className="pt-6">
                <OperationBody
                  body={operation.getRequestBody()}
                  contentTypeParameter={operation.getContentType()}
                />
              </div>
            </Tab>
          )}
        </Tabs>

        {/* SECTION 2: RESPONSE */}
        <Tabs
          aria-label="Responses and Code"
          selectedKey={selectedResponseTab}
          onSelectionChange={(key) => setSelectedResponseTab(key.toString())}
        >
          <Tab
            key="responses"
            title={
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="size-3" />
                <span>Responses</span>
              </div>
            }
          >
            <div className="mt-6 flex-1 h-full overflow-hidden rounded-md">
              <OperationResponse
                acceptHeader={(operation.getAccept()?.value as string) || ""}
                operation={operation}
              />
            </div>
          </Tab>

          <Tab
            key="snippet"
            title={
              <div className="flex items-center gap-2">
                <CodeIcon className="size-3" />
                <span>Snippet</span>
              </div>
            }
          >
            <div className="mt-6 h-full rounded-md overflow-hidden">
              <OperationCode operation={operation} />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
);

OperationTabs.displayName = "OperationTabs";
