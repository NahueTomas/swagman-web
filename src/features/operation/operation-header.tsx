import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { LockIcon, UnlockIcon } from "@/shared/components/icons";
import { AuthorizationModal } from "@/features/authorization/authorization-modal";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";
import { Chip } from "@/shared/components/chip/chip";
import { MainButton } from "@/shared/components/main-button";
import { cn } from "@/shared/utils/cn";

export const OperationHeader = observer(() => {
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
              className="h-10 px-6 bg-primary-500 hover:bg-primary-400 text-background hover:underline font-bold shadow-lg shadow-primary-500/10"
              disabled={operation.loadingRequestResponse}
              onClick={handleExecute}
            >
              <span className="text-xs font-black italic uppercase tracking-[0.2em]">
                {operation.loadingRequestResponse ? "Executing" : "Execute"}
              </span>
            </MainButton>
          </div>
        </div>

        {/* Action Status Bar */}
        <div className="flex items-center justify-between px-4 h-9 bg-background-500/20 border-t border-divider/20">
          <div className="flex items-center gap-4">
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
                <span className="text-[10px] uppercase font-black tracking-[0.15em]">
                  {isAuthSatisfied ? "Authorized" : "Auth Required"}
                </span>
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
      </div>

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
