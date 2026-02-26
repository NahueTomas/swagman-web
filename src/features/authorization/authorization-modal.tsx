/* eslint-disable jsx-a11y/label-has-associated-control */ import { useState } from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { SecurityModel } from "@/models/security.model";
import { OperationModel } from "@/models/operation.model";
import { LockIcon, KeyIcon, CheckIcon } from "@/shared/components/icons";
import { FormFieldText } from "@/shared/components/form-field-text";
import { cn } from "@/shared/utils/cn";
import { Modal } from "@/shared/components/modal";
import { Chip } from "@/shared/components/chip";

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

    const securities = globalSecurity.filter((gs) => {
      const authNames: string[] = [];

      security?.forEach((s) => authNames.push(...Object.keys(s)));

      return authNames.includes(gs.getKey());
    });

    const securitiesToShow = !securities?.length ? globalSecurity : securities;

    return (
      <Modal
        icon={<LockIcon className="size-5" />}
        isOpen={isOpen}
        title="Available authorizations"
        onClose={onClose}
      >
        <div className="space-y-4">
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
          "rounded-md border transition-colors",
          isLogged
            ? "border-success-500/50 bg-success-500/5"
            : "border-divider bg-background-800/50"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-divider/50">
          <div className="flex items-center gap-2.5">
            <KeyIcon
              className={cn(
                "size-3.5",
                isLogged ? "text-success-500" : "text-foreground-500"
              )}
            />
            <span className="text-sm font-mono font-medium text-foreground-200">
              {security.getKey()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLogged && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-success-500">
                <CheckIcon className="size-3" />
                Authorized
              </span>
            )}
            <Chip label={type} radius="sm" size="xs" variant="ghost-primary" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {security.getDescription() && (
            <p className="text-xs text-foreground-500 leading-relaxed">
              {security.getDescription()}
            </p>
          )}

          {type === "apiKey" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground-400 uppercase tracking-wider">
                  API Key
                </label>
                <FormFieldText
                  disabled={isLogged}
                  placeholder="Enter your API key"
                  value={value}
                  onChange={(v) => setValue(v as string)}
                />
                <p className="text-xs text-foreground-500">
                  Header:{" "}
                  <span className="font-mono text-foreground-400">
                    {security.getSecuritySchema().name}
                  </span>
                </p>
              </div>

              <div className="flex justify-end">
                {isLogged ? (
                  <button
                    className="px-4 py-1.5 text-xs font-medium text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded transition-colors"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="px-4 py-1.5 bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-background text-xs font-semibold rounded transition-colors"
                    disabled={!value.trim()}
                    type="button"
                    onClick={handleAuthorize}
                  >
                    Authorize
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-3 py-2.5 rounded-md border border-warning-600/40">
              <p className="text-xs text-warning-500">
                <span className="font-bold">{type}</span> authentication is not
                yet supported.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
