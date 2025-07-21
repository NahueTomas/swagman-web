import { useEffect, useState, useCallback } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Error as ErrorComponent } from "@/shared/components/ui/error";
import { Loading } from "@/features/specification/loading";
import { useRequestForms } from "@/hooks/use-request-forms";

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const { setSpecification } = useRequestForms();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const specUrl = params.url;

  const loadLocalSpec = useCallback((): object | undefined => {
    try {
      // Check if window.LOCAL_SPEC exists
      if (!window.LOCAL_SPEC) {
        throw new Error(
          "No local spec found. Define window.LOCAL_SPEC with your OpenAPI specification."
        );
      }

      // Verificar que sea un objeto válido
      if (typeof window.LOCAL_SPEC !== "object" || window.LOCAL_SPEC === null) {
        throw new Error(
          "window.LOCAL_SPEC is not a valid object with the OpenAPI specification."
        );
      }

      return window.LOCAL_SPEC;
    } catch (error) {
      // Use toast to show error
      addToast({
        title: "Error loading local spec",
        description: error instanceof Error ? error.message : "Unknown error",
        color: "danger",
      });
    }
  }, []);

  const loadSpec = useCallback(
    async (url: string) => {
      if (!url) return;

      setIsLoading(true);
      setError(null);

      try {
        const spec = new SpecModel();

        if (url === "local") {
          const localSpec = loadLocalSpec();

          if (localSpec) await spec.processSpec(localSpec);
        } else await spec.processSpec(url);

        setSpec(spec);
        setSpecification(url);
      } catch (err: any) {
        setError(err.message || "Failed to load or process the specification.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSpec, setSpecification, loadLocalSpec]
  );

  useEffect(() => {
    if (specUrl) loadSpec(specUrl);
  }, [specUrl, loadSpec]);

  return (
    <div className="flex h-dvh w-full">
      {!error && !isLoading && (
        <div className="flex flex-row h-full">
          <ApiExplorer />
          <Divider orientation="vertical" />
        </div>
      )}

      <main className="flex-1 w-full items-center justify-center bg-content1/15 overflow-hidden">
        {error ? (
          <ErrorComponent message={error} title="Error to get specification" />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
