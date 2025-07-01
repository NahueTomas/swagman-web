import { Button } from "@heroui/button";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { ThunderIcon } from "@/shared/components/ui/icons";
import { OperationHeaderUrl } from "@/features/operation/operation-header-url";

export const OperationHeaderUrlSection = () => {
  const operation = useStore((state) => state.operationFocused);
  const spec = useStore((state) => state.spec);
  const {
    specificationUrl,
    specifications,
    setResponseLoading,
    setResponseSuccess,
    getResponse,
  } = useRequestForms((state) => state);

  if (!operation || !spec) return null; // Need operation and spec

  const currentValues =
    specifications?.[specificationUrl || ""]?.forms?.[operation.id];
  const path = operation.path;
  const methodUpper = operation.method.toUpperCase();

  const methodColors: Record<
    string,
    "primary" | "secondary" | "warning" | "success" | "danger" | "default"
  > = {
    GET: "primary",
    POST: "secondary",
    PUT: "warning",
    PATCH: "success",
    DELETE: "danger",
    DEFAULT: "default",
  };

  const colorSet = methodColors[methodUpper] || methodColors.DEFAULT;

  const handleClick = async () => {
    try {
      setResponseLoading(specificationUrl || "", operation.id);
      const response = await spec.makeRequest(
        operation,
        currentValues?.requestBody?.[currentValues?.contentType] || null,
        currentValues?.parameters,
        currentValues?.contentType || null
      );

      setResponseSuccess(specificationUrl || "", operation.id, response);
    } catch (error: unknown) {
      setResponseSuccess(specificationUrl || "", operation.id, null);
      throw error;
    }
  };

  const responseStatus = getResponse(specificationUrl || "", operation.id);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 md:bg-background/50 md:border md:border-divider rounded-full">
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 overflow-hidden">
        <Button
          className={`bg-${colorSet}/10 rounded-full border border-divider hover:cursor-default`}
          color={colorSet}
          disabled={responseStatus?.loading}
          radius="full"
          variant="faded"
        >
          {methodUpper}
        </Button>

        <div className="font-mono text-sm overflow-x-auto scrollbar-hide whitespace-nowrap">
          <div className="pr-2 py-1 w-full transition-all duration-200">
            <OperationHeaderUrl url={path} />
          </div>
        </div>
      </div>
      <Button
        className="bg-gradient-to-br from-primary to-danger shadow-secondary-500/20"
        color="primary"
        disabled={responseStatus?.loading}
        radius="full"
        variant="shadow"
        onClick={handleClick}
      >
        <ThunderIcon
          className={`size-4 ${responseStatus?.loading ? "animate-spin" : ""}`}
        />
        {responseStatus?.loading ? "Executing..." : "Execute"}
      </Button>
    </div>
  );
};
