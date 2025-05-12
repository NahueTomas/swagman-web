import { Button } from "@heroui/button";

import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import { ThunderIcon } from "@/components/icons";
import { Url } from "@/components/operation/url";

export const UrlSection = () => {
  const operation = useStore((state) => state.operationFocused);
  const spec = useStore((state) => state.spec);
  const { forms, setResponseLoading, setResponseSuccess, getResponse } =
    useRequestForms((state) => state);

  if (!operation || !spec) return null; // Need operation and spec

  const currentValues = forms?.[operation.id];
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
      setResponseLoading(operation.id);
      const response = await spec.makeRequest(
        operation,
        currentValues?.requestBody?.[currentValues?.contentType] || null,
        currentValues?.parameters,
        currentValues?.contentType || null
      );

      setResponseSuccess(operation.id, response);
    } catch (error: unknown) {
      setResponseSuccess(operation.id, null);
      throw error;
    }
  };

  const responseStatus = getResponse(operation.id);

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
            <Url url={path} />
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
