import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";

import {
  GlobeIcon,
  SendIcon,
  LaptopIcon,
  AlertTriangleIcon,
} from "@/shared/components/icons";
import { escapeUrl } from "@/shared/utils/helpers";
import { ROUTES } from "@/shared/constants/constants";
import { Subtitle } from "@/shared/components/subtitle";
import { cn } from "@/shared/utils/cn";

interface ErrorStateProps {
  message?: string;
}

export const Error = ({
  message = "Failed to load API specification",
}: ErrorStateProps) => {
  const [url, setUrl] = useState("");
  const urlInputId = useId();

  const navigate = useNavigate();

  const handleGo = () => {
    if (url.trim()) {
      navigate(`/${escapeUrl(url)}`);
    }
  };

  const handleLocal = () => {
    navigate(ROUTES.APP);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full p-6 text-center overflow-hidden">
      <div className="relative max-w-sm w-full space-y-8 animate-fade-in-up">
        {/* Brand + Error */}
        <div className="flex flex-col items-center space-y-5">
          <Subtitle as="h1">SWAGMAN</Subtitle>

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/15">
              <AlertTriangleIcon className="size-5 text-danger-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-foreground-200 font-semibold text-sm">
                Specification Error
              </h3>
              <p className="text-xs text-foreground-500 max-w-[280px] leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Navigation options */}
        <div className="space-y-2.5">
          {/* Go to Local Button */}
          <button
            className={cn(
              "w-full flex items-center justify-between px-4 py-3.5 rounded-lg",
              "bg-background-600/40 border border-white/[0.06]",
              "hover:border-primary-500/25 hover:bg-primary-500/5 transition-all group"
            )}
            type="button"
            onClick={handleLocal}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-primary-500/10 border border-primary-500/15">
                <LaptopIcon className="size-4 text-primary-400" />
              </div>
              <div className="flex flex-col items-start text-left">
                <Subtitle as="span" size="micro">
                  Local
                </Subtitle>
                <span className="text-xs font-medium text-foreground-300 group-hover:text-foreground-100 transition-colors">
                  Open local file
                </span>
              </div>
            </div>
            <SendIcon className="size-3.5 text-foreground-700 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Manual URL Input Section */}
          <div className="p-4 rounded-lg bg-background-600/40 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2">
              <GlobeIcon className="size-3.5 text-foreground-600" />
              <Subtitle as="label" htmlFor={urlInputId} size="micro">
                Load from URL
              </Subtitle>
            </div>

            <div className="flex gap-2">
              <input
                className={cn(
                  "flex-1 bg-background-800/60 border border-white/[0.08] rounded-md px-3 py-2",
                  "text-xs font-mono focus:outline-none focus:border-primary-500/50",
                  "focus:ring-1 focus:ring-primary-500/15",
                  "text-foreground-200 placeholder:text-foreground-700"
                )}
                id={urlInputId}
                placeholder="https://api.example.com/openapi.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGo()}
              />
              <button
                aria-label="Load specification from URL"
                className={cn(
                  "px-3 py-2 rounded-md transition-all text-xs font-semibold",
                  "bg-primary-500/10 hover:bg-primary-500/20",
                  "border border-primary-500/20 hover:border-primary-500/40",
                  "text-primary-400 hover:text-primary-300"
                )}
                type="button"
                onClick={handleGo}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
