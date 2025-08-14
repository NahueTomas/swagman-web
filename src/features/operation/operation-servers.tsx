import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Code } from "@heroui/code";
import { addToast } from "@heroui/toast";

import { FormFieldSelect } from "@/shared/components/ui/form-fields/form-field-select";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
import { ServerIcon, VariableIcon } from "@/shared/components/ui/icons";
import { useRequestForms } from "@/hooks/use-request-forms";
import { ServerModel } from "@/models/server.model";
import { useStore } from "@/hooks/use-store";
import { OpenAPIServerVariable } from "@/shared/types/openapi";

interface ServerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperationServers = ({ isOpen, onClose }: ServerProps) => {
  // Get the request forms state management functions
  const {
    specificationUrl,
    setSelectedServer,
    setOperationServer,
    specifications,
  } = useRequestForms((state) => state);

  const { operationFocused: operation, spec } = useStore((state) => state);
  const operationRequestForms = specifications?.[specificationUrl || ""];

  // Get operation-specific server if available, or fallback to global
  const isOperationSpecific = !!operation?.getServers()?.length;

  const globalSelectedServer =
    specifications?.[specificationUrl || ""]?.selectedServer;
  const globalSelectedServerVariables =
    specifications?.[specificationUrl || ""]?.selectedServerVariables;
  const selectedServer = isOperationSpecific
    ? operationRequestForms?.selectedServer
    : globalSelectedServer;
  const selectedServerVariables = isOperationSpecific
    ? operationRequestForms?.selectedServerVariables
    : globalSelectedServerVariables;

  const servers = isOperationSpecific
    ? operation?.getServers() || []
    : spec?.servers || [];

  const [currentServer, setCurrentServer] = useState<ServerModel>(
    servers.find((s) => s.getUrl() === selectedServer) || servers[0]
  );

  const [serverVariables, setServerVariables] = useState<{
    [key: string]: OpenAPIServerVariable;
  }>(selectedServerVariables || {});

  // Update local server variables when props change
  useEffect(() => {
    if (selectedServerVariables) {
      setServerVariables({ ...selectedServerVariables });
    }
  }, [selectedServerVariables]);

  // Update current server when selected server changes
  useEffect(() => {
    const server = servers.find((s) => s.getUrl() === selectedServer);

    if (server) {
      setCurrentServer(server);
    }
  }, [selectedServer]);

  /**
   * Handle server selection change
   * Initializes server variables with default values
   */
  const handleServerChange = (serverUrl: string) => {
    const server = servers.find((s) => s.getUrl() === serverUrl);

    if (server) {
      setCurrentServer(server);

      // Initialize server variables with defaults or existing values
      if (server.getVariables()) {
        const newVariables = Object.entries(server.getVariables() || {}).reduce(
          (acc, [key, variable]) => {
            acc[key] = {
              default: variable.default,
              description: variable.description,
              enum: variable.enum,
            };

            return acc;
          },
          {} as { [key: string]: OpenAPIServerVariable }
        );

        setServerVariables(newVariables);
      } else {
        setServerVariables({});
      }
    }
  };

  /**
   * Handle variable value change
   */
  const handleVariableChange = (key: string, value: string) => {
    setServerVariables((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        default: value,
      },
    }));
  };

  /**
   * Apply server selection and variables
   * Updates the global state and closes the modal
   */
  const handleApply = () => {
    if (currentServer) {
      // Save server variables to the store
      if (isOperationSpecific) {
        // For operation-specific servers
        setOperationServer(
          specificationUrl || "",
          operation?.id,
          currentServer.getUrl(),
          Object.entries(serverVariables).reduce(
            (acc, [key, variable]) => {
              acc[key] = variable.default;

              return acc;
            },
            {} as { [key: string]: string }
          )
        );
      } else {
        // For global servers
        setSelectedServer(
          specificationUrl || "",
          currentServer.getUrl(),
          serverVariables
        );
      }

      // Close the modal
      onClose();
    }
  };

  /**
   * Get the processed URL with variables applied
   */
  const getProcessedUrl = (server: ServerModel) => {
    let url = server.getUrl();
    const hasVariables =
      server.getVariables() &&
      Object.keys(server.getVariables() || {}).length > 0;

    // Replace variables in URL if any
    if (hasVariables && Object.keys(serverVariables).length > 0) {
      try {
        url = server.getUrlWithVariables(
          Object.entries(serverVariables).reduce(
            (acc, [key, variable]) => {
              acc[key] = variable.default;

              return acc;
            },
            {} as { [key: string]: string }
          )
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Fallback to default variables
        try {
          url = server.getUrlWithDefaultVariables();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          addToast({
            description: "Error applying variables to URL",
            color: "danger",
          });
        }
      }
    } else if (hasVariables) {
      try {
        url = server.getUrlWithDefaultVariables();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        addToast({
          description: "Error applying variables to URL",
          color: "danger",
        });
      }
    }

    // Add base URL if needed
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }

    return url;
  };

  return (
    <Modal isOpen={isOpen} placement="center" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Server Selection
        </ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            {/* Server Type Indicator */}
            <div className="px-3 py-2 rounded-lg text-xs flex flex-col text-wrap gap-2 border border-divider">
              <span>
                {isOperationSpecific
                  ? "Operation-Specific Servers"
                  : "Global API Servers"}
              </span>
              <span>
                {isOperationSpecific
                  ? "These servers are defined only for this operation and override global servers."
                  : 'These servers apply to all API "operations" by default.'}
              </span>
            </div>

            {/* Server Selection Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <ServerIcon className="size-5" />
                <span className="text-sm font-medium" id="server-label">
                  Server
                </span>
              </div>

              <FormFieldSelect
                aria-labelledby="server-label"
                options={servers.map((server) => server.getUrl())}
                placeholder="Select server"
                required={true}
                value={currentServer?.getUrl()}
                onChange={handleServerChange}
              />

              {currentServer?.getDescription() && (
                <p className="mt-1.5 flex items-start">
                  <span>{currentServer.getDescription()}</span>
                </p>
              )}
            </div>

            {/* Server Variables Section */}
            {currentServer?.getVariables() &&
              Object.keys(currentServer.getVariables() || {}).length > 0 && (
                <div className="border-t border-divider pt-4">
                  <div className="flex items-center mb-2">
                    <VariableIcon className="size-5 mr-1.5" />
                    <h4 className="text-sm font-medium">Server Variables</h4>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(currentServer.getVariables() || {}).map(
                      ([key, variable]) => (
                        <div key={key} className="space-y-1">
                          <label
                            className="block text-xs font-medium"
                            id={`variable-${key}-label`}
                          >
                            {key}
                            {variable.description && (
                              <span className="ml-1 font-normal">
                                - {variable.description}
                              </span>
                            )}
                          </label>
                          {variable.enum && variable.enum.length > 0 ? (
                            <FormFieldSelect
                              aria-labelledby={`variable-${key}-label`}
                              options={variable.enum}
                              required={true}
                              size="small"
                              value={
                                serverVariables[key] ||
                                String(variable.default || "")
                              }
                              onChange={(value) =>
                                handleVariableChange(key, value)
                              }
                            />
                          ) : (
                            <FormFieldText
                              aria-labelledby={`variable-${key}-label`}
                              value={String(
                                serverVariables[key] || variable.default || ""
                              )}
                              onChange={(value) =>
                                handleVariableChange(key, value)
                              }
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Preview Section */}
            <div className="border-t border border-divider pt-4">
              <div className="flex items-center mb-2">
                <h4 className="text-sm font-medium">URL Preview</h4>
              </div>

              {currentServer && (
                <Code className="font-mono text-sm break-all overflow-x-auto">
                  {getProcessedUrl(currentServer)}
                </Code>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" size="sm" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onClick={handleApply}
          >
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
