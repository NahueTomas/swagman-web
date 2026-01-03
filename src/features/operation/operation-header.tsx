import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import {
  ServerIcon,
  LockIcon,
  UnlockIcon,
  SendIcon,
} from "@/shared/components/icons";
import { ServerModal } from "@/features/server/server-modal";
import { AuthorizationModal } from "@/features/authorization/authorization-modal";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";
import { Chip } from "@/shared/components/chip/chip";
import { MainButton } from "@/shared/components/main-button";
import { cn } from "@/shared/utils/cn";

export const OperationHeader = observer(() => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      operation.setLoadingRequestResponse(true);
      const request = await spec.makeRequest(operation);

      operation.setRequestResponse(request);
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.log({
        title: "Request Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        color: "danger",
      });
    } finally {
      operation.setLoadingRequestResponse(false);
    }
  };

  const selectedServer = operation.getSelectedServer();
  const servers = operation.getServers();

  const globalSecurity = spec?.getGlobalSecurity() || [];
  const isAuthSatisfied = operation.isSecuritySatisfied(globalSecurity);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-divider/40">
      <div className="flex flex-col w-full">
        {/* Main URL Row - Maximized Space */}
        <div className="flex items-center gap-4 px-4 h-14 lg:h-16">
          <div className="flex-shrink-0">
            <h2
              className={cn(
                "font-mono w-20 font-black text-xl tracking-tighter text-center",
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
              className="h-10 px-6 bg-primary-500 hover:bg-primary-400 text-background font-bold shadow-lg shadow-primary-500/10"
              disabled={operation.loadingRequestResponse}
              onClick={handleExecute}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em]">
                  {operation.loadingRequestResponse ? "Executing" : "Execute"}
                </span>
                <SendIcon
                  className={cn(
                    "size-3.5",
                    operation.loadingRequestResponse && "animate-pulse"
                  )}
                />
              </div>
            </MainButton>
          </div>
        </div>

        {/* Action Status Bar (Settings & Metadata) */}
        <div className="flex items-center justify-between px-4 h-9 bg-background-500/20 border-t border-divider/20">
          <div className="flex items-center gap-4">
            {/* Server Selector Button */}
            {selectedServer ? (
              <button
                className="flex items-center gap-2 group transition-colors px-1 rounded"
                onClick={() => setIsServerModalOpen(true)}
              >
                <ServerIcon className="size-4 text-foreground-500 group-hover:text-primary-500" />
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  {selectedServer ? selectedServer.getUrl() : "Select Server"}
                </span>
              </button>
            ) : undefined}

            {selectedServer && operation.security.length ? (
              <div className="h-3 w-px bg-divider/50" />
            ) : undefined}

            {/* Authorization Button */}
            {operation.security.length > 0 && (
              <button
                className={cn(
                  "flex items-center gap-2 group transition-colors px-1 rounded",
                  isAuthSatisfied
                    ? "text-success hover:bg-success/5"
                    : "text-foreground-500 hover:text-foreground-200"
                )}
                onClick={() => setIsAuthModalOpen(true)}
              >
                {isAuthSatisfied ? (
                  <UnlockIcon className="size-3" />
                ) : (
                  <LockIcon className="size-3" />
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest">
                  {isAuthSatisfied ? "Authorized" : "Auth Required"}
                </span>
              </button>
            )}
          </div>

          {/* Metadata Chips */}
          {operation.deprecated && (
            <Chip label="Deprecated" size="xs" variant="ghost-warning" />
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedServer && servers && isServerModalOpen && (
        <ServerModal
          description="These servers are defined only for this operation and override global servers."
          isOpen={isServerModalOpen}
          selectedServer={selectedServer!}
          servers={operation.getServers() || spec?.getServers() || []}
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
