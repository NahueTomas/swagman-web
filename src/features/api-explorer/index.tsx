import { useRef, useState } from "react";
import { observer } from "mobx-react-lite";

import { ServerModal } from "../server/server-modal";
import { AuthorizationModal } from "../authorization/authorization-modal";

import { ApiExplorerTagList } from "./api-explorer-tag-list";
import { ApiExplorerTaggedItem } from "./api-explorer-tagged-item";
import { QuickNav } from "./quicknav";

import { SectionTitle } from "@/shared/components/section-title";
import {
  CheckIcon,
  InfoIcon,
  LockIcon,
  ResetIcon,
  SearchIcon,
  ServerIcon,
  ShareIcon,
  UnlockIcon,
} from "@/shared/components/icons";
import { Resizable } from "@/shared/components/resizable";
import { useStore } from "@/hooks/use-store";
import { useCacheStore } from "@/hooks/use-cache-store";
import { usePinStore } from "@/hooks/use-pin-store";
import { cn } from "@/shared/utils/cn";
import { buildSharePayload, buildShareUrl } from "@/shared/utils/share-url";

export const ApiExplorer = observer(() => {
  const { operationFocused, focusOperation, spec, setSpec } = useStore();
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!spec) return null;

  const selectedServer = spec.getSelectedServer();
  const servers = spec.getServers();
  const isSecuritySatisfied = spec.isSecuritySatisfied();
  const securitySchemes = spec.getGlobalSecurity();

  const handleShare = async () => {
    const payload = buildSharePayload(spec, operationFocused?.id);
    const url = buildShareUrl(payload);

    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    if (!isResetting) {
      setIsResetting(true);
      resetTimeoutRef.current = setTimeout(() => setIsResetting(false), 3000);

      return;
    }

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setIsResetting(false);
    useCacheStore.getState().clearSpec(spec.specKey);
    spec.resetAll();
    setSpec(spec);
  };

  return (
    <aside className="flex h-full w-auto text-foreground-400">
      <Resizable axis="x" defaultWidth={320}>
        <div className="flex flex-col h-full w-full pt-4 px-4">
          {/* TOP FIXED HEADER */}
          <div className="pb-4 border-b border-white/[0.06] mb-4">
            <div className="flex flex-col gap-3">
              {/* BRANDING + ACTIONS */}
              <div className="flex items-center justify-between px-0.5 select-none">
                <span className="text-[10px] font-black tracking-[0.3em] text-foreground-600 uppercase">
                  Swagman
                </span>

                <div className="flex items-center gap-0.5">
                  {/* Share — active only when an operation is focused */}
                  <button
                    className="flex items-center gap-1 px-1.5 py-1 rounded transition-colors text-foreground-600 hover:text-primary-300 hover:bg-primary-500/10"
                    title="Copy shareable link with all current parameter values"
                    onClick={handleShare}
                  >
                    {isCopied ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <ShareIcon className="size-3" />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                      {isCopied ? "Copied" : "Share"}
                    </span>
                  </button>

                  {/* Reset — two-click confirmation */}
                  <button
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-1 rounded transition-all",
                      isResetting
                        ? "text-danger-400 bg-danger-500/10 hover:bg-danger-500/20"
                        : "text-foreground-600 hover:text-danger-400 hover:bg-danger-500/5"
                    )}
                    title="Reset all parameter values, authorization, and server selection"
                    onClick={handleReset}
                  >
                    <ResetIcon className="size-3" />
                    <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                      {isResetting ? "Confirm?" : "Reset"}
                    </span>
                  </button>
                </div>
              </div>
              {/* SPEC (QuickNav) */}
              <QuickNav />
            </div>
          </div>

          {/* SCROLLABLE SIDEBAR CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
            {/* STATUS CONTROLS */}
            <div className="flex flex-col gap-1.5">
              {/* SERVER STATUS */}
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/[0.07] bg-background-500/20 hover:bg-background-500/50 hover:border-white/[0.14] transition-all group text-left"
                type="button"
                onClick={() => setIsServerModalOpen(true)}
              >
                <ServerIcon className="size-3.5 text-foreground-600 group-hover:text-primary-400 shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600 leading-none mb-1">
                    Server
                  </p>
                  <p className="text-[11px] font-mono text-foreground-500 truncate group-hover:text-foreground-300 transition-colors leading-none">
                    {selectedServer?.getUrl() || "No server selected"}
                  </p>
                </div>
              </button>

              {/* AUTH STATUS */}
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all group text-left",
                  isSecuritySatisfied
                    ? "border-success-500/25 bg-success-500/5 hover:bg-success-500/10 hover:border-success-500/40"
                    : "border-white/[0.07] bg-background-500/20 hover:bg-background-500/50 hover:border-white/[0.14]"
                )}
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
              >
                {isSecuritySatisfied ? (
                  <UnlockIcon className="size-3.5 text-success-500 shrink-0" />
                ) : (
                  <LockIcon className="size-3.5 text-foreground-600 group-hover:text-primary-400 shrink-0 transition-colors" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1",
                      isSecuritySatisfied
                        ? "text-success-600"
                        : "text-foreground-600"
                    )}
                  >
                    Authorization
                  </p>
                  {securitySchemes.length > 0 ? (
                    <p className="text-[11px] font-mono text-foreground-500 group-hover:text-foreground-300 transition-colors leading-none">
                      {securitySchemes.filter((s) => s.logged).length} /{" "}
                      {securitySchemes.length} authorized
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-foreground-500 leading-none">
                      No schemes
                    </p>
                  )}
                </div>
                {securitySchemes.length > 0 && (
                  <div className="flex gap-0.5 shrink-0">
                    {securitySchemes.map((security) => (
                      <div
                        key={security.getKey()}
                        className={cn(
                          "w-1 h-3.5 rounded-full transition-colors",
                          security.logged
                            ? "bg-success-500"
                            : "bg-foreground-700"
                        )}
                        title={security.getKey()}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <SectionTitle className="text-[9px] font-black tracking-[0.2em] text-foreground-600 px-0.5">
                General
              </SectionTitle>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left",
                  operationFocused === null
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-foreground-400 hover:bg-white/5 hover:text-foreground-100"
                )}
                type="button"
                onClick={() => focusOperation(null)}
              >
                <InfoIcon
                  className={cn(
                    "size-3.5 shrink-0",
                    operationFocused === null ? "text-primary-500" : ""
                  )}
                />
                About
              </button>
            </div>

            {/* PINNED OPERATIONS */}
            <PinnedSection
              focusOperation={focusOperation}
              operationFocusedId={operationFocused?.id || null}
              specKey={spec.specKey}
            />

            <div className="space-y-1.5 pb-4">
              <SectionTitle className="text-[9px] font-black tracking-[0.2em] text-foreground-600 px-0.5">
                Tags & Operations
              </SectionTitle>
              {/* SEARCH */}
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-foreground-600 pointer-events-none" />
                <input
                  className={cn(
                    "w-full h-8 pl-8 pr-8 rounded-md text-xs transition-all duration-200 outline-none",
                    "bg-background-500/20 text-foreground-200",
                    "border border-white/[0.07] hover:border-white/[0.14]",
                    "focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/15",
                    "placeholder:text-foreground-600 placeholder:font-normal"
                  )}
                  placeholder="Search operations..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchQuery("");
                  }}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-600 hover:text-foreground-300 transition-colors"
                    type="button"
                    onClick={() => setSearchQuery("")}
                  >
                    <span className="text-xs font-bold">&times;</span>
                  </button>
                )}
              </div>
              <ApiExplorerTagList
                className="space-y-0.5"
                focusOperation={focusOperation}
                operationFocusedId={operationFocused?.id || null}
                searchQuery={searchQuery}
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
          setSelectedServer={(url) => {
            spec.setSelectedServer(url);
            useCacheStore.getState().setGlobalServer(spec.specKey, url);
          }}
          subtitle="Global API Servers"
          onClose={() => setIsServerModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthorizationModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </aside>
  );
});

/** Renders the pinned operations section — only visible when there are pins. */
const PinnedSection = ({
  specKey,
  operationFocusedId,
  focusOperation,
}: {
  specKey: string;
  operationFocusedId: string | null;
  focusOperation: (operationId: string | null) => void;
}) => {
  const pins = usePinStore((s) => s.pins[specKey]);
  const togglePin = usePinStore((s) => s.togglePin);
  const operations = useStore((s) => s.spec?.getOperations());

  if (!pins || pins.length === 0) return null;

  // Resolve pinned operation IDs to resume objects
  const pinnedOps = pins
    .map((id) => operations?.find((op) => op.id === id))
    .filter(Boolean);

  if (pinnedOps.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <SectionTitle className="text-[9px] font-black tracking-[0.2em] text-foreground-600 px-0.5">
        Pinned
      </SectionTitle>
      <ul className="space-y-px">
        {pinnedOps.map((op) => (
          <ApiExplorerTaggedItem
            key={op!.id}
            active={op!.id === operationFocusedId}
            className="pl-3 pr-3"
            deprecated={op!.deprecated}
            isPinned={true}
            method={op!.method}
            title={op!.summary || op!.path}
            onClick={() => focusOperation(op!.id)}
            onTogglePin={() => togglePin(specKey, op!.id)}
          />
        ))}
      </ul>
    </div>
  );
};
