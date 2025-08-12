import { useEffect } from "react";

import { useRequestForms } from "@/hooks/use-request-forms";
import { useStore } from "@/hooks/use-store";
import { OpenAPIServerVariable } from "@/shared/types/openapi";

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
export const OperationHeaderUrl = ({ url, className }: UrlProps) => {
  // Get global spec and operation data from the store
  const { spec, operationFocused: operationModel } = useStore((state) => state);

  // Get request forms state and actions from the store
  const {
    specifications,
    specificationUrl,
    setSelectedServer,
    setOperationServer,
  } = useRequestForms((state) => state);

  // Get operation form data
  const operationForm = operationModel?.id
    ? specifications?.[specificationUrl || ""]?.forms?.[operationModel.id]
    : undefined;

  // Get operation-specific server if available, or fallback to global
  const isOperationSpecific = !!operationModel?.getServers()?.length;
  const globalSelectedServer =
    specifications?.[specificationUrl || ""]?.selectedServer;
  const globalSelectedServerVariables =
    specifications?.[specificationUrl || ""]?.selectedServerVariables;
  const selectedServer = isOperationSpecific
    ? operationForm?.selectedServer
    : globalSelectedServer;
  const selectedServerVariables = isOperationSpecific
    ? operationForm?.selectedServerVariables
    : globalSelectedServerVariables;

  // Get path and query parameters from the form state
  const pathParams = operationForm?.parameters?.path || {};

  // Determine which servers to use (operation-specific or global)
  const servers = operationModel?.getServers()?.length
    ? operationModel.getServers()
    : spec?.servers || [];

  /**
   * Auto-select the first available server if none is selected
   */
  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      const firstServer = servers[0];
      const variables = firstServer.getVariables();

      if (isOperationSpecific && operationModel?.id) {
        // For operation-specific servers, use string values
        const serverVariables: { [key: string]: string } = {};

        if (variables) {
          Object.entries(variables).forEach(([key, variable]) => {
            if (
              variable &&
              typeof variable === "object" &&
              "default" in variable
            ) {
              serverVariables[key] = String(variable.default);
            }
          });
        }

        setOperationServer(
          specificationUrl || "",
          operationModel.id,
          firstServer.getUrl(),
          serverVariables
        );
      } else {
        // For global servers, use OpenAPIServerVariable type
        const serverVariables: { [key: string]: OpenAPIServerVariable } = {};

        if (variables) {
          Object.entries(variables).forEach(([key, variable]) => {
            if (
              variable &&
              typeof variable === "object" &&
              "default" in variable
            ) {
              serverVariables[key] = {
                default: String(variable.default),
                description: variable.description || "",
                enum: variable.enum || [],
              };
            }
          });
        }

        setSelectedServer(
          specificationUrl || "",
          firstServer.getUrl(),
          serverVariables
        );
      }
    }
  }, [servers, selectedServer, isOperationSpecific, operationModel?.id]);

  if (!operationModel) return null;

  const operationParameters =
    operationForm?.parameters || operationModel.getParameterDefaultValues();

  const requestPreview = spec?.buildRequest(
    operationModel,
    null, // requestBody
    operationParameters, // parameters
    null // contentType
  );

  /**
   * Get the URL with parameters from requestPreview
   */
  const getUrlWithParameters = () => {
    return requestPreview?.url || url;
  };

  /**
   * Get the base URL template (with placeholders) for path parameter detection
   */
  const getUrlTemplate = () => {
    return url; // Always use the original template URL for placeholder detection
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
          // Convert variables to string values
          const stringVariables: { [key: string]: string } = {};

          Object.entries(selectedServerVariables).forEach(([key, value]) => {
            if (typeof value === "string") {
              stringVariables[key] = value;
            } else if (
              value &&
              typeof value === "object" &&
              "default" in value
            ) {
              stringVariables[key] = value.default;
            }
          });

          // Use custom variables
          displayUrl = currentServerModel.getUrlWithVariables(stringVariables);
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
    const processedUrl = getUrlWithParameters();
    const templateUrl = getUrlTemplate();

    // Regex patterns for path and query parameters
    const pathParamRegex = /\{([^{}]+)\}/g;
    const queryParamRegex = /([^&?=]+)=([^&]+)?/g;

    let parts: React.ReactNode[] = [];

    // Render server part if available
    if (servers.length > 0 && selectedServer) {
      const displayUrl = getServerDisplayUrl();

      parts.push(
        <span
          key="server-badge"
          className="hover:opacity-80 cursor-help hover:border-b hover:border-dotted px-px"
          title={`Selected server: "${displayUrl}"`}
        >
          {displayUrl}
        </span>
      );
    }

    // Process path parameters using template URL for detection but resolved URL for display
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const templateUrlWithoutQuery = templateUrl.split("?")[0];
    const processedUrlWithoutQuery = processedUrl.split("?")[0];

    // Create a mapping of resolved values by analyzing both URLs
    const getResolvedValue = (paramName: string, placeholder: string) => {
      // Try to get from pathParams first
      const paramData = pathParams[paramName];

      if (paramData?.value !== undefined) {
        return paramData.value.toString();
      }

      // Fallback: try to extract from the resolved URL by comparing positions
      const beforePlaceholder = templateUrlWithoutQuery.substring(
        0,
        templateUrlWithoutQuery.indexOf(placeholder)
      );
      const afterPlaceholder = templateUrlWithoutQuery.substring(
        templateUrlWithoutQuery.indexOf(placeholder) + placeholder.length
      );

      if (
        processedUrlWithoutQuery.startsWith(beforePlaceholder) &&
        processedUrlWithoutQuery.endsWith(afterPlaceholder)
      ) {
        const startPos = beforePlaceholder.length;
        const endPos =
          processedUrlWithoutQuery.length - afterPlaceholder.length;

        return processedUrlWithoutQuery.substring(startPos, endPos);
      }

      return "";
    };

    while ((match = pathParamRegex.exec(templateUrlWithoutQuery)) !== null) {
      const [fullMatch, paramName] = match;
      const startIndex = match.index;

      // Add text before the parameter (using resolved URL)
      if (startIndex > lastIndex) {
        const textBefore = templateUrlWithoutQuery.substring(
          lastIndex,
          startIndex
        );

        parts.push(<span key={`text-${lastIndex}`}>{textBefore}</span>);
      }

      const resolvedValue = getResolvedValue(paramName, fullMatch);

      // Add highlighted parameter showing just the value, but with enhanced tooltip for path params
      parts.push(
        <span
          key={`path-badge-${startIndex}`}
          className="hover:opacity-80 cursor-help hover:border-b hover:border-dotted px-px"
          title={`Path parameter: ${paramName} = "${resolvedValue}"`}
        >
          {resolvedValue || fullMatch}
        </span>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    // Add remaining path text
    if (lastIndex < templateUrlWithoutQuery.length) {
      parts.push(
        <span key={`text-end-path`}>
          {templateUrlWithoutQuery.substring(lastIndex)}
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
        const [, paramName, paramValue] = match;

        // Add highlighted query parameter with descriptive tooltip
        parts.push(
          <span
            key={`query-badge-${startIndex}`}
            className="hover:opacity-80 cursor-help hover:border-b hover:border-dotted px-px"
            title={`Query parameter: ${paramName} = "${paramValue ? decodeURIComponent(paramValue) : ""}"`}
          >
            {fullMatch}
          </span>
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
      <div>
        <div className="font-mono flex items-center flex-wrap leading-4">
          {renderHighlightedUrl()}
        </div>
      </div>
    </div>
  );
};
