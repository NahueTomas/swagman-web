import { useState, useEffect, useMemo } from "react";

import { Subtitle } from "@/shared/components/subtitle";
import { OperationModel } from "@/models/operation.model";
import { Code } from "@/shared/components/code";
import { CardSelectableButtons } from "@/shared/components/card-selectable-buttons/card-selectable-buttons";
import { DocumentTextIcon } from "@/shared/components/icons";

type OperationResponseProps = {
  operation: OperationModel;
  acceptHeader?: string;
};

export const OperationResponse = ({
  operation,
  acceptHeader = "",
}: OperationResponseProps) => {
  // Get response data
  const responses = operation.getResponses();
  const hasResponses = responses.accepted.length > 0;
  const responseStatusCodes = useMemo(
    () => Object.keys(responses.responses || {}),
    [responses.responses]
  );

  // Use state with a function to ensure it's only calculated once on mount
  const [selectedResponse, setSelectedResponse] = useState<string>("");

  // Reset selection when operation changes
  useEffect(() => {
    // When operation changes, always select the first status code
    if (responseStatusCodes.length > 0) {
      setSelectedResponse(responseStatusCodes[0]);
    } else {
      setSelectedResponse("");
    }
  }, [operation]); // Only depend on operation changes

  // Fallback selection if current selection becomes invalid
  useEffect(() => {
    if (
      responseStatusCodes.length > 0 &&
      selectedResponse &&
      !responseStatusCodes.includes(selectedResponse)
    ) {
      setSelectedResponse(responseStatusCodes[0]);
    }
  }, [responseStatusCodes, selectedResponse]);

  if (!hasResponses) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 border border-dashed border-divider/30 rounded-lg text-center">
        <div className="p-2.5 rounded-lg bg-background-500/30 border border-white/[0.06]">
          <DocumentTextIcon className="size-5 text-foreground-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground-400">
            No response examples available
          </h4>
          <p className="text-[11px] text-foreground-600">
            This endpoint does not define any response details
          </p>
        </div>
      </div>
    );
  }

  // Force a default selection for rendering if somehow we don't have one
  const effectiveSelection =
    selectedResponse ||
    (responseStatusCodes.length > 0 ? responseStatusCodes[0] : "");

  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-2">
        {/* Status Code Selector */}
        <CardSelectableButtons
          options={responseStatusCodes.map((statusCode) => ({
            value: statusCode,
            selected: effectiveSelection === statusCode,
          }))}
          onClick={(value: string) => setSelectedResponse(value)}
        />
      </div>

      <div className="space-y-2">
        {/* Response Content - Always render with effective selection */}
        {effectiveSelection && (
          <ResponseContent
            acceptHeader={acceptHeader}
            operation={operation}
            statusCode={effectiveSelection}
          />
        )}
      </div>
    </div>
  );
};

type ResponseContentProps = {
  operation: OperationModel;
  statusCode: string;
  acceptHeader: string;
};

const ResponseContent = ({
  operation,
  statusCode,
  acceptHeader,
}: ResponseContentProps) => {
  const response = operation.getResponses().getResponse(statusCode);
  const responseExample = operation
    .getResponses()
    .getResponseExample(statusCode, acceptHeader || "");

  return (
    <>
      {response?.description && (
        <Subtitle as="p" size="micro">
          {response.description}
        </Subtitle>
      )}
      <Code
        language={getLanguageFromMimeType(acceptHeader)}
        value={responseExample || "No schema defined for this response"}
      />
    </>
  );
};

const getLanguageFromMimeType = (
  mimeType: string
): "json" | "xml" | "html" | "javascript" | "css" | "plaintext" => {
  const lowerType = mimeType?.toLowerCase() || "";

  if (lowerType.includes("json")) return "json";
  if (lowerType.includes("xml")) return "xml";
  if (lowerType.includes("html")) return "html";
  if (lowerType.includes("javascript")) return "javascript";
  if (lowerType.includes("css")) return "css";

  return "plaintext";
};
