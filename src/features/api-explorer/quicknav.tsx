import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronDownIcon,
  DocumentTextIcon,
  SendIcon,
} from "@/shared/components/icons";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/shared/utils/cn";
import { escapeUrl } from "@/shared/utils/helpers";
import { ROUTES } from "@/shared/constants/constants";

export const QuickNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const urlInputId = useId();
  const { spec } = useStore();

  const navigate = useNavigate();

  const handleGo = () => {
    if (url.trim()) {
      navigate(`/${escapeUrl(url)}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGo();
  };

  const handleLocal = () => {
    navigate(ROUTES.APP);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Trigger — identical structure to Server / Auth cards */}
      <button
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all group text-left",
          isOpen
            ? "border-primary-500/30 bg-primary-500/5"
            : "border-white/[0.07] bg-background-500/20 hover:bg-background-500/50 hover:border-white/[0.14]"
        )}
        type="button"
        onClick={() => setIsOpen((s) => !s)}
      >
        <DocumentTextIcon
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isOpen
              ? "text-primary-400"
              : "text-foreground-600 group-hover:text-primary-400"
          )}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1",
              isOpen ? "text-primary-600" : "text-foreground-600"
            )}
          >
            Spec
          </p>
          <p className="text-[11px] font-mono text-foreground-500 truncate group-hover:text-foreground-300 transition-colors leading-none">
            {spec?.info?.title || "No spec loaded"}
          </p>
        </div>
        <ChevronDownIcon
          className={cn(
            "size-3 shrink-0 transition-all duration-200",
            isOpen
              ? "rotate-180 text-primary-400"
              : "text-foreground-600 group-hover:text-foreground-400"
          )}
        />
      </button>

      {/* Inline expansion panel */}
      {isOpen && (
        <div className="mt-1.5 rounded-lg border border-white/[0.07] bg-background-500/10 overflow-hidden">
          <button
            className="w-full flex items-center px-3 py-2.5 text-xs font-medium text-foreground-400 hover:text-foreground-100 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05]"
            type="button"
            onClick={handleLocal}
          >
            Local file
          </button>

          <div className="flex flex-col gap-2 p-3">
            <label
              className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground-600"
              htmlFor={urlInputId}
            >
              Load from URL
            </label>
            <div className="flex gap-1.5">
              <input
                className={cn(
                  "flex-1 h-8 px-2.5 rounded-md text-xs font-mono transition-all duration-200 outline-none min-w-0",
                  "bg-background-900/50 text-foreground-200",
                  "border border-white/[0.1] hover:border-white/[0.18]",
                  "focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20 focus:shadow-[0_0_12px_rgba(190,151,110,0.15)]",
                  "placeholder:text-foreground-600 placeholder:font-sans placeholder:font-normal"
                )}
                id={urlInputId}
                placeholder="https://api.example.com/openapi.json"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="px-2.5 h-8 bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/25 hover:border-primary-500/50 text-primary-400 rounded-md transition-all shrink-0"
                type="button"
                onClick={handleGo}
              >
                <SendIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
