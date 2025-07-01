import { useState } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { ServerIcon, ThunderIcon, Copy } from "@/shared/components/ui/icons";

// Simple check icon component
const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

import { OperationHeaderUrl } from "@/features/operation/operation-header-url";
import { OperationServers } from "@/features/operation/operation-servers";

export const OperationHeader = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { operationFocused: operation, spec } = useStore((state) => state);
  const { specificationUrl, specifications, getResponse } = useRequestForms(
    (state) => state
  );

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
  const methodColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    GET: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/20",
    },
    POST: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-500/20",
    },
    PUT: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/20",
    },
    PATCH: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/20",
    },
    DELETE: {
      bg: "bg-red-500/10",
      text: "text-red-600",
      border: "border-red-500/20",
    },
    DEFAULT: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      border: "border-gray-500/20",
    },
  };
  const colorSet = methodColors[methodUpper] || methodColors.DEFAULT;

  const handleCopyUrl = async () => {
    try {
      const baseUrl = spec?.servers?.[0]?.getUrl() || window.location.origin;
      const fullUrl = `${baseUrl}${operation.path}`;

      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      addToast({
        title: "URL Copied!",
        description: "Endpoint URL copied to clipboard",
        color: "success",
      });

      setTimeout(() => setIsCopied(false), 2000);
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

      useRequestForms
        .getState()
        .setResponseLoading(specificationUrl || "", operation.id);
      const response = await spec.makeRequest(
        operation,
        currentValues?.requestBody?.[currentValues?.contentType] || null,
        currentValues?.parameters,
        currentValues?.contentType || null
      );

      useRequestForms
        .getState()
        .setResponseSuccess(specificationUrl || "", operation.id, response);
    } catch (error: unknown) {
      useRequestForms
        .getState()
        .setResponseSuccess(specificationUrl || "", operation.id, null);
      throw error;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur border-b border-divider/10">
      <div className="w-full px-4 sm:px-8 pt-3 pb-2">
        {/* Modern Single-Line Layout */}
        <div className="flex items-stretch border border-divider rounded-lg h-12 sm:h-14 bg-background">
          {/* HTTP Method Badge - Integrated */}
          <div className="flex items-center">
            <Badge
              color="default"
              content={operation.deprecated ? "!" : undefined}
              isInvisible={!operation.deprecated}
              placement="top-right"
              shape="circle"
            >
              <div
                className={`h-full min-w-1 sm:min-w-20 ${colorSet.text} flex items-center justify-center`}
              >
                <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  {methodUpper}
                </span>
              </div>
            </Badge>
          </div>

          {/* Divider */}
          <div className="w-px bg-divider" />

          {/* URL Bar - Maximum Space (Postman Style) */}
          <div className="flex-1 min-w-0 flex items-center">
            <div className="relative group w-full h-full flex items-center">
              <div className="w-full h-full flex items-center">
                <div className="flex-1 px-3 sm:px-4 font-mono text-xs sm:text-sm overflow-hidden">
                  <OperationHeaderUrl url={operation.path} />
                </div>
              </div>
            </div>
          </div>

          {/* Execute Button - Prominent but Clean */}
          <div className="flex items-center">
            <Button
              className="mr-2"
              disabled={responseStatus?.loading}
              radius="sm"
              startContent={
                <ThunderIcon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    responseStatus?.loading ? "animate-spin" : ""
                  }`}
                />
              }
              onClick={handleExecute}
            >
              <span className="hidden sm:inline text-sm">
                {responseStatus?.loading ? "Executing..." : "Execute"}
              </span>
              <span className="sm:hidden text-xs">
                {responseStatus?.loading ? "..." : "Execute"}
              </span>
            </Button>
          </div>
        </div>

        {/* Secondary Row - Server Config & Tags */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-divider/10">
          <div className="flex items-center gap-2">
            {/* Server Config */}
            <div className="flex items-center gap-2">
              <Tooltip content="Server Settings">
                <Button
                  isIconOnly
                  className="h-6 w-6"
                  radius="md"
                  size="sm"
                  variant="flat"
                  onClick={() => setIsServerModalOpen(true)}
                >
                  <ServerIcon className="w-3.5 h-3.5 text-foreground/60" />
                </Button>
              </Tooltip>
            </div>

            {/* Copy URL */}
            <Tooltip content={isCopied ? "Copied!" : "Copy URL"}>
              <Button
                isIconOnly
                className="h-6 w-6"
                radius="md"
                size="sm"
                variant="flat"
                onClick={handleCopyUrl}
              >
                {isCopied ? (
                  <CheckIcon className="w-3.5 h-3.5 text-foreground/60" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-foreground/60" />
                )}
              </Button>
            </Tooltip>
          </div>

          {/* Tags - Minimal */}
          {operation.tags && operation.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex gap-1.5">
                {operation.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-content2/50 text-foreground/60 rounded-md border border-divider/30"
                  >
                    {tag}
                  </span>
                ))}
                {operation.tags.length > 2 && (
                  <span className="px-2 py-0.5 text-xs bg-content2/50 text-foreground/60 rounded-md border border-divider/30">
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
