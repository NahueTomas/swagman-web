import { useState } from "react";
import { observer } from "mobx-react-lite";

import { ServerModal } from "../server/server-modal";
import { AuthorizationModal } from "../authorization/authorization-modal";

import { ApiExplorerTagList } from "./api-explorer-tag-list";
import { QuickNav } from "./quicknav";

import { ActionButton } from "@/shared/components/action-button";
import { SectionTitle } from "@/shared/components/section-title";
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
        <div className="flex flex-col h-full w-full pt-4 px-4">
          {/* TOP FIXED HEADER */}
          <div className="pb-4 border-b border-divider mb-4">
            <div className="flex flex-col gap-4">
              {/* BRANDING */}
              <div className="flex items-center gap-2.5 px-0.5 mb-1 select-none group cursor-default">
                <span
                  className="text-sm font-black tracking-tight text-foreground-400 uppercase italic 
                                 transition-all duration-300 group-hover:text-primary-500 group-hover:tracking-widest"
                >
                  Swagman
                </span>
              </div>

              {/* NAVIGATION BUTTON */}
              <QuickNav />

              <div className="flex gap-3">
                {/* SERVER BUTTON */}
                <ActionButton
                  className="flex-1"
                  icon={<ServerIcon className="size-4" />}
                  label="Servers"
                  size="sm"
                  onClick={() => setIsServerModalOpen(true)}
                />

                {/* AUTH BUTTON */}
                <div className="flex-1 relative">
                  <ActionButton
                    active={isSecuritySatisfied}
                    className="w-full"
                    icon={
                      isSecuritySatisfied ? (
                        <UnlockIcon className="size-4" />
                      ) : (
                        <LockIcon className="size-4" />
                      )
                    }
                    label="Authorize"
                    size="sm"
                    variant={isSecuritySatisfied ? "success" : "default"}
                    onClick={() => setIsAuthModelOpen(true)}
                  >
                    {/* SECURITY DOTS - Cleanly positioned top-right indicator */}
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
                      {securitySchemes.map((security) => (
                        <div
                          key={security.getKey()}
                          className={cn(
                            "w-2 h-0.5 rounded-full",
                            security.logged
                              ? "bg-success-600"
                              : "bg-foreground-600/50"
                          )}
                          title={security.getKey()}
                        />
                      ))}
                    </div>
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* SCROLLABLE SIDEBAR CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            <div className="space-y-2">
              <SectionTitle>General</SectionTitle>
              <ActionButton
                active={operationFocused === null}
                className="w-full text-sm py-2 px-3 justify-start"
                icon={<InfoIcon className="size-4" />}
                label="Overview"
                variant={operationFocused === null ? "default" : "ghost"}
                onClick={() => focusOperation(null)}
              />
            </div>

            <div className="space-y-2">
              <SectionTitle>Tags & Operations</SectionTitle>
              <ApiExplorerTagList
                className="space-y-0.5"
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
