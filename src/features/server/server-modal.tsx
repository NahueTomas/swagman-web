import { observer } from "mobx-react-lite";

import { FormFieldSelect } from "@/shared/components/form-field-select";
import { FormFieldText } from "@/shared/components/form-field-text";
import {
  ServerIcon,
  VariableIcon,
  XIcon,
  InfoIcon,
} from "@/shared/components/icons";
import { ServerModel } from "@/models/server.model";
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
    subtitle,
    description,
  }: ServerProps) => {
    if (!isOpen) return null;

    const currentServer = selectedServer;

    const handleServerChange = (serverUrl: string) =>
      setSelectedServer(serverUrl);
    const handleVariableChange = (key: string, value: string) => {
      currentServer.setVariableValue(key, value);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-950/80 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-background-900 border border-divider rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
            <div className="flex items-center gap-3">
              <ServerIcon className="size-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-foreground-100">
                Server Configuration
              </h3>
            </div>
            <button
              className="p-1 hover:bg-background-800 rounded-md transition-colors text-foreground-500"
              onClick={onClose}
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Info Section */}
            <div className="flex gap-3 p-4 bg-primary-500/5 border border-primary-500/20 rounded-md">
              <InfoIcon className="size-5 text-primary-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-primary-100">
                  {subtitle}
                </div>
                <div className="text-xs text-foreground-500 leading-relaxed">
                  {description}
                </div>
              </div>
            </div>

            {/* Selector Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Subtitle size="xs">BASE URL</Subtitle>
              </div>
              <FormFieldSelect
                options={servers?.map((server) => server.getUrl())}
                placeholder="Select server environment"
                required={true}
                value={currentServer?.getUrl()}
                onChange={(v) => handleServerChange(v as string)}
              />
              {currentServer?.getDescription() && (
                <p className="px-1 text-[11px] text-foreground-500 italic">
                  {currentServer.getDescription()}
                </p>
              )}
            </div>

            {/* Variables Table Section */}
            {currentServer?.getVariables() &&
              Object.keys(currentServer.getVariables() || {}).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <VariableIcon className="size-4 text-foreground-500" />
                    <Subtitle size="xs">SERVER VARIABLES</Subtitle>
                  </div>

                  <div className="border border-divider/50 rounded-md overflow-hidden bg-background-950/30">
                    <table className="w-full border-collapse table-fixed">
                      <thead>
                        <tr className="bg-background-800/50 border-b border-divider/50">
                          <th className="w-1/3 px-4 py-2 text-left text-[10px] font-bold text-foreground-500 uppercase tracking-widest">
                            Key
                          </th>
                          <th className="w-2/3 px-4 py-2 text-left text-[10px] font-bold text-foreground-500 uppercase tracking-widest">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider/30">
                        {Object.entries(currentServer.getVariables() || {}).map(
                          ([key, variable]) => (
                            <tr
                              key={key}
                              className="group hover:bg-background-800/30 transition-colors"
                            >
                              <td className="px-4 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-mono text-foreground-300">
                                    {key}
                                  </span>
                                  {variable.description && (
                                    <span className="text-[10px] text-foreground-500 leading-tight">
                                      {variable.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2">
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
                                    placeholder={`Enter ${key}...`}
                                    value={currentServer.getVariableValue(key)}
                                    onChange={(value) =>
                                      handleVariableChange(key, value as string)
                                    }
                                  />
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Preview Section */}
            <div className="space-y-3">
              <Subtitle size="xs">RESOLVED URL PREVIEW</Subtitle>
              <div className="p-4 bg-background-950 border border-divider rounded-md font-mono text-xs text-primary-400 break-all leading-relaxed ring-1 ring-inset ring-primary-500/10">
                {currentServer
                  ? currentServer.getUrlWithVariables()
                  : "No server selected"}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-divider flex justify-end gap-3 bg-background-950/50">
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
