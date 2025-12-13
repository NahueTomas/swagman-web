import { useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { observer } from "mobx-react-lite";

import { useStore } from "@/hooks/use-store";
import { SecurityModel } from "@/models/security.model";
import { OperationModel } from "@/models/operation.model";
import { LockIcon } from "@/shared/components/ui/icons";

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

      security.forEach((s) => authNames.push(...Object.keys(s)));

      if (authNames.includes(gs.getKey())) return true;
    });

    // If there is not any security defined in the spec but there is definitions it must show everyone, no matter what
    const securitiesToShow = !securities?.length ? globalSecurity : securities;

    return (
      <Modal isOpen={isOpen} placement="center" size="3xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="text-xl flex flex-col gap-1">
            Authorizatize
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {securitiesToShow.map((s) => (
                <SecuritySchemeInput key={s.getKey()} security={s} />
              ))}
            </div>
          </ModalBody>
        </ModalContent>
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
        // Always update global security - operation-level just references global
        spec?.setCredentialsToGlobalSecurity(security.getKey(), {
          type: "apiKey",
          value: value,
        });
      }
    };

    const handleLogout = () => {
      setValue("");
      // Always update global security - operation-level just references global
      spec?.setCredentialsToGlobalSecurity(security.getKey(), undefined);
    };

    const type = security.getType();
    const scheme = security.getScheme();
    const isLogged = security.logged;

    if (type === "apiKey") {
      return (
        <div className="px-3 py-4 rounded-lg border border-divider space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockIcon className="size-4" />
              <h3 className="text-lg font-semibold">{security.getKey()}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isLogged && (
                <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">
                  Authorized
                </span>
              )}
              <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded">
                apiKey ({security.getIn()})
              </span>
            </div>
          </div>

          {security.getDescription() && (
            <p className="text-sm text-default-600">
              {security.getDescription()}
            </p>
          )}

          <p>{security.getSecuritySchema().name}</p>

          <Input
            label="Value"
            placeholder={`Enter your API key`}
            radius="sm"
            type="text"
            value={value}
            variant="bordered"
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            {isLogged ? (
              <Button
                color="danger"
                size="sm"
                variant="flat"
                onPress={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="primary"
                isDisabled={!value.trim()}
                size="sm"
                variant="flat"
                onPress={handleAuthorize}
              >
                Authorize
              </Button>
            )}
          </div>
        </div>
      );
    }

    // For other auth types (to be implemented later)
    return (
      <div className="px-3 py-4 rounded-lg border border-divider space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LockIcon className="size-4" />
            <h3 className="text-lg font-semibold">{security.getKey()}</h3>
          </div>
          <span className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded">
            {type} {scheme && `(${scheme})`}
          </span>
        </div>

        {security.getDescription() && (
          <p className="text-sm text-default-600">
            {security.getDescription()}
          </p>
        )}

        <div className="px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning-600">
            This authentication method is not available yet. We&apos;re working
            on adding support for it soon.
          </p>
        </div>
      </div>
    );
  }
);
