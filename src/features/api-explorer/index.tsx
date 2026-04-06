import { useRef, useState } from "react";
import { observer } from "mobx-react-lite";

import { ServerModal } from "../server/server-modal";
import { AuthorizationModal } from "../authorization/authorization-modal";

import { ApiExplorerTagList } from "./api-explorer-tag-list";
import { ApiExplorerTaggedItem } from "./api-explorer-tagged-item";
import { QuickNav } from "./quicknav";

import { Subtitle } from "@/shared/components/subtitle";
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
    try {
      const payload = buildSharePayload(spec, operationFocused?.id);
      const url = buildShareUrl(payload);

      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts or when denied
      // eslint-disable-next-line no-console
      console.error("Failed to copy share link to clipboard");
    }
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
    usePinStore.getState().clearPins(spec.specKey);
    spec.resetAll();
    setSpec(spec);
  };

  return (
    <aside className="flex h-full w-auto text-foreground-400">
      <Resizable axis="x" defaultWidth={320}>
        <div className="flex flex-col h-full w-full pt-5 px-4">
          {/* TOP FIXED HEADER */}
          <div className="pb-4 border-b border-white/[0.05] mb-5">
            <div className="flex flex-col gap-4">
              {/* BRANDING + ACTIONS */}
              <div className="flex items-center justify-between px-0.5 select-none">
                <Subtitle as="h2">SWAGMAN</Subtitle>

                <div className="flex items-center gap-0.5">
                  {/* Share */}
                  <button
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-foreground-600 hover:text-primary-400 hover:bg-primary-500/8"
                    title="Copy shareable link with all current parameter values"
                    type="button"
                    onClick={handleShare}
                  >
                    {isCopied ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <ShareIcon className="size-3" />
                    )}
                    <Subtitle as="span" className="text-[8px]" size="micro">
                      {isCopied ? "Copied" : "Share"}
                    </Subtitle>
                  </button>

                  {/* Reset — two-click confirmation */}
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all",
                      isResetting
                        ? "text-danger-400 bg-danger-500/10 hover:bg-danger-500/20"
                        : "text-foreground-600 hover:text-danger-400 hover:bg-danger-500/5"
                    )}
                    title="Reset all parameter values, authorization, and server selection"
                    type="button"
                    onClick={handleReset}
                  >
                    <ResetIcon className="size-3" />
                    <Subtitle as="span" className="text-[8px]" size="micro">
                      {isResetting ? "Confirm?" : "Reset"}
                    </Subtitle>
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
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-left",
                  "border border-white/[0.05] bg-white/[0.02]",
                  "hover:bg-white/[0.04] hover:border-white/[0.1]"
                )}
                type="button"
                onClick={() => setIsServerModalOpen(true)}
              >
                <div className="p-1.5 rounded-md bg-foreground-700/20 group-hover:bg-primary-500/10 transition-colors">
                  <ServerIcon className="size-3 text-foreground-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <Subtitle as="p" className="leading-none mb-1" size="micro">
                    Server
                  </Subtitle>
                  <p className="text-[11px] font-mono text-foreground-500 truncate group-hover:text-foreground-300 transition-colors leading-none">
                    {selectedServer?.getUrl() || "No server selected"}
                  </p>
                </div>
              </button>

              {/* AUTH STATUS */}
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-left",
                  isSecuritySatisfied
                    ? "border border-success-500/20 bg-success-500/[0.03] hover:bg-success-500/[0.06] hover:border-success-500/30"
                    : "border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                )}
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    isSecuritySatisfied
                      ? "bg-success-500/10"
                      : "bg-foreground-700/20 group-hover:bg-primary-500/10"
                  )}
                >
                  {isSecuritySatisfied ? (
                    <UnlockIcon className="size-3 text-success-500" />
                  ) : (
                    <LockIcon className="size-3 text-foreground-600 group-hover:text-primary-400 transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Subtitle
                    as="p"
                    className={cn(
                      "leading-none mb-1",
                      isSecuritySatisfied ? "text-success-600" : ""
                    )}
                    size="micro"
                  >
                    Authorization
                  </Subtitle>
                  {securitySchemes.length > 0 ? (
                    <p className="text-[11px] font-mono text-foreground-500 group-hover:text-foreground-300 transition-colors leading-none">
                      {securitySchemes.filter((s) => s.logged).length} /{" "}
                      {securitySchemes.length} authorized
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono text-foreground-600 leading-none">
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
                          "w-1 h-3 rounded-full transition-colors",
                          security.logged
                            ? "bg-success-500"
                            : "bg-foreground-800"
                        )}
                        title={security.getKey()}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <Subtitle as="p" className="px-1" size="micro">
                General
              </Subtitle>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all text-left",
                  operationFocused === null
                    ? "bg-primary-500/10 text-primary-400 shadow-[inset_0_0_0_1px] shadow-primary-500/15"
                    : "text-foreground-400 hover:bg-white/[0.04] hover:text-foreground-200"
                )}
                type="button"
                onClick={() => focusOperation(null)}
              >
                <InfoIcon
                  className={cn(
                    "size-3.5 shrink-0",
                    operationFocused === null
                      ? "text-primary-500"
                      : "text-foreground-600"
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
              <Subtitle as="p" className="px-1" size="micro">
                Tags & Operations
              </Subtitle>
              {/* SEARCH */}
              <div className="relative group/search">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-foreground-700 group-focus-within/search:text-primary-500 pointer-events-none transition-colors" />
                <input
                  aria-label="Search operations"
                  className={cn(
                    "w-full h-8 pl-8 pr-8 rounded-md text-xs transition-all duration-200 outline-none",
                    "bg-white/[0.02] text-foreground-200",
                    "border border-white/[0.05] hover:border-white/[0.1]",
                    "focus:border-primary-500/30 focus:ring-1 focus:ring-primary-500/10 focus:bg-white/[0.03]",
                    "placeholder:text-foreground-700 placeholder:font-normal"
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
                    aria-label="Clear search"
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
    .filter((op): op is NonNullable<typeof op> => Boolean(op));

  if (pinnedOps.length === 0) return null;

  return (
    <div className="space-y-1">
      <Subtitle as="p" className="px-1" size="micro">
        Pinned
      </Subtitle>
      <ul className="space-y-px">
        {pinnedOps.map((op) => (
          <ApiExplorerTaggedItem
            key={op.id}
            active={op.id === operationFocusedId}
            className="pl-3 pr-3"
            deprecated={op.deprecated}
            isPinned={true}
            method={op.method}
            title={op.summary || op.path}
            onClick={() => focusOperation(op.id)}
            onTogglePin={() => togglePin(specKey, op.id)}
          />
        ))}
      </ul>
    </div>
  );
};
