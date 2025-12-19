import { observer } from "mobx-react-lite";
import { useState } from "react";

import { useStore } from "@/hooks/use-store";

interface UrlProps {
  url: string;
  className?: string;
}

export const OperationHeaderUrl = observer(({ url, className }: UrlProps) => {
  const { spec, operationFocused: operationModel } = useStore((state) => state);
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!operationModel || !spec) return null;

  const requestPreview = spec?.buildRequest(operationModel);
  const selectedServer =
    operationModel.getSelectedServer() || spec.getSelectedServer();
  const servers = !!operationModel.getServers()
    ? operationModel.getServers()
    : spec.getServers();

  const getUrlTemplate = () => url;
  const getServerDisplayUrl = () =>
    selectedServer ? selectedServer.getUrlWithVariables() : selectedServer;

  const renderHighlightedUrl = () => {
    const processedUrl = requestPreview.url;
    const templateUrl = getUrlTemplate();

    let result = "";

    const pathParamRegex = /\{([^{}]+)\}/g;
    const queryParamRegex = /([^&?=]+)=([^&]+)?/g;

    if (servers?.length && selectedServer) {
      const displayUrl = getServerDisplayUrl();

      result += displayUrl;
    }

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const templateUrlWithoutQuery = templateUrl.split("?")[0];
    const processedUrlWithoutQuery = processedUrl.split("?")[0];

    const getResolvedValue = (paramName: string, placeholder: string) => {
      const paramData = operationModel
        .getPathParameters()
        ?.find((p) => p.name === paramName);

      if (paramData?.value !== undefined) return paramData.value.toString();

      const before = templateUrlWithoutQuery.substring(
        0,
        templateUrlWithoutQuery.indexOf(placeholder)
      );
      const after = templateUrlWithoutQuery.substring(
        templateUrlWithoutQuery.indexOf(placeholder) + placeholder.length
      );

      if (
        processedUrlWithoutQuery.startsWith(before) &&
        processedUrlWithoutQuery.endsWith(after)
      ) {
        return processedUrlWithoutQuery.substring(
          before.length,
          processedUrlWithoutQuery.length - after.length
        );
      }

      return "";
    };

    while ((match = pathParamRegex.exec(templateUrlWithoutQuery)) !== null) {
      const [fullMatch, paramName] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        result += templateUrlWithoutQuery.substring(lastIndex, startIndex);
      }

      result += getResolvedValue(paramName, fullMatch) || fullMatch;
      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < templateUrlWithoutQuery.length) {
      result += templateUrlWithoutQuery.substring(lastIndex);
    }

    if (processedUrl.includes("?")) {
      const query = processedUrl.substring(processedUrl.indexOf("?"));

      result += "?";
      lastIndex = 1;

      while ((match = queryParamRegex.exec(query)) !== null) {
        const [fullMatch] = match;
        const startIndex = match.index;

        if (startIndex > lastIndex) {
          result += query.substring(lastIndex, startIndex);
        }

        result += fullMatch;
        lastIndex = startIndex + fullMatch.length;
      }

      if (lastIndex < query.length) {
        result += query.substring(lastIndex);
      }
    }

    return result;
  };

  return (
    <div
      className="relative w-full h-11 flex items-center"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onBlur={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
    >
      <div
        className={`w-full min-h-full rounded-md flex items-center ${
          expanded
            ? "px-4 py-2.5 outline-2 outline outline-primary/70 bg-content1 absolute top-0 z-10"
            : "pointer-events-none"
        } ${className || ""}`}
      >
        <span
          className={`w-full text-sm 2xl:text-base ${
            expanded ? "break-words" : "truncate"
          }`}
        >
          {renderHighlightedUrl()}
        </span>
      </div>
    </div>
  );
});
