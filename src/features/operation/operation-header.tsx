import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import {
  ServerIcon,
  LockIcon,
  UnlockIcon,
  ThunderIcon,
} from "@/shared/components/ui/icons";
import { ServerModal } from "@/features/server/server-modal";
import { AuthorizationModal } from "@/features/authorization/authorization-modal";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";

export const OperationHeader = observer(() => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { operationFocused: operation, spec } = useStore((state) => state);

  // Cleanup function for aborting requests
  useEffect(() => {
    return () => {
      operation?.setLoadingRequestResponse(false);
    };
  }, []);

  if (!operation) return null;

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

  const handleExecute = async () => {
    try {
      if (!spec) return;

      operation.setLoadingRequestResponse(true);
      const request = await spec.makeRequest(operation);

      operation.setRequestResponse(request);
      operation.setLoadingRequestResponse(false);
    } catch (error: unknown) {
      operation.setLoadingRequestResponse(false);

      addToast({
        title: "Request Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        color: "danger",
      });
    }
  };

  const selectedServer = operation.getSelectedServer();
  const servers = operation.getServers();
  const globalSecurity = spec?.getGlobalSecurity() || [];
  const isOperationSecuritySatisfied =
    operation.isSecuritySatisfied(globalSecurity);

  return (
    <header
      aria-label="API Operation Header"
      className="sticky top-0 z-50 border-b border-divider"
      role="banner"
    >
      <div className="w-full px-2 pt-2 pb-1.5">
        {/* Responsive Layout */}
        <div className="rounded-lg">
          {/* Mobile Layout (Column) - Hidden on md+ */}
          <div className="flex flex-col md:hidden">
            {/* Mobile: Method + Tags Row */}
            <div className="flex items-center justify-between p-3 border-b border-divider">
              <div className="flex items-center gap-2 relative">
                <div
                  className={`absolute inset-0 ${colorSet.bg} blur-md pointer-events-none`}
                />
                <div
                  className={`px-3 py-1.5 rounded-lg ${colorSet.text} flex items-center justify-center`}
                >
                  <span className="uppercase tracking-wider">
                    {methodUpper}
                  </span>
                </div>
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
                      className="px-2 py-0.5 text-xs text-foreground/60 rounded-lg border border-divider"
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                  {operation.tags.length > 1 && (
                    <span
                      aria-label={`${operation.tags.length - 1} more tags`}
                      className="px-2 py-0.5 text-xs text-foreground/60 rounded-lg border border-divider"
                      role="listitem"
                    >
                      +{operation.tags.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: URL Row */}
            <div className="border-b border-divider">
              <OperationHeaderUrl url={operation.path} />
            </div>

            {/* Mobile: Actions Row */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                {selectedServer && (
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
                )}

                {operation.security.length ? (
                  <Tooltip content="Operation Authorize">
                    <Button
                      isIconOnly
                      aria-label="Open authorization settings"
                      className={`h-7 w-7 relative ${
                        isOperationSecuritySatisfied ? "text-success/70" : ""
                      }`}
                      radius="md"
                      size="sm"
                      variant="flat"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        {isOperationSecuritySatisfied ? (
                          <UnlockIcon
                            aria-hidden="true"
                            className="w-3.5 h-3.5"
                          />
                        ) : (
                          <LockIcon
                            aria-hidden="true"
                            className="w-3.5 h-3.5"
                          />
                        )}
                      </div>
                    </Button>
                  </Tooltip>
                ) : null}
              </div>

              <Button
                aria-label={
                  operation.loadingRequestResponse
                    ? "Executing API request..."
                    : "Execute API request"
                }
                color="primary"
                disabled={operation.loadingRequestResponse}
                endContent={<ThunderIcon className="size-4" />}
                size="sm"
                variant="flat"
                onClick={handleExecute}
              >
                {operation.loadingRequestResponse ? "Executing..." : "Execute"}
              </Button>
            </div>
          </div>

          {/* Desktop Layout (Row) - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-stretch gap-x-2 2xl:gap-x-4">
            {/* Desktop: HTTP Method */}
            <div className={`flex items-center relative`}>
              <div className={`absolute inset-0 ${colorSet.bg} blur-xl`} />
              <div
                className={`h-full min-w-28 2xl:min-w-28 flex items-center justify-center`}
              >
                <span
                  className={`text-xl 2xl:text-2xl uppercase tracking-wider ${colorSet.text}`}
                >
                  {methodUpper}
                </span>
              </div>
            </div>

            {/* Desktop: URL Bar */}
            <div className="flex-1 min-w-0 xl:h-14 flex items-center">
              <OperationHeaderUrl url={operation.path} />
            </div>

            {/* Desktop: Execute Button */}
            <div className="flex items-center">
              <Button
                aria-label={
                  operation.loadingRequestResponse
                    ? "Executing API request..."
                    : "Execute API request"
                }
                color="primary"
                disabled={operation.loadingRequestResponse}
                endContent={<ThunderIcon className="size-4" />}
                size="lg"
                variant="flat"
                onClick={handleExecute}
              >
                {operation.loadingRequestResponse ? "Executing..." : "Execute"}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Row - Only shown on md+ */}
        <div className="hidden md:flex items-center justify-between mt-3 pt-1.5 border-t border-divider">
          <div className="flex items-center gap-2">
            {selectedServer && (
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
            )}

            {operation.security.length ? (
              <Tooltip content="Operation Authorize">
                <Button
                  isIconOnly
                  aria-label="Open authorization settings"
                  className={`h-6 w-6 relative ${
                    isOperationSecuritySatisfied ? "text-success/70" : ""
                  }`}
                  radius="md"
                  size="sm"
                  variant="flat"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {isOperationSecuritySatisfied ? (
                      <UnlockIcon aria-hidden="true" className="w-3.5 h-3.5" />
                    ) : (
                      <LockIcon aria-hidden="true" className="w-3.5 h-3.5" />
                    )}
                  </div>
                </Button>
              </Tooltip>
            ) : null}
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
                    className="px-2 py-0.5 text-xs text-foreground/60 rounded-lg border border-divider"
                    role="listitem"
                  >
                    {tag}
                  </span>
                ))}
                {operation.tags.length > 2 && (
                  <span
                    aria-label={`${operation.tags.length - 2} more tags`}
                    className="px-2 py-0.5 text-xs text-foreground/60 rounded-lg border border-divider"
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

      {selectedServer && servers && isServerModalOpen && (
        <ServerModal
          description="These servers are defined only for this operation and override global servers."
          isOpen={isServerModalOpen}
          selectedServer={selectedServer}
          servers={servers}
          setSelectedServer={operation.setSelectedServer}
          subtitle="Operation-Specific Servers"
          onClose={() => setIsServerModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthorizationModal
          isOpen={isAuthModalOpen}
          operation={operation}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </header>
  );
});
