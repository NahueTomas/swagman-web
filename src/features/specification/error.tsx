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

interface ErrorStateProps {
  message?: string;
  onRedirect?: (url: string) => void;
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
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        {/* Error Icon & Message */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 rounded-full bg-danger-500/10 border border-danger-500/20">
            <AlertTriangleIcon className="size-8 text-danger-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground-100 font-bold text-lg">
              Specification Error
            </h3>
            <p className="text-sm text-foreground-500">{message}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Go to Local Button */}
          <button
            className="w-full flex items-center justify-between p-4 rounded-md 
                       bg-background-500 hover:bg-background-400 border border-white/5 
                       hover:border-primary-500/30 transition-all group"
            type="button"
            onClick={handleLocal}
          >
            <div className="flex items-center gap-3">
              <LaptopIcon className="size-5 text-primary-500" />
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-bold text-foreground-200">
                  Go to Local
                </span>
                <span className="text-xs text-foreground-600 font-mono">
                  localhost:3000
                </span>
              </div>
            </div>
            <SendIcon className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Manual URL Input Section */}
          <div className="p-4 rounded-md bg-background-600 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-foreground-400">
              <GlobeIcon className="size-4" />
              <label
                className="text-[10px] font-black uppercase tracking-widest"
                htmlFor={urlInputId}
              >
                Load from URL
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 bg-background-800 border border-white/10 rounded px-3 py-2 
                           text-xs font-mono focus:outline-none focus:border-primary-500/50 
                           text-foreground-200 placeholder:text-foreground-800"
                id={urlInputId}
                placeholder="https://api.example.com/openapi.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGo()}
              />
              <button
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-background-900 
                           text-xs font-bold rounded transition-colors"
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
