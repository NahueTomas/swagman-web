import { useEffect } from "react";
import { Chip } from "@heroui/chip";

import { useRequestForms } from "@/hooks/use-request-forms";
import { useStore } from "@/hooks/use-store";

/**
 * Props for the OperationUrl component
 */
interface UrlProps {
  url: string;
  className?: string;
}

/**
 * OperationUrl Component
 * Displays a formatted URL with server, path and query parameters
 */
export const Url = ({ url, className }: UrlProps) => {
  // Get global spec and operation data from the store
  const { spec, operationFocused: operationModel } = useStore((state) => state);

  // Get request forms state and actions from the store
  const {
    forms,
    selectedServer: globalSelectedServer,
    selectedServerVariables: globalServerVariables,
    setSelectedServer,
    setOperationServer,
  } = useRequestForms((state) => state);

  // Get operation form data
  const operationForm = operationModel?.id
    ? forms[operationModel.id]
    : undefined;

  // Get path and query parameters from the form state
  const pathParams = operationForm?.parameters?.path || {};
  const queryParams = operationForm?.parameters?.query || {};

  // Determine which servers to use (operation-specific or global)
  const servers = operationModel?.getServers()?.length
    ? operationModel.getServers()
    : spec?.servers || [];

  // Determine if operation has specific servers
  const isOperationSpecific = !!operationModel?.getServers()?.length;

  // Get operation-specific server if available, or fallback to global
  const selectedServer = operationForm?.selectedServer || globalSelectedServer;
  const selectedServerVariables =
    operationForm?.selectedServerVariables || globalServerVariables;

  /**
   * Auto-select the first available server if none is selected
   */
  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      const firstServer = servers[0];

      // Get default server variables
      const serverVariables: { [key: string]: string } = {};
      const variables = firstServer.getVariables();

      if (variables) {
        // Initialize server variables with defaults
        Object.entries(variables).forEach(([key, variable]) => {
          serverVariables[key] = variable.default;
        });
      }

      // Update the server in the appropriate store (global or operation-specific)
      if (isOperationSpecific && operationModel?.id) {
        setOperationServer(
          operationModel.id,
          firstServer.getUrl(),
          serverVariables
        );
      } else {
        setSelectedServer(firstServer.getUrl(), serverVariables);
      }
    }
  }, [servers, selectedServer, isOperationSpecific, operationModel?.id]);

  /**
   * Process the URL with query parameters
   */
  const processUrl = () => {
    let processedUrl = url;
    let queryParts: string[] = [];

    // Process query parameters
    Object.entries(queryParams).forEach(([paramName, paramData]) => {
      const isIncluded = paramData.included;

      if (
        isIncluded &&
        paramData.value !== undefined &&
        paramData.value !== null
      ) {
        if (Array.isArray(paramData.value)) {
          // For array values, add each value as a separate parameter
          paramData.value.forEach((val) => {
            if (val !== undefined && val !== null) {
              queryParts.push(`${paramName}=${encodeURIComponent(val)}`);
            }
          });
        } else {
          // For single values, add as a single parameter
          queryParts.push(
            `${paramName}=${encodeURIComponent(paramData.value)}`
          );
        }
      }
    });

    // Add query parameters to the URL
    if (queryParts.length > 0) {
      processedUrl += `?${queryParts.join("&")}`;
    }

    return processedUrl;
  };

  /**
   * Get the server URL with variables applied
   */
  const getServerDisplayUrl = () => {
    if (!selectedServer) return "";

    // Find the current server model
    const currentServerModel = servers.find(
      (s) => s.getUrl() === selectedServer
    );

    if (!currentServerModel) return selectedServer;

    let displayUrl = selectedServer;

    // Apply server variables to URL
    if (currentServerModel.getVariables()) {
      try {
        if (
          selectedServerVariables &&
          Object.keys(selectedServerVariables).length > 0
        ) {
          // Use custom variables
          displayUrl = currentServerModel.getUrlWithVariables(
            selectedServerVariables
          );
        } else {
          // Use default variables
          displayUrl = currentServerModel.getUrlWithDefaultVariables();
        }
      } catch (e) {
        throw e;
      }
    }

    return displayUrl;
  };

  /**
   * Render the URL with highlighted parameters
   */
  const renderHighlightedUrl = () => {
    const processedUrl = processUrl();

    // Regex patterns for path and query parameters
    const pathParamRegex = /\{([^{}]+)\}/g;
    const queryParamRegex = /([^&?=]+)=([^&]+)?/g;

    let parts: React.ReactNode[] = [];

    // Render server part if available
    if (servers.length > 0 && selectedServer) {
      const displayUrl = getServerDisplayUrl();

      parts.push(
        <Chip
          key="server-badge"
          className="hover:cursor-help"
          size="sm"
          title={displayUrl}
          variant="flat"
        >
          {`{server}`}
        </Chip>
      );

      // Add separator between server and path
      parts.push(<span key="server-separator"> </span>);
    }

    // Process path parameters
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const urlWithoutQuery = processedUrl.split("?")[0];

    while ((match = pathParamRegex.exec(urlWithoutQuery)) !== null) {
      const [fullMatch, paramName] = match;
      const startIndex = match.index;

      // Add text before the parameter
      if (startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {urlWithoutQuery.substring(lastIndex, startIndex)}
          </span>
        );
      }

      // Check if parameter exists in pathParams
      const paramData = pathParams[paramName];

      // Add highlighted parameter with tooltip
      parts.push(
        <Chip
          key={`path-badge-${startIndex}`}
          className="hover:cursor-help"
          color="secondary"
          size="sm"
          title={paramData?.value?.toString() || '""'}
          variant="flat"
        >
          {fullMatch}
        </Chip>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    // Add remaining path text
    if (lastIndex < urlWithoutQuery.length) {
      parts.push(
        <span key={`text-end-path`}>
          {urlWithoutQuery.substring(lastIndex)}
        </span>
      );
    }

    // Process query parameters
    if (processedUrl.includes("?")) {
      const queryString = processedUrl.substring(processedUrl.indexOf("?"));

      parts.push(<span key="query-separator">?</span>);

      lastIndex = 1; // Start after the ?

      while ((match = queryParamRegex.exec(queryString)) !== null) {
        const [fullMatch] = match;
        const startIndex = match.index;

        // Add text before the parameter (& separators)
        if (startIndex > lastIndex) {
          parts.push(
            <span key={`query-sep-${lastIndex}`}>
              {queryString.substring(lastIndex, startIndex)}
            </span>
          );
        }

        // Extract parameter name and value
        const [, , paramValue] = match;

        // Add highlighted query parameter with tooltip
        parts.push(
          <Chip
            key={`query-badge-${startIndex}`}
            className="hover:cursor-help"
            color="primary"
            size="sm"
            title={paramValue ? `"${decodeURIComponent(paramValue)}"` : '""'}
            variant="flat"
          >
            {fullMatch}
          </Chip>
        );

        lastIndex = startIndex + fullMatch.length;
      }

      // Add remaining query string
      if (lastIndex < queryString.length) {
        parts.push(
          <span key="query-end">{queryString.substring(lastIndex)}</span>
        );
      }
    }

    return parts;
  };

  return (
    <div className={`text-sm ${className || ""}`}>
      <div className="flex items-center">{renderHighlightedUrl()}</div>
    </div>
  );
};
