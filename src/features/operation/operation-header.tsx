import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import {
  ServerIcon,
  ThunderIcon,
  Copy,
  Check,
} from "@/shared/components/ui/icons";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";
import { OperationServers } from "@/features/operation/operation-servers";

export const OperationHeader = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { operationFocused: operation, spec } = useStore((state) => state);
  const { specificationUrl, specifications, getResponse } = useRequestForms(
    (state) => state
  );

  // Cleanup function for aborting requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!operation) return null;

  const currentValues = specifications?.[specificationUrl || ""]?.forms?.[
    operation?.id
  ] || {
    parameters: operation.getParameterDefaultValues(),
    requestBody: operation.getRequestBody()?.getFieldDefaultValues(),
    contentType: operation.getRequestBody()?.getMimeTypes()?.[0] || null,
  };

  const responseStatus = getResponse(specificationUrl || "", operation.id);

  const methodUpper = operation.method.toUpperCase();
  const methodColors: Record<string, { bg: string; text: string }> = {
    GET: {
      bg: "bg-primary/20",
      text: "text-primary-600",
    },
    POST: {
      bg: "bg-secondary/20",
      text: "text-secondary-600",
    },
    PUT: {
      bg: "bg-orange-500/20",
      text: "text-orange-600",
    },
    PATCH: {
      bg: "bg-success/20",
      text: "text-success-600",
    },
    DELETE: {
      bg: "bg-danger/20",
      text: "text-danger-600",
    },
    DEFAULT: {
      bg: "bg-divider/10",
      text: "text-divider",
    },
  };
  const colorSet = methodColors[methodUpper] || methodColors.DEFAULT;

  const handleCopyUrl = async () => {
    try {
      if (!spec) return;

      // Use spec.buildRequest to get the properly formatted URL
      const request = spec.buildRequest(
        operation,
        null, // requestBody
        currentValues?.parameters || null, // parameters
        null // contentType
      );

      const fullUrl = request.url;

      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      addToast({
        title: "URL Copied!",
        description: "Endpoint URL copied to clipboard",
        color: "success",
      });

      setTimeout(() => setIsCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addToast({
        title: "Copy Failed",
        description: "Failed to copy URL",
        color: "danger",
      });
    }
  };

  const handleExecute = async () => {
    try {
      if (!spec) return;

      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      useRequestForms
        .getState()
        .setResponseLoading(specificationUrl || "", operation.id);

      const response = await spec.makeRequest(
        operation,
        currentValues?.requestBody?.[currentValues?.contentType] || null,
        currentValues?.parameters,
        currentValues?.contentType || null
      );

      // Only update if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        useRequestForms
          .getState()
          .setResponseSuccess(specificationUrl || "", operation.id, response);
      }
    } catch (error: unknown) {
      // Only handle error if request wasn't aborted
      if (
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        useRequestForms
          .getState()
          .setResponseSuccess(specificationUrl || "", operation.id, null);

        addToast({
          title: "Request Failed",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          color: "danger",
        });
      }
    }
  };

  return (
    <header
      aria-label="API Operation Header"
      className="sticky top-0 z-50 border-b border-divider"
      role="banner"
    >
      <div className="w-full px-2 pt-2 pb-1.5">
        {/* Responsive Layout */}
        <div className="rounded-lg overflow-hidden">
          {/* Mobile Layout (Column) - Hidden on md+ */}
          <div className="flex flex-col md:hidden">
            {/* Mobile: Method + Tags Row */}
            <div className="flex items-center justify-between p-3 border-b border-divider/30">
              <div className="flex items-center gap-2 relative">
                <div
                  className={`absolute inset-0 ${colorSet.bg} blur-md select-none pointer-events-none`}
                />
                <Badge
                  color="default"
                  content={operation.deprecated ? "!" : undefined}
                  isInvisible={!operation.deprecated}
                  placement="top-right"
                  shape="circle"
                >
                  <div
                    className={`px-3 py-1.5 rounded-md ${colorSet.text} flex items-center justify-center`}
                  >
                    <span className="uppercase tracking-wider">
                      {methodUpper}
                    </span>
                  </div>
                </Badge>
              </div>

              {/* Mobile Tags */}
              {operation.tags && operation.tags.length > 0 && (
                <div
                  aria-label="API operation tags"
                  className="flex gap-1"
                  role="list"
                >
                  {operation.tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs text-foreground/60 rounded-md border border-divider"
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                  {operation.tags.length > 1 && (
                    <span
                      aria-label={`${operation.tags.length - 1} more tags`}
                      className="px-2 py-0.5 text-xs text-foreground/60 rounded-md border border-divider"
                      role="listitem"
                    >
                      +{operation.tags.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: URL Row */}
            <div className="p-3 border-b border-divider/30">
              <div className="font-mono text-xs text-foreground/90 overflow-hidden">
                <OperationHeaderUrl url={operation.path} />
              </div>
            </div>

            {/* Mobile: Actions Row */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Tooltip content="Server Settings">
                  <Button
                    isIconOnly
                    aria-label="Open server settings"
                    className="h-7 w-7"
                    radius="md"
                    size="sm"
                    variant="flat"
                    onClick={() => setIsServerModalOpen(true)}
                  >
                    <ServerIcon
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-foreground/60"
                    />
                  </Button>
                </Tooltip>

                <Tooltip content={isCopied ? "Copied!" : "Copy URL"}>
                  <Button
                    isIconOnly
                    aria-label={
                      isCopied
                        ? "URL copied to clipboard"
                        : "Copy operation URL"
                    }
                    className="h-7 w-7"
                    radius="md"
                    size="sm"
                    variant="flat"
                    onClick={handleCopyUrl}
                  >
                    {isCopied ? (
                      <Check
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-success"
                      />
                    ) : (
                      <Copy
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-foreground/60"
                      />
                    )}
                  </Button>
                </Tooltip>
              </div>

              <Button
                aria-label={
                  responseStatus?.loading
                    ? "Executing API request..."
                    : "Execute API request"
                }
                color="default"
                disabled={responseStatus?.loading}
                radius="md"
                size="sm"
                startContent={
                  <ThunderIcon
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      responseStatus?.loading ? "animate-spin" : ""
                    }`}
                  />
                }
                onClick={handleExecute}
              >
                <span className="text-sm">
                  {responseStatus?.loading ? "Executing..." : "Execute"}
                </span>
              </Button>
            </div>
          </div>

          {/* Desktop Layout (Row) - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-stretch h-14">
            {/* Desktop: HTTP Method Badge */}
            <div className={`flex items-center relative`}>
              <div
                className={`absolute inset-0 ${colorSet.bg} blur-xl select-none pointer-events-none`}
              />
              <Badge
                color="default"
                content={operation.deprecated ? "!" : undefined}
                isInvisible={!operation.deprecated}
                placement="top-right"
                shape="circle"
              >
                <div
                  className={`h-full min-w-24 flex items-center justify-center`}
                >
                  <span
                    className={`text-xl uppercase tracking-wider ${colorSet.text}`}
                  >
                    {methodUpper}
                  </span>
                </div>
              </Badge>
            </div>

            {/* Desktop: URL Bar */}
            <div className="flex-1 min-w-0 flex items-center">
              <div className="relative group w-full h-full flex items-center">
                <div className="w-full h-full flex items-center">
                  <div className="flex-1 px-4 font-mono text-sm overflow-hidden">
                    <OperationHeaderUrl url={operation.path} />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Execute Button */}
            <div className="flex items-center">
              <button
                aria-label={
                  responseStatus?.loading
                    ? "Executing API request..."
                    : "Execute API request"
                }
                className="flex gap-6 items-center border-l-0 h-full rounded-lg px-4 transition-colors bg-content2 hover:bg-content3"
                disabled={responseStatus?.loading}
                onClick={handleExecute}
              >
                <ThunderIcon
                  aria-hidden="true"
                  className={`w-4 h-4 ${
                    responseStatus?.loading ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm font-semibold">
                  {responseStatus?.loading ? "Executing..." : "Execute"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Row - Only shown on md+ */}
        <div className="hidden md:flex items-center justify-between mt-3 pt-1.5 border-t border-divider">
          <div className="flex items-center gap-2">
            <Tooltip content="Server Settings">
              <Button
                isIconOnly
                aria-label="Open server settings"
                className="h-6 w-6"
                radius="md"
                size="sm"
                variant="flat"
                onClick={() => setIsServerModalOpen(true)}
              >
                <ServerIcon
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-foreground/60"
                />
              </Button>
            </Tooltip>

            <Tooltip content={isCopied ? "Copied!" : "Copy URL"}>
              <Button
                isIconOnly
                aria-label={
                  isCopied ? "URL copied to clipboard" : "Copy operation URL"
                }
                className="h-6 w-6"
                radius="md"
                size="sm"
                variant="flat"
                onClick={handleCopyUrl}
              >
                {isCopied ? (
                  <Check
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-success"
                  />
                ) : (
                  <Copy
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-foreground/60"
                  />
                )}
              </Button>
            </Tooltip>
          </div>

          {/* Desktop Tags */}
          {operation.tags && operation.tags.length > 0 && (
            <div
              aria-label="API operation tags"
              className="flex items-center gap-2 flex-shrink-0"
              role="list"
            >
              <div className="flex gap-1.5">
                {operation.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs text-foreground/60 rounded-md border border-divider/30"
                    role="listitem"
                  >
                    {tag}
                  </span>
                ))}
                {operation.tags.length > 2 && (
                  <span
                    aria-label={`${operation.tags.length - 2} more tags`}
                    className="px-2 py-0.5 text-xs text-foreground/60 rounded-md border border-divider/30"
                    role="listitem"
                  >
                    +{operation.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isServerModalOpen && (
        <OperationServers
          isOpen={isServerModalOpen}
          onClose={() => setIsServerModalOpen(false)}
        />
      )}
    </header>
  );
};
