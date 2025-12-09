import { observer } from "mobx-react-lite";

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
export const OperationHeaderUrl = observer(({ url, className }: UrlProps) => {
  // Get global spec and operation data from the store
  const { spec, operationFocused: operationModel } = useStore((state) => state);

  if (!operationModel || !spec) return null;

  const requestPreview = spec?.buildRequest(operationModel);
  const selectedServer =
    operationModel.getSelectedServer() || spec.getSelectedServer();
  const servers = !!operationModel.getServers()
    ? operationModel.getServers()
    : spec.getServers();

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
    // Find the current server model
    const currentServerModel = selectedServer;

    if (!currentServerModel) return selectedServer;

    return selectedServer.getUrlWithVariables();
  };

  /**
   * Render the URL with highlighted parameters
   */
  const renderHighlightedUrl = () => {
    const processedUrl = requestPreview.url;
    const templateUrl = getUrlTemplate();

    // Regex patterns for path and query parameters
    const pathParamRegex = /\{([^{}]+)\}/g;
    const queryParamRegex = /([^&?=]+)=([^&]+)?/g;

    let parts: React.ReactNode[] = [];

    // Render server part if available
    if (servers?.length && selectedServer) {
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
      const paramData = operationModel
        .getPathParameters()
        ?.find((p) => p.name === paramName);

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
});
