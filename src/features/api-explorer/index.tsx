import { useState } from "react";
import { observer } from "mobx-react-lite";

import { ServerModal } from "../server/server-modal";
import { AuthorizationModal } from "../authorization/authorization-modal";

import { ApiExplorerTagList } from "./api-explorer-tag-list";
import { QuickNav } from "./quicknav";

import {
  LockIcon,
  UnlockIcon,
  ServerIcon,
  InfoIcon,
} from "@/shared/components/icons";
import { Resizable } from "@/shared/components/resizable";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/shared/utils/cn";

export const ApiExplorer = observer(() => {
  const { operationFocused, focusOperation, spec } = useStore();
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModelOpen] = useState(false);

  if (!spec) return null;

  const selectedServer = spec.getSelectedServer();
  const servers = spec.getServers();
  const isSecuritySatisfied = spec.isSecuritySatisfied();
  const securitySchemes = spec.getGlobalSecurity();

  return (
    <aside className="flex h-full w-auto text-foreground-400">
      <Resizable axis="x" defaultWidth={320}>
        <div className="flex flex-col h-full w-full">
          {/* TOP FIXED HEADER */}
          <div className="pb-3 pr-3 border-b border-white/10 mb-2">
            <div className="flex flex-col gap-2 p-2">
              {/* NAVIGATION BUTTON */}
              <QuickNav />

              <div className="flex gap-2">
                {/* SERVER BUTTON */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 p-2 rounded-md 
                             bg-background-500 hover:bg-background-400 hover:text-foreground-100 
                             border border-transparent hover:border-white/15 transition-all duration-200"
                  type="button"
                  onClick={() => setIsServerModalOpen(true)}
                >
                  <ServerIcon className="size-4 text-primary-500" />
                  <span className="text-xs font-medium truncate max-w-[80px]">
                    Servers
                  </span>
                </button>

                {/* AUTH BUTTON */}
                <button
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 p-1.5 rounded-md border transition-all duration-200 relative",
                    "bg-background-500 hover:bg-background-400",
                    isSecuritySatisfied
                      ? "border-success-900/50 text-success-400"
                      : "border-transparent hover:border-white/15 text-foreground-400"
                  )}
                  type="button"
                  onClick={() => setIsAuthModelOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    {isSecuritySatisfied ? (
                      <UnlockIcon className="size-4 text-primary-500" />
                    ) : (
                      <LockIcon className="size-4 text-primary-500" />
                    )}
                    <span className="text-xs font-medium">Authorize</span>
                  </div>

                  {/* SECURITY DOTS */}
                  <div className="absolute bottom-0.5 flex gap-0.5 h-0.5">
                    {securitySchemes.map((security) => (
                      <div
                        key={security.getKey()}
                        className={cn(
                          "w-2 h-0.5 rounded-full",
                          security.logged
                            ? "bg-success-500"
                            : "bg-foreground-600"
                        )}
                        title={security.getKey()}
                      />
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE SIDEBAR CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-3 pt-1 space-y-4">
            <div className="space-y-1">
              <p className="px-3 text-[9px] font-black uppercase tracking-widest text-foreground-600 mb-2">
                General
              </p>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 hover:bg-background-400 hover:text-foreground-100",
                  operationFocused === null
                    ? "bg-primary-500/10 text-primary-400 font-semibold shadow-sm border border-primary-500/20"
                    : "text-foreground-400 font-medium border border-transparent"
                )}
                onClick={() => focusOperation(null)}
              >
                <InfoIcon
                  className={cn(
                    "size-4",
                    operationFocused === null
                      ? "text-primary-500"
                      : "text-foreground-400"
                  )}
                />
                Overview
              </button>
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[9px] font-black uppercase tracking-widest text-foreground-600 mb-2">
                Tags & Operations
              </p>
              <ApiExplorerTagList
                focusOperation={focusOperation}
                operationFocusedId={operationFocused?.id || null}
              />
            </div>
          </div>
        </div>
      </Resizable>

      {/* MODALS */}
      {selectedServer && servers && isServerModalOpen && (
        <ServerModal
          description='These servers apply to all API "operations" by default.'
          isOpen={isServerModalOpen}
          selectedServer={selectedServer}
          servers={servers}
          setSelectedServer={(url) => spec.setSelectedServer(url)}
          subtitle="Global API Servers"
          onClose={() => setIsServerModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthorizationModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModelOpen(false)}
        />
      )}
    </aside>
  );
});
