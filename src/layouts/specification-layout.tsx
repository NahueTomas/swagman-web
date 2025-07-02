import { useEffect, useState, useMemo, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Divider } from "@heroui/divider";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Error } from "@/shared/components/ui/error";
import { Loading } from "@/features/specification/loading";
import { unescapeUrl } from "@/shared/utils/helpers";
import { useRequestForms } from "@/hooks/use-request-forms";

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const { setSpecification } = useRequestForms();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSpecUrl, setCurrentSpecUrl] = useState<string>("");

  const { pathname } = useLocation();

  // Memoizar el parsing de URL para evitar recálculos innecesarios
  const specUrl = useMemo(() => {
    const pathParts = pathname.split("/");
    const urlIndex = pathParts.indexOf("specification") + 1;
    return unescapeUrl(urlIndex > 0 ? pathParts[urlIndex] : "");
  }, [pathname]);

  // Función memoizada para cargar especificación
  const loadSpec = useCallback(
    async (url: string) => {
      if (!url) return;

      setIsLoading(true);
      setError(null);

      try {
        const spec = new SpecModel();
        await spec.processSpec(url);
        setSpec(spec);
        setSpecification(url);
        setCurrentSpecUrl(url);
      } catch (err: any) {
        setError(err.message || "Failed to load or process the specification.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSpec, setSpecification]
  );

  // Solo cargar la especificación si la URL cambió
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
          <Error message={error} title="Error to get specification" />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
