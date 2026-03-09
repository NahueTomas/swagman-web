import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";

import { cn } from "@/shared/utils/cn";
import { FormFieldText } from "@/shared/components/form-field-text";
import { ChevronDownIcon, ServerIcon } from "@/shared/components/icons";
import { ServerModel } from "@/models/server.model";
import { Modal } from "@/shared/components/modal";
import { Subtitle } from "@/shared/components/subtitle";

// ─── Local custom select — visible border + filled bg for modal context ───────

interface ModalSelectProps {
  value?: string;
  options: string[];
  placeholder?: string;
  onChange: (v: string) => void;
}

const ModalSelect = ({
  value,
  options,
  placeholder = "Select an option",
  onChange,
}: ModalSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        className={cn(
          "w-full flex items-center justify-between h-9 px-3 rounded-md text-xs font-mono transition-all duration-200 outline-none",
          "bg-background-900/50 text-foreground-200",
          "border",
          open
            ? "border-primary-500/60 ring-1 ring-primary-500/20"
            : "border-white/[0.1] hover:border-white/[0.2]"
        )}
        type="button"
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((s) => !s);
          }
        }}
      >
        <span
          className={cn(
            "truncate text-left flex-1",
            !value && "text-foreground-600 italic font-sans font-normal"
          )}
        >
          {value ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-foreground-500 transition-transform duration-200 shrink-0 ml-2",
            open && "rotate-180 text-primary-400"
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-2xl shadow-black/50 transition-all duration-150 origin-top",
          "bg-background-800 border-white/[0.08]",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        )}
      >
        <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
          {options.map((opt) => (
            <button
              key={opt}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-mono rounded-md transition-colors",
                value === opt
                  ? "bg-primary-500/15 text-primary-300 font-semibold"
                  : "text-foreground-400 hover:text-foreground-100 hover:bg-white/[0.04]"
              )}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Feature component ────────────────────────────────────────────────────────

interface ServerProps {
  isOpen: boolean;
  selectedServer: ServerModel;
  setSelectedServer: (url: string) => void;
  servers: ServerModel[];
  subtitle?: string;
  description?: string;
  onClose: () => void;
}

export const ServerModal = observer(
  ({
    isOpen,
    onClose,
    selectedServer,
    setSelectedServer,
    servers,
  }: ServerProps) => {
    const currentServer = selectedServer;

    const handleServerChange = (serverUrl: string) =>
      setSelectedServer(serverUrl);
    const handleVariableChange = (key: string, value: string) => {
      currentServer.setVariableValue(key, value);
    };

    return (
      <Modal
        icon={<ServerIcon className="size-4" />}
        isOpen={isOpen}
        title="Select and config the server"
        onClose={onClose}
      >
        <div className="space-y-6">
          {/* Server Selection */}
          <div className="space-y-2">
            <Subtitle as="p" size="xxs">
              Environment
            </Subtitle>
            <ModalSelect
              options={servers?.map((server) => server.getUrl())}
              placeholder="Select server"
              value={currentServer?.getUrl()}
              onChange={handleServerChange}
            />
            {currentServer?.getDescription() && (
              <p className="text-xs text-foreground-500 mt-1">
                {currentServer.getDescription()}
              </p>
            )}
          </div>

          {/* Variables */}
          {currentServer?.getVariables() &&
            Object.keys(currentServer.getVariables() || {}).length > 0 && (
              <div className="space-y-3">
                <Subtitle as="p" size="xxs">
                  Variables
                </Subtitle>
                <div className="space-y-3">
                  {Object.entries(currentServer.getVariables() || {}).map(
                    ([key, variable]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-mono text-foreground-300">
                            {key}
                          </span>
                          {variable.description && (
                            <span className="text-[10px] text-foreground-500 truncate max-w-[50%]">
                              {variable.description}
                            </span>
                          )}
                        </div>
                        {variable.enum && variable.enum.length > 0 ? (
                          <ModalSelect
                            options={variable.enum}
                            value={currentServer.getVariableValue(key)}
                            onChange={(value) =>
                              handleVariableChange(key, value)
                            }
                          />
                        ) : (
                          <FormFieldText
                            placeholder={`Enter ${key}`}
                            value={currentServer.getVariableValue(key)}
                            onChange={(value) =>
                              handleVariableChange(key, value as string)
                            }
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Preview */}
          <div className="border-t border-white/[0.05]">
            <div className="mt-5 space-y-1.5">
              <Subtitle as="p" size="xxs">
                Preview
              </Subtitle>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-background-900/60 border border-white/[0.06]">
                <div
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    currentServer ? "bg-success-500" : "bg-foreground-600"
                  )}
                />
                <code className="text-xs text-foreground-300 font-mono break-all">
                  {currentServer?.getUrlWithVariables() || "No server selected"}
                </code>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);
