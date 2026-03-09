import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { useCacheStore } from "@/hooks/use-cache-store";
import {
  LockIcon,
  SendIcon,
  ServerIcon,
  UnlockIcon,
} from "@/shared/components/icons";
import { ServerModal } from "@/features/server/server-modal";
import { AuthorizationModal } from "@/features/authorization/authorization-modal";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";
import { Chip } from "@/shared/components/chip/chip";
import { MainButton } from "@/shared/components/main-button";
import { Subtitle } from "@/shared/components/subtitle";
import { cn } from "@/shared/utils/cn";

export const OperationHeader = observer(() => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const { operationFocused: operation, spec } = useStore((state) => state);

  useEffect(() => {
    return () => {
      operation?.setLoadingRequestResponse(false);
    };
  }, [operation]);

  if (!operation) return null;

  const methodUpper = operation.method.toUpperCase();

  const methodStyles: Record<string, string> = {
    GET: "text-success",
    POST: "text-warning",
    PUT: "text-calm",
    PATCH: "text-alt",
    DELETE: "text-danger",
    DEFAULT: "text-foreground-500",
  };

  const handleExecute = async () => {
    try {
      if (!spec) return;
      operation.setRequestError(null);
      operation.setLoadingRequestResponse(true);
      const request = await spec.makeRequest(operation);

      operation.setRequestResponse(request);
    } catch (error: unknown) {
      const message =
        error instanceof TypeError && error.message === "Failed to fetch"
          ? "Network error — this is likely a CORS issue. The target server does not allow requests from this origin."
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred";

      operation.setRequestError(message);
    } finally {
      operation.setLoadingRequestResponse(false);
    }
  };

  // Operation-specific servers — only shown when the spec explicitly defines
  // servers at the operation level (overrides global servers for this operation).
  const operationServers = operation.getServers();
  const hasOwnServers = (operationServers?.length ?? 0) > 0;
  const operationServer = operation.getSelectedServer();

  const handleOperationServerChange = (url: string) => {
    if (!spec) return;
    operation.setSelectedServer(url);
    useCacheStore
      .getState()
      .setOperationServer(spec.specKey, operation.id, url);
  };

  const globalSecurity = spec?.getGlobalSecurity() || [];
  const isAuthSatisfied = operation.isSecuritySatisfied(globalSecurity);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-divider/40">
      <div className="flex flex-col w-full">
        {/* Main URL Row */}
        <div className="flex items-center gap-2 pl-4 pr-4 h-14 lg:h-16">
          <div className="flex-shrink-0">
            <h2
              className={cn(
                "font-mono w-20 font-black text-lg text-center",
                methodStyles[methodUpper] || methodStyles.DEFAULT
              )}
            >
              {methodUpper}
            </h2>
          </div>

          <div className="flex-1 min-w-0">
            <OperationHeaderUrl url={operation.path} />
          </div>

          <div className="flex-shrink-0">
            <MainButton
              className={cn(
                "group/btn relative h-9 px-4 gap-2 overflow-hidden",
                "text-[11px] font-bold uppercase tracking-[0.12em]",
                "rounded-md border",
                "transition-all duration-200 ease-out",
                // Idle
                !operation.loadingRequestResponse && [
                  "bg-primary-500/10 border-primary-500/20 text-primary-400",
                  // Hover
                  "hover:bg-primary-500/[0.18] hover:border-primary-500/35 hover:text-primary-300",
                  "hover:shadow-[0_0_24px_-6px] hover:shadow-primary-500/25",
                  // Active
                  "active:scale-[0.98] active:bg-primary-500/25",
                ],
                // Loading state
                operation.loadingRequestResponse && [
                  "bg-primary-500/[0.12] border-primary-500/15 text-primary-500",
                  "cursor-wait",
                ]
              )}
              disabled={operation.loadingRequestResponse}
              onClick={handleExecute}
            >
              {/* Label */}
              <span className="relative z-10">
                {operation.loadingRequestResponse ? "Sending" : "Send"}
              </span>

              {/* Shimmer sweep — loading */}
              {operation.loadingRequestResponse && (
                <span className="absolute inset-0 animate-sweep bg-gradient-to-r from-transparent via-primary-400/[0.08] to-transparent pointer-events-none" />
              )}
              {/* Icon */}
              <SendIcon
                className={cn(
                  "relative z-10 size-3 transition-transform duration-200",
                  !operation.loadingRequestResponse &&
                    "group-hover/btn:translate-x-0.5"
                )}
              />
            </MainButton>
          </div>
        </div>

        {/* Action Status Bar — only rendered when there's content to show */}
        {(hasOwnServers ||
          operation.security.length > 0 ||
          operation.deprecated) && (
          <div className="flex items-center justify-between px-4 h-9 bg-background-600/40 border-t border-white/[0.04]">
            <div className="flex items-center gap-4">
              {/* Operation-specific server — only shown when defined in the spec */}
              {hasOwnServers && operationServer && (
                <button
                  className="flex items-center gap-2 group transition-colors px-1 rounded"
                  type="button"
                  onClick={() => setIsServerModalOpen(true)}
                >
                  <ServerIcon className="size-3.5 text-foreground-500 group-hover:text-primary-500 shrink-0" />
                  <div className="flex flex-col items-start">
                    <Subtitle
                      as="span"
                      className="text-[8px] leading-none mb-0.5"
                      size="micro"
                    >
                      Operation server
                    </Subtitle>
                    <span className="text-[10px] font-mono text-foreground-400 group-hover:text-foreground-200 transition-colors leading-none">
                      {operationServer.getUrl()}
                    </span>
                  </div>
                </button>
              )}

              {hasOwnServers &&
                operationServer &&
                operation.security.length > 0 && (
                  <div className="h-3 w-px bg-divider/50" />
                )}

              {/* Authorization Button */}
              {operation.security.length > 0 && (
                <button
                  className="flex items-center gap-2 group transition-colors px-1 rounded"
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  {isAuthSatisfied ? (
                    <UnlockIcon className="size-3.5 text-success-500 shrink-0" />
                  ) : (
                    <LockIcon className="size-3.5 text-foreground-500 group-hover:text-primary-500 shrink-0" />
                  )}
                  <div className="flex flex-col items-start">
                    <Subtitle
                      as="span"
                      className="text-[8px] leading-none mb-0.5"
                      size="micro"
                    >
                      Authorization
                    </Subtitle>
                    <span
                      className={cn(
                        "text-[10px] font-mono leading-none transition-colors",
                        isAuthSatisfied
                          ? "text-success-500"
                          : "text-foreground-400 group-hover:text-foreground-200"
                      )}
                    >
                      {isAuthSatisfied ? "Authorized" : "Auth Required"}
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Metadata Chips */}
            {operation.deprecated && (
              <Chip
                label="Deprecated"
                radius="sm"
                size="xs"
                variant="ghost-warning"
              />
            )}
          </div>
        )}
      </div>

      {/* Operation-specific server modal */}
      {hasOwnServers && operationServer && isServerModalOpen && (
        <ServerModal
          description="These servers are defined only for this operation and override the global server."
          isOpen={isServerModalOpen}
          selectedServer={operationServer}
          servers={operationServers!}
          setSelectedServer={handleOperationServerChange}
          subtitle="Operation Servers"
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
