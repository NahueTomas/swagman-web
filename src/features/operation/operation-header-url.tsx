import { observer } from "mobx-react-lite";
import { useState, useMemo } from "react";

import { useStore } from "@/hooks/use-store";
import { cn } from "@/shared/utils/cn";

export const OperationHeaderUrl = observer(
  ({ url, className }: { url: string; className?: string }) => {
    const { spec, operationFocused: operationModel } = useStore(
      (state) => state
    );
    const [isFocused, setIsFocused] = useState(false);

    if (!operationModel || !spec) return null;

    const requestPreview = spec.buildRequest(operationModel);
    const selectedServer =
      operationModel.getSelectedServer() || spec.getSelectedServer();

    const segments = useMemo(() => {
      const fullUrl = requestPreview.url;
      const serverUrl = selectedServer
        ? selectedServer.getUrlWithVariables()
        : "";
      const items: Array<{ text: string; type: string }> = [];

      if (serverUrl) items.push({ text: serverUrl, type: "server" });

      const pathPart = url.split("?")[0];
      const pathSegments = pathPart.split(/(\{.*?\})/g);

      pathSegments.forEach((seg) => {
        if (seg.startsWith("{") && seg.endsWith("}")) {
          const paramName = seg.slice(1, -1);
          const resolved = operationModel
            .getPathParameters()
            ?.find((p) => p.name === paramName)?.value;

          items.push({ text: resolved?.toString() || seg, type: "param" });
        } else if (seg) {
          items.push({ text: seg, type: "base" });
        }
      });

      if (fullUrl.includes("?")) {
        items.push({
          text: fullUrl.substring(fullUrl.indexOf("?")),
          type: "query",
        });
      }

      return items;
    }, [requestPreview.url, selectedServer, url, operationModel]);

    return (
      <div className={cn("relative w-full h-10", className)}>
        <button
          className={cn(
            "w-full font-mono text-xs transition-colors duration-150 text-left items-start",
            "bg-background-600 border rounded-md outline-none",
            "select-text cursor-text",
            isFocused
              ? "absolute top-0 left-0 right-0 z-[100] h-auto min-h-full py-2.5 px-3 border-primary-500 shadow-2xl bg-background-700 ring-1 ring-primary-500"
              : "h-full flex items-center px-3 border-white/15 overflow-hidden"
          )}
          type="button"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsFocused(false);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onMouseDown={(e) => {
            if (isFocused) e.stopPropagation();
          }}
        >
          <div
            className={cn(
              "w-full pointer-events-auto",
              isFocused
                ? "whitespace-normal break-all block"
                : "whitespace-nowrap overflow-hidden text-ellipsis block"
            )}
          >
            {segments.map((seg, i) => (
              <span
                key={i}
                className={cn(
                  "inline",
                  seg.type === "base" && "text-foreground-300",
                  seg.type === "server" && "text-foreground-600 font-bold",
                  seg.type === "param" &&
                    "text-primary-400 font-bold underline decoration-primary-500/30 underline-offset-2",
                  seg.type === "query" && "text-blue-400/90 italic"
                )}
              >
                {seg.text}
              </span>
            ))}
          </div>
        </button>
      </div>
    );
  }
);
