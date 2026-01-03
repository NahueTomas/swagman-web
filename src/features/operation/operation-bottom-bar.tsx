import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { useDragResize } from "@/hooks/use-drag-resize";
import { Code } from "@/shared/components/code";
import { ChevronUp } from "@/shared/components/icons";
import {
  RESPONSE_PANEL,
  HTTP_STATUS_RANGES,
} from "@/shared/constants/constants";
import { memoize } from "@/shared/utils/memoize";
import { RequestResponseModel } from "@/models/request-response.model";
import { Chip } from "@/shared/components/chip";
import { cn } from "@/shared/utils/cn";
import { Tab, Tabs } from "@/shared/components/tabs";
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
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground-400 font-bold">
            Loading...
          </p>
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
            <div key={item.label} className="bg-background-500 p-4">
              <div className="text-[9px] font-black text-foreground-600 uppercase tracking-[0.2em] mb-1">
                {item.label}
              </div>
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

  if (!operationFocused) return null;

  const response = operationFocused.requestResponse;
  const isLoading = operationFocused.loadingRequestResponse;

  if (isLoading && isCollapsed) toggleCollapse();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col transition-colors duration-300",
        isCollapsed
          ? "border-t border-divider bg-background-500"
          : "bg-background-500 border-t border-divider"
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
          "flex items-center justify-between px-4 h-10 shrink-0 border-b border-divider"
        )}
      >
        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center size-6 hover:bg-foreground-100/10 rounded transition-colors"
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

          <span className="text-xxs font-black uppercase tracking-[0.2em] text-foreground-400">
            RESPONSE
          </span>
        </div>

        {(response || isLoading) && (
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Chip label="Requesting..." size="xs" variant="ghost-primary" />
            ) : response ? (
              <div className="flex items-center gap-2">
                <span className="text-xxs font-mono text-foreground-100 mr-2">
                  {response.getDate()}
                </span>
                <Chip
                  label={`${response.getStatus()} ${response.getStatusText()}`}
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
          {response ? (
            <ResponsePanel isLoading={isLoading} response={response} />
          ) : (
            <div className="flex items-center justify-center h-full opacity-40">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold">
                Await execution
              </p>
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
