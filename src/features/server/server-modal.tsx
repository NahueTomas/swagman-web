import { observer } from "mobx-react-lite";

import { cn } from "@/shared/utils/cn";
import { FormFieldSelect } from "@/shared/components/form-field-select";
import { FormFieldText } from "@/shared/components/form-field-text";
import { ServerIcon } from "@/shared/components/icons";
import { ServerModel } from "@/models/server.model";
import { Modal } from "@/shared/components/modal";
import { Subtitle } from "@/shared/components/subtitle";

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
  }: ServerProps) => {
    const currentServer = selectedServer;

    const handleServerChange = (serverUrl: string) =>
      setSelectedServer(serverUrl);
    const handleVariableChange = (key: string, value: string) => {
      currentServer.setVariableValue(key, value);
    };

    return (
      <Modal
        icon={<ServerIcon className="size-5" />}
        isOpen={isOpen}
        title="Select and config the server"
        onClose={onClose}
      >
        <div className="space-y-6">
          {/* Server Selection */}
          <div className="space-y-2">
            <Subtitle>Environment</Subtitle>
            <FormFieldSelect
              options={servers?.map((server) => server.getUrl())}
              placeholder="Select server"
              required={true}
              value={currentServer?.getUrl()}
              onChange={(v) => handleServerChange(v as string)}
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
                <Subtitle>Variables</Subtitle>
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
                          <FormFieldSelect
                            options={variable.enum}
                            required={true}
                            value={currentServer.getVariableValue(key)}
                            onChange={(value) =>
                              handleVariableChange(key, value as string)
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
          <div className="border-t border-t-divider">
            <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-md bg-background-800 border border-divider">
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
      </Modal>
    );
  }
);
