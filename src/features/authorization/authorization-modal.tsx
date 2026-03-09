import { useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { SecurityModel } from "@/models/security.model";
import { OperationModel } from "@/models/operation.model";
import { LockIcon, KeyIcon, CheckIcon } from "@/shared/components/icons";
import { cn } from "@/shared/utils/cn";
import { Modal } from "@/shared/components/modal";
import { Chip } from "@/shared/components/chip";
import { Subtitle } from "@/shared/components/subtitle";

// ─── Local custom input — visible border + filled bg for modal context ───────

interface ModalTextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ModalTextInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: ModalTextInputProps) => (
  <div className="relative group">
    <input
      className={cn(
        "w-full h-9 px-3 rounded-md text-xs font-mono transition-all duration-200 outline-none",
        "bg-background-900/50 text-foreground-200",
        "border border-white/[0.1] hover:border-white/[0.2]",
        "focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/20",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "placeholder:text-foreground-600 placeholder:font-sans placeholder:not-italic placeholder:font-normal"
      )}
      disabled={disabled}
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <div className="absolute bottom-px left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 transition-all duration-300 group-focus-within:w-[88%] opacity-70 rounded-full" />
  </div>
);

// ─── Feature components ───────────────────────────────────────────────────────

export const AuthorizationModal = observer(
  ({
    isOpen,
    onClose,
    operation,
  }: {
    isOpen: boolean;
    onClose: () => void;
    operation?: OperationModel;
  }) => {
    const { spec } = useStore();

    if (!spec) return null;

    const globalSecurity = spec.getGlobalSecurity();
    const security = operation?.security?.length
      ? operation?.security
      : spec?.security;

    const authNames = security?.flatMap((s) => Object.keys(s)) ?? [];
    const securities = globalSecurity.filter((gs) =>
      authNames.includes(gs.getKey())
    );

    const securitiesToShow = !securities?.length ? globalSecurity : securities;

    return (
      <Modal
        icon={<LockIcon className="size-4" />}
        isOpen={isOpen}
        title="Available authorizations"
        onClose={onClose}
      >
        <div className="space-y-3">
          {securitiesToShow.map((s) => (
            <SecuritySchemeInput key={s.getKey()} security={s} />
          ))}
        </div>
      </Modal>
    );
  }
);

const SecuritySchemeInput = observer(
  ({ security }: { security: SecurityModel }) => {
    const { spec } = useStore();
    const [value, setValue] = useState(
      security.credentials?.type === "apiKey" ? security.credentials.value : ""
    );

    const handleAuthorize = () => {
      if (value.trim()) {
        spec?.setCredentialsToGlobalSecurity(security.getKey(), {
          type: "apiKey",
          value: value,
        });
      }
    };

    const handleLogout = () => {
      setValue("");
      spec?.setCredentialsToGlobalSecurity(security.getKey(), undefined);
    };

    const type = security.getType();
    const isLogged = security.logged;

    return (
      <div
        className={cn(
          "rounded-lg border transition-colors overflow-hidden",
          isLogged
            ? "border-success-500/30 bg-success-500/5"
            : "border-white/[0.07] bg-background-800/60"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            isLogged
              ? "border-success-500/20 bg-success-500/5"
              : "border-white/[0.05] bg-background-700/40"
          )}
        >
          <div className="flex items-center gap-2.5">
            <KeyIcon
              className={cn(
                "size-3.5",
                isLogged ? "text-success-400" : "text-foreground-500"
              )}
            />
            <span className="text-sm font-mono font-medium text-foreground-200">
              {security.getKey()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLogged && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success-400">
                <CheckIcon className="size-3" />
                Authorized
              </span>
            )}
            <Chip label={type} radius="sm" size="xs" variant="ghost-primary" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {security.getDescription() && (
            <p className="text-xs text-foreground-500 leading-relaxed">
              {security.getDescription()}
            </p>
          )}

          {type === "apiKey" ? (
            <div className="space-y-1.5">
              <Subtitle as="label" size="xxs">
                API Key
              </Subtitle>
              <ModalTextInput
                disabled={isLogged}
                placeholder="Enter your API key"
                value={value}
                onChange={(v) => setValue(v)}
              />
              <p className="text-xs text-foreground-600">
                Header:{" "}
                <span className="font-mono text-foreground-400">
                  {security.getSecuritySchema().name}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex gap-3 px-3.5 py-3 rounded-lg border border-warning-500/20 bg-warning-500/5">
              <div className="shrink-0 mt-0.5 size-4 rounded-full border border-warning-500/40 flex items-center justify-center">
                <span className="text-[9px] font-black text-warning-400">
                  !
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-warning-400">
                  {type} not supported
                </p>
                <p className="text-xs text-warning-600 mt-0.5">
                  This authentication scheme is not yet supported.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer button — apiKey only */}
        {type === "apiKey" && (
          <div className="border-t border-white/[0.05]">
            {isLogged ? (
              <button
                className="w-full flex items-center justify-center gap-2 h-10 text-xs font-bold text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-all"
                type="button"
                onClick={handleLogout}
              >
                <KeyIcon className="size-4" />
                LOGOUT
              </button>
            ) : (
              <button
                className="w-full flex items-center justify-center gap-2 h-10 bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:cursor-not-allowed text-background-950 text-xs font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
                disabled={!value.trim()}
                type="button"
                onClick={handleAuthorize}
              >
                <LockIcon className="size-4" />
                AUTHORIZE
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
