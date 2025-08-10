import { useState, useEffect } from "react";

import { Subtitle } from "@/shared/components/ui/subtitle";
import { OperationModel } from "@/models/operation.model";
import { Code } from "@/shared/components/ui/code";
import { CardSelectableButtons } from "@/shared/components/ui/card-selectable-buttons";

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
  const responseStatusCodes = Object.keys(responses.responses || {});

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
      <div className="p-4 border border-default-200 rounded-lg text-center text-default-500">
        <div className="flex flex-col items-center justify-center text-center p-12">
          {/* Heroicon: arrow-path */}
          <svg
            className="w-8 h-8 text-zinc-300 mb-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h4 className="text-sm font-medium">
            No response examples available
          </h4>
        </div>
        <p className="text-xs mt-1">
          This endpoint does not define any response details
        </p>
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
        <Subtitle>Response Examples</Subtitle>

        {/* Status Code Selector */}
        <CardSelectableButtons
          options={responseStatusCodes.map((statusCode) => ({
            value: statusCode,
            selected: effectiveSelection === statusCode,
          }))}
          onClick={(value: string) => setSelectedResponse(value)}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M3.75 9h16.5m-16.5 6.75h16.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Status Code</span>
        </CardSelectableButtons>
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
      <Subtitle>{response?.description || "Response"}</Subtitle>
      <Code
        autoHeight
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
