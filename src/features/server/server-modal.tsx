import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Code } from "@heroui/code";
import { observer } from "mobx-react-lite";

import { FormFieldSelect } from "@/shared/components/ui/form-fields/form-field-select";
import { FormFieldText } from "@/shared/components/ui/form-fields/form-field-text";
import { ServerIcon, VariableIcon } from "@/shared/components/ui/icons";
import { ServerModel } from "@/models/server.model";

interface ServerProps {
  isOpen: boolean;
  selectedServer: ServerModel;
  setSelectedServer: (url: string) => void;
  servers: ServerModel[];
  subtitle: string;
  description: string;
  onClose: () => void;
}

export const ServerModal = observer(
  ({
    isOpen,
    onClose,
    selectedServer,
    setSelectedServer,
    servers,
    subtitle,
    description,
  }: ServerProps) => {
    // Get operation server if available, or fallback to global
    const currentServer = selectedServer;

    /**
     * Handle server selection change
     * Initializes server variables with default values
     */
    const handleServerChange = (serverUrl: string) =>
      setSelectedServer(serverUrl);

    /**
     * Handle variable value change
     */
    const handleVariableChange = (key: string, value: string) => {
      currentServer.setVariableValue(key, value);
    };

    /**
     * Apply server selection and variables
     * Updates the global state and closes the modal
     */
    const handleApply = () => {
      onClose();
    };

    return (
      <Modal isOpen={isOpen} placement="center" size="3xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="text-xl flex flex-col gap-1">
            Server Selection
          </ModalHeader>
          <ModalBody>
            <div className="space-y-10">
              {/* Server Type Indicator */}
              <div className="px-3 py-2 rounded-lg text-base flex flex-col text-wrap gap-2 border border-divider">
                <span className="text-lg">{subtitle}</span>
                <span>{description}</span>
              </div>

              {/* Server Selection Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <ServerIcon className="size-5" />
                  <span className="text-lg font-medium" id="server-label">
                    Server
                  </span>
                </div>

                <FormFieldSelect
                  aria-labelledby="server-label"
                  options={servers?.map((server) => server.getUrl())}
                  placeholder="Select server"
                  required={true}
                  value={currentServer?.getUrl()}
                  onChange={(v) => handleServerChange(v as string)}
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
                                value={currentServer.getVariableValue(key)}
                                onChange={(value) =>
                                  handleVariableChange(key, value as string)
                                }
                              />
                            ) : (
                              <FormFieldText
                                aria-labelledby={`variable-${key}-label`}
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

              {/* Preview Section */}
              <div className="px-3 py-2 rounded-lg flex flex-col text-wrap gap-2 border border-divider">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium">URL Preview</h4>
                </div>

                {currentServer && (
                  <Code className="font-mono break-all overflow-x-auto">
                    {currentServer.getUrlWithVariables()}
                  </Code>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              size="md"
              variant="flat"
              onClick={handleApply}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);
