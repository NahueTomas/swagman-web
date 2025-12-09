import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { Spinner } from "@heroui/spinner";

import { useStore } from "@/hooks/use-store";
import { useDragResize } from "@/hooks/use-drag-resize";
import { Code } from "@/shared/components/ui/code";
import { ChevronUp } from "@/shared/components/ui/icons";
import {
  RESPONSE_PANEL,
  HTTP_STATUS_RANGES,
} from "@/shared/constants/constants";
import { memoize } from "@/shared/utils/memoize";
import { RequestResponseModel } from "@/models/request-response.model";
import { observer } from "mobx-react-lite";

interface ResponsePanelProps {
  response: RequestResponseModel;
  isLoading?: boolean;
}

// Memoized language detection function
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
  const contentType =
    (response.getHeaders()?.["content-type"] as string) || "application/json";

  // Memoize formatted body to avoid re-stringifying on every render
  const data = response.getData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-default-500">Loading response...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col-reverse">
      <Tabs
        className="flex-1 h-full"
        classNames={{
          tabList: "gap-2 w-full relative p-0",
          panel: "p-0 h-full overflow-hidden border-t border-b border-divider",
          cursor: "w-full",
          tab: "w-auto",
        }}
        color="default"
        defaultSelectedKey="body"
        size="sm"
        variant="underlined"
      >
        <Tab key="body" title="Body">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
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
            </div>
          </div>
        </Tab>

        <Tab
          key="headers"
          title={`Headers (${Object.keys(response.getHeaders()).length})`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-divider">
                {Object.entries(response.getHeaders()).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 gap-4 p-3 transition-colors"
                  >
                    <div className="font-mono text-[12px] font-medium text-primary">
                      {key}
                    </div>
                    <div className="font-mono text-[12px] text-default-600 break-all">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="info" title="Info">
          <div className="h-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-default-500 uppercase tracking-wide">
                  URL
                </div>
                <p className="text-xs font-mono text-default-700 break-all">
                  {response.getUrl()}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-default-500 uppercase tracking-wide">
                  Status
                </div>
                <p className="text-xs text-default-700">
                  {response.getStatus()}{" "}
                  {response.getStatusText()
                    ? ` ${response.getStatusText()}`
                    : ""}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-default-500 uppercase tracking-wide">
                  Date
                </div>
                <p className="text-xs text-default-700">{response.getDate()}</p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-default-500 uppercase tracking-wide">
                  Content Type
                </div>
                <p className="text-xs text-default-700">{contentType}</p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-default-500 uppercase tracking-wide">
                  Success
                </div>
                <p className="text-xs text-default-700">
                  {response.getOK() ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

ResponsePanel.displayName = "ResponsePanel";

export const OperationBottomBar = observer(() => {
  const { operationFocused } = useStore((state) => state);

  // Use custom drag resize hook
  const {
    isDragging,
    isCollapsed,
    isMaximized,
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

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex flex-col border-t border-divider ${isCollapsed ? "" : "bg-content2 shadow-2xl"}`}
      style={{
        height: currentHeight,
      }}
    >
      {/* Loading Animation Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-transparent overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              animation: "loading-wave 2s ease-in-out infinite",
              width: "30%",
            }}
          />
        </div>
      )}

      {/* Resize Handle */}
      <div
        ref={dragRef}
        aria-label="Resize response panel"
        className={`
          h-1 cursor-ns-resize
          absolute top-0 left-0 right-0
          hover:bg-primary/10 transition-all duration-0
          ${isDragging ? "bg-primary/50" : "bg-transparent"}
          ${isCollapsed || isMaximized ? "cursor-default opacity-0" : "cursor-ns-resize"}
        `}
        role="button"
        style={{
          pointerEvents: isCollapsed || isMaximized ? "none" : "auto",
        }}
        tabIndex={0}
        onMouseDown={handleMouseDown}
      />

      {/* Header Bar */}
      <div className="w-full flex items-center justify-between p-2">
        <Button
          isIconOnly
          className="min-w-6 w-6 h-6"
          color="default"
          size="sm"
          variant="light"
          onClick={toggleCollapse}
        >
          <ChevronUp
            className={`size-3 transition-transform ${isCollapsed ? "rotate-0" : "rotate-180"}`}
          />
        </Button>

        {(response || isLoading) && (
          <>
            <div className="flex items-center gap-2 text-xs text-default-500">
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Loading...</span>
                </>
              ) : response ? (
                <>
                  <span>{response.getDate()}</span>
                  <Chip color="default" radius="sm" size="sm" variant="flat">
                    {(response.getHeaders()?.["content-type"] as string) ||
                      "application/json"}
                  </Chip>
                  <Chip
                    color={getStatusColorVariant(response.getStatus())}
                    size="sm"
                    title={`${response.getStatus()}: ${response.getStatusText()}`}
                    variant="flat"
                  >
                    {response.getStatus()} {response.getStatusText()}
                  </Chip>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {response ? (
            <ResponsePanel isLoading={isLoading} response={response} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                    <div className="flex gap-2 items-center">
                      <Spinner size="lg" />
                      <p className="text-sm text-default-500">
                        Waiting for response...
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-default-500">
                    Execute a request to see the response
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Helper function for status color using constants
const getStatusColorVariant = memoize(
  (
    status: number
  ): "success" | "warning" | "danger" | "secondary" | "default" => {
    const { SUCCESS, REDIRECT, CLIENT_ERROR, SERVER_ERROR } =
      HTTP_STATUS_RANGES;

    if (status >= SUCCESS.min && status <= SUCCESS.max) return "success";
    if (status >= REDIRECT.min && status <= REDIRECT.max) return "warning";
    if (status >= CLIENT_ERROR.min && status <= CLIENT_ERROR.max)
      return "danger";
    if (status >= SERVER_ERROR.min && status <= SERVER_ERROR.max)
      return "secondary";

    return "default";
  }
);
