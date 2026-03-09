import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { useDragResize } from "@/hooks/use-drag-resize";
import { Code } from "@/shared/components/code";
import {
  AlertTriangleIcon,
  ChevronUp,
  ExecuteIcon,
} from "@/shared/components/icons";
import {
  RESPONSE_PANEL,
  HTTP_STATUS_RANGES,
} from "@/shared/constants/constants";
import { memoize } from "@/shared/utils/memoize";
import { RequestResponseModel } from "@/models/request-response.model";
import { Chip } from "@/shared/components/chip";
import { cn } from "@/shared/utils/cn";
import { Tab, Tabs } from "@/shared/components/tabs";
import { Subtitle } from "@/shared/components/subtitle";
import { Variant } from "@/shared/types/variant";

// Custom Minimal Spinner
const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-spin rounded-full h-4 w-4 border-2 border-primary-500/20 border-t-primary-500",
      className
    )}
  />
);

interface ResponsePanelProps {
  response: RequestResponseModel;
  isLoading?: boolean;
}

const getLanguageFromContentType = memoize(
  (
    contentType: string
  ): "json" | "xml" | "html" | "javascript" | "css" | "plaintext" => {
    const lowerType = contentType.toLowerCase();

    if (lowerType.includes("json")) return "json";
    if (lowerType.includes("xml")) return "xml";
    if (lowerType.includes("html")) return "html";
    if (lowerType.includes("javascript")) return "javascript";
    if (lowerType.includes("css")) return "css";

    return "plaintext";
  }
);

const ResponsePanel = ({ response, isLoading }: ResponsePanelProps) => {
  const [activeTab, setActiveTab] = useState("body");
  const contentType =
    (response.getHeaders()?.["content-type"] as string) || "application/json";
  const data = response.getData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-700/40">
        <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-xl bg-background-600/60 border border-white/[0.06]">
          <Spinner className="h-7 w-7" />
          <Subtitle as="p" size="xxs">
            Requesting...
          </Subtitle>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <Tabs
        className="flex flex-col-reverse"
        classNames={{
          panel: "h-full overflow-auto",
          button: "px-4 h-7",
          tabList: "border-b-0 border-t",
        }}
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key)}
      >
        <Tab key="body" title="Body">
          <Code
            height="100%"
            language={getLanguageFromContentType(contentType)}
            readOnly={true}
            value={
              typeof data !== "string"
                ? JSON.stringify(data, null, 2)
                : String(data)
            }
          />
        </Tab>

        <Tab
          key="headers"
          title={`Headers (${Object.keys(response.getHeaders()).length})`}
        >
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-divider/30">
              {Object.entries(response.getHeaders()).map(([key, value]) => (
                <tr
                  key={key}
                  className="hover:bg-foreground-100/5 transition-colors"
                >
                  <td className="p-3 font-mono text-[11px] font-bold text-primary-400 w-1/3 select-all tracking-tight">
                    {key}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-foreground-400 break-all select-all">
                    {Array.isArray(value) ? value.join(", ") : value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tab>

        <Tab key="info" title="Metadata">
          <div className="p-4 space-y-5">
            {[
              { label: "URL", value: response.getUrl(), mono: true },
              {
                label: "Status",
                value: `${response.getStatus()} ${response.getStatusText()}`,
              },
              { label: "Timestamp", value: response.getDate() },
              { label: "Content Type", value: contentType },
              { label: "Success", value: response.getOK() ? "Yes" : "No" },
            ].map((item) => (
              <div key={item.label}>
                <Subtitle as="div" className="mb-1" size="micro">
                  {item.label}
                </Subtitle>
                <p
                  className={cn(
                    "text-xs text-foreground-200 break-all",
                    item.mono && "font-mono"
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export const OperationBottomBar = observer(() => {
  const { operationFocused } = useStore((state) => state);

  const {
    isDragging,
    isCollapsed,
    currentHeight,
    containerRef,
    dragRef,
    handleMouseDown,
    toggleCollapse,
  } = useDragResize({
    minHeight: RESPONSE_PANEL.MIN_HEIGHT,
    defaultHeight: RESPONSE_PANEL.DEFAULT_HEIGHT,
    maxHeightRatio: RESPONSE_PANEL.MAX_HEIGHT_RATIO,
  });

  const isLoading = operationFocused?.loadingRequestResponse ?? false;
  const requestError = operationFocused?.requestError ?? null;

  // Use the live in-memory response only — responses are no longer persisted
  const response = operationFocused?.requestResponse ?? null;

  // Auto-expand panel when loading starts or error occurs
  useEffect(() => {
    if ((isLoading || requestError) && isCollapsed) toggleCollapse();
  }, [isLoading, requestError, isCollapsed, toggleCollapse]);

  if (!operationFocused) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col transition-colors duration-300",
        isCollapsed
          ? "border-t border-divider bg-background-500 hover:bg-background-400"
          : "bg-background-600 border-t border-divider shadow-inner"
      )}
      style={{ height: currentHeight }}
    >
      {/* Wave Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary-900/20 overflow-hidden z-[60]">
          <div className="h-full bg-primary-500 shadow-[0_0_10px_#BE976E] animate-loading-wave w-[30%]" />
        </div>
      )}

      {/* Resize Handle - Fixed TS and A11y */}
      {!isCollapsed && (
        <button
          ref={dragRef as unknown as React.RefObject<HTMLButtonElement>}
          aria-label="Resize response panel"
          aria-valuemax={Math.round(
            window.innerHeight * RESPONSE_PANEL.MAX_HEIGHT_RATIO
          )}
          aria-valuemin={RESPONSE_PANEL.MIN_HEIGHT}
          aria-valuenow={Math.round(currentHeight)}
          className={cn(
            "h-[4px] w-full absolute top-0 left-0 right-0 z-50 transition-colors border-none p-0 outline-none",
            isDragging
              ? "bg-primary-500"
              : "hover:bg-primary-500/50 cursor-ns-resize bg-transparent"
          )}
          role="slider"
          type="button"
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Header Bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 h-10 shrink-0",
          !isCollapsed && "border-b border-divider/50"
        )}
      >
        <div className="flex items-center gap-3">
          <button
            aria-label={
              isCollapsed ? "Expand response panel" : "Collapse response panel"
            }
            className="flex items-center justify-center size-6 hover:bg-white/[0.06] rounded transition-colors"
            type="button"
            onClick={toggleCollapse}
          >
            <ChevronUp
              className={cn(
                "size-3.5 transition-transform duration-300",
                !isCollapsed && "rotate-180"
              )}
            />
          </button>

          <div className="flex items-center gap-2">
            {!isLoading && response && !requestError && (
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    getStatusDotClass(response.getStatus())
                  )}
                />
                {/* Ping ring on arrival */}
                <div
                  className={cn(
                    "absolute w-3 h-3 rounded-full animate-ping opacity-40",
                    getStatusDotClass(response.getStatus())
                  )}
                  style={{ animationIterationCount: 2 }}
                />
              </div>
            )}
            {!isLoading && requestError && (
              <div className="w-1.5 h-1.5 rounded-full bg-danger-500" />
            )}
            <Subtitle as="span" size="xxs">
              Response
            </Subtitle>
          </div>
        </div>

        {(response || isLoading || requestError) && (
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Chip
                label="Requesting..."
                radius="sm"
                size="xs"
                variant="ghost-primary"
              />
            ) : requestError ? (
              <Chip
                label="Error"
                radius="sm"
                size="xs"
                variant="ghost-danger"
              />
            ) : response ? (
              <div className="flex items-center gap-2">
                <span className="text-xxs font-mono text-foreground-500 mr-1">
                  {response.getDate()}
                </span>
                <Chip
                  label={`${response.getStatus()} ${response.getStatusText()}`}
                  radius="sm"
                  size="xs"
                  variant={getStatusColorVariant(response.getStatus())}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {requestError ? (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="flex flex-col items-center gap-4 px-6 py-6 min-h-full justify-center">
                <div className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 shrink-0">
                  <AlertTriangleIcon className="size-6 text-danger-500" />
                </div>
                <div className="space-y-2 text-center max-w-md">
                  <Subtitle as="p" className="text-danger-500" size="xxs">
                    Request Failed
                  </Subtitle>
                  <p className="text-xs text-foreground-400 leading-relaxed">
                    {requestError}
                  </p>
                  {requestError.includes("CORS") && (
                    <div className="mt-3 rounded-lg border border-white/[0.07] bg-background-500/20 p-4 text-left space-y-2">
                      <Subtitle as="p" size="micro">
                        Possible fixes
                      </Subtitle>
                      <ul className="text-[11px] text-foreground-500 space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>
                          Enable CORS on the target API server by adding{" "}
                          <code className="text-primary-400 font-mono text-[10px]">
                            Access-Control-Allow-Origin
                          </code>{" "}
                          headers
                        </li>
                        <li>
                          Use a CORS proxy between the browser and the API
                        </li>
                        <li>
                          Run the API on the same origin as this application
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : response ? (
            <ResponsePanel isLoading={isLoading} response={response} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <div className="relative p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <ExecuteIcon className="size-5 text-foreground-800" />
              </div>
              <div className="space-y-1 text-center">
                <Subtitle as="p" className="text-foreground-700" size="xxs">
                  No response yet
                </Subtitle>
                <p className="text-[11px] text-foreground-700 max-w-[200px] leading-relaxed">
                  Press{" "}
                  <span className="font-medium text-primary-600">Send</span> to
                  make a request
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const getStatusColorVariant = memoize((status: number): Variant => {
  const { SUCCESS, REDIRECT, CLIENT_ERROR, SERVER_ERROR } = HTTP_STATUS_RANGES;

  if (status >= SUCCESS.min && status <= SUCCESS.max) return "ghost-success";
  if (status >= REDIRECT.min && status <= REDIRECT.max) return "ghost-calm";
  if (status >= CLIENT_ERROR.min && status <= CLIENT_ERROR.max)
    return "ghost-danger";
  if (status >= SERVER_ERROR.min && status <= SERVER_ERROR.max)
    return "ghost-danger";

  return "ghost-default";
});

const getStatusDotClass = memoize((status: number): string => {
  const { SUCCESS, REDIRECT, CLIENT_ERROR, SERVER_ERROR } = HTTP_STATUS_RANGES;

  if (status >= SUCCESS.min && status <= SUCCESS.max) return "bg-success-500";
  if (status >= REDIRECT.min && status <= REDIRECT.max) return "bg-calm-500";
  if (status >= CLIENT_ERROR.min && status <= CLIENT_ERROR.max)
    return "bg-danger-500";
  if (status >= SERVER_ERROR.min && status <= SERVER_ERROR.max)
    return "bg-danger-500";

  return "bg-foreground-600";
});
