import { useEffect, useState, useMemo, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Error as ErrorComponent } from "@/shared/components/ui/error";
import { Loading } from "@/features/specification/loading";
import { unescapeUrl } from "@/shared/utils/helpers";
import { useRequestForms } from "@/hooks/use-request-forms";

// Declare global variable for local spec
declare global {
  interface Window {
    LOCAL_SPEC?: object;
  }
}

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const { setSpecification } = useRequestForms();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSpecUrl, setCurrentSpecUrl] = useState<string>("");

  const { pathname } = useLocation();

  const specUrl = useMemo(() => {
    const pathParts = pathname.split("/");
    const urlIndex = pathParts.indexOf("specification") + 1;

    return unescapeUrl(urlIndex > 0 ? pathParts[urlIndex] : "");
  }, [pathname]);

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

        // NUEVA LÓGICA: Si URL es "local", cargar desde window.LOCAL_SPEC
        if (url === "local") {
          const localSpec = loadLocalSpec();

          if (localSpec) await spec.processSpec(localSpec);
        } else {
          // Lógica original para URLs externas
          await spec.processSpec(url);
        }

        setSpec(spec);
        setSpecification(url);
        setCurrentSpecUrl(url);
      } catch (err: any) {
        setError(err.message || "Failed to load or process the specification.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSpec, setSpecification, loadLocalSpec]
  );

  useEffect(() => {
    if (specUrl && specUrl !== currentSpecUrl) {
      loadSpec(specUrl);
    }
  }, [specUrl, currentSpecUrl, loadSpec]);

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
