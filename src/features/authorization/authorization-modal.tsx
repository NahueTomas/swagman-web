import { useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { SecurityModel } from "@/models/security.model";
import { OperationModel } from "@/models/operation.model";
import { LockIcon, XIcon, InfoIcon, KeyIcon } from "@/shared/components/icons";
import { FormFieldText } from "@/shared/components/form-field-text";
import { Chip } from "@/shared/components/chip";
import { Subtitle } from "@/shared/components/subtitle";
import { cn } from "@/shared/utils/cn";

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

    if (!isOpen || !spec) return null;

    const globalSecurity = spec.getGlobalSecurity();
    const security = operation?.security?.length
      ? operation?.security
      : spec?.security;

    const securities = globalSecurity.filter((gs) => {
      const authNames: string[] = [];

      security?.forEach((s) => authNames.push(...Object.keys(s)));

      return authNames.includes(gs.getKey());
    });

    const securitiesToShow = !securities?.length ? globalSecurity : securities;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-950/80 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-background-900 border border-divider rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-background-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/10 rounded-md">
                <LockIcon className="size-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground-100 leading-none">
                  Authorization
                </h3>
                <p className="text-[11px] text-foreground-500 mt-1">
                  Configure security schemes for API requests
                </p>
              </div>
            </div>
            <button
              className="p-1.5 hover:bg-background-800 rounded-md transition-colors text-foreground-500"
              onClick={onClose}
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {securitiesToShow.map((s) => (
              <SecuritySchemeInput key={s.getKey()} security={s} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-divider flex justify-end bg-background-950/50">
            <button
              className="px-4 py-2 text-xs font-medium text-foreground-500 hover:text-foreground-200 transition-colors"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
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
          "border rounded-lg transition-all overflow-hidden",
          isLogged
            ? "border-success-500/30 bg-success-500/[0.02]"
            : "border-divider bg-background-950/30"
        )}
      >
        {/* Scheme Header */}
        <div className="px-4 py-3 border-b border-divider/50 flex items-center justify-between bg-background-800/20">
          <div className="flex items-center gap-3">
            <KeyIcon
              className={cn(
                "size-4",
                isLogged ? "text-success-500" : "text-foreground-500"
              )}
            />
            <span className="text-sm font-mono font-bold text-foreground-200">
              {security.getKey()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLogged && (
              <Chip
                className="bg-success-500/10 text-success-500 border-success-500/20"
                label="Authorized"
                size="xxs"
                variant="default"
              />
            )}
            <Chip
              className="bg-background-700 text-foreground-400"
              label={`${type} (${security.getIn() || "header"})`}
              size="xxs"
              variant="default"
            />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {security.getDescription() && (
            <div className="flex gap-2 text-[11px] text-foreground-500 leading-relaxed">
              <InfoIcon className="size-3.5 shrink-0 mt-0.5 text-primary-500/70" />
              <p>{security.getDescription()}</p>
            </div>
          )}

          {type === "apiKey" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Subtitle size="xs">API KEY VALUE</Subtitle>
                <FormFieldText
                  placeholder="Paste your token here..."
                  value={value}
                  onChange={(v) => setValue(v as string)}
                />
                <p className="text-[10px] text-foreground-500 font-mono italic">
                  Parameter name:{" "}
                  <span className="text-primary-500/80">
                    {security.getSecuritySchema().name}
                  </span>
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {isLogged ? (
                  <button
                    className="px-4 py-1.5 border border-danger-500/50 text-danger-500 hover:bg-danger-500/10 text-[11px] font-bold rounded transition-colors"
                    onClick={handleLogout}
                  >
                    REMOVE CREDENTIALS
                  </button>
                ) : (
                  <button
                    className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded transition-all shadow-lg shadow-primary-500/10"
                    disabled={!value.trim()}
                    onClick={handleAuthorize}
                  >
                    AUTHORIZE
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-warning-500/5 border border-warning-500/20 rounded flex gap-3">
              <InfoIcon className="size-4 text-warning-500 shrink-0" />
              <p className="text-xs text-warning-200/80">
                Authentication method{" "}
                <span className="font-bold underline">{type}</span> is currently
                in development.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
